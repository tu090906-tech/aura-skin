# ==========================================================
# PHẦN A. PYTHON DICTIONARY - KHO DỮ LIỆU CHÍNH
# ==========================================================

SKINCARE_DATA = {

    # ------------------------------------------------------
    # 1. NHẬN DIỆN 5 TÌNH TRẠNG DA
    # ------------------------------------------------------

    "skin_conditions": {

        "Acne": {
            "name_vi": "Mụn trứng cá",
            "name_en": "Acne",

            "signs": [
                "Xuất hiện các nốt mụn viêm, sưng đỏ",
                "Có thể có đầu mủ trắng hoặc vàng",
                "Thường xuất hiện ở trán, mũi, cằm và hai bên má"
            ],

            "severity_levels": {
                "mild": "Ít mụn, xuất hiện rải rác",
                "moderate": "Mụn xuất hiện ở nhiều vùng trên mặt",
                "severe": "Mụn viêm nhiều, sưng đau hoặc lan rộng"
            },

            "care": [
                "Làm sạch da dịu nhẹ",
                "Sử dụng sản phẩm hỗ trợ trị mụn phù hợp",
                "Dưỡng ẩm để hạn chế khô da",
                "Không tự ý nặn hoặc chạm tay vào mụn"
            ],

            "warnings": [
                "Không lạm dụng sản phẩm tẩy tế bào chết",
                "Không kết hợp nhiều hoạt chất mạnh cùng lúc",
                "Mụn viêm nặng hoặc có nguy cơ để lại sẹo nên khám bác sĩ da liễu"
            ]
        },

        "Acne_scar": {
            "name_vi": "Thâm/sẹo sau mụn",
            "name_en": "Post-acne marks and scars",

            "signs": [
                "Xuất hiện vết đỏ hoặc nâu sau khi mụn lành",
                "Có thể là thâm đỏ sau viêm (PIE)",
                "Có thể là thâm nâu sau viêm (PIH)",
                "Một số trường hợp có thay đổi cấu trúc bề mặt da"
            ],

            "severity_levels": {
                "mild": "Một vài vết thâm nhỏ",
                "moderate": "Nhiều vết thâm phân bố trên mặt",
                "severe": "Thâm nhiều hoặc có sẹo lõm, sẹo lồi"
            },

            "care": [
                "Làm sạch da dịu nhẹ",
                "Sử dụng sản phẩm hỗ trợ làm đều màu da phù hợp",
                "Dưỡng ẩm đầy đủ",
                "Sử dụng kem chống nắng hằng ngày",
                "Không cạy hoặc nặn các vùng da đang tổn thương"
            ],

            "warnings": [
                "Thâm đỏ, thâm nâu và sẹo cấu trúc là các vấn đề khác nhau",
                "Mỹ phẩm không thể xử lý mọi loại sẹo lõm hoặc sẹo lồi",
                "Sẹo sâu hoặc thâm kéo dài nên được bác sĩ da liễu đánh giá"
            ]
        },

        "Blackhead": {
            "name_vi": "Mụn đầu đen",
            "name_en": "Blackhead",

            "signs": [
                "Xuất hiện các nhân mụn hở có đầu màu đen",
                "Thường tập trung ở mũi, cằm và trán",
                "Bề mặt da có thể sần và lỗ chân lông dễ nhìn thấy"
            ],

            "severity_levels": {
                "mild": "Ít mụn đầu đen, tập trung ở một vùng",
                "moderate": "Mụn đầu đen xuất hiện ở nhiều vùng",
                "severe": "Mụn đầu đen dày đặc và kéo dài"
            },

            "care": [
                "Làm sạch da dịu nhẹ",
                "Sử dụng Salicylic Acid (BHA) phù hợp",
                "Dưỡng ẩm để hạn chế khô da",
                "Không cạy nặn hoặc chà xát mạnh"
            ],

            "warnings": [
                "Không lạm dụng miếng lột mụn",
                "Không sử dụng nhiều sản phẩm tẩy tế bào chết cùng lúc"
            ]
        },

        "Dark_spot": {
            "name_vi": "Thâm sạm/nám/đốm sắc tố",
            "name_en": "Dark spots",

            "signs": [
                "Xuất hiện các đốm hoặc mảng da sẫm màu",
                "Màu sắc có thể nâu, nâu sẫm hoặc xám",
                "Có thể liên quan đến ánh nắng, tia UV hoặc thay đổi nội tiết"
            ],

            "severity_levels": {
                "mild": "Một vài đốm sắc tố nhỏ",
                "moderate": "Nhiều đốm hoặc mảng sẫm màu",
                "severe": "Mảng sắc tố rộng hoặc đậm màu"
            },

            "care": [
                "Sử dụng kem chống nắng phổ rộng mỗi sáng",
                "Dưỡng ẩm đầy đủ",
                "Có thể tham khảo hoạt chất hỗ trợ làm sáng da",
                "Hạn chế tiếp xúc ánh nắng trực tiếp"
            ],

            "warnings": [
                "Không tự ý sử dụng kem trộn không rõ nguồn gốc",
                "Đốm sắc tố thay đổi nhanh, bất đối xứng hoặc có viền bất thường cần khám da liễu",
                "Nám và các bệnh lý sắc tố cần được đánh giá chuyên môn"
            ]
        },

        "Redness": {
            "name_vi": "Mẩn đỏ",
            "name_en": "Skin redness",

            "signs": [
                "Da xuất hiện vùng đỏ ở má, mũi hoặc quanh mũi",
                "Có thể kèm cảm giác nóng rát hoặc châm chích",
                "Có thể liên quan đến kích ứng hoặc hàng rào bảo vệ da suy yếu"
            ],

            "severity_levels": {
                "mild": "Đỏ nhẹ ở một vùng nhỏ",
                "moderate": "Đỏ ở nhiều vùng trên mặt",
                "severe": "Đỏ lan rộng, kéo dài hoặc kèm đau rát"
            },

            "care": [
                "Ưu tiên phục hồi hàng rào bảo vệ da",
                "Sử dụng sản phẩm làm dịu và dưỡng ẩm",
                "Tránh nước quá nóng và chà xát mạnh",
                "Ưu tiên sản phẩm không hương liệu"
            ],

            "warnings": [
                "Tạm ngưng hoạt chất dễ gây kích ứng khi da đang đỏ/rát",
                "Đỏ kéo dài hoặc lan rộng cần được bác sĩ da liễu đánh giá",
                "Không tự ý sử dụng sản phẩm điều trị mạnh"
            ]
        }
    },

    # ------------------------------------------------------
    # 2. BỘ 9 TÌNH HUỐNG ẢNH KIỂM THỬ
    # ------------------------------------------------------

    "image_test_cases": {

        "IMG_01": {
            "description": "Da gần như sạch, ánh sáng tốt",
            "expected_label": None,
            "expected_action": "No_condition_detected",
            "purpose": "Kiểm tra trường hợp không phát hiện tình trạng da",
            "image_file": None
        },

        "IMG_02": {
            "description": "Ít mụn xuất hiện rải rác",
            "expected_label": "Acne",
            "expected_severity": "mild",
            "purpose": "Kiểm tra nhận diện mụn mức độ nhẹ",
            "image_file": None
        },

        "IMG_03": {
            "description": "Nhiều mụn viêm",
            "expected_label": "Acne",
            "expected_severity": "severe",
            "expected_action": "Show_dermatologist_warning",
            "purpose": "Kiểm tra nhận diện mụn viêm nhiều và cảnh báo",
            "image_file": None
        },

        "IMG_04": {
            "description": "Nhiều mụn đầu đen vùng mũi",
            "expected_label": "Blackhead",
            "purpose": "Kiểm tra nhận diện mụn đầu đen",
            "image_file": None
        },

        "IMG_05": {
            "description": "Có vết thâm sau mụn",
            "expected_label": "Acne_scar",
            "purpose": "Kiểm tra nhận diện thâm sau mụn",
            "image_file": None
        },

        "IMG_06": {
            "description": "Mũi và vùng quanh mũi đỏ",
            "expected_label": "Redness",
            "purpose": "Kiểm tra nhận diện tình trạng mẩn đỏ",
            "image_file": None
        },

        "IMG_07": {
            "description": "Ảnh thiếu sáng",
            "expected_label": None,
            "expected_action": "Request_retake",
            "purpose": "Kiểm tra cảnh báo chất lượng ảnh kém",
            "image_file": None
        },

        "IMG_08": {
            "description": "Khuôn mặt bị che khuất",
            "expected_label": None,
            "expected_action": "Request_retake",
            "purpose": "Kiểm tra xử lý ảnh không hợp lệ",
            "image_file": None
        },

        "IMG_09": {
            "description": "Da có thâm sạm, nám",
            "expected_label": "Dark_spot",
            "purpose": "Kiểm tra nhận diện đốm sắc tố",
            "image_file": None
        }
    },

    # ------------------------------------------------------
    # 3. QUY TRÌNH CHĂM SÓC DA SÁNG VÀ TỐI
    # ------------------------------------------------------

    "skincare_routines": {

        "Acne": {
            "morning": [
                "Rửa mặt bằng sữa rửa mặt dịu nhẹ",
                "Thoa serum Niacinamide",
                "Dùng kem dưỡng ẩm mỏng nhẹ",
                "Thoa kem chống nắng phổ rộng SPF 50+"
            ],

            "evening": [
                "Tẩy trang nếu có sử dụng kem chống nắng hoặc trang điểm",
                "Rửa mặt dịu nhẹ",
                "Sử dụng sản phẩm hỗ trợ trị mụn phù hợp",
                "Dùng kem dưỡng ẩm phục hồi"
            ],

            "notes": [
                "Không tự ý kết hợp nhiều hoạt chất mạnh",
                "Benzoyl Peroxide có thể gây khô và kích ứng",
                "Retinoid cần sử dụng theo hướng dẫn phù hợp",
                "Retinoid bôi ngoài da cần tránh trong thai kỳ"
            ]
        },

        "Acne_scar": {
            "morning": [
                "Rửa mặt dịu nhẹ",
                "Thoa serum Niacinamide hoặc Vitamin C",
                "Dùng kem dưỡng ẩm",
                "Thoa kem chống nắng phổ rộng SPF 50+"
            ],

            "evening": [
                "Tẩy trang nếu cần",
                "Rửa mặt dịu nhẹ",
                "Sử dụng sản phẩm hỗ trợ thâm phù hợp",
                "Dùng kem dưỡng ẩm"
            ],

            "notes": [
                "Chống nắng giúp hạn chế tình trạng thâm đậm màu",
                "Có thể tham khảo Azelaic Acid",
                "Bắt đầu hoạt chất từ tần suất thấp",
                "Sẹo lõm và sẹo lồi cần được đánh giá chuyên môn"
            ]
        },

        "Blackhead": {
            "morning": [
                "Rửa mặt dịu nhẹ",
                "Thoa serum Niacinamide",
                "Dùng kem dưỡng ẩm mỏng nhẹ",
                "Thoa kem chống nắng phổ rộng SPF 50+"
            ],

            "evening": [
                "Tẩy trang nếu cần",
                "Rửa mặt dịu nhẹ",
                "Sử dụng Salicylic Acid (BHA) phù hợp",
                "Dùng kem dưỡng ẩm"
            ],

            "notes": [
                "BHA hỗ trợ làm thông thoáng lỗ chân lông",
                "Không cạy nặn hoặc chà xát mạnh",
                "Không lạm dụng miếng lột mụn"
            ]
        },

        "Dark_spot": {
            "morning": [
                "Rửa mặt dịu nhẹ",
                "Thoa serum Vitamin C hoặc Niacinamide",
                "Dùng kem dưỡng ẩm",
                "Thoa kem chống nắng phổ rộng SPF 50+"
            ],

            "evening": [
                "Tẩy trang nếu cần",
                "Rửa mặt dịu nhẹ",
                "Sử dụng hoạt chất hỗ trợ sắc tố phù hợp",
                "Dùng kem dưỡng ẩm"
            ],

            "notes": [
                "Có thể tham khảo Alpha Arbutin hoặc Tranexamic Acid",
                "Thoa lại kem chống nắng khi cần",
                "Không kết hợp nhiều hoạt chất mạnh cùng lúc"
            ]
        },

        "Redness": {
            "morning": [
                "Rửa mặt nhẹ nhàng bằng sản phẩm dịu nhẹ",
                "Dùng sản phẩm làm dịu chứa Panthenol hoặc Glycerin",
                "Dùng kem dưỡng ẩm chứa Ceramide",
                "Thoa kem chống nắng phù hợp da nhạy cảm"
            ],

            "evening": [
                "Tẩy trang nhẹ nhàng nếu cần",
                "Rửa mặt dịu nhẹ",
                "Dùng sản phẩm dưỡng ẩm và làm dịu",
                "Dùng kem dưỡng phục hồi"
            ],

            "notes": [
                "Ưu tiên phục hồi hàng rào bảo vệ da",
                "Tránh hương liệu và cồn khô nếu da dễ kích ứng",
                "Tạm tránh acid và retinoid khi da đang đỏ/rát"
            ]
        }
    },

    # ------------------------------------------------------
    # 4. HOẠT CHẤT VÀ NHÓM SẢN PHẨM
    # ------------------------------------------------------

    "product_ingredients": {

        "Acne": {
            "active_ingredients": [
                "Salicylic Acid (BHA)",
                "Benzoyl Peroxide",
                "Tea Tree Oil",
                "Niacinamide"
            ],

            "product_groups": [
                "Sữa rửa mặt dịu nhẹ",
                "Gel chấm mụn",
                "Kem dưỡng ẩm mỏng nhẹ, không gây bít tắc"
            ]
        },

        "Acne_scar": {
            "active_ingredients": [
                "Vitamin C",
                "Niacinamide",
                "Azelaic Acid",
                "AHA"
            ],

            "product_groups": [
                "Serum Vitamin C",
                "Serum Niacinamide",
                "Kem dưỡng hỗ trợ làm đều màu da"
            ]
        },

        "Blackhead": {
            "active_ingredients": [
                "Salicylic Acid (BHA 1-2%)",
                "Clay",
                "Niacinamide"
            ],

            "product_groups": [
                "Dầu tẩy trang",
                "Mặt nạ đất sét",
                "Toner BHA"
            ]
        },

        "Dark_spot": {
            "active_ingredients": [
                "Tranexamic Acid",
                "Alpha Arbutin",
                "Kojic Acid",
                "Retinoids"
            ],

            "product_groups": [
                "Serum Tranexamic Acid",
                "Serum Alpha Arbutin",
                "Kem chống nắng phổ rộng"
            ]
        },

        "Redness": {
            "active_ingredients": [
                "Centella Asiatica",
                "Panthenol (B5)",
                "Ceramide",
                "Madecassoside"
            ],

            "product_groups": [
                "Toner làm dịu",
                "Serum B5 phục hồi",
                "Kem dưỡng phục hồi hàng rào da"
            ]
        }
    },

    # ------------------------------------------------------
    # 5. ĐIỀU CHỈNH THEO LOẠI DA
    # ------------------------------------------------------

    "skin_type_adaptation": {

        "Oily": {
            "name_vi": "Da dầu",

            "texture": [
                "Gel",
                "Fluid",
                "Serum gốc nước"
            ],

            "preferences": [
                "Ưu tiên kết cấu mỏng nhẹ",
                "Ưu tiên công thức Oil-free",
                "Ưu tiên sản phẩm Non-comedogenic"
            ]
        },

        "Dry": {
            "name_vi": "Da khô",

            "texture": [
                "Cream",
                "Lotion"
            ],

            "preferred_ingredients": [
                "Ceramide",
                "Hyaluronic Acid",
                "Glycerin"
            ],

            "preferences": [
                "Ưu tiên sản phẩm giàu ẩm",
                "Thận trọng với hoạt chất có thể gây khô da",
                "Duy trì dưỡng ẩm đầy đủ"
            ]
        },

        "Combination": {
            "name_vi": "Da hỗn hợp",

            "preferences": [
                "Áp dụng chăm sóc theo từng vùng da",
                "Kiểm soát dầu ở vùng chữ T",
                "Cấp ẩm dịu nhẹ cho hai bên má",
                "Có thể sử dụng sản phẩm khác nhau cho từng vùng"
            ]
        },

        "Sensitive": {
            "name_vi": "Da nhạy cảm",

            "preferred_ingredients": [
                "Centella Asiatica",
                "Panthenol (B5)",
                "Azelaic Acid"
            ],

            "preferences": [
                "Giảm nồng độ và tần suất hoạt chất",
                "Ưu tiên sản phẩm làm dịu",
                "Tránh cồn khô và hương liệu",
                "Thử sản phẩm mới trên vùng da nhỏ trước"
            ]
        }
    },

    # ------------------------------------------------------
    # 6. HƯỚNG DẪN ĂN UỐNG VÀ SINH HOẠT
    # ------------------------------------------------------

    "lifestyle_guidance": {

        "Acne": [
            "Lưu ý hạn chế đồ ngọt và thực phẩm có chỉ số đường huyết cao",
            "Có thể theo dõi phản ứng của da với sữa bò",
            "Hạn chế đồ chiên rán nếu nhận thấy chúng làm tình trạng da xấu hơn"
        ],

        "Acne_scar": [
            "Duy trì chế độ ăn cân bằng",
            "Bổ sung rau xanh và trái cây",
            "Duy trì giấc ngủ và sinh hoạt hợp lý"
        ],

        "Blackhead": [
            "Duy trì chế độ ăn cân bằng",
            "Hạn chế đồ ăn nhiều đường nếu cần",
            "Duy trì vệ sinh da và sinh hoạt hợp lý"
        ],

        "Dark_spot": [
            "Bổ sung rau xanh và trái cây",
            "Duy trì chế độ ăn đa dạng",
            "Kết hợp chống nắng và bảo vệ da khi ra ngoài"
        ],

        "Redness": [
            "Lưu ý đồ ăn quá cay nóng nếu chúng làm da đỏ hơn",
            "Theo dõi phản ứng của da với rượu bia",
            "Duy trì chế độ sinh hoạt điều độ"
        ],

        "Dry": [
            "Bổ sung chất béo lành mạnh",
            "Có thể tham khảo thực phẩm chứa Omega-3 như cá và các loại hạt",
            "Duy trì uống đủ nước"
        ],

        "general": [
            "Uống đủ nước theo nhu cầu cơ thể",
            "Bổ sung rau xanh và trái cây",
            "Ngủ đủ giấc",
            "Duy trì chế độ sinh hoạt lành mạnh"
        ],

        "note": (
            "Các hướng dẫn ăn uống và sinh hoạt chỉ mang tính tham khảo. "
            "Không xem đây là phương pháp điều trị hoặc kết luận nguyên nhân "
            "gây ra tình trạng da."
        )
    },

    # ------------------------------------------------------
    # 7. GỢI Ý SẢN PHẨM THEO PHÂN KHÚC GIÁ
    # ------------------------------------------------------

    "product_recommendations": {

        "Acne": {
            "student_under_350k": [
                "Simple Refreshing Facial Wash",
                "Derma Forte / Megaduo"
            ],

            "mid_350k_800k": [
                "La Roche-Posay Effaclar Purifying Foaming Gel",
                "La Roche-Posay Effaclar Duo+M"
            ],

            "premium_over_800k": [
                "Paula's Choice Clear Regular Strength 2% BHA",
                "SkinCeuticals Blemish + Age Defense"
            ]
        },

        "Acne_scar": {
            "student_under_350k": [
                "The Ordinary Niacinamide 10% + Zinc 1%",
                "Melano CC Whitening Essence"
            ],

            "mid_350k_800k": [
                "Eucerin ProACNE Triple Effect Serum",
                "Bioderma Sébium Kerato+"
            ],

            "premium_over_800k": [
                "SkinCeuticals Discoloration Defense",
                "Obagi Clinical Vitamin C + Arbutin"
            ]
        },

        "Blackhead": {
            "student_under_350k": [
                "Garnier Micellar Water",
                "COSRX BHA Blackhead Power Liquid"
            ],

            "mid_350k_800k": [
                "Bioderma Sébium H2O",
                "Paula's Choice Skin Perfecting 2% BHA"
            ],

            "premium_over_800k": [
                "Obagi Clenziderm MD Pore Therapy",
                "Kiehl's Rare Earth Deep Pore Cleansing Masque"
            ]
        },

        "Dark_spot": {
            "student_under_350k": [
                "The Ordinary Alpha Arbutin 2% + HA",
                "Skin Aqua Tone Up / L'Oreal UV Defender"
            ],

            "mid_350k_800k": [
                "Eucerin Spotless Brightening Booster Serum",
                "La Roche-Posay Anthelios UVMune 400"
            ],

            "premium_over_800k": [
                "SkinCeuticals C E Ferulic",
                "Heliocare 360 Pigment Solution Fluid"
            ]
        },

        "Redness": {
            "student_under_350k": [
                "SKIN1004 Madagascar Centella Ampoule",
                "Klairs Midnight Blue Calming Cream"
            ],

            "mid_350k_800k": [
                "La Roche-Posay Hyalu B5 Serum",
                "Bioderma Cicabio Crème+"
            ],

            "premium_over_800k": [
                "SkinCeuticals Phyto Corrective Gel",
                "Avène Cicalfate+ Restorative Protective Cream"
            ]
        }
    },

    # ------------------------------------------------------
    # 8. CẢNH BÁO VÀ LƯU Ý CHUNG
    # ------------------------------------------------------

    "general_warnings": {

        "medical_disclaimer": (
            "Các gợi ý chăm sóc da và sản phẩm chỉ mang tính tham khảo "
            "dựa trên kết quả nhận diện của mô hình AI, không thay thế "
            "chẩn đoán hoặc chỉ định của bác sĩ da liễu."
        ),

        "invalid_image": (
            "Ảnh không đủ điều kiện phân tích do thiếu sáng, mờ hoặc "
            "khuôn mặt bị che khuất. Vui lòng chụp lại ảnh rõ hơn."
        ),

        "low_confidence": (
            "Độ tin cậy nhận diện thấp. Hệ thống chưa thể đưa ra kết luận "
            "phù hợp. Vui lòng chụp lại ảnh hoặc tham khảo chuyên gia."
        ),

        "high_severity": (
            "Tình trạng da có dấu hiệu nghiêm trọng. Bạn nên tham khảo "
            "ý kiến bác sĩ da liễu để được đánh giá phù hợp."
        )
    }
}


