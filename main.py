"""
main.py - FastAPI Backend for AURASKIN Skincare Analysis Application.
Connects Roboflow RF-DETR model and clinical skincare recommendation logic
to the AURASKIN web frontend.
"""

import os
import json
import time
import secrets
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, Form, Query, Header, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

import database
from skincare_data import (
    SKINCARE_DATA,
    get_test_case,
    process_image_quality,
    get_skin_type_adaptation,
    get_lifestyle_guidance
)
from ai_service import (
    detect_skin_conditions,
    check_image_quality
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("auraskin.api")

app = FastAPI(
    title="AURASKIN Skincare Clinical Analysis API",
    description="Production-ready FastAPI backend integrating Roboflow RF-DETR model with AURASKIN clinical skincare engine.",
    version="2.0.0"
)

# Initialize database schema and migrate users on startup
@app.on_event("startup")
def on_startup():
    database.init_db()
    logger.info("Database schema initialized and users synced successfully.")

# Enable CORS for frontend flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Map frontend Vietnamese skin type values to canonical English keys
SKIN_TYPE_MAPPING = {
    "Da dầu": "Oily",
    "Da khô": "Dry",
    "Da hỗn hợp": "Combination",
    "Da nhạy cảm": "Sensitive",
    "Chưa xác định": None,
    "Oily": "Oily",
    "Dry": "Dry",
    "Combination": "Combination",
    "Sensitive": "Sensitive"
}


# ==========================================================
# AUTHENTICATION DEPENDENCIES
# ==========================================================

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Extract authenticated user from Bearer session token if provided."""
    if not authorization or not isinstance(authorization, str):
        return None
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return None
    return database.get_user_by_token(token)


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Strict authentication dependency verifying session token."""
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
        )
    return user


class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ==========================================================
# REST API ENDPOINTS
# ==========================================================

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "auraskin-backend",
        "version": "2.0.0"
    }


@app.post("/api/auth/register")
def register_endpoint(req: RegisterRequest):
    """
    Register a new user account with fullName, email, password.
    Persists account into SQLite Users table and syncs users.json.
    """
    full_name = req.fullName.strip()
    email = req.email.strip().lower()
    password = req.password

    if len(full_name) < 2:
        raise HTTPException(status_code=400, detail="Họ và tên cần có tối thiểu 2 ký tự.")
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Địa chỉ email không hợp lệ.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu cần có tối thiểu 6 ký tự.")

    existing = database.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="Email này đã được sử dụng. Vui lòng chuyển sang tab Đăng nhập.")

    user = database.create_user(full_name, email, password)
    token = database.create_session(user["id"])
    logger.info(f"New user registered: {full_name} ({email}) id={user['id']}")

    return {
        "status": "success",
        "message": f"Tài khoản {full_name} ({email}) đã được tạo thành công! Vui lòng đăng nhập.",
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["fullName"],
            "email": user["email"]
        }
    }


@app.post("/api/auth/login")
def login_endpoint(req: LoginRequest):
    """
    Authenticate user with email and password from SQLite storage.
    Generates verified session token.
    """
    email = req.email.strip().lower()
    password = req.password

    user = database.get_user_by_email(email)
    if not user or user.get("password") != password:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại.")

    token = database.create_session(user["id"])
    logger.info(f"User logged in successfully: {user.get('fullName')} ({email}) id={user['id']}")

    return {
        "status": "success",
        "message": f"Đăng nhập thành công! Chào mừng {user.get('fullName')}.",
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["fullName"],
            "email": user["email"]
        }
    }


@app.post("/api/auth/logout")
def logout_endpoint(authorization: Optional[str] = Header(None)):
    """Logs out user by invalidating their session token in database."""
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        database.delete_session(token)
    return {
        "status": "success",
        "message": "Đã đăng xuất thành công."
    }


@app.get("/api/auth/me")
def me_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return {
        "status": "success",
        "user": {
            "id": current_user["id"],
            "fullName": current_user["fullName"],
            "email": current_user["email"]
        }
    }


@app.get("/api/auth/users")
def get_registered_users():
    """Retrieve registered users list (excluding passwords)."""
    with database.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, fullName, email, createdAt FROM Users ORDER BY createdAt ASC")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


# ==========================================================
# SKIN ANALYSIS HISTORY ENDPOINTS (PER-USER ISOLATED)
# ==========================================================

@app.get("/api/history")
def get_user_history_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves skin analysis history strictly belonging to the authenticated user.
    Account B can NEVER see Account A's history.
    """
    history = database.get_user_analysis_history(current_user["id"])
    return {
        "status": "success",
        "user_id": current_user["id"],
        "count": len(history),
        "history": history
    }


@app.get("/api/history/{history_id}")
def get_history_detail_endpoint(history_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves a single historical skin analysis verifying user ownership.
    """
    item = database.get_analysis_history_item(history_id, current_user["id"])
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi phân tích hoặc bạn không có quyền truy cập bản ghi này."
        )
    return {
        "status": "success",
        "item": item
    }


