"""
ai_service.py - Skin condition inference service using Roboflow RF-DETR model
and clinical skincare logic integration.
Direct model output: zero artificial distortions, class swapping, or heuristic overriding.
"""

import io
import os
import math
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image
import numpy as np
import cv2
import requests

from skincare_data import (
    SKINCARE_DATA,
    process_ai_result,
    get_skincare_recommendation,
    get_skin_type_adaptation,
    get_lifestyle_guidance
)

logger = logging.getLogger("auraskin.ai_service")

# Helper to load .env safely
def _load_dotenv_safe():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v

_load_dotenv_safe()

# ====================================================================
# === ROBOFLOW DIRECT MODEL CONFIGURATION ===
# ====================================================================
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "h6AQMjAFxWRXdHCt3azX")
ROBOFLOW_API_URL = os.getenv("ROBOFLOW_API_URL", "https://detect.roboflow.com")
ROBOFLOW_WORKSPACE = os.getenv("ROBOFLOW_WORKSPACE", "hngs-workspace-hiqdd")
ROBOFLOW_MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "skin-skincare-k0kup-1-rfdetr-small-t1/1")
ROBOFLOW_MODEL_NAME = os.getenv("ROBOFLOW_MODEL_NAME", "hngs-workspace-hiqdd/skin-skincare-k0kup-1-rfdetr-small-t1")
DEFAULT_CONFIDENCE_THRESHOLD = float(os.getenv("ROBOFLOW_CONFIDENCE_THRESHOLD", "0.20"))

# 5 clinical skin condition classes
DISEASE_CLASSES = ['acne', 'acne_scar', 'blackhead', 'dark_spot', 'redness']
NORMAL_CLASSES = {'null', 'normal', 'normal_skin', 'healthy_skin', 'none'}

LABEL_NORMALIZATION = {
    "acne": "Acne",
    "acne_scar": "Acne_scar",
    "blackhead": "Blackhead",
    "dark_spot": "Dark_spot",
    "redness": "Redness"
}

RAW_CLASSES_NORMALIZED = ['Acne', 'Acne_scar', 'Blackhead', 'Dark_spot', 'Redness']

VIETNAMESE_NAMES = {
    "Acne": "Mụn trứng cá",
    "Acne_scar": "Thâm/sẹo sau mụn",
    "Blackhead": "Mụn đầu đen",
    "Dark_spot": "Thâm sạm/nám",
    "Redness": "Mẩn đỏ"
}

CONCERN_MAPPING = {
    "mụn": "Acne",
    "mun": "Acne",
    "acne": "Acne",
    "mụn trứng cá": "Acne",
    "thâm mụn": "Acne_scar",
    "tham mun": "Acne_scar",
    "thâm/sẹo sau mụn": "Acne_scar",
    "thâm sau mụn": "Acne_scar",
    "acne_scar": "Acne_scar",
    "mụn đầu đen": "Blackhead",
    "mun dau den": "Blackhead",
    "blackhead": "Blackhead",
    "thâm sạm": "Dark_spot",
    "tham sam": "Dark_spot",
    "thâm sạm/nám": "Dark_spot",
    "thâm nám": "Dark_spot",
    "nám": "Dark_spot",
    "dark_spot": "Dark_spot",
    "mẩn đỏ": "Redness",
    "man do": "Redness",
    "redness": "Redness"
}


def normalize_class_name(raw_name: Any) -> str:
    """Standardize label names from Roboflow model output."""
    if not raw_name:
        return ""
    import re
    s = str(raw_name).strip().lower()
    s = s.replace("-", "_").replace(" ", "_")
    s = re.sub(r"_+", "_", s).strip("_")

    plural_map = {
        "blackheads": "blackhead",
        "acnes": "acne",
        "acne_scars": "acne_scar",
        "acnescar": "acne_scar",
        "acnescars": "acne_scar",
        "dark_spots": "dark_spot",
        "darkspots": "dark_spot",
        "darkspot": "dark_spot",
        "rednesses": "redness",
        "normal": "null",
        "normal_skin": "null",
        "healthy_skin": "null",
        "none": "null"
    }
    return plural_map.get(s, s)


def normalize_label(raw_label: str) -> str:
    """Normalize model output class name to SKINCARE_DATA key."""
    if not raw_label:
        return "Acne"
    clean = str(raw_label).strip().lower().replace("-", "_").replace(" ", "_")
    return LABEL_NORMALIZATION.get(clean, clean.capitalize())