# ==========================================================
# PHẦN B. CÁC HÀM GỌI VÀ XỬ LÝ DỮ LIỆU
# ==========================================================

# ----------------------------------------------------------
# HÀM 1. LẤY THÔNG TIN CHI TIẾT THEO NHÃN DA
# ----------------------------------------------------------

def get_skincare_recommendation(skin_label, skin_type=None):
    """
    Lấy toàn bộ dữ liệu chăm sóc da theo nhãn AI.

    skin_label:
        Acne / Acne_scar / Blackhead / Dark_spot / Redness

    skin_type:
        Oily / Dry / Combination / Sensitive
    """

    if skin_label not in SKINCARE_DATA["skin_conditions"]:
        return {
            "status": "not_found",
            "message": "Không tìm thấy dữ liệu tình trạng da."
        }

    condition = SKINCARE_DATA["skin_conditions"][skin_label]
    routine = SKINCARE_DATA["skincare_routines"][skin_label]
    ingredients = SKINCARE_DATA["product_ingredients"][skin_label]

    lifestyle = (
        SKINCARE_DATA["lifestyle_guidance"].get(skin_label, [])
        + SKINCARE_DATA["lifestyle_guidance"]["general"]
    )

    result = {
        "status": "success",

        "skin_label": skin_label,
        "skin_condition": condition["name_vi"],

        "signs": condition["signs"],
        "severity_levels": condition["severity_levels"],

        "morning_routine": routine["morning"],
        "evening_routine": routine["evening"],
        "routine_notes": routine["notes"],

        "active_ingredients": ingredients["active_ingredients"],
        "product_groups": ingredients["product_groups"],

        "lifestyle_guidance": lifestyle,

        "lifestyle_note": (
            SKINCARE_DATA["lifestyle_guidance"]["note"]
        ),

        "product_recommendations": (
            SKINCARE_DATA["product_recommendations"][skin_label]
        ),

        "warnings": condition["warnings"],

        "disclaimer": (
            SKINCARE_DATA["general_warnings"]["medical_disclaimer"]
        )
    }

    # Điều chỉnh dữ liệu theo loại da
    if skin_type is not None:

        adaptation = SKINCARE_DATA[
            "skin_type_adaptation"
        ].get(skin_type)

        if adaptation is None:
            result["skin_type_adaptation"] = {
                "message": "Loại da không hợp lệ."
            }

        else:
            result["skin_type"] = skin_type

            result["skin_type_adaptation"] = adaptation

    return result