@app.delete("/api/history/{history_id}")
def delete_history_item_endpoint(history_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Deletes a specific history item belonging to authenticated user."""
    deleted = database.delete_analysis_history_item(history_id, current_user["id"])
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi phân tích để xóa hoặc bạn không có quyền truy cập."
        )
    return {
        "status": "success",
        "message": "Đã xóa bản ghi phân tích thành công."
    }


@app.delete("/api/history")
def clear_user_history_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Clears all history records strictly for the authenticated user."""
    count = database.clear_user_analysis_history(current_user["id"])
    return {
        "status": "success",
        "message": f"Đã xóa toàn bộ {count} bản ghi lịch sử phân tích của tài khoản."
    }


@app.get("/api/skincare-data")
def get_full_skincare_data():
    """
    Returns the complete clinical skincare knowledge base.
    """
    return SKINCARE_DATA


@app.get("/api/test-case/{test_case_id}")
def test_case_endpoint(test_case_id: str):
    """
    Retrieves test case details and quality check analysis
    for test cases IMG_01 through IMG_09.
    """
    case_key = test_case_id.upper().strip()
    test_case = get_test_case(case_key)
    if not test_case:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy mã kiểm thử {case_key}")
    
    quality_result = process_image_quality(case_key)
    return {
        "test_case_id": case_key,
        "test_case": test_case,
        "quality_result": quality_result
    }


@app.post("/api/analyze")
def analyze_skin(
    file: UploadFile = File(...),
    skin_type: Optional[str] = Form(None),
    priority_concerns: Optional[str] = Form(None),
    threshold: float = Form(0.20),
    authorization: Optional[str] = Header(None)
):
    """
    Analyzes uploaded facial image using Roboflow RF-DETR and AURASKIN clinical engine.
    - Pre-checks image brightness/validity (underexposed/dark < 40 -> Request_retake)
    - Runs direct Roboflow detection (Model: skin-skincare-k0kup-1-rfdetr-small-t1/1)
    - Aggregates detected classes and bounding boxes
    - Calculates clinical severity (mild, moderate, severe)
    - Applies Redness soothing barrier override if redness is detected
    - Dispatches to process_ai_result and populates routines and 3-tier product catalog
    - Persists analysis result and uploaded image into SkinAnalysisHistory linked to authenticated userId
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={
                "status": "invalid_image",
                "message": "Tệp tải lên không phải là định dạng hình ảnh hợp lệ. Vui lòng chọn ảnh định dạng JPG, PNG hoặc WEBP.",
                "expected_action": "Request_retake"
            }
        )

    try:
        if hasattr(file, "file") and hasattr(file.file, "read"):
            image_bytes = file.file.read()
        elif hasattr(file, "read"):
            image_bytes = file.read()
        else:
            image_bytes = b""
        if len(image_bytes) == 0:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "invalid_image",
                    "message": "Tệp hình ảnh rỗng.",
                    "expected_action": "Request_retake"
                }
            )

        # Authenticate user from session token
        authenticated_user = get_current_user_optional(authorization)

        # Normalize skin_type input from frontend
        normalized_skin_type = None
        if skin_type:
            normalized_skin_type = SKIN_TYPE_MAPPING.get(skin_type.strip(), skin_type.strip())

        # Ngưỡng độ tin cậy mặc định 0.20 (20%)
        safe_threshold = float(threshold) if threshold is not None and float(threshold) > 0 else 0.20

        # Run AI detection & clinical synthesis
        result = detect_skin_conditions(
            image_bytes=image_bytes,
            skin_type=normalized_skin_type,
            priority_concerns=priority_concerns,
            threshold=safe_threshold
        )

        result["skin_type"] = skin_type or "Chưa xác định"
        result["priority_concerns"] = [c.strip() for c in priority_concerns.split(",") if c.strip()] if priority_concerns else []

        # If analysis succeeded or returned normal skin (class null), persist image & history for authenticated user
        if result.get("status") in ("success", "no_condition", "normal_skin") and authenticated_user:
            user_id = authenticated_user["id"]
            history_id = f"hist_{int(time.time() * 1000)}_{secrets.token_hex(3)}"
            file_ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
            image_filename = f"{history_id}{file_ext}"
            image_filepath = os.path.join(database.UPLOADS_DIR, image_filename)

            try:
                with open(image_filepath, "wb") as img_f:
                    img_f.write(image_bytes)
                image_url = f"/uploads/{image_filename}"
            except Exception as e:
                logger.error(f"Failed to persist uploaded image file: {e}")
                image_url = ""

            detected_labels = list(result.get("summary_metrics", {}).get("condition_counts", {}).keys())

            hist_record = database.create_analysis_history(
                user_id=user_id,
                image_url=image_url,
                detected_labels=detected_labels,
                analysis_result=result
            )

            result["history_id"] = hist_record["id"]
            result["image_url"] = image_url
            result["saved_at"] = hist_record["createdAt"]
            logger.info(f"Analysis saved to database for user {user_id}: {hist_record['id']}")

        return result

    except Exception as e:
        logger.error(f"Error during skin analysis: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Đã xảy ra lỗi trong quá trình phân tích: {str(e)}"
            }
        )


# ==========================================================
# STATIC FILE SERVING FOR FRONTEND & UPLOADS
# ==========================================================

# Mount /uploads to serve persistently saved skin images
app.mount("/uploads", StaticFiles(directory=database.UPLOADS_DIR), name="uploads")

@app.get("/")
def serve_root():
    return FileResponse(os.path.join(CURRENT_DIR, "index.html"))

@app.get("/index.html")
def serve_index():
    return FileResponse(os.path.join(CURRENT_DIR, "index.html"))

@app.get("/styles.css")
def serve_css():
    return FileResponse(os.path.join(CURRENT_DIR, "styles.css"), media_type="text/css")

@app.get("/app.js")
def serve_js():
    return FileResponse(os.path.join(CURRENT_DIR, "app.js"), media_type="application/javascript")

@app.get("/logo.png")
def serve_logo():
    logo_path = os.path.join(CURRENT_DIR, "logo.png")
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Logo not found")

@app.get("/logo-icon.png")
def serve_logo_icon():
    icon_path = os.path.join(CURRENT_DIR, "logo-icon.png")
    if os.path.exists(icon_path):
        return FileResponse(icon_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Logo icon not found")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