def parse_priority_concerns(concerns_input: Any) -> List[str]:
    """Parse comma-separated string, JSON array, or list into normalized SKINCARE_DATA keys."""
    if not concerns_input:
        return []
    raw_list = []
    if isinstance(concerns_input, str):
        try:
            parsed = json.loads(concerns_input)
            if isinstance(parsed, list):
                raw_list = [str(x) for x in parsed]
            else:
                raw_list = [s.strip() for s in concerns_input.split(",") if s.strip()]
        except Exception:
            raw_list = [s.strip() for s in concerns_input.split(",") if s.strip()]
    elif isinstance(concerns_input, (list, tuple)):
        raw_list = [str(x) for x in concerns_input]

    result = []
    for item in raw_list:
        clean = item.strip().lower()
        key = CONCERN_MAPPING.get(clean) or LABEL_NORMALIZATION.get(clean)
        if key and key in RAW_CLASSES_NORMALIZED and key not in result:
            result.append(key)
    return result


def check_image_quality(image_bytes: bytes) -> Dict[str, Any]:
    """
    Check image validity, resolution, and brightness before inference.
    - Rejects corrupt or invalid bytes.
    - Rejects tiny resolution (< 120x120).
    - Rejects severely underexposed/dark image (mean brightness < 40).
    - Rejects severely overexposed image (mean brightness > 248).
    - Rejects completely flat / blurred image (std dev < 10).
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.verify()

        pil_img = Image.open(io.BytesIO(image_bytes))
        width, height = pil_img.size

        if width < 120 or height < 120:
            return {
                "valid": False,
                "reason": "too_small",
                "error": "Ảnh có độ phân giải quá nhỏ, không đủ điều kiện để mô hình AI phân tích chi tiết bề mặt da. Vui lòng chụp ảnh rõ nét hơn.",
                "expected_action": "Request_retake"
            }

        gray_img = pil_img.convert("L")
        np_gray = np.array(gray_img)
        mean_brightness = float(np.mean(np_gray))
        std_brightness = float(np.std(np_gray))

        if mean_brightness < 40.0:
            return {
                "valid": False,
                "reason": "underexposed",
                "brightness": round(mean_brightness, 2),
                "error": SKINCARE_DATA["general_warnings"]["invalid_image"],
                "expected_action": "Request_retake"
            }

        if mean_brightness > 248.0:
            return {
                "valid": False,
                "reason": "overexposed",
                "brightness": round(mean_brightness, 2),
                "error": "Ảnh bị lóa sáng nghiêm trọng, làm mất chi tiết bề mặt da. Vui lòng chụp lại với ánh sáng tự nhiên dịu nhẹ hơn.",
                "expected_action": "Request_retake"
            }

        if std_brightness < 10.0:
            return {
                "valid": False,
                "reason": "too_flat_or_blurry",
                "error": "Ảnh bị nhòe mờ hoặc mất nét chi tiết khuôn mặt. Vui lòng giữ chắc tay và chụp lại ảnh rõ nét hơn.",
                "expected_action": "Request_retake"
            }

        return {
            "valid": True,
            "brightness": round(mean_brightness, 2),
            "std": round(std_brightness, 2),
            "width": width,
            "height": height,
            "format": pil_img.format or "JPEG"
        }
    except Exception as e:
        logger.error(f"Image quality check error: {e}")
        return {
            "valid": False,
            "reason": "corrupted",
            "error": SKINCARE_DATA["general_warnings"]["invalid_image"],
            "expected_action": "Request_retake"
        }


def _normalize_model_slug(raw_model_id: str) -> str:
    """
    Normalizes Roboflow model slug to valid hosted API format:
    e.g. 'hngs-workspace-hiqdd/skin-skincare-k0kup-1-rfdetr-small-t1/1' -> 'skin-skincare-k0kup/1'
    or 'skin-skincare-k0kup-1-rfdetr-small-t1/1' -> 'skin-skincare-k0kup/1'
    """
    s = str(raw_model_id).strip()
    if "roboflow.com/" in s:
        s = s.split("roboflow.com/")[-1]
    if "skin-skincare-k0kup" in s:
        # Roboflow project slug is skin-skincare-k0kup and version is 1
        return "skin-skincare-k0kup/1"
    return s


def _call_roboflow_model_direct(image_bytes: bytes, threshold: float = 0.20) -> Dict[str, Any]:
    """
    Direct POST call to Roboflow Hosted Inference API with user image.
    Bypasses old workflow wrappers and hardcoded threshold limits.
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = pil_img.size

    model_slug = _normalize_model_slug(ROBOFLOW_MODEL_ID)
    conf_param = max(10, min(90, int(threshold * 100)))

    endpoints = [
        f"https://detect.roboflow.com/{model_slug}?api_key={ROBOFLOW_API_KEY}&confidence={conf_param}",
        f"https://serverless.roboflow.com/{model_slug}?api_key={ROBOFLOW_API_KEY}&confidence={conf_param}",
    ]

    for url in endpoints:
        try:
            r = requests.post(
                url,
                files={"file": ("image.jpg", image_bytes, "image/jpeg")},
                timeout=15
            )
            if r.status_code == 200:
                data = r.json()
                preds = data.get("predictions", [])
                logger.info(f"[_call_roboflow_model_direct] Success from {url.split('?')[0]}: found {len(preds)} predictions.")
                return {
                    "predictions": preds,
                    "image": data.get("image", {"width": width, "height": height}),
                    "raw_output": data
                }
            else:
                logger.warning(f"[_call_roboflow_model_direct] Status {r.status_code} from {url.split('?')[0]}: {r.text[:150]}")
        except Exception as e:
            logger.warning(f"[_call_roboflow_model_direct] Connection error on {url.split('?')[0]}: {e}")

    # Fallback to inference_sdk client if direct requests encounters network issues
    try:
        from inference_sdk import InferenceHTTPClient
        import tempfile
        client = InferenceHTTPClient(
            api_url="https://detect.roboflow.com",
            api_key=ROBOFLOW_API_KEY
        )
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        try:
            res = client.infer(tmp_path, model_id=model_slug)
            preds = res.get("predictions", [])
            logger.info(f"[inference_sdk fallback] Success: found {len(preds)} predictions.")
            return {
                "predictions": preds,
                "image": res.get("image", {"width": width, "height": height}),
                "raw_output": res
            }
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
    except Exception as e:
        logger.error(f"[inference_sdk fallback] Error: {e}")

    return {
        "predictions": None,
        "image": {"width": width, "height": height}
    }