# ----------------------------------------------------------
# HÀM 2. LẤY DỮ LIỆU ẢNH KIỂM THỬ
# ----------------------------------------------------------

def get_test_case(test_case_id):
    """
    Lấy dữ liệu của một ảnh kiểm thử.

    Ví dụ: get_test_case("IMG_01")
    """

    return SKINCARE_DATA["image_test_cases"].get(test_case_id)


# ----------------------------------------------------------
# HÀM 3. LẤY HƯỚNG DẪN THEO LOẠI DA
# ----------------------------------------------------------

def get_skin_type_adaptation(skin_type):
    """
    Lấy hướng dẫn chăm sóc theo loại da.
    """

    return SKINCARE_DATA[
        "skin_type_adaptation"
    ].get(skin_type, {
        "message": "Không tìm thấy loại da phù hợp."
    })


# ----------------------------------------------------------
# HÀM 4. LẤY HƯỚNG DẪN ĂN UỐNG VÀ SINH HOẠT
# ----------------------------------------------------------

def get_lifestyle_guidance(skin_label):
    """
    Lấy hướng dẫn ăn uống và sinh hoạt theo tình trạng da.
    """

    if skin_label not in SKINCARE_DATA["skin_conditions"]:
        return {
            "message": "Không tìm thấy tình trạng da."
        }

    guidance = SKINCARE_DATA["lifestyle_guidance"]

    return {
        "skin_specific": guidance.get(skin_label, []),
        "general": guidance["general"],
        "note": guidance["note"]
    }


# ----------------------------------------------------------
# HÀM 5. XỬ LÝ KẾT QUẢ TỪ MÔ HÌNH AI
# ----------------------------------------------------------

def process_ai_result(
    skin_label,
    confidence,
    skin_type=None,
    threshold=0.10,
    severity=None
):
    """
    Tiếp nhận kết quả từ mô hình AI và trả về gợi ý skincare.

    Ví dụ đầu vào:
        skin_label = "Acne"
        confidence = 0.92
        skin_type = "Oily"

    threshold:
        Ngưỡng tin cậy minh họa, cần hiệu chỉnh bằng dữ liệu thực tế.

    severity:
        mild / moderate / severe (nếu mô hình hoặc hệ thống có cung cấp).
    """

    # Kiểm tra confidence
    if not isinstance(confidence, (int, float)):
        return {
            "status": "invalid_confidence",
            "message": "Confidence phải là một số."
        }

    if not 0 <= confidence <= 1:
        return {
            "status": "invalid_confidence",
            "message": "Confidence phải nằm trong khoảng 0 đến 1."
        }

    if not 0 <= threshold <= 1:
        return {
            "status": "invalid_threshold",
            "message": "Threshold phải nằm trong khoảng 0 đến 1."
        }

    # Trường hợp độ tin cậy thấp
    if confidence < threshold:
        return {
            "status": "low_confidence",
            "confidence": confidence,
            "message": SKINCARE_DATA[
                "general_warnings"
            ]["low_confidence"]
        }

    # Trường hợp không phát hiện tình trạng da
    if skin_label is None:
        return {
            "status": "no_condition",
            "confidence": confidence,
            "message": (
                "Chưa phát hiện tình trạng da thuộc các nhóm "
                "được hệ thống hỗ trợ."
            )
        }

    # Kiểm tra nhãn AI
    if skin_label not in SKINCARE_DATA["skin_conditions"]:
        return {
            "status": "invalid_label",
            "message": "Nhãn tình trạng da không hợp lệ."
        }

    # Lấy toàn bộ dữ liệu skincare
    result = get_skincare_recommendation(
        skin_label=skin_label,
        skin_type=skin_type
    )

    result["confidence"] = confidence

    # Bổ sung mức độ nếu có
    if severity is not None:

        severity_data = SKINCARE_DATA[
            "skin_conditions"
        ][skin_label]["severity_levels"]

        if severity not in severity_data:
            result["severity_warning"] = (
                "Mức độ không hợp lệ hoặc chưa được hỗ trợ."
            )

        else:
            result["severity"] = severity
            result["severity_description"] = (
                severity_data[severity]
            )

            if severity == "severe":
                result["medical_warning"] = (
                    SKINCARE_DATA["general_warnings"][
                        "high_severity"
                    ]
                )

    return result