def compute_box_iou(boxA: List[float], boxB: List[float]) -> float:
    """Compute Intersection over Union (IoU) between two bounding boxes [x1, y1, x2, y2]."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    inter_w = max(0.0, xB - xA)
    inter_h = max(0.0, yB - yA)
    inter_area = inter_w * inter_h

    areaA = max(0.0, boxA[2] - boxA[0]) * max(0.0, boxA[3] - boxA[1])
    areaB = max(0.0, boxB[2] - boxB[0]) * max(0.0, boxB[3] - boxB[1])
    union_area = areaA + areaB - inter_area
    if union_area <= 0:
        return 0.0
    return inter_area / union_area


def apply_nms(predictions: List[Dict[str, Any]], iou_threshold: float = 0.50) -> List[Dict[str, Any]]:
    """
    Standard Non-Maximum Suppression (NMS):
    For bounding boxes of the SAME class that overlap with IoU > iou_threshold,
    keeps the one with higher confidence score to eliminate duplicate box detections.
    """
    if not predictions:
        return []

    sorted_preds = sorted(predictions, key=lambda p: float(p.get("confidence", 0)), reverse=True)
    kept: List[Dict[str, Any]] = []

    for p in sorted_preds:
        p_cls = p.get("_normalized_cls", "")
        cx, cy = float(p.get("x", 0)), float(p.get("y", 0))
        w, h = float(p.get("width", 0)), float(p.get("height", 0))
        box_p = [cx - w / 2.0, cy - h / 2.0, cx + w / 2.0, cy + h / 2.0]

        is_dup = False
        for k in kept:
            k_cls = k.get("_normalized_cls", "")
            if p_cls == k_cls:
                k_cx, k_cy = float(k.get("x", 0)), float(k.get("y", 0))
                k_w, k_h = float(k.get("width", 0)), float(k.get("height", 0))
                box_k = [k_cx - k_w / 2.0, k_cy - k_h / 2.0, k_cx + k_w / 2.0, k_cy + k_h / 2.0]
                if compute_box_iou(box_p, box_k) > iou_threshold:
                    is_dup = True
                    break
        if not is_dup:
            kept.append(p)

    return kept


def map_facial_zone(
    bx: float,
    by: float,
    img_w: int = 640,
    img_h: int = 640
) -> str:
    """
    Maps bounding box coordinates (bx, by) to anatomical facial region for display only.
    Does NOT alter, swap, or remove any disease class.
    """
    rel_x = bx / img_w if img_w > 0 else 0.5
    rel_y = by / img_h if img_h > 0 else 0.5

    # Forehead (upper 35% of face)
    if rel_y < 0.35:
        return "Vùng trán"
    # Nose (center horizontal 30%, vertical 35% to 65%)
    if 0.35 <= rel_y <= 0.65 and 0.35 <= rel_x <= 0.65:
        return "Vùng mũi & cánh mũi"
    # Cheeks (left and right sides of mid-face)
    if 0.35 <= rel_y <= 0.75:
        if rel_x < 0.35:
            return "Vùng má trái"
        elif rel_x > 0.65:
            return "Vùng má phải"
        else:
            return "Vùng má & gò má"
    # Chin and lower jaw (bottom 25%)
    if rel_y > 0.75:
        if 0.30 <= rel_x <= 0.70:
            return "Vùng cằm & quanh miệng"
        else:
            return "Vùng quai hàm"

    return "Vùng bề mặt da trọng tâm"


# Backward compatibility wrappers
def map_zone_by_vertical_coordinate(ymin: float, image_height: float, xmin=None, xmax=None, image_width=None, framing=None) -> str:
    img_h = int(image_height) if image_height and image_height > 1.0 else 640
    img_w = int(image_width) if image_width and image_width > 1.0 else 640
    by = (ymin * img_h) if (0.0 <= ymin <= 1.0) else float(ymin)
    bx = (((xmin + xmax) / 2.0) if (xmin is not None and xmax is not None) else (xmin or (img_w / 2.0)))
    if 0.0 <= bx <= 1.0:
        bx = bx * img_w
    return map_facial_zone(bx=bx, by=by, img_w=img_w, img_h=img_h)


def detect_skin_conditions(
    image_bytes: bytes,
    skin_type: Optional[str] = None,
    priority_concerns: Optional[Any] = None,
    threshold: float = DEFAULT_CONFIDENCE_THRESHOLD
) -> Dict[str, Any]:
    """
    Direct model inference and clinical skincare synthesis:
    1. Pre-checks image quality.
    2. Calls Roboflow RF-DETR model directly (skin-skincare-k0kup-1-rfdetr-small-t1/1).
    3. Keeps model predictions with confidence >= threshold (default 0.20).
    4. Applies standard NMS (IoU > 0.50) without altering or swapping classes.
    5. Returns no_condition (Normal skin) only when 0 disease spots are detected.
    6. Maps detected conditions directly to SKINCARE_DATA and process_ai_result.
    """
    # Normalize skin_type input
    if skin_type:
        skin_type_clean = skin_type.strip().lower()
        mapping = {
            "da dầu": "Oily",
            "da khô": "Dry",
            "da hỗn hợp": "Combination",
            "da nhạy cảm": "Sensitive",
            "oily": "Oily",
            "dry": "Dry",
            "combination": "Combination",
            "sensitive": "Sensitive"
        }
        skin_type = mapping.get(skin_type_clean, skin_type)

    # Step 1: Pre-check image quality
    quality = check_image_quality(image_bytes)
    if not quality["valid"]:
        return {
            "status": "invalid_image",
            "message": quality["error"],
            "expected_action": quality["expected_action"],
            "details": quality
        }

    img_w = quality["width"]
    img_h = quality["height"]

    # Step 2: Call Roboflow direct hosted API
    safe_thresh = float(threshold) if threshold is not None and threshold > 0 else DEFAULT_CONFIDENCE_THRESHOLD
    inference_raw = _call_roboflow_model_direct(image_bytes, threshold=safe_thresh)
    raw_predictions = inference_raw.get("predictions")

    if raw_predictions is None:
        return {
            "status": "low_confidence",
            "message": SKINCARE_DATA["general_warnings"]["low_confidence"],
            "expected_action": "Request_retake",
            "details": {"reason": "inference_connection_failed"}
        }

    rf_w = float(inference_raw.get("image", {}).get("width") or img_w)
    rf_h = float(inference_raw.get("image", {}).get("height") or img_h)

    logger.info(f"[ROBOFLOW RAW] Model returned {len(raw_predictions)} raw predictions.")

    # Step 3: Standardize labels and filter by confidence threshold
    disease_candidates: List[Dict[str, Any]] = []

    for p in raw_predictions:
        conf = float(p.get("confidence", 0.0))
        raw_val = p.get("class") or p.get("label", "")
        norm_cls = normalize_class_name(raw_val)
        p["_normalized_cls"] = norm_cls

        # Filter strictly by confidence threshold
        if conf < safe_thresh:
            continue

        if norm_cls in DISEASE_CLASSES:
            disease_candidates.append(p)

    # Step 4: Apply standard NMS (IoU > 0.50) to remove duplicate overlapping boxes of the same class
    disease_predictions = apply_nms(disease_candidates, iou_threshold=0.50)

    user_priorities = parse_priority_concerns(priority_concerns)

    # ====================================================================
    # CASE 1: ZERO DISEASE CONDITIONS DETECTED (NORMAL SKIN)
    # ====================================================================
    if len(disease_predictions) == 0:
        unmatched_note = None
        if user_priorities:
            unmatched_names = [VIETNAMESE_NAMES.get(c, c) for c in user_priorities]
            unmatched_note = (
                f"Mô hình AI không phát hiện dấu hiệu '{', '.join(unmatched_names)}' trên ảnh của bạn. "
                f"Làn da hiện duy trì trạng thái bình thường, khỏe mạnh."
            )

        return {
            "status": "no_condition",
            "is_normal_skin": True,
            "detected_null": True,
            "message": "Không phát hiện vấn đề da thuộc 5 nhóm nhận diện (AI xác nhận làn da bình thường).",
            "image_dimensions": {"width": img_w, "height": img_h},
            "detections": [],
            "summary_metrics": {
                "total_spots": 0,
                "primary_condition": None,
                "primary_condition_vi": "Da bình thường / Khỏe mạnh",
                "overall_severity": "none",
                "average_confidence": 0.0,
                "condition_counts": {}
            },
            "primary_recommendation": None,
            "all_detected_conditions_details": [],
            "skin_type_adaptation": get_skin_type_adaptation(skin_type) if skin_type else None,
            "lifestyle_guidance": get_lifestyle_guidance(skin_type) if skin_type else None,
            "unmatched_priority_note": unmatched_note
        }

    # ====================================================================
    # CASE 2: CONDITIONS DETECTED (STATE C)
    # Map directly to bounding boxes and SKINCARE_DATA clinical protocols
    # ====================================================================
    detections: List[Dict[str, Any]] = []
    condition_counts: Dict[str, int] = {}
    condition_confs: Dict[str, List[float]] = {}
    condition_zones: Dict[str, List[str]] = {}

    for i, p in enumerate(disease_predictions):
        conf = float(p.get("confidence", 0.0))
        norm_key = p.get("_normalized_cls") or normalize_class_name(p.get("class"))
        norm_cls = LABEL_NORMALIZATION.get(norm_key, norm_key.capitalize())
        name_vi = VIETNAMESE_NAMES.get(norm_cls, norm_cls)

        cx = float(p.get("x", 0.0))
        cy = float(p.get("y", 0.0))
        w = float(p.get("width", 0.0))
        h = float(p.get("height", 0.0))

        # Normalized coordinates relative to model resolution (0.0 to 1.0)
        norm_cx = cx / rf_w if rf_w > 0 else 0.0
        norm_cy = cy / rf_h if rf_h > 0 else 0.0
        norm_w = w / rf_w if rf_w > 0 else 0.0
        norm_h = h / rf_h if rf_h > 0 else 0.0

        # Exact center to top-left corner conversion: (cx - w/2, cy - h/2)
        norm_left = max(0.0, min(1.0, norm_cx - norm_w / 2.0))
        norm_top = max(0.0, min(1.0, norm_cy - norm_h / 2.0))
        norm_w = max(0.0, min(1.0 - norm_left, norm_w))
        norm_h = max(0.0, min(1.0 - norm_top, norm_h))

        # Pixel coordinates on user's uploaded image
        box_cx_px = norm_cx * img_w
        box_cy_px = norm_cy * img_h

        zone_name = map_facial_zone(
            bx=box_cx_px,
            by=box_cy_px,
            img_w=img_w,
            img_h=img_h
        )

        detections.append({
            "id": f"det_{i+1}",
            "raw_class": str(p.get("class")),
            "class": norm_cls,
            "name_vi": name_vi,
            "confidence": round(conf, 3),
            "zone": zone_name,
            "x": round(norm_left * img_w, 1),
            "y": round(norm_top * img_h, 1),
            "width": round(norm_w * img_w, 1),
            "height": round(norm_h * img_h, 1),
            "norm_x": round(norm_left, 4),
            "norm_y": round(norm_top, 4),
            "norm_w": round(norm_w, 4),
            "norm_h": round(norm_h, 4)
        })

        condition_counts[norm_cls] = condition_counts.get(norm_cls, 0) + 1
        condition_confs.setdefault(norm_cls, []).append(conf)
        condition_zones.setdefault(norm_cls, []).append(zone_name)

    total_spots = len(detections)
    avg_confidence = float(np.mean([d["confidence"] for d in detections])) if detections else 0.0

    # Severity classification per condition
    condition_severities: Dict[str, str] = {}
    for cond, count in condition_counts.items():
        if count >= 20:
            condition_severities[cond] = "severe"
        elif count >= 8:
            condition_severities[cond] = "moderate"
        else:
            condition_severities[cond] = "mild"

    # User priority ordering (for display ordering only, never invents fake data)
    matched_priorities = [c for c in user_priorities if c in condition_counts]
    unmatched_priorities = [c for c in user_priorities if c not in condition_counts]

    unmatched_note = None
    if unmatched_priorities:
        unmatched_names = [VIETNAMESE_NAMES.get(c, c) for c in unmatched_priorities]
        unmatched_note = (
            f"AI không phát hiện dấu hiệu '{', '.join(unmatched_names)}' trên ảnh của bạn. "
            f"Phác đồ dưới đây tập trung vào các vấn đề da thực tế được phát hiện."
        )

    # Sort conditions: user priority first, then spot count, then average confidence
    sorted_conditions = sorted(
        condition_counts.keys(),
        key=lambda c: (
            1 if c in matched_priorities else 0,
            1 if (c == "Redness" and condition_severities[c] in ["moderate", "severe"]) else 0,
            condition_counts[c],
            float(np.mean(condition_confs[c]))
        ),
        reverse=True
    )

    primary_cond = sorted_conditions[0]
    primary_severity = condition_severities[primary_cond]
    primary_avg_conf = float(np.mean(condition_confs[primary_cond]))

    # Build detailed condition cards from SKINCARE_DATA
    all_conditions_details: List[Dict[str, Any]] = []
    all_conditions_recs: Dict[str, Any] = {}
    redness_detected = "Redness" in condition_counts

    for cond in sorted_conditions:
        c_count = condition_counts[cond]
        c_sev = condition_severities[cond]
        c_conf = float(np.mean(condition_confs[cond]))
        c_zones = list(dict.fromkeys(condition_zones.get(cond, [])))
        is_user_prio = cond in matched_priorities

        cond_data = SKINCARE_DATA["skin_conditions"][cond]
        routine_data = SKINCARE_DATA["skincare_routines"][cond]
        ingredient_data = SKINCARE_DATA["product_ingredients"][cond]
        product_data = SKINCARE_DATA["product_recommendations"][cond]
        lifestyle_data = SKINCARE_DATA["lifestyle_guidance"].get(cond, [])
        sev_desc = cond_data["severity_levels"].get(c_sev, "Cần theo dõi và chăm sóc phù hợp.")

        med_warning = None
        if c_sev == "severe":
            med_warning = SKINCARE_DATA["general_warnings"]["high_severity"]

        skin_adapt = get_skin_type_adaptation(skin_type) if skin_type else None

        cond_ai_rec = process_ai_result(
            skin_label=cond,
            confidence=c_conf,
            skin_type=skin_type,
            threshold=0.0,
            severity=c_sev
        )
        if cond_ai_rec and isinstance(cond_ai_rec, dict):
            cond_ai_rec["care_notes"] = cond_data.get("care", [])
            cond_ai_rec["care"] = cond_data.get("care", [])
            cond_ai_rec["medical_warning"] = med_warning
        all_conditions_recs[cond] = cond_ai_rec

        all_conditions_details.append({
            "skin_label": cond,
            "skin_condition": VIETNAMESE_NAMES.get(cond, cond),
            "name_vi": VIETNAMESE_NAMES.get(cond, cond),
            "spot_count": c_count,
            "severity": c_sev,
            "severity_description": sev_desc,
            "average_confidence": round(c_conf, 3),
            "confidence_avg": round(c_conf, 3),
            "confidence_percent": int(round(c_conf * 100)),
            "detected_zones": c_zones,
            "is_user_priority": is_user_prio,
            "signs": cond_data.get("signs", []),
            "care": cond_data.get("care", []),
            "care_notes": cond_data.get("care", []),
            "warnings": cond_data.get("warnings", []),
            "medical_warning": med_warning,
            "active_ingredients": ingredient_data.get("active_ingredients", []),
            "product_groups": ingredient_data.get("product_groups", []),
            "morning_routine": routine_data.get("morning", []),
            "evening_routine": routine_data.get("evening", []),
            "routine_notes": routine_data.get("notes", []),
            "lifestyle_guidance": lifestyle_data,
            "product_recommendations": product_data,
            "skin_type_adaptation": skin_adapt,
            "process_ai_result": cond_ai_rec,
            "recommendation": cond_ai_rec or {
                "signs": cond_data.get("signs", []),
                "care_notes": cond_data.get("care", []),
                "warnings": cond_data.get("warnings", []),
                "active_ingredients": ingredient_data.get("active_ingredients", []),
                "morning_routine": routine_data.get("morning", []),
                "evening_routine": routine_data.get("evening", []),
                "routine_notes": routine_data.get("notes", []),
                "product_recommendations": product_data,
                "medical_warning": med_warning
            }
        })

    primary_rec = all_conditions_recs.get(primary_cond) or process_ai_result(
        skin_label=primary_cond,
        confidence=primary_avg_conf,
        skin_type=skin_type,
        threshold=0.0,
        severity=primary_severity
    )

    if redness_detected:
        soothing_override = (
            "LƯU Ý ĐẶC BIỆT KHI CÓ MẨN ĐỎ: Làn da ghi nhận tình trạng mẩn đỏ / suy yếu hàng rào bảo vệ. "
            "Ưu tiên tuyệt đối cho việc phục hồi da (Ceramide, Panthenol B5, Rau má), tạm ngưng hoặc "
            "giảm thiểu các hoạt chất mạnh (BHA, AHA, Retinoids, Vitamin C nồng độ cao) để tránh làm "
            "tình trạng đỏ rát lan rộng."
        )
        if "routine_notes" in primary_rec and isinstance(primary_rec["routine_notes"], list):
            if soothing_override not in primary_rec["routine_notes"]:
                primary_rec["routine_notes"].insert(0, soothing_override)

    # Overall severity calculation
    if total_spots >= 20:
        overall_severity = "severe"
    elif total_spots >= 8:
        overall_severity = "moderate"
    else:
        overall_severity = "mild"

    medical_warning = None
    if overall_severity == "severe":
        medical_warning = SKINCARE_DATA["general_warnings"]["high_severity"]
        if primary_rec and isinstance(primary_rec, dict) and not primary_rec.get("medical_warning"):
            primary_rec["medical_warning"] = medical_warning
    else:
        if primary_rec and isinstance(primary_rec, dict):
            primary_rec["medical_warning"] = None
        for cd in all_conditions_details:
            cd["medical_warning"] = None
            if isinstance(cd.get("recommendation"), dict):
                cd["recommendation"]["medical_warning"] = None
            if isinstance(cd.get("process_ai_result"), dict):
                cd["process_ai_result"]["medical_warning"] = None

    return {
        "status": "success",
        "image_dimensions": {"width": img_w, "height": img_h},
        "detections": detections,
        "summary_metrics": {
            "total_spots": total_spots,
            "primary_condition": primary_cond,
            "primary_condition_vi": VIETNAMESE_NAMES.get(primary_cond, primary_cond),
            "overall_severity": overall_severity,
            "medical_warning": medical_warning,
            "average_confidence": round(avg_confidence, 3),
            "condition_counts": condition_counts,
            "condition_severities": condition_severities,
            "redness_override_applied": redness_detected,
            "is_multi_condition": len(condition_counts) > 1,
            "all_conditions_recs": all_conditions_recs
        },
        "primary_recommendation": primary_rec,
        "all_detected_conditions_details": all_conditions_details,
        "skin_type_adaptation": get_skin_type_adaptation(skin_type) if skin_type else None,
        "lifestyle_guidance": get_lifestyle_guidance(skin_type) if skin_type else None,
        "unmatched_priority_note": unmatched_note
    }