# ----------------------------------------------------------
# HÀM 6. XỬ LÝ ẢNH KHÔNG HỢP LỆ
# ----------------------------------------------------------

def process_image_quality(test_case_id):
    """
    Kiểm tra tình huống ảnh thử nghiệm.

    Dùng để minh họa logic xử lý ảnh thiếu sáng hoặc bị che.
    Không tự đánh giá chất lượng ảnh thật.
    """

    test_case = get_test_case(test_case_id)

    if test_case is None:
        return {
            "status": "not_found",
            "message": "Không tìm thấy mã ảnh kiểm thử."
        }

    action = test_case["expected_action"]

    if action == "Request_retake":
        return {
            "status": "invalid_image",
            "description": test_case["description"],
            "message": SKINCARE_DATA[
                "general_warnings"
            ]["invalid_image"]
        }

    return {
        "status": "valid_test_case",
        "description": test_case["description"],
        "expected_label": test_case["expected_label"],
        "expected_action": action
    }


# ==========================================================
# PHẦN C. VÍ DỤ CHẠY THỬ
# ==========================================================

if __name__ == "__main__":

    # Ví dụ 1: Mô hình AI nhận diện mụn trên da dầu

    result = process_ai_result(
        skin_label="Acne",
        confidence=0.92,
        skin_type="Oily",
        threshold=0.15,
        severity="mild"
    )

    print("\n========== KẾT QUẢ PHÂN TÍCH DA ==========")

    print("Trạng thái:", result["status"])

    if result["status"] == "success":

        print("Tình trạng da:", result["skin_condition"])

        print("Độ tin cậy:", result["confidence"])

        print("\n--- DẤU HIỆU NHẬN DIỆN ---")
        for item in result["signs"]:
            print("-", item)

        print("\n--- ROUTINE BUỔI SÁNG ---")
        for step in result["morning_routine"]:
            print("-", step)

        print("\n--- ROUTINE BUỔI TỐI ---")
        for step in result["evening_routine"]:
            print("-", step)

        print("\n--- HOẠT CHẤT THAM KHẢO ---")
        for item in result["active_ingredients"]:
            print("-", item)

        print("\n--- ĐIỀU CHỈNH THEO LOẠI DA ---")
        print(result.get("skin_type_adaptation"))

        print("\n--- ĂN UỐNG VÀ SINH HOẠT ---")
        for item in result["lifestyle_guidance"]:
            print("-", item)

        print("\n--- GỢI Ý SẢN PHẨM ---")
        for category, products in result[
            "product_recommendations"
        ].items():
            print(category, ":", products)

        print("\n--- CẢNH BÁO ---")
        for item in result["warnings"]:
            print("-", item)

        print("\n--- LƯU Ý Y KHOA ---")
        print(result["disclaimer"])

    # Ví dụ 2: Kiểm tra ảnh thiếu sáng

    print("\n========== KIỂM TRA CHẤT LƯỢNG ẢNH ==========")

    image_result = process_image_quality("IMG_07")

    print(image_result)

