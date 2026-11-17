/* ==========================================================================
   AURASKIN — Pure Client-Side Consultation & Analysis Engine (ES6+)
   Zero Backend | Zero Fetch | Zero Icons / Zero Emojis
   Standard Web APIs: FileReader, HTML5 Canvas, DOM, localStorage
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONSTANTS & STORAGE CONFIG
     ------------------------------------------------------------------------ */
  const STORAGE_KEY_PREFIX = 'auraskin_history_';
  const AUTH_USERS_KEY = 'auraskin_auth_users';
  const AUTH_SESSION_KEY = 'auraskin_auth_session';
  const SCAN_DURATION_MS = 1200;
  const MAX_HISTORY_ITEMS = 16;
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
  const API_BASE = window.location.protocol.startsWith('http') ? '' : 'http://localhost:8000';

  const BLANK_TAB_MESSAGE =
    'Chưa có dữ liệu phân tích. Vui lòng tải ảnh lên và nhấn Bắt đầu phân tích ở thanh công cụ bên trái.';
  const EMPTY_HISTORY_MESSAGE =
    'Chưa có bản ghi lịch sử nào được lưu trữ';

  /* ------------------------------------------------------------------------
     2. DERMATOLOGICAL CONSULTATION KNOWLEDGE BASE (100% CLIENT-SIDE)
     ------------------------------------------------------------------------ */
  const SKIN_TYPE_PROFILES = {
    'Chưa xác định': {
      note: 'Phác đồ cân bằng nền tảng ưu tiên dịu nhẹ, tôn trọng độ cân bằng sinh lý 5.5 của làn da.',
      compatibilityBase: 89,
      barrierSensitivity: 1,
      cleanser: {
        title: 'Sữa rửa mặt dạng gel dịu nhẹ độ cân bằng 5.5',
        desc: 'Làm sạch bụi mịn và bã nhờn dư thừa mà không gây cảm giác căng rít sau khi rửa.',
        texture: 'Gel trong suốt không tạo bọt dày'
      },
      moisturizer: {
        title: 'Nhũ tương dưỡng ẩm cân bằng sinh học',
        desc: 'Bổ sung độ ẩm vừa đủ giúp bề mặt da mềm mại, thông thoáng cả ngày.',
        texture: 'Nhũ tương mỏng nhẹ thẩm thấu nhanh'
      },
      spf: {
        title: 'Kem chống nắng phổ rộng kết cấu sữa lỏng',
        desc: 'Bảo vệ làn da trước tia cực tím và ánh sáng xanh mà không để lại vệt trắng.',
        texture: 'Sữa lỏng nhẹ thoáng, không gây bí'
      }
    },
    'Da khô': {
      note: 'Ưu tiên cấp ẩm đa tầng và khóa ẩm giàu chất béo tự nhiên nhằm hạn chế bong tróc, nếp nhăn mảnh.',
      compatibilityBase: 92,
      barrierSensitivity: 2,
      cleanser: {
        title: 'Sữa rửa mặt dạng kem không chứa sunfat',
        desc: 'Làm sạch êm dịu, giữ lại lớp màng ẩm tự nhiên và chất béo bảo vệ bề mặt.',
        texture: 'Sữa kem dịu mềm mượt'
      },
      moisturizer: {
        title: 'Kem dưỡng phục hồi giàu hoạt chất dưỡng ẩm sâu',
        desc: 'Khóa ẩm chuyên sâu ban đêm và làm dịu vùng da khô căng ở hai bên má.',
        texture: 'Kem dưỡng đậm đặc tan nhẹ trên da'
      },
      spf: {
        title: 'Kem chống nắng dưỡng ẩm màng lọc thế hệ mới',
        desc: 'Tích hợp thành phần hút ẩm giúp lớp nền chống nắng ẩm mượt suốt nhiều giờ.',
        texture: 'Kem chống nắng dưỡng ẩm mịn mượt'
      }
    },
    'Da dầu': {
      note: 'Tập trung điều tiết bã nhờn cân bằng, giữ lỗ chân lông thông thoáng nhưng vẫn đủ nước.',
      compatibilityBase: 91,
      barrierSensitivity: 1,
      cleanser: {
        title: 'Gel rửa mặt làm sạch dịu nhẹ kiểm soát dầu',
        desc: 'Loại bỏ bã nhờn tích tụ vùng chữ T nhưng vẫn duy trì độ ẩm cân bằng.',
        texture: 'Gel tạo bọt mịn nhẹ không khô căng'
      },
      moisturizer: {
        title: 'Gel dưỡng ẩm không dầu gốc nước',
        desc: 'Cung cấp nước tức thì cho biểu bì giúp hạn chế tình trạng tiết dầu bù trừ.',
        texture: 'Gel nước mỏng mát không bít tắc'
      },
      spf: {
        title: 'Chống nắng phổ rộng kiềm dầu ráo mịn',
        desc: 'Kiểm soát bóng nhờn vùng trán và cánh mũi, giữ bề mặt khô thoáng tự nhiên.',
        texture: 'Sữa lỏng ráo mịn nhẹ mặt'
      }
    },
    'Da hỗn hợp': {
      note: 'Cân bằng kép: thông thoáng vùng chữ T và nuôi dưỡng độ ẩm dịu êm cho hai bên má.',
      compatibilityBase: 93,
      barrierSensitivity: 1,
      cleanser: {
        title: 'Gel rửa mặt cân bằng độ ẩm chiết xuất thực vật',
        desc: 'Làm sạch hiệu quả vùng trán, mũi, cằm mà không làm khô vùng da hai bên má.',
        texture: 'Gel kem dịu nhẹ'
      },
      moisturizer: {
        title: 'Sữa dưỡng cân bằng đa vùng',
        desc: 'Điều tiết độ ẩm thông minh theo nhu cầu từng vùng da trên khuôn mặt.',
        texture: 'Sữa dưỡng mỏng nhẹ dễ phân lớp'
      },
      spf: {
        title: 'Kem chống nắng kết cấu lai mỏng thoáng',
        desc: 'Cân bằng độ ẩm cho vùng má đồng thời giữ vùng chữ T khô ráo tự nhiên.',
        texture: 'Tinh chất chống nắng mịn nhẹ'
      }
    },
    'Da nhạy cảm': {
      note: 'Giảm thiểu tối đa hoạt chất kích ứng, đặt phục hồi hàng rào bảo vệ và làm dịu lên hàng đầu.',
      compatibilityBase: 95,
      barrierSensitivity: 3,
      cleanser: {
        title: 'Sữa rửa mặt tối giản không hương liệu',
        desc: 'Công thức ít thành phần giúp làm sạch an toàn, hạn chế ma sát và ửng đỏ.',
        texture: 'Sữa rửa mặt dạng sữa siêu dịu nhẹ'
      },
      moisturizer: {
        title: 'Kem dưỡng phục hồi màng bảo vệ chứa hoạt chất làm dịu',
        desc: 'Làm dịu nhanh cảm giác châm chích và củng cố lớp sừng trước tác nhân môi trường.',
        texture: 'Kem sáp phục hồi êm dịu không cồn khô'
      },
      spf: {
        title: 'Kem chống nắng thuần vật lý hạt mịn',
        desc: 'Màng lọc Oxit Kẽm lành tính giúp phản xạ tia cực tím nhẹ nhàng cho làn da nhạy cảm.',
        texture: 'Kem chống nắng khoáng chất dịu nhẹ'
      }
    }
  };

  const CONCERN_DATA = {
    'Mụn': {
      focusZoneHint: 'Vùng cằm & Chữ T',
      zoneWeights: { forehead: 1.2, leftCheek: 1.0, tZone: 1.35, jawline: 1.45 },
      actives: [
        {
          name: 'Axit Azelaic 10%',
          desc: 'Làm dịu nốt sưng đỏ, kháng khuẩn nhẹ nhàng và hạn chế hình thành thâm sau mụn.'
        },
        {
          name: 'Axit Salicylic (BHA) 1% - 2%',
          desc: 'Tan trong dầu giúp làm sạch sâu bã nhờn tích tụ trong nang lông (dùng cách ngày nếu da nhạy cảm).'
        },
        {
          name: 'Kẽm PCA & Niacinamide 4%',
          desc: 'Điều tiết bã nhờn dịu nhẹ, giảm bóng dầu và hỗ trợ cân bằng hệ vi sinh trên nền da mụn.'
        }
      ],
      cautions: [
        {
          name: 'Dầu khoáng & Bơ thực vật đặc',
          desc: 'Các gốc dầu nặng dễ gây bít tắc lỗ chân lông tại vùng trán, má trong và viền hàm.'
        },
        {
          name: 'Tẩy da chết vật lý hạt to',
          desc: 'Ma sát cơ học làm vỡ nhân mụn viêm, kéo dài thời gian hồi phục và tăng nguy cơ sẹo thâm.'
        }
      ],
      morningStep: {
        type: 'ĐIỀU TIẾT DẦU & NGỪA VIÊM',
        title: 'Tinh chất Niacinamide 4% - 5% kết hợp Kẽm PCA',
        desc: 'Kiểm soát dầu thừa vùng chữ T, củng cố hàng rào ẩm và làm dịu các điểm mẩn đỏ mới hình thành.',
        dosage: '2 - 3 giọt cho toàn mặt',
        timing: 'Mỗi sáng sau bước cân bằng ẩm',
        note: 'Vỗ nhẹ đầu ngón tay và chờ khoảng 45 giây cho tinh chất ráo mịn trước khi khóa ẩm.',
        texture: 'Tinh chất lỏng thấm nhanh'
      },
      eveningStep: {
        type: 'ĐẶC TRỊ GIẢM MỤN',
        title: 'Tinh chất Axit Salicylic (BHA) 1% - 2% hoặc Axit Azelaic 10%',
        desc: 'Làm thông thoáng cổ nang lông, hỗ trợ gom cồi và làm dịu các vùng mụn sưng viêm.',
        dosage: '2 - 3 giọt hoặc chấm mỏng vùng có mụn',
        timing: '2 - 3 buổi tối/tuần (tăng dần nếu da dung nạp tốt)',
        note: 'Không thoa sát vùng khóe mũi, khóe miệng; giữ khoảng cách 5 phút trước bước kem dưỡng phục hồi.',
        texture: 'Gel hoặc dung dịch đặc trị mỏng nhẹ'
      }
    },
    'Thâm sạm': {
      focusZoneHint: 'Gò má & Vùng sắc tố',
      zoneWeights: { forehead: 1.1, leftCheek: 1.45, tZone: 0.95, jawline: 1.05 },
      actives: [
        {
          name: 'Axit Tranexamic 2% - 5%',
          desc: 'Ức chế đường truyền tín hiệu hắc tố, cải thiện tình trạng sạm nám và vùng da tối màu.'
        },
        {
          name: 'Vitamin C dẫn xuất ổn định',
          desc: 'Chống oxy hóa mạnh mẽ vào buổi sáng, hỗ trợ làm đều tông da rạng rỡ tự nhiên.'
        },
        {
          name: 'Alpha Arbutin 2%',
          desc: 'Làm mờ các vùng sạm màu khu trú tại hai bên gò má mà ít gây bong tróc biểu bì.'
        }
      ],
      cautions: [
        {
          name: 'Bỏ qua bước chống nắng phổ rộng',
          desc: 'Tia cực tím kích thích tăng sinh sắc tố trở lại rất nhanh, làm giảm hiệu quả mọi tinh chất làm sáng.'
        },
        {
          name: 'Phối hợp quá nhiều axit tẩy mạnh cùng lúc',
          desc: 'Gây viêm âm ỉ kéo dài và dễ dẫn đến tăng sắc tố dội ngược.'
        }
      ],
      morningStep: {
        type: 'CHỐNG OXY HÓA & LÀM SÁNG',
        title: 'Tinh chất Vitamin C dẫn xuất ổn định kết hợp Axit Ferulic',
        desc: 'Trung hòa gốc tự do và tăng cường hàng rào bảo vệ sắc tố dưới tác động của tia cực tím ban ngày.',
        dosage: '3 - 4 giọt cho mặt và cổ',
        timing: 'Mỗi sáng trước kem dưỡng và chống nắng',
        note: 'Bảo quản lọ tinh chất nơi thoáng mát, tránh ánh nắng trực tiếp để hạn chế oxy hóa.',
        texture: 'Tinh chất dạng nước thẩm thấu tức thì'
      },
      eveningStep: {
        type: 'ĐIỀU CHỈNH SẮC TỐ',
        title: 'Tinh chất Axit Tranexamic 3% - 5% kết hợp Alpha Arbutin',
        desc: 'Hỗ trợ ức chế tổng hợp melanin quá mức và làm đều màu vùng gò má trong chu kỳ tái tạo ban đêm.',
        dosage: '3 giọt toàn mặt, tập trung vùng gò má',
        timing: 'Hằng tối hoặc cách ngày trong 2 tuần đầu',
        note: 'Kết hợp kem dưỡng giàu Ceramide ở bước cuối để hạn chế khô căng bề mặt.',
        texture: 'Tinh chất dưỡng sáng dịu nhẹ'
      }
    },
    'Thâm mụn': {
      focusZoneHint: 'Hai bên gò má & Viền hàm',
      zoneWeights: { forehead: 1.05, leftCheek: 1.45, tZone: 1.0, jawline: 1.35 },
      actives: [
        {
          name: 'Niacinamide 5% - 10%',
          desc: 'Ngăn vận chuyển túi sắc tố lên bề mặt biểu bì, làm mờ vết thâm đỏ và thâm nâu sau mụn.'
        },
        {
          name: 'Axit Azelaic 10% - 15%',
          desc: 'Vừa hỗ trợ mờ thâm đỏ (PIE) lẫn thâm nâu (PIH), vừa ngăn ngừa nhân mụn mới quay lại.'
        },
        {
          name: 'Axit Mandelic (AHA phân tử lớn) 5%',
          desc: 'Thúc đẩy thay mới tế bào sừng chứa sắc tố một cách êm dịu, ít gây châm chích.'
        }
      ],
      cautions: [
        {
          name: 'Tự ý nặn ép nhân mụn chưa chín',
          desc: 'Gây tổn thương mao mạch dưới da, biến nốt mụn nhỏ thành vết thâm dai dẳng nhiều tháng.'
        },
        {
          name: 'Lạm dụng chất tẩy trắng lột nhanh',
          desc: 'Làm mỏng lớp sừng bảo vệ và khiến vùng da sau mụn dễ bị sạm thâm hơn khi gặp nắng.'
        }
      ],
      morningStep: {
        type: 'MỜ THÂM & BẢO VỆ SẮC TỐ',
        title: 'Tinh chất Niacinamide 5% kết hợp Vitamin C dịu nhẹ',
        desc: 'Hỗ trợ làm sáng vết thâm mới sau mụn và hạn chế thâm sạm đậm màu dưới ánh sáng ban ngày.',
        dosage: '2 - 3 giọt thoa đều toàn mặt',
        timing: 'Mỗi sáng trước bước kem chống nắng',
        note: 'Ưu tiên chống nắng SPF 50+ để vết thâm đỏ và thâm nâu không bị sậm màu thêm.',
        texture: 'Tinh chất mỏng nhẹ không nhờn rít'
      },
      eveningStep: {
        type: 'TÁI TẠO & MỜ THÂM SAU MỤN',
        title: 'Tinh chất Axit Azelaic 10% hoặc AHA Mandelic 5%',
        desc: 'Đẩy nhanh quá trình mờ đốm thâm khu trú ở gò má và viền hàm mà vẫn tôn trọng hàng rào ẩm.',
        dosage: 'Lượng bằng 1 hạt đậu nhỏ cho vùng thâm',
        timing: '3 - 4 tối/tuần (xen kẽ tối phục hồi B5)',
        note: 'Chỉ thoa lên vùng da đã lành vết thương hở, tránh bôi lên nốt mụn vừa vỡ.',
        texture: 'Nhũ tương hoặc gel kem mịn nhẹ'
      }
    },
    'Mụn đầu đen': {
      focusZoneHint: 'Vùng Chữ T & Cánh mũi',
      zoneWeights: { forehead: 1.15, leftCheek: 1.05, tZone: 1.55, jawline: 1.0 },
      actives: [
        {
          name: 'Axit Salicylic (BHA) 2% tan trong dầu',
          desc: 'Thẩm thấu sâu vào cổ nang lông vùng mũi và cằm để hòa tan nút bã nhờn bị oxy hóa.'
        },
        {
          name: 'Gluconolactone (PHA) 4% - 6%',
          desc: 'Làm mềm lớp sừng quanh miệng lỗ chân lông, giúp nhân bã nhờn thoát ra tự nhiên.'
        },
        {
          name: 'Đất sét Kaolin / Bentonite tinh khiết',
          desc: 'Hấp phụ dầu thừa bề mặt định kỳ mà không kéo căng hoặc làm tổn thương vùng cánh mũi.'
        }
      ],
      cautions: [
        {
          name: 'Miếng lột mụn cơ học hoặc cây nặn đầu nhọn',
          desc: 'Gây giãn rộng cổ nang lông và dễ làm trầy xước vùng da mỏng quanh cánh mũi.'
        },
        {
          name: 'Sản phẩm trang điểm chứa silicon dày không tẩy kỹ',
          desc: 'Dễ đọng lại ở rãnh mũi, tạo điều kiện cho sợi bã nhờn oxy hóa nhanh thành đầu đen.'
        }
      ],
      morningStep: {
        type: 'HẠN CHẾ OXY HÓA BÃ NHỜN',
        title: 'Tinh chất Niacinamide 5% & Chiết xuất Trà xanh',
        desc: 'Giữ bề mặt vùng cánh mũi khô thoáng, giảm lượng dầu tiết ra và hạn chế đầu đen xỉn màu.',
        dosage: '2 giọt tập trung vùng chữ T và mũi',
        timing: 'Mỗi sáng sau bước làm sạch dịu nhẹ',
        note: 'Thoa lớp mỏng hơn ở hai bên má nếu bạn thuộc nền da hỗn hợp hoặc thiên khô.',
        texture: 'Tinh chất kết cấu nước nhẹ'
      },
      eveningStep: {
        type: 'THÔNG THOÁNG LỖ CHÂN LÔNG',
        title: 'Dung dịch BHA 2% hoặc PHA 5% làm sạch cổ nang lông',
        desc: 'Hòa tan nút dầu bít tắc vùng cánh mũi, trán và cằm, giúp bề mặt lỗ chân lông mịn gọn hơn.',
        dosage: 'Thấm 3 - 4 giọt ra bông mỏng hoặc vỗ trực tiếp',
        timing: '2 - 3 buổi tối/tuần vùng chữ T',
        note: 'Có thể kết hợp mặt nạ đất sét dịu nhẹ 1 lần/tuần trước bước đặc trị để tăng độ thông thoáng.',
        texture: 'Dung dịch lỏng nhẹ không bết dính'
      }
    },
    'Mẩn đỏ': {
      focusZoneHint: 'Hai bên gò má & Vùng nhạy cảm',
      zoneWeights: { forehead: 1.05, leftCheek: 1.48, tZone: 1.05, jawline: 1.2 },
      actives: [
        {
          name: 'Panthenol (Vitamin B5) 5%',
          desc: 'Làm dịu tức thì cảm giác nóng rát, châm chích và hỗ trợ phục hồi biểu bì mỏng yếu.'
        },
        {
          name: 'Chiết xuất Rau má (Madecassoside)',
          desc: 'Giảm phản ứng đỏ rát bề mặt, làm dịu mao mạch nhạy cảm và tăng sức đề kháng tự nhiên.'
        },
        {
          name: 'Phức hợp Ceramide tỷ lệ sinh học',
          desc: 'Tái thiết lập lớp vữa lipid gian bào, ngăn tác nhân kích ứng từ môi trường xâm nhập.'
        }
      ],
      cautions: [
        {
          name: 'Hương liệu tổng hợp, tinh dầu thơm & cồn khô',
          desc: 'Dễ kích hoạt cảm giác bỏng rát và làm vùng mẩn đỏ ở hai bên má lan rộng hơn.'
        },
        {
          name: 'Tẩy tế bào chết nồng độ cao & nước quá nóng',
          desc: 'Làm giãn mạch ngoại vi và bào mòn lớp sừng đang cần được bảo vệ.'
        }
      ],
      morningStep: {
        type: 'LÀM DỊU & GIẢM ỬNG ĐỎ',
        title: 'Tinh chất Vitamin B5 (5%) và Rau má tinh khiết',
        desc: 'Làm dịu nhanh vùng da ửng hồng hai bên má, tăng cường lớp đệm ẩm trước tác động nhiệt độ.',
        dosage: '3 giọt vỗ nhẹ nhàng, không chà xát',
        timing: 'Hằng sáng ngay khi da còn hơi ẩm',
        note: 'Ưu tiên kem chống nắng thuần vật lý (Oxit Kẽm) để hạn chế sinh nhiệt gây đỏ da.',
        texture: 'Tinh chất làm dịu mát da'
      },
      eveningStep: {
        type: 'PHỤC HỒI HÀNG RÀO BẢO VỆ',
        title: 'Tinh chất Ceramide sinh học kết hợp Allantoin / Bisabolol',
        desc: 'Tái tạo lớp màng lipid tự nhiên, làm dịu cảm giác căng tức và ổn định sắc da trong giấc ngủ.',
        dosage: '3 - 4 giọt cho toàn mặt và vùng ửng đỏ',
        timing: 'Mỗi tối, tạm ngưng các axit tẩy sừng mạnh',
        note: 'Nếu da đang châm chích nhiều, có thể giảm chu trình tối xuống chỉ 3 bước tối giản.',
        texture: 'Tinh chất sữa êm dịu không hương liệu'
      }
    }
  };

  /* ------------------------------------------------------------------------
     3. APPLICATION STATE
     ------------------------------------------------------------------------ */
  const state = {
    currentUser: null,
    authMode: 'login',
    hasImage: false,
    imageFile: null,
    isScanning: false,
    scanToken: 0,
    hasAnalysis: false,
    activeTab: 'analysis',
    productTierFilter: 'all',
    imageDataUrl: null,
    imageElement: null,
    fileMeta: null,
    skinType: 'Chưa xác định',
    concerns: [],
    currentResult: null,
    history: []
  };

  /* ------------------------------------------------------------------------
     4. DOM REFERENCES
     ------------------------------------------------------------------------ */
  const dom = {
    authView: document.getElementById('authView'),
    appShell: document.getElementById('appShell'),
    authTabLogin: document.getElementById('authTabLogin'),
    authTabRegister: document.getElementById('authTabRegister'),
    authForm: document.getElementById('authForm'),
    authNameGroup: document.getElementById('authNameGroup'),
    authFullName: document.getElementById('authFullName'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    authConfirmGroup: document.getElementById('authConfirmGroup'),
    authConfirmPassword: document.getElementById('authConfirmPassword'),
    authError: document.getElementById('authError'),
    authSubmitBtn: document.getElementById('authSubmitBtn'),
    activeUserLabel: document.getElementById('activeUserLabel'),
    logoutBtn: document.getElementById('logoutBtn'),

    uploadZone: document.getElementById('uploadZone'),
    imageInput: document.getElementById('imageInput'),
    uploadPrompt: document.getElementById('uploadPrompt'),
    uploadMeta: document.getElementById('uploadMeta'),
    changeImageBtn: document.getElementById('changeImageBtn'),
    uploadError: document.getElementById('uploadError'),

    skinTypeSelect: document.getElementById('skinTypeSelect'),
    concernPills: document.getElementById('concernPills'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analyzeCaption: document.getElementById('analyzeCaption'),

    workspaceStatusPill: document.getElementById('workspaceStatusPill'),
    onboardingGuide: document.getElementById('onboardingGuide'),
    comparisonGrid: document.getElementById('comparisonGrid'),
    originalPreview: document.getElementById('originalPreview'),
    originalFrameMeta: document.getElementById('originalFrameMeta'),
    scannedFrameMeta: document.getElementById('scannedFrameMeta'),
    canvasStage: document.getElementById('canvasStage'),
    scannedCanvas: document.getElementById('scannedCanvas'),
    waitingOverlay: document.getElementById('waitingOverlay'),

    tabButtons: Array.from(document.querySelectorAll('.tab-btn')),
    panels: {
      analysis: document.getElementById('panel-analysis'),
      routine: document.getElementById('panel-routine'),
      products: document.getElementById('panel-products'),
      history: document.getElementById('panel-history')
    }
  };

  /* ------------------------------------------------------------------------
     5. UTILITY HELPERS
     ------------------------------------------------------------------------ */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  function formatTimestamp(date) {
    if (!date) {
      date = new Date();
    }
    let parsedDate = date instanceof Date ? date : new Date(date);
    if (isNaN(parsedDate.getTime())) {
      if (typeof date === 'string' && date.trim().length > 0) {
        return date;
      }
      parsedDate = new Date();
    }
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(parsedDate.getDate());
    const month = pad(parsedDate.getMonth() + 1);
    const year = parsedDate.getFullYear();
    const hours = pad(parsedDate.getHours());
    const minutes = pad(parsedDate.getMinutes());
    return `${day}/${month}/${year} — ${hours}:${minutes}`;
  }

  function isValidImageFile(file) {
    if (!file) return false;
    const lowerName = (file.name || '').toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    return hasValidExt || hasValidMime;
  }

  function showToast(title, message, type = 'success', durationMs = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card is-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-title">${escapeHtml(title)}</span>
        <button type="button" class="toast-close-btn" aria-label="Đóng thông báo">ĐÓNG</button>
      </div>
      <p class="toast-message">${escapeHtml(message)}</p>
      <div class="toast-progress" style="animation-duration: ${durationMs}ms;"></div>
    `;

    container.appendChild(toast);

    // Trigger smooth fade-in
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    let timeoutId = null;
    const removeToast = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 380);
    };

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', removeToast);
    }

    timeoutId = setTimeout(removeToast, durationMs);
  }

  function showUploadError(message) {
    dom.uploadError.textContent = message;
    dom.uploadError.hidden = false;
    showToast('THÔNG BÁO TẢI ẢNH', message, 'error', 5000);
  }

  function clearUploadError() {
    dom.uploadError.textContent = '';
    dom.uploadError.hidden = true;
  }

  /* ------------------------------------------------------------------------
     6. CLIENT-SIDE IMAGE PIXEL ANALYSIS & CANVAS OVERLAY
     ------------------------------------------------------------------------ */
  function analyzeImageMetrics(imgElement) {
    const sampleSize = 120;
    const regions = [
      { key: 'forehead', label: 'VÙNG TRÁN', x0: 0.25, y0: 0.12, x1: 0.75, y1: 0.34 },
      { key: 'leftCheek', label: 'GÒ MÁ', x0: 0.16, y0: 0.40, x1: 0.42, y1: 0.66 },
      { key: 'tZone', label: 'VÙNG CHỮ T', x0: 0.42, y0: 0.36, x1: 0.58, y1: 0.64 },
      { key: 'jawline', label: 'CẰM & VIỀN HÀM', x0: 0.30, y0: 0.68, x1: 0.70, y1: 0.88 }
    ];

    const fallbackResult = {
      meanLuma: 156,
      regions: {
        forehead: { variance: 0.42, warmth: 0.35, peakX: 0.48, peakY: 0.22 },
        leftCheek: { variance: 0.48, warmth: 0.44, peakX: 0.28, peakY: 0.52 },
        tZone: { variance: 0.56, warmth: 0.41, peakX: 0.50, peakY: 0.48 },
        jawline: { variance: 0.39, warmth: 0.38, peakX: 0.52, peakY: 0.77 }
      }
    };

    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = sampleSize;
      offscreen.height = sampleSize;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) return fallbackResult;

      ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

      let totalLuma = 0;
      let totalPixels = 0;
      const regionStats = {};

      regions.forEach((reg) => {
        const startX = Math.floor(reg.x0 * sampleSize);
        const endX = Math.ceil(reg.x1 * sampleSize);
        const startY = Math.floor(reg.y0 * sampleSize);
        const endY = Math.ceil(reg.y1 * sampleSize);

        let sumLuma = 0;
        let sumWarmth = 0;
        let count = 0;
        let maxLocalDiff = -1;
        let bestX = (reg.x0 + reg.x1) / 2;
        let bestY = (reg.y0 + reg.y1) / 2;

        // First pass: average luma in region
        for (let y = startY; y < endY; y += 1) {
          for (let x = startX; x < endX; x += 1) {
            const idx = (y * sampleSize + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            sumLuma += luma;
            sumWarmth += Math.max(0, r - (g + b) * 0.5);
            count += 1;
          }
        }

        const meanRegLuma = count > 0 ? sumLuma / count : 140;
        const meanWarmth = count > 0 ? sumWarmth / count : 18;
        let diffAccum = 0;

        // Second pass: local texture/tonal deviation & peak focus coordinate
        for (let y = startY + 1; y < endY - 1; y += 1) {
          for (let x = startX + 1; x < endX - 1; x += 1) {
            const idx = (y * sampleSize + x) * 4;
            const rightIdx = (y * sampleSize + (x + 1)) * 4;
            const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const lumaRight =
              0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];

            const deviation = Math.abs(luma - meanRegLuma) * 0.65 + Math.abs(luma - lumaRight) * 1.1;
            diffAccum += deviation;

            if (deviation > maxLocalDiff) {
              maxLocalDiff = deviation;
              bestX = x / sampleSize;
              bestY = y / sampleSize;
            }
          }
        }

        totalLuma += sumLuma;
        totalPixels += count;

        const normVariance = Math.min(0.95, Math.max(0.22, (diffAccum / Math.max(1, count)) / 24));
        const normWarmth = Math.min(0.95, Math.max(0.18, meanWarmth / 42));

        regionStats[reg.key] = {
          variance: normVariance,
          warmth: normWarmth,
          peakX: bestX,
          peakY: bestY
        };
      });

      return {
        meanLuma: totalPixels > 0 ? totalLuma / totalPixels : 150,
        regions: regionStats
      };
    } catch (err) {
      return fallbackResult;
    }
  }

  function createThumbnailDataUrl(imgElement) {
    const maxEdge = 420;
    const naturalW = imgElement.naturalWidth || 420;
    const naturalH = imgElement.naturalHeight || 420;
    const scale = Math.min(1, maxEdge / Math.max(naturalW, naturalH));
    const targetW = Math.max(1, Math.round(naturalW * scale));
    const targetH = Math.max(1, Math.round(naturalH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.drawImage(imgElement, 0, 0, targetW, targetH);
    try {
      return canvas.toDataURL('image/jpeg', 0.68);
    } catch (err) {
      return '';
    }
  }

  function renderScannedCanvas(imgElement, items, showOverlay) {
    const canvas = dom.scannedCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgElement) return;

    // Preserve exact natural aspect ratio without arbitrary dimension clamping (Problem 4)
    const maxRenderEdge = 960;
    const natW = imgElement.naturalWidth || 800;
    const natH = imgElement.naturalHeight || 800;
    const scale = Math.min(1, maxRenderEdge / Math.max(natW, natH));
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);

    canvas.width = w;
    canvas.height = h;
    canvas.style.aspectRatio = `${w} / ${h}`;

    // Base image draw
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgElement, 0, 0, w, h);

    // Problem 1 & 4: If not scanned, or items is empty (State B), do NOT draw any bounding boxes or brackets
    if (!showOverlay || !Array.isArray(items) || items.length === 0) {
      return;
    }

    // Subtle editorial surface veil
    ctx.fillStyle = 'rgba(250, 248, 245, 0.05)';
    ctx.fillRect(0, 0, w, h);

    // Delicate outer calibration frame
    const inset = Math.round(Math.min(w, h) * 0.032);
    ctx.strokeStyle = 'rgba(216, 167, 177, 0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

    // Center alignment hairlines
    ctx.strokeStyle = 'rgba(216, 167, 177, 0.24)';
    ctx.beginPath();
    ctx.moveTo(w / 2, inset);
    ctx.lineTo(w / 2, h - inset);
    ctx.moveTo(inset, h / 2);
    ctx.lineTo(w - inset, h / 2);
    ctx.stroke();

    const fontSize = Math.max(10, Math.round(w * 0.015));

    items.forEach((det) => {
      // Problem 4: display_x = norm_x * display_width, etc.
      const normX = det.norm_x != null ? det.norm_x : (det.x / natW);
      const normY = det.norm_y != null ? det.norm_y : (det.y / natH);
      const normW = det.norm_w != null ? det.norm_w : (det.width / natW);
      const normH = det.norm_h != null ? det.norm_h : (det.height / natH);

      const left = Math.round(normX * w);
      const top = Math.round(normY * h);
      const boxW = Math.max(12, Math.round(normW * w));
      const boxH = Math.max(12, Math.round(normH * h));
      const right = left + boxW;
      const bottom = top + boxH;

      // Soft focus area tint
      ctx.fillStyle = 'rgba(216, 167, 177, 0.12)';
      ctx.fillRect(left, top, boxW, boxH);

      // Bounding box stroke (#D8A7B1 luxury palette)
      ctx.strokeStyle = '#D8A7B1';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(left, top, boxW, boxH);

      // Viewfinder corner brackets (#A65C6D)
      const bLen = Math.min(8, Math.round(Math.min(boxW, boxH) * 0.35));
      ctx.strokeStyle = '#A65C6D';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(left, top + bLen);
      ctx.lineTo(left, top);
      ctx.lineTo(left + bLen, top);
      // Top-right
      ctx.moveTo(right - bLen, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, top + bLen);
      // Bottom-left
      ctx.moveTo(left, bottom - bLen);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + bLen, bottom);
      // Bottom-right
      ctx.moveTo(right - bLen, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, bottom - bLen);
      ctx.stroke();

      // Typographic coordinate pill tag (#FAF8F5 label text)
      const confPercent = Math.round((det.confidence || 0) * 100);
      const labelText = `${det.name_vi || det.class} ${confPercent}%`;

      ctx.font = `600 ${fontSize}px "Be Vietnam Pro", sans-serif`;
      const textMetrics = ctx.measureText(labelText);
      const padX = 6;
      const pillW = textMetrics.width + padX * 2;
      const pillH = fontSize + 8;

      let pillX = left;
      pillX = Math.max(inset + 4, Math.min(w - inset - pillW - 4, pillX));

      let pillY = top - pillH - 4;
      if (pillY < inset + 4) {
        pillY = bottom + 4;
      }

      // Leader hairline
      ctx.strokeStyle = 'rgba(166, 92, 109, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left + Math.min(8, boxW / 2), pillY < top ? top : bottom);
      ctx.lineTo(pillX + pillW / 2, pillY < top ? pillY + pillH : pillY);
      ctx.stroke();

      // Pill background (#A65C6D) + border (#D8A7B1)
      ctx.fillStyle = '#A65C6D';
      ctx.strokeStyle = '#D8A7B1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillW, pillH, 3);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();

      // Label text (#FAF8F5 luxury palette)
      ctx.fillStyle = '#FAF8F5';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, pillX + padX, pillY + pillH / 2 + 0.5);
    });
  }

  /* ------------------------------------------------------------------------
     7. CONSULTATION REPORT GENERATOR (ADAPTED TO SKIN TYPE & CONCERNS)
     ------------------------------------------------------------------------ */
  function buildConsultationReport(metrics, skinType, concerns) {
    const profile = SKIN_TYPE_PROFILES[skinType] || SKIN_TYPE_PROFILES['Chưa xác định'];
    const activeConcerns = concerns.length > 0 ? concerns : [];

    // Calculate zone weights based on selected concerns
    const weights = { forehead: 1, leftCheek: 1, tZone: 1, jawline: 1 };
    activeConcerns.forEach((c) => {
      const cData = CONCERN_DATA[c];
      if (!cData) return;
      weights.forehead = Math.max(weights.forehead, cData.zoneWeights.forehead);
      weights.leftCheek = Math.max(weights.leftCheek, cData.zoneWeights.leftCheek);
      weights.tZone = Math.max(weights.tZone, cData.zoneWeights.tZone);
      weights.jawline = Math.max(weights.jawline, cData.zoneWeights.jawline);
    });

    // Skin type multiplier
    const typeBoost =
      skinType === 'Da dầu'
        ? { forehead: 1.15, leftCheek: 0.95, tZone: 1.25, jawline: 1.1 }
        : skinType === 'Da khô'
          ? { forehead: 1.05, leftCheek: 1.22, tZone: 0.9, jawline: 1.1 }
          : skinType === 'Da nhạy cảm'
            ? { forehead: 1.0, leftCheek: 1.3, tZone: 0.95, jawline: 1.15 }
            : skinType === 'Da hỗn hợp'
              ? { forehead: 1.15, leftCheek: 1.1, tZone: 1.25, jawline: 1.05 }
              : { forehead: 1, leftCheek: 1, tZone: 1, jawline: 1 };

    const rawZones = [
      {
        key: 'forehead',
        index: '01',
        name: 'Vùng Trán',
        shortTag: 'TRÁN',
        reg: metrics.regions.forehead,
        mult: weights.forehead * typeBoost.forehead
      },
      {
        key: 'leftCheek',
        index: '02',
        name: 'Hai Bên Gò Má',
        shortTag: 'GÒ MÁ',
        reg: metrics.regions.leftCheek,
        mult: weights.leftCheek * typeBoost.leftCheek
      },
      {
        key: 'tZone',
        index: '03',
        name: 'Vùng Chữ T & Cánh Mũi',
        shortTag: 'CHỮ T',
        reg: metrics.regions.tZone,
        mult: weights.tZone * typeBoost.tZone
      },
      {
        key: 'jawline',
        index: '04',
        name: 'Vùng Cằm & Viền Hàm',
        shortTag: 'CẰM',
        reg: metrics.regions.jawline,
        mult: weights.jawline * typeBoost.jawline
      }
    ];

    const zones = rawZones.map((item) => {
      const combinedScore = (item.reg.variance * 0.62 + item.reg.warmth * 0.38) * item.mult;
      const intensityPercent = Math.min(94, Math.max(24, Math.round(combinedScore * 105)));
      const spotCount = Math.max(2, Math.round(intensityPercent / 12));

      let severity = 'ỔN ĐỊNH';
      if (intensityPercent >= 70) severity = 'CẦN CHÚ Ý';
      else if (intensityPercent >= 48) severity = 'THEO DÕI NHẸ';

      return {
        key: item.key,
        index: item.index,
        name: item.name,
        shortTag: item.shortTag,
        spotCount,
        severity,
        intensityPercent,
        description: buildZoneObservation(item.key, skinType, activeConcerns, intensityPercent),
        focusCoord: {
          x: item.reg.peakX,
          y: item.reg.peakY
        }
      };
    });

    const totalSpots = zones.reduce((acc, z) => acc + z.spotCount, 0);
    const maxIntensity = Math.max(...zones.map((z) => z.intensityPercent));
    const dominantZone = zones.reduce((top, curr) =>
      curr.intensityPercent > top.intensityPercent ? curr : top
    );

    const priorityLevel =
      maxIntensity >= 74 || activeConcerns.length >= 3
        ? 'CAO'
        : maxIntensity >= 52 || activeConcerns.length >= 1
          ? 'TRUNG BÌNH'
          : 'CÂN BẰNG';

    const lumaClarityBonus = metrics.meanLuma >= 95 && metrics.meanLuma <= 215 ? 4 : 1;
    const concernClarityBonus = activeConcerns.length > 0 ? 2 : 0;
    const compatibilityScore = Math.min(
      98,
      profile.compatibilityBase + lumaClarityBonus + concernClarityBonus
    );

    const summaryText = buildEditorialSummary(skinType, activeConcerns, dominantZone.name, profile.note);
    const textureAdvice = buildTextureAdvice(skinType, activeConcerns);
    const lifestyleRules = buildAcneLifestyleRules(skinType, activeConcerns);
    const routine = buildRoutine(skinType, activeConcerns, profile);
    const products = buildProductSuggestions(skinType, activeConcerns, profile);

    return {
      skinType,
      concerns: [...activeConcerns],
      summaryText,
      kpis: {
        totalSpots,
        priorityLevel,
        focusZone: dominantZone.name,
        compatibilityScore: `${compatibilityScore}%`
      },
      zones,
      textureAdvice,
      lifestyleRules,
      routine,
      products
    };
  }

  function buildZoneObservation(zoneKey, skinType, concerns, intensity) {
    const hasAcne = concerns.includes('Mụn');
    const hasPigment = concerns.includes('Thâm sạm');
    const hasAcneMarks = concerns.includes('Thâm mụn');
    const hasBlackheads = concerns.includes('Mụn đầu đen');
    const hasRedness = concerns.includes('Mẩn đỏ');

    if (zoneKey === 'forehead') {
      if (hasAcne || skinType === 'Da dầu') {
        return 'Tuyến bã nhờn hoạt động cao hơn mức trung bình, dễ xuất hiện mụn ẩn hoặc bít tắc li ti gần chân tóc nếu làm sạch chưa kỹ.';
      }
      if (hasBlackheads) {
        return 'Vùng giữa trán có xu hướng tích tụ sợi bã nhờn nhẹ; cần ưu tiên làm sạch cân bằng pH và hoạt chất tan trong dầu.';
      }
      if (hasRedness || skinType === 'Da nhạy cảm') {
        return 'Bề mặt da trán mỏng, dễ ửng đỏ trước tia cực tím trực diện; cần chống nắng dịu nhẹ và tránh tẩy sừng mạnh.';
      }
      if (hasPigment || hasAcneMarks) {
        return 'Ghi nhận vùng sắc tố nhẹ phía trán; duy trì chống nắng đủ lượng để giữ tông da đồng đều.';
      }
      return `Mật độ điểm ghi nhận ở mức ${intensity}%, kết cấu tương đối đồng đều và đáp ứng tốt với dưỡng ẩm dịu nhẹ.`;
    }

    if (zoneKey === 'leftCheek') {
      if (hasRedness || skinType === 'Da nhạy cảm' || skinType === 'Da khô') {
        return 'Hai bên gò má có dấu hiệu nhạy cảm mao mạch, dễ ửng đỏ hoặc khô căng khi thay đổi nhiệt độ; ưu tiên làm dịu với Vitamin B5 và Ceramide.';
      }
      if (hasAcneMarks) {
        return 'Ghi nhận vết thâm sau mụn tập trung tại vùng má; ưu tiên Azelaic Acid hoặc Niacinamide kết hợp chống nắng kỹ mỗi sáng.';
      }
      if (hasPigment) {
        return 'Phát hiện sự chênh lệch sắc tố khu trú ở gò má cao; cần chú trọng chống nắng phổ rộng và tinh chất dưỡng sáng dịu êm.';
      }
      if (hasAcne) {
        return 'Vùng má cần hạn chế kết cấu kem quá đặc gây bí tắc; nên thay vỏ gối định kỳ để giảm ma sát.';
      }
      return 'Độ ẩm và độ mịn bề mặt ở mức hài hòa, chỉ cần duy trì lớp màng ẩm bảo vệ ổn định.';
    }

    if (zoneKey === 'tZone') {
      if (hasBlackheads || skinType === 'Da dầu' || skinType === 'Da hỗn hợp') {
        return 'Khu vực chữ T và cánh mũi tập trung tuyến dầu cao, dễ hình thành mụn đầu đen; nên kết hợp BHA nồng độ dịu và làm sạch kép buổi tối.';
      }
      if (hasAcne) {
        return 'Dễ tích tụ bã nhờn vùng cánh mũi và giữa hai chân mày, nên ưu tiên kết cấu gel mỏng nhẹ tránh gây bít tắc.';
      }
      if (hasRedness) {
        return 'Cánh mũi có dấu hiệu nhạy cảm nhẹ; tránh lột mụn cơ học hoặc miết mạnh bằng bông tẩy trang.';
      }
      return 'Vùng chữ T duy trì độ cân bằng khá tốt; lưu ý làm sạch nhẹ nhàng quanh hai bên cánh mũi vào buổi tối.';
    }

    // jawline
    if (hasAcne) {
      return 'Ghi nhận các điểm mụn cần theo dõi quanh cằm và viền hàm, thường liên quan đến ma sát khẩu trang hoặc chu kỳ sinh lý.';
    }
    if (hasAcneMarks || hasPigment) {
      return 'Có dấu hiệu thâm sau mụn tại vùng cằm; hạn chế chạm tay lên mặt và ưu tiên hoạt chất phục hồi đều màu.';
    }
    if (hasBlackheads) {
      return 'Vùng hõm cằm dễ tích tụ bã nhờn; cần chú ý làm sạch kỹ phần cằm dưới và đường viền hàm mỗi cuối ngày.';
    }
    if (hasRedness) {
      return 'Viền hàm nhạy cảm trước ma sát khẩu trang; ưu tiên khẩu trang mềm thoáng và kem dưỡng phục hồi mỏng nhẹ.';
    }
    return 'Vùng cằm ổn định, tiếp tục làm sạch kỹ phần viền hàm và cổ mỗi cuối ngày để ngừa tích tụ cặn bẩn.';
  }

  function buildTextureAdvice(skinType, concerns) {
    const hasAcneOrBlackhead = concerns.includes('Mụn') || concerns.includes('Mụn đầu đen');
    const hasRedness = concerns.includes('Mẩn đỏ');

    const map = {
      'Da khô': {
        lead: 'Nền da khô cần kết cấu giàu chất ẩm và chất béo sinh học để bù đắp lớp màng hydrolipid tự nhiên, hạn chế bong tróc và khô căng.',
        preferredTitle: 'Sữa kem, Tinh chất sữa & Kem dưỡng ẩm mượt',
        preferredDesc: 'Ưu tiên kết cấu dạng sữa (Lotion/Emulsion) hoặc kem mềm giàu Ceramide, Squalane và Axit Hyaluronic đa phân tử.',
        preferredTags: ['Sữa rửa mặt kem', 'Tinh chất sữa', 'Kem dưỡng ẩm sâu'],
        avoidTitle: 'Gel cồn khô, Bọt tẩy mạnh & Đất sét khô nhanh',
        avoidDesc: 'Tránh sữa rửa mặt tạo bọt dày chứa sunfat hoặc toner nhiều cồn khô khiến bề mặt mất nước nhanh hơn.',
        avoidTags: ['Bọt tẩy pH cao', 'Cồn khô bay hơi', 'Đất sét hút dầu mạnh'],
        layeringDesc: 'Thoa tinh chất trên nền da còn hơi ẩm sau rửa mặt, khóa bằng kem dưỡng trong vòng 60 giây. Nếu có mụn ẩn, chỉ dùng kem đặc tại hai bên má.'
      },
      'Da dầu': {
        lead: 'Nền da dầu ưu tiên kết cấu gốc nước mỏng nhẹ (oil-free, non-comedogenic) giúp cấp đủ nước cho biểu bì mà không gây bít tắc cổ nang lông.',
        preferredTitle: 'Gel trong, Tinh chất nước & Nhũ tương thấm nhanh',
        preferredDesc: 'Chọn sản phẩm nền nước (Gel-cream, Fluid, Serum lỏng) giúp bề mặt ráo thoáng, hạn chế bóng nhờn vùng chữ T.',
        preferredTags: ['Gel rửa mặt dịu', 'Serum gốc nước', 'Gel-cream kiềm dầu'],
        avoidTitle: 'Sáp đặc, Dầu nền nặng & Kem khóa ẩm quá dày',
        avoidDesc: 'Hạn chế dầu khoáng nặng, bơ hạt mỡ nồng độ cao hoặc kem chống nắng quá bóng dễ gây bí nang lông.',
        avoidTags: ['Sáp/Bơ đặc', 'Dầu nặng dễ bí tắc', 'Kem nền dày lì'],
        layeringDesc: 'Giữ chu trình tối giản 3 - 4 lớp mỏng. Đợi mỗi lớp thấm ráo hoàn toàn trước khi chuyển bước tiếp theo để tránh vón cục.'
      },
      'Da hỗn hợp': {
        lead: 'Nền da hỗn hợp đòi hỏi chiến lược kết cấu phân vùng thông minh: thông thoáng vùng chữ T (trán, mũi, cằm) và êm dịu cho hai bên gò má.',
        preferredTitle: 'Gel cân bằng, Lotion mỏng & Kem chống nắng kết cấu lai',
        preferredDesc: 'Sử dụng kết cấu sữa lỏng hoặc gel-lotion dễ điều chỉnh độ dày mỏng tùy theo từng vùng trên gương mặt.',
        preferredTags: ['Gel kem dịu nhẹ', 'Serum thấm nhanh', 'Nhũ tương đa vùng'],
        avoidTitle: 'Sản phẩm kiềm dầu quá khô hoặc kem quá giàu dầu toàn mặt',
        avoidDesc: 'Tránh bôi kem đặc lên vùng mũi/cằm hoặc dùng sữa rửa mặt tẩy mạnh khiến hai bên má bị khô căng.',
        avoidTags: ['Tẩy dầu quá gắt', 'Kem đặc vùng chữ T', 'Lớp lót silicone dày'],
        layeringDesc: 'Áp dụng kỹ thuật thoa phân lớp: toàn mặt một lớp mỏng, sau đó dặm thêm một lượng nhỏ kem dưỡng riêng cho vùng má khô.'
      },
      'Da nhạy cảm': {
        lead: 'Nền da nhạy cảm đặt sự tối giản và êm dịu lên hàng đầu; mọi kết cấu cần hạn chế tối đa ma sát cơ học khi thoa lên da.',
        preferredTitle: 'Sữa không bọt, Tinh chất làm dịu & Kem sáp phục hồi nhẹ',
        preferredDesc: 'Chọn công thức không hương liệu, kết cấu trơn mượt dễ tán nhẹ bằng đầu ngón tay mà không cần chà xát.',
        preferredTags: ['Sữa dịu không bọt', 'Serum B5 lỏng nhẹ', 'Kem phục hồi êm'],
        avoidTitle: 'Hạt scrub vật lý, Gel lột & Sản phẩm nhiều tinh dầu thơm',
        avoidDesc: 'Tránh tuyệt đối hạt tẩy tế bào chết, mặt nạ lột hoặc các dạng dung dịch nồng độ axit cao gây châm chích.',
        avoidTags: ['Hạt scrub thô', 'Hương liệu & tinh dầu', 'Axit nồng độ cao'],
        layeringDesc: 'Làm ấm nhẹ sản phẩm giữa các đầu ngón tay rồi áp nhẹ lên da. Giữ tối đa 3 - 4 bước mỗi buổi để giảm tải cho màng bảo vệ.'
      },
      'Chưa xác định': {
        lead: 'Với nền da chưa xác định rõ đặc tính, kết cấu cân bằng sinh học (nhũ tương mỏng, gel nước pH 5.5) là lựa chọn an toàn và dễ thích nghi nhất.',
        preferredTitle: 'Gel dịu pH 5.5, Tinh chất nước & Nhũ tương cân bằng',
        preferredDesc: 'Các kết cấu trung tính giúp duy trì độ ẩm vừa đủ ở má mà vẫn giữ vùng chữ T thoáng sạch suốt ngày.',
        preferredTags: ['Gel pH 5.5', 'Serum cấp nước', 'Nhũ tương mỏng nhẹ'],
        avoidTitle: 'Sản phẩm cực đoan (quá đặc bí hoặc tẩy rửa quá khô)',
        avoidDesc: 'Tránh thử nghiệm đồng thời nhiều sản phẩm đặc trị kết cấu nặng khi chưa theo dõi phản ứng của da.',
        avoidTags: ['Xà phòng kiềm cao', 'Kem đặc bít tắc', 'Tẩy sừng dày đặc'],
        layeringDesc: 'Tuân thủ nguyên tắc từ lỏng đến đặc: nước cân bằng -> tinh chất gốc nước -> nhũ tương khóa ẩm -> chống nắng ban ngày.'
      }
    };

    const base = map[skinType] || map['Chưa xác định'];
    let extraNote = '';
    if (hasAcneOrBlackhead) {
      extraNote = ' Lưu ý riêng cho tình trạng mụn / mụn đầu đen: luôn ưu tiên nhãn "Non-comedogenic" (không gây bít tắc lỗ chân lông) ở mọi bước kem dưỡng và chống nắng.';
    } else if (hasRedness) {
      extraNote = ' Lưu ý riêng cho tình trạng mẩn đỏ: ưu tiên kết cấu mát dịu, không chứa cồn khô và tránh sử dụng bông tẩy trang ma sát mạnh.';
    }

    return {
      lead: `${base.lead}${extraNote}`,
      preferredTitle: base.preferredTitle,
      preferredDesc: base.preferredDesc,
      preferredTags: base.preferredTags,
      avoidTitle: base.avoidTitle,
      avoidDesc: base.avoidDesc,
      avoidTags: base.avoidTags,
      layeringDesc: base.layeringDesc
    };
  }

  function buildAcneLifestyleRules(skinType, concerns) {
    const hasAcneFocus =
      concerns.includes('Mụn') ||
      concerns.includes('Mụn đầu đen') ||
      concerns.includes('Thâm mụn');

    const subnote = hasAcneFocus
      ? 'ĐANG KÍCH HOẠT TRỌNG TÂM KIỂM SOÁT MỤN & THÂM'
      : `NGUYÊN TẮC HỖ TRỢ NGỪA MỤN CHO ${skinType.toUpperCase()}`;

    return {
      subnote,
      nutrition: [
        {
          title: 'Ưu tiên thực phẩm có chỉ số đường huyết thấp (Low-GI)',
          desc: 'Giảm đồ uống nhiều đường, bánh kẹo ngọt và tinh bột tinh chế để tránh tăng đột biến insulin và IGF-1 kích thích tuyến bã nhờn.'
        },
        {
          title: 'Tiết chế sữa động vật tách béo & đồ chiên rán nhiều dầu',
          desc: 'Hạn chế sữa bò tách béo hoặc chế phẩm nhiều đường/béo bão hòa; có thể thay thế bằng sữa hạt không đường khi da đang nổi mụn viêm.'
        },
        {
          title: 'Bổ sung Kẽm, Omega-3 & chất chống oxy hóa tự nhiên',
          desc: 'Tăng cường cá béo, hạt bí, rau xanh đậm, quả mọng và uống đủ 1.8 - 2.2 lít nước lọc mỗi ngày để hỗ trợ làm dịu phản ứng viêm.'
        }
      ],
      habits: [
        {
          title: 'Tuyệt đối không tự ý nặn mụn & hạn chế chạm tay lên mặt',
          desc: 'Tác động lực tay làm vỡ vách nang lông, khiến vi khuẩn lan sâu hơn và để lại thâm mụn dai dẳng nhiều tuần.'
        },
        {
          title: 'Giữ vệ sinh vật dụng tiếp xúc trực tiếp với da mặt',
          desc: 'Thay vỏ gối 1 - 2 lần/tuần, giặt sạch khăn mặt hoặc dùng khăn giấy dùng một lần, lau màn hình điện thoại và thay khẩu trang mỗi ngày.'
        },
        {
          title: 'Ngủ đủ 7 - 8 tiếng trước 23h & kiểm soát căng thẳng',
          desc: 'Thiếu ngủ và stress làm tăng hormone cortisol, kích thích tiết dầu vùng chữ T và làm chậm tốc độ phục hồi tổn thương da.'
        }
      ]
    };
  }

  function buildEditorialSummary(skinType, concerns, dominantZoneName, profileNote) {
    const concernClause =
      concerns.length > 0
        ? `trọng tâm điều chỉnh ${concerns.join(', ').toLowerCase()}`
        : 'duy trì sự cân bằng sinh lý toàn diện';
    return `Hồ sơ ${skinType.toLowerCase()} với ${concernClause}, ưu tiên chăm sóc đặc biệt tại ${dominantZoneName.toLowerCase()}. ${profileNote}`;
  }

  function buildRoutine(skinType, concerns, profile) {
    const hasRedness = concerns.includes('Mẩn đỏ') || skinType === 'Da nhạy cảm';
    const hasAcne = concerns.includes('Mụn');
    const hasBlackheads = concerns.includes('Mụn đầu đen');
    const hasAcneMarks = concerns.includes('Thâm mụn');
    const hasPigment = concerns.includes('Thâm sạm');

    // Chọn tinh chất buổi sáng theo thứ tự ưu tiên an toàn
    let amTreatment = {
      type: 'TINH CHẤT CÂN BẰNG',
      title: 'Tinh chất Axit Hyaluronic & Chiết xuất Cúc La Mã',
      desc: 'Cấp nước tầng nông và làm dịu da trước tác động của môi trường điều hòa và tia cực tím.',
      dosage: '2 - 3 giọt cho toàn mặt',
      timing: 'Mỗi sáng trên nền da còn hơi ẩm',
      note: 'Vỗ nhẹ đều khắp mặt và cổ, chờ khoảng 45 giây trước khi chuyển sang bước khóa ẩm.',
      texture: 'Tinh chất cấp nước mỏng nhẹ'
    };

    if (hasRedness) {
      amTreatment = CONCERN_DATA['Mẩn đỏ'].morningStep;
    } else if (hasAcne) {
      amTreatment = CONCERN_DATA['Mụn'].morningStep;
    } else if (hasAcneMarks) {
      amTreatment = CONCERN_DATA['Thâm mụn'].morningStep;
    } else if (hasPigment) {
      amTreatment = CONCERN_DATA['Thâm sạm'].morningStep;
    } else if (hasBlackheads) {
      amTreatment = CONCERN_DATA['Mụn đầu đen'].morningStep;
    }

    // Chọn đặc trị buổi tối theo bối cảnh
    let pmTreatment = {
      type: 'NUÔI DƯỠNG & PHỤC HỒI',
      title: 'Tinh chất Vitamin B5 kết hợp Chiết xuất Rau má',
      desc: 'Tái tạo độ ẩm tự nhiên và làm dịu mọi căng thẳng của biểu bì sau một ngày dài.',
      dosage: '3 giọt cho toàn mặt và vùng cổ',
      timing: 'Hằng tối sau bước cân bằng ẩm',
      note: 'Tập trung vỗ nhẹ thêm ở vùng gò má nếu thường xuyên ngồi phòng máy lạnh.',
      texture: 'Tinh chất phục hồi chuyên sâu'
    };

    if (hasRedness) {
      pmTreatment = CONCERN_DATA['Mẩn đỏ'].eveningStep;
    } else if (hasAcne) {
      pmTreatment = CONCERN_DATA['Mụn'].eveningStep;
    } else if (hasBlackheads) {
      pmTreatment = CONCERN_DATA['Mụn đầu đen'].eveningStep;
    } else if (hasAcneMarks) {
      pmTreatment = CONCERN_DATA['Thâm mụn'].eveningStep;
    } else if (hasPigment) {
      pmTreatment = CONCERN_DATA['Thâm sạm'].eveningStep;
    }

    const amSteps = [
      {
        number: '01',
        type: 'BƯỚC 01 · LÀM SẠCH BUỔI SÁNG',
        title: profile.cleanser.title,
        desc:
          skinType === 'Da khô' || skinType === 'Da nhạy cảm' || hasRedness
            ? 'Làm sạch dịu nhẹ bằng nước mát hoặc lượng nhỏ sữa rửa mặt không bọt để giữ nguyên lớp màng ẩm tự nhiên sau giấc ngủ.'
            : profile.cleanser.desc,
        dosage: 'Lượng bằng 1 hạt đậu xanh (tạo bọt mịn trước khi thoa)',
        timing: '20 - 30 giây vào mỗi sáng',
        note: 'Không dùng nước nóng; thấm khô nhẹ bằng khăn sạch hoặc bông mềm.',
        texture: profile.cleanser.texture
      },
      {
        number: '02',
        type: 'BƯỚC 02 · CÂN BẰNG & CẤP ẨM NỀN',
        title: hasRedness
          ? 'Nước dưỡng làm dịu không cồn chiết xuất Rau má / Yến mạch'
          : 'Dung dịch cân bằng ẩm chứa Axit Hyaluronic phân tử nhỏ',
        desc: 'Đưa độ pH bề mặt về ngưỡng sinh lý 5.5 và tạo lớp đệm ẩm giúp tinh chất đặc trị thẩm thấu đồng đều.',
        dosage: '4 - 5 giọt vỗ trực tiếp bằng lòng bàn tay',
        timing: 'Ngay sau bước rửa mặt khi da còn ẩm nhẹ',
        note: 'Tránh dùng bông lau ma sát mạnh nếu hai bên má đang có dấu hiệu mẩn đỏ.',
        texture: 'Nước dưỡng lỏng nhẹ'
      },
      {
        number: '03',
        type: `BƯỚC 03 · ${amTreatment.type}`,
        title: amTreatment.title,
        desc: amTreatment.desc,
        dosage: amTreatment.dosage,
        timing: amTreatment.timing,
        note: amTreatment.note,
        texture: amTreatment.texture
      },
      {
        number: '04',
        type: 'BƯỚC 04 · KHÓA ẨM BAN NGÀY',
        title: profile.moisturizer.title,
        desc: profile.moisturizer.desc,
        dosage:
          skinType === 'Da dầu'
            ? 'Lượng bằng 1 hạt ngô, tán mỏng vùng chữ T'
            : 'Lượng bằng 1 - 1.5 đốt ngón tay út cho mặt và cổ',
        timing: 'Mỗi sáng sau khi tinh chất thấm ráo',
        note: 'Nền da dầu có thể bỏ qua bước này nếu kem chống nắng đã có khả năng cấp ẩm tốt.',
        texture: profile.moisturizer.texture
      },
      {
        number: '05',
        type: 'BƯỚC 05 · BẢO VỆ PHỔ RỘNG',
        title: profile.spf.title,
        desc: `${profile.spf.desc} Lá chắn bắt buộc để ngăn thâm mụn, thâm sạm đậm màu và bảo vệ hàng rào da.`,
        dosage: 'Đủ 2 đốt ngón tay (khoảng 1.2 ml) cho mặt & cổ',
        timing: 'Trước khi ra ngoài 15 phút; thoa dặm lại sau mỗi 3 - 4 giờ',
        note: 'Chấm đều nhiều điểm nhỏ rồi tán vỗ nhẹ theo một chiều để lớp chống nắng tiệp mịn, không vón.',
        texture: profile.spf.texture
      }
    ];

    const pmSteps = [
      {
        number: '01',
        type: 'BƯỚC 01 · TẨY TRANG CHUYÊN BIỆT',
        title:
          skinType === 'Da dầu' || hasAcne || hasBlackheads
            ? 'Nước tẩy trang Micellar dịu nhẹ không cồn / Dầu tẩy trang lỏng nhũ hóa sạch'
            : 'Nước tẩy trang dịu nhẹ hoặc Sáp tẩy trang lành tính không hương liệu',
        desc: 'Hòa tan hoàn toàn màng lọc kem chống nắng, bụi mịn PM2.5 và bã nhờn oxy hóa tích tụ cả ngày.',
        dosage: '2 - 3 bông thấm đẫm hoặc 2 nhấn dầu nhũ hóa kỹ',
        timing: '45 - 60 giây vào đầu quy trình tối',
        note: 'Nếu dùng dầu/sáp tẩy trang, cần nhũ hóa kỹ với nước ấm nhẹ trong 30 giây cho đến khi chuyển trắng sữa hoàn toàn.',
        texture: 'Làm sạch hòa tan bã nhờn'
      },
      {
        number: '02',
        type: 'BƯỚC 02 · RỬA MẶT CÂN BẰNG 5.5',
        title: profile.cleanser.title,
        desc: 'Loại bỏ hoàn toàn cặn dầu nhũ hóa và bụi bẩn còn sót lại, giữ bề mặt thông thoáng mà không khô căng.',
        dosage: 'Lượng bằng 1 hạt đậu, đánh bọt mịn với nước trước khi thoa',
        timing: '30 - 45 giây, tập trung kỹ vùng cánh mũi, trán và viền hàm',
        note: 'Rửa sạch kỹ vùng chân tóc và dưới cằm để phòng ngừa mụn ẩn quanh viền hàm.',
        texture: profile.cleanser.texture
      },
      {
        number: '03',
        type: 'BƯỚC 03 · LÀM DỊU & CÂN BẰNG ẨM',
        title: hasRedness
          ? 'Nước dưỡng phục hồi không cồn giàu Panthenol B5 & Rau má'
          : 'Toner cấp ẩm dịu nhẹ cân bằng pH sau làm sạch',
        desc: 'Làm dịu nhanh bề mặt da vừa làm sạch kép, ổn định độ ẩm trước khi đưa hoạt chất điều trị.',
        dosage: '4 - 5 giọt vỗ nhẹ đều khắp gương mặt',
        timing: 'Mỗi tối ngay sau bước rửa mặt',
        note: 'Đợi bề mặt ráo ẩm vừa phải (khoảng 1 - 2 phút) nếu bước tiếp theo dùng axit đặc trị như BHA/AHA.',
        texture: 'Dung dịch dịu nhẹ không cồn'
      },
      {
        number: '04',
        type: `BƯỚC 04 · ${pmTreatment.type}`,
        title: pmTreatment.title,
        desc: pmTreatment.desc,
        dosage: pmTreatment.dosage,
        timing: pmTreatment.timing,
        note:
          concerns.length >= 2
            ? `${pmTreatment.note} Do bạn có nhiều mối quan tâm (${concerns.join(', ')}), nên dùng xen kẽ cách ngày với tối phục hồi B5 để da thích nghi êm dịu.`
            : pmTreatment.note,
        texture: pmTreatment.texture
      },
      {
        number: '05',
        type: 'BƯỚC 05 · KHÓA ẨM TÁI TẠO ĐÊM',
        title:
          hasRedness || skinType === 'Da khô'
            ? 'Kem dưỡng phục hồi hàng rào bảo vệ chứa Ceramide & Panthenol'
            : profile.moisturizer.title,
        desc: 'Khóa giữ tinh chất điều trị bên dưới và giảm mất nước qua biểu bì suốt 8 giờ nghỉ ngơi ban đêm.',
        dosage: 'Lượng bằng 1 - 1.5 hạt đậu tùy độ khô từng vùng',
        timing: 'Bước cuối cùng mỗi tối, cách bước đặc trị 3 - 5 phút',
        note: 'Thoa mỏng hơn ở vùng chữ T nếu da dầu mụn, và dặm kỹ hơn ở hai bên gò má nếu ngồi điều hòa đêm.',
        texture: profile.moisturizer.texture
      }
    ];

    return { am: amSteps, pm: pmSteps };
  }

  function buildDermocosmeticTiers(skinType, concerns) {
    const isOilyOrMixed = skinType === 'Da dầu' || skinType === 'Da hỗn hợp';
    const isDryOrSensitive = skinType === 'Da khô' || skinType === 'Da nhạy cảm';
    const hasAcne = concerns.includes('Mụn');
    const hasBlackheads = concerns.includes('Mụn đầu đen');
    const hasAcneMarks = concerns.includes('Thâm mụn');
    const hasPigment = concerns.includes('Thâm sạm');
    const hasRedness = concerns.includes('Mẩn đỏ');

    const cleanserByTier = {
      student: isOilyOrMixed
        ? {
            brand: 'SIMPLE / BIODERMA',
            name: 'Simple Refreshing Facial Wash / Bioderma Sébium Gel Moussant (100ml)',
            active: 'Pro-Vitamin B5, Kẽm Gluconate & Đồng Sulfate dịu nhẹ',
            price: '140.000đ – 280.000đ',
            reason: 'Làm sạch bã nhờn vùng chữ T hiệu quả với chi phí hợp lý, không gây khô rát căng da.'
          }
        : {
            brand: 'CETAPHIL / CERAVE',
            name: 'Cetaphil Gentle Skin Cleanser / CeraVe Hydrating Cleanser (236ml)',
            active: 'Niacinamide, Panthenol B5 & 3 loại Ceramide thiết yếu',
            price: '210.000đ – 340.000đ',
            reason: 'Làm sạch êm dịu chuẩn da liễu, giữ lại lớp màng ẩm cho da khô, nhạy cảm hoặc mẩn đỏ.'
          },
      standard: isOilyOrMixed || hasAcne || hasBlackheads
        ? {
            brand: 'LA ROCHE-POSAY / SVR',
            name: 'La Roche-Posay Effaclar Purifying Foaming Gel / SVR Sebiaclear Gel Moussant',
            active: 'Zinc PCA, Gluconolactone (PHA) & Nước khoáng làm dịu',
            price: '390.000đ – 550.000đ',
            reason: 'Điều tiết dầu thừa và thông thoáng nang lông, lý tưởng cho nền da dầu mụn và mụn đầu đen.'
          }
        : {
            brand: 'LA ROCHE-POSAY / AVÈNE',
            name: 'La Roche-Posay Toleriane Caring Wash / Avène Cleanance Hydra Soothing Cream',
            active: 'Niacinamide, Ceramide-3 & Nước khoáng Avène làm dịu',
            price: '420.000đ – 620.000đ',
            reason: 'Công thức tối giản làm sạch nhẹ nhàng, hỗ trợ giảm ửng đỏ và căng tức hai bên gò má.'
          },
      premium: isOilyOrMixed || hasAcne
        ? {
            brand: 'PAULA’S CHOICE / OBAGI',
            name: 'Paula’s Choice Clear Pore Normalizing Cleanser / Obagi Clenziderm Daily Care',
            active: 'Salicylic Acid dịu nhẹ 0.5% - 2% & Panthenol',
            price: '850.000đ – 1.150.000đ',
            reason: 'Hỗ trợ làm sạch sâu cổ nang lông ngay từ bước rửa mặt mà vẫn giữ độ cân bằng bề mặt.'
          }
        : {
            brand: 'SKINCEUTICALS / KIEHL’S',
            name: 'SkinCeuticals Gentle Cleanser / Kiehl’s Ultra Facial Cleanser',
            active: 'Allantoin, Chiết xuất cam thảo & Squalane thực vật',
            price: '920.000đ – 1.350.000đ',
            reason: 'Kết cấu kem sữa cao cấp giúp làm sạch êm ái, bảo toàn hàng rào lipid cho làn da mỏng nhạy cảm.'
          }
    };

    const pickTreatmentByTier = (tier) => {
      if (hasRedness) {
        if (tier === 'student') {
          return {
            brand: 'KLAIRS / SKIN1004',
            name: 'Skin1004 Madagascar Centella Ampoule / Klairs Midnight Blue Drop',
            active: 'Chiết xuất Rau má tinh khiết (Centella) & Guaiazulene',
            price: '260.000đ – 380.000đ',
            reason: 'Làm dịu nhanh vùng da ửng đỏ và giảm cảm giác nóng rát với bảng thành phần lành tính.'
          };
        }
        if (tier === 'standard') {
          return {
            brand: 'LA ROCHE-POSAY / BIODERMA',
            name: 'La Roche-Posay Hyalu B5 Serum / Bioderma Sensibio Defensive Serum',
            active: 'Vitamin B5 5%, Madecassoside & Carnosine chống kích ứng',
            price: '680.000đ – 850.000đ',
            reason: 'Tăng cường hàng rào tự vệ cho da dễ mẩn đỏ, phục hồi biểu bì mỏng yếu rõ rệt.'
          };
        }
        return {
          brand: 'SKINCEUTICALS',
          name: 'SkinCeuticals Phyto Corrective Gel',
          active: 'Hyaluronic Acid, Chiết xuất Dưa leo, Cỏ xạ hương & Dâu tằm',
          price: '1.850.000đ – 2.250.000đ',
          reason: 'Tinh chất dược mỹ phẩm chuyên biệt làm dịu đỏ rát sau kích ứng và cấp ẩm không gây bí.'
        };
      }

      if (hasBlackheads) {
        if (tier === 'student') {
          return {
            brand: 'PAULA’S CHOICE (MINI) / THE ORDINARY',
            name: 'The Ordinary Salicylic Acid 2% Solution / Paula’s Choice BHA 2% (30ml)',
            active: 'Salicylic Acid (BHA) 2% tan trong dầu',
            price: '220.000đ – 360.000đ',
            reason: 'Thẩm thấu vào lỗ chân lông vùng mũi và chữ T để làm mềm, đẩy sạch nhân mụn đầu đen.'
          };
        }
        if (tier === 'standard') {
          return {
            brand: 'SVR / PAULA’S CHOICE',
            name: 'SVR Sebiaclear Serum / Paula’s Choice Skin Perfecting 2% BHA Liquid (118ml)',
            active: 'Gluconolactone (PHA) 14%, Niacinamide 4% hoặc BHA 2%',
            price: '590.000đ – 850.000đ',
            reason: 'Giải quyết đồng thời sợi bã nhờn oxy hóa, mụn đầu đen và bề mặt lỗ chân lông thô.'
          };
        }
        return {
          brand: 'OBAGI / SKINCEUTICALS',
          name: 'Obagi Clenziderm Pore Therapy BHA 2% / SkinCeuticals Blemish + Age Defense',
          active: 'Salicylic Acid 2%, Dioic Acid & Glycolic Acid',
          price: '1.150.000đ – 2.450.000đ',
          reason: 'Công thức chuẩn lâm sàng kiểm soát bã nhờn mạnh mẽ và làm thông thoáng cổ nang lông.'
        };
      }

      if (hasAcne) {
        if (tier === 'student') {
          return {
            brand: 'MEGADUO / DERMA FORTE / THE ORDINARY',
            name: 'Derma Forte Gel / The Ordinary Niacinamide 10% + Zinc 1%',
            active: 'Azelaic Acid, Coenzyme Q10 hoặc Niacinamide 10% + Kẽm',
            price: '150.000đ – 290.000đ',
            reason: 'Hỗ trợ giảm sưng mụn, kiềm dầu vùng chữ T và hạn chế thâm sau mụn với mức giá sinh viên.'
          };
        }
        if (tier === 'standard') {
          return {
            brand: 'LA ROCHE-POSAY / EUCERIN',
            name: 'La Roche-Posay Effaclar Duo+M / Eucerin ProAcne A.I. Clearing Treatment',
            active: 'Phylobioma, Niacinamide, Salicylic Acid & Licochalcone A',
            price: '450.000đ – 620.000đ',
            reason: 'Làm dịu nốt mụn viêm, cân bằng hệ vi sinh bề mặt và ngăn mụn tái phát.'
          };
        }
        return {
          brand: 'OBAGI / MARTIDERM',
          name: 'MartiDerm Acniover Serum / Obagi Pore Therapy & Azelaic System',
          active: 'Niacinamide, Chiết xuất hoa sen, Prebiotics & BHA bọc',
          price: '980.000đ – 1.850.000đ',
          reason: 'Điều tiết dầu thừa chuyên sâu mà vẫn duy trì độ ẩm mượt cho nền da đang điều trị mụn.'
        };
      }

      if (hasAcneMarks || hasPigment) {
        if (tier === 'student') {
          return {
            brand: 'THE ORDINARY / GOOD MOLECULES',
            name: 'The Ordinary Alpha Arbutin 2% + HA / Good Molecules Discoloration Serum',
            active: 'Alpha Arbutin 2%, Tranexamic Acid & Niacinamide 4%',
            price: '240.000đ – 380.000đ',
            reason: 'Làm mờ vết thâm mụn và đốm sạm khu trú ở gò má một cách êm dịu, ít bong tróc.'
          };
        }
        if (tier === 'standard') {
          return {
            brand: 'EUCERIN / LA ROCHE-POSAY',
            name: 'Eucerin Spotless Brightening Booster / La Roche-Posay Mela B3 Serum',
            active: 'Thiamidol / Melasyl kết hợp Niacinamide 10%',
            price: '750.000đ – 980.000đ',
            reason: 'Hoạt chất ức chế tổng hợp melanin thế hệ mới giúp cải thiện rõ rệt thâm sạm và thâm mụn.'
          };
        }
        return {
          brand: 'SKINCEUTICALS / OBAGI',
          name: 'SkinCeuticals Discoloration Defense / Obagi Professional-C Serum 15%',
          active: 'Tranexamic Acid 3%, Kojic Acid 1%, Niacinamide 5% hoặc L-Ascorbic 15%',
          price: '2.100.000đ – 2.850.000đ',
          reason: 'Phức hợp đặc trị sắc tố cường độ cao giúp cải thiện thâm nám lâu năm và làm sáng đều tông da.'
        };
      }

      // Default balanced hydration treatment
      if (tier === 'student') {
        return {
          brand: 'THE ORDINARY / TORRIDEN',
          name: 'Torriden Dive-In Low Molecular HA Serum / The Ordinary HA 2% + B5',
          active: 'Axit Hyaluronic đa phân tử & Vitamin B5',
          price: '240.000đ – 360.000đ',
          reason: 'Bổ sung độ ẩm tầng nông tức thì, giữ da mềm mại và căng mịn suốt cả ngày.'
        };
      }
      if (tier === 'standard') {
        return {
          brand: 'VICHY / LA ROCHE-POSAY',
          name: 'Vichy Mineral 89 Booster / La Roche-Posay Hyalu B5',
          active: '89% Nước khoáng núi lửa Vichy, HA tinh khiết & Vitamin B5',
          price: '650.000đ – 880.000đ',
          reason: 'Củng cố hàng rào bảo vệ tự nhiên và cải thiện độ đàn hồi bề mặt.'
        };
      }
      return {
        brand: 'SKINCEUTICALS / ESTHEDERM',
        name: 'SkinCeuticals Hydrating B5 Gel / Esthederm Intensive Hyaluronic Serum',
        active: 'Hyaluronic Acid nguyên chất & Vitamin B5 nồng độ cao',
        price: '1.750.000đ – 2.200.000đ',
        reason: 'Cấp nước chuyên sâu không chứa dầu, giúp bề mặt da mịn mượt và phục hồi nhanh chóng.'
      };
    };

    const moisturizerByTier = {
      student: isOilyOrMixed || hasAcne
        ? {
            brand: 'NEUTROGENA / SIMPLE',
            name: 'Neutrogena Hydro Boost Water Gel / Simple Hydrating Light Moisturiser',
            active: 'Hyaluronic Acid, Glycerin & Vitamin E',
            price: '190.000đ – 340.000đ',
            reason: 'Kết cấu gel nước mỏng nhẹ thấm nhanh, không gây nặng mặt cho da dầu hoặc da hỗn hợp.'
          }
        : {
            brand: 'CERAVE / BIODERMA',
            name: 'CeraVe Daily Moisturising Lotion / Bioderma Atoderm Crème (200ml)',
            active: '3 loại Ceramide thiết yếu, Niacinamide & MVE Technology',
            price: '280.000đ – 390.000đ',
            reason: 'Cấp ẩm bền bỉ suốt 24 giờ và phục hồi lớp màng bảo vệ tự nhiên cho da khô, nhạy cảm.'
          },
      standard: isDryOrSensitive || hasRedness
        ? {
            brand: 'LA ROCHE-POSAY / AVÈNE',
            name: 'La Roche-Posay Cicaplast Baume B5+ / Avène Cicalfate+ Repairing Cream',
            active: 'Panthenol B5 5%, Madecassoside & Phức hợp Tribioma',
            price: '390.000đ – 520.000đ',
            reason: 'Làm dịu mẩn đỏ, phục hồi da tổn thương sau mụn hoặc kích ứng do hoạt chất mạnh.'
          }
        : {
            brand: 'BIODERMA / SVR',
            name: 'Bioderma Sébium Sensitive / SVR Sebiaclear Hydra',
            active: 'Ceramide sinh học, Kẽm Gluconate & Niacinamide 5%',
            price: '410.000đ – 540.000đ',
            reason: 'Dưỡng ẩm dịu nhẹ cho da dầu mụn đang dùng BHA/Azelaic mà vẫn giữ độ thoáng lỗ chân lông.'
          },
      premium: isOilyOrMixed || hasAcne
        ? {
            brand: 'KIEHL’S / PAULA’S CHOICE',
            name: 'Kiehl’s Ultra Facial Oil-Free Gel Cream / Paula’s Choice Clear Oil-Free Moisturizer',
            active: 'Đạm Glycoprotein băng giá, Niacinamide & Ceramide',
            price: '950.000đ – 1.250.000đ',
            reason: 'Khóa ẩm không dầu, làm mát bề mặt và hạn chế tiết bã nhờn dư thừa suốt ngày.'
          }
        : {
            brand: 'SKINCEUTICALS / OBAGI',
            name: 'SkinCeuticals Triple Lipid Restore 2:4:2 / Obagi Hydrate Facial Moisturizer',
            active: '2% Ceramide, 4% Cholesterol, 2% Axit béo hoặc Hydromanil',
            price: '1.200.000đ – 3.400.000đ',
            reason: 'Tái thiết lập cấu trúc lipid gian bào chuẩn tỷ lệ vàng, phục hồi độ căng mịn cho da khô nhạy cảm.'
          }
    };

    const sunscreenByTier = {
      student: isOilyOrMixed || hasAcne
        ? {
            brand: 'SKIN AQUA / BIODERMA (MINI)',
            name: 'Skin Aqua Tone Up UV / Garnier Super UV Invisible Serum SPF 50+',
            active: 'Màng lọc phổ rộng kết hợp Vitamin C & HA',
            price: '160.000đ – 320.000đ',
            reason: 'Kết cấu ráo nhẹ, dễ mua và tiết kiệm khi dùng đủ 2 đốt ngón tay mỗi ngày.'
          }
        : {
            brand: 'ANESSA / CELL FUSION C',
            name: 'Cell Fusion C Toning / Moisture Sunscreen 100 SPF50+ (35ml)',
            active: 'Peptide, Collagen thủy phân & Oxit Kẽm',
            price: '280.000đ – 380.000đ',
            reason: 'Chống nắng dịu nhẹ, không cay mắt và giữ độ ẩm êm ái cho làn da thiên khô, mẩn đỏ.'
          },
      standard: isOilyOrMixed || hasAcne || hasBlackheads
        ? {
            brand: 'LA ROCHE-POSAY / EUCERIN',
            name: 'La Roche-Posay Anthelios UVMune 400 Oil Control / Eucerin Sun Dry Touch',
            active: 'Màng lọc Mexoryl 400, Airlicium kiềm dầu & Carnitine',
            price: '440.000đ – 580.000đ',
            reason: 'Bảo vệ phổ rộng trước tia UVA dài gây thâm sạm, đồng thời kiềm dầu ráo mịn suốt 8 giờ.'
          }
        : {
            brand: 'AVÈNE / BIODERMA',
            name: 'Avène Very High Protection Fluid / Bioderma Photoderm AR SPF 50+',
            active: 'Màng lọc TriAsorB & Phức hợp Rosactiv giảm ửng đỏ',
            price: '480.000đ – 650.000đ',
            reason: 'Thiết kế riêng cho nền da nhạy cảm hoặc có mẩn đỏ, hạn chế sinh nhiệt dưới nắng.'
          },
      premium: {
        brand: 'HELIOCARE / SKINCEUTICALS',
        name: 'Heliocare 360° Water Gel / SkinCeuticals Physical Fusion UV Defense SPF 50',
        active: 'Fernblock+ chống oxy hóa hoặc Oxit Kẽm & Titanium Dioxide vi hạt',
        price: '980.000đ – 1.450.000đ',
        reason: 'Chống nắng dược mỹ phẩm phổ rộng cao cấp bảo vệ DNA tế bào, ngăn ngừa tái phát thâm sạm và thâm mụn.'
      }
    };

    return [
      {
        id: 'student',
        eyebrow: 'PHÂN KHÚC 01',
        title: 'Học sinh – Sinh viên',
        priceRange: '140.000đ – 390.000đ / sản phẩm',
        description: 'Ưu tiên công thức tối giản, hiệu quả ổn định và dễ duy trì đều đặn mỗi ngày.',
        items: [
          { role: '01 · LÀM SẠCH', ...cleanserByTier.student },
          { role: '02 · ĐẶC TRỊ TRỌNG TÂM', ...pickTreatmentByTier('student') },
          { role: '03 · KHÓA ẨM PHỤC HỒI', ...moisturizerByTier.student },
          { role: '04 · CHỐNG NẮNG BẢO VỆ', ...sunscreenByTier.student }
        ]
      },
      {
        id: 'standard',
        eyebrow: 'PHÂN KHÚC 02',
        title: 'Phổ thông',
        priceRange: '390.000đ – 980.000đ / sản phẩm',
        description: 'Các dòng dược mỹ phẩm kinh điển được kiểm chứng lâm sàng rộng rãi tại phòng khám da liễu.',
        items: [
          { role: '01 · LÀM SẠCH', ...cleanserByTier.standard },
          { role: '02 · ĐẶC TRỊ TRỌNG TÂM', ...pickTreatmentByTier('standard') },
          { role: '03 · KHÓA ẨM PHỤC HỒI', ...moisturizerByTier.standard },
          { role: '04 · CHỐNG NẮNG BẢO VỆ', ...sunscreenByTier.standard }
        ]
      },
      {
        id: 'premium',
        eyebrow: 'PHÂN KHÚC 03',
        title: 'Cao cấp',
        priceRange: '850.000đ – 3.400.000đ / sản phẩm',
        description: 'Công thức nồng độ tinh khiết cao, công nghệ bọc dẫn thấm sâu và tối ưu tốc độ cải thiện bề mặt.',
        items: [
          { role: '01 · LÀM SẠCH', ...cleanserByTier.premium },
          { role: '02 · ĐẶC TRỊ TRỌNG TÂM', ...pickTreatmentByTier('premium') },
          { role: '03 · KHÓA ẨM PHỤC HỒI', ...moisturizerByTier.premium },
          { role: '04 · CHỐNG NẮNG BẢO VỆ', ...sunscreenByTier.premium }
        ]
      }
    ];
  }

  function buildProductSuggestions(skinType, concerns, profile) {
    const isSensitive = skinType === 'Da nhạy cảm' || concerns.includes('Mẩn đỏ');

    // Thu thập hoạt chất khuyên dùng và thành phần cần lưu ý
    const activeMap = new Map();
    const cautionMap = new Map();

    if (concerns.length === 0) {
      activeMap.set('Axit Hyaluronic đa tầng', {
        name: 'Axit Hyaluronic đa tầng',
        desc: 'Giữ nước sinh học bền vững cho mọi nền da mà không gây nặng mặt.'
      });
      activeMap.set('Dẫn xuất Vitamin B3 (4%)', {
        name: 'Dẫn xuất Vitamin B3 (4%)',
        desc: 'Củng cố hàng rào bảo vệ, hỗ trợ làm đều tông da và điều tiết dầu nhẹ nhàng.'
      });
      activeMap.set('Hoạt chất phục hồi Vitamin B5', {
        name: 'Hoạt chất phục hồi Vitamin B5',
        desc: 'Làm dịu da tức thì và duy trì độ mềm mại cho biểu bì.'
      });
      cautionMap.set('Hương liệu nồng độ cao', {
        name: 'Hương liệu nồng độ cao',
        desc: 'Có thể làm tăng nguy cơ nhạy cảm khi sử dụng lâu dài.'
      });
      cautionMap.set('Chồng chéo nhiều axit tẩy mạnh', {
        name: 'Chồng chéo nhiều axit tẩy mạnh',
        desc: 'Không cần thiết cho chu trình cân bằng và dễ làm mỏng hàng rào ẩm tự nhiên.'
      });
    } else {
      concerns.forEach((c) => {
        const entry = CONCERN_DATA[c];
        if (!entry) return;
        entry.actives.forEach((act) => {
          if (isSensitive && act.name.includes('BHA')) {
            activeMap.set('PHA 4% (Thay thế dịu nhẹ)', {
              name: 'PHA 4% (Thay thế dịu nhẹ cho BHA)',
              desc: 'Làm sạch tế bào chết bề mặt êm ái hơn, phù hợp với nền da đang nhạy cảm hoặc mẩn đỏ.'
            });
          } else if (!activeMap.has(act.name)) {
            activeMap.set(act.name, act);
          }
        });
        entry.cautions.forEach((caut) => {
          if (!cautionMap.has(caut.name)) {
            cautionMap.set(caut.name, caut);
          }
        });
      });
    }

    if (isSensitive && !cautionMap.has('Cồn khô & Tinh dầu thơm')) {
      cautionMap.set('Cồn khô & Tinh dầu thơm', {
        name: 'Cồn khô & Tinh dầu thơm',
        desc: 'Nên loại trừ khỏi bảng thành phần để tránh cảm giác nóng rát hoặc ửng đỏ.'
      });
    }

    const tiers = buildDermocosmeticTiers(skinType, concerns);

    return {
      actives: Array.from(activeMap.values()).slice(0, 5),
      cautions: Array.from(cautionMap.values()).slice(0, 4),
      tiers
    };
  }

  /* ------------------------------------------------------------------------
     8. TAB RENDERING FUNCTIONS
     ------------------------------------------------------------------------ */
  function renderBlankStateHtml(message) {
    return `
      <div class="empty-state-card">
        <span class="empty-state-index">AURASKIN</span>
        <p class="empty-state-text">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderAnalysisTab() {
    if (!state.hasAnalysis || !state.currentResult) {
      dom.panels.analysis.innerHTML = renderBlankStateHtml(BLANK_TAB_MESSAGE);
      return;
    }

    const res = state.currentResult;
    const textureAdvice = res.textureAdvice || buildTextureAdvice(res.skinType, res.concerns || []);
    const lifestyleRules = res.lifestyleRules || buildAcneLifestyleRules(res.skinType, res.concerns || []);

    const preferredTagsHtml = (textureAdvice.preferredTags || [])
      .map((tag) => `<span class="texture-pill">${escapeHtml(tag)}</span>`)
      .join('');

    const avoidTagsHtml = (textureAdvice.avoidTags || [])
      .map((tag) => `<span class="texture-pill is-avoid">${escapeHtml(tag)}</span>`)
      .join('');

    const nutritionHtml = (lifestyleRules.nutrition || [])
      .map(
        (item) => `
      <li class="lifestyle-item">
        <span class="lifestyle-item-title">${escapeHtml(item.title)}</span>
        <p class="lifestyle-item-desc">${escapeHtml(item.desc)}</p>
      </li>
    `
      )
      .join('');

    const habitsHtml = (lifestyleRules.habits || [])
      .map(
        (item) => `
      <li class="lifestyle-item">
        <span class="lifestyle-item-title">${escapeHtml(item.title)}</span>
        <p class="lifestyle-item-desc">${escapeHtml(item.desc)}</p>
      </li>
    `
      )
      .join('');

    // State B: Normal skin / 0 detections on valid image
    if (res.isNoCondition) {
      let priorityNoteHtml = '';
      if (res.unmatchedPriorityNote) {
        priorityNoteHtml = `
          <aside class="priority-note-banner" role="note">
            <strong>GHI CHÚ MỐI QUAN TÂM</strong>
            <p>${escapeHtml(res.unmatchedPriorityNote)}</p>
          </aside>
        `;
      }

      dom.panels.analysis.innerHTML = `
        <div class="analysis-context-bar">
          <p class="analysis-summary-text">Không phát hiện vấn đề da thuộc 5 nhóm nhận diện.</p>
          <div class="context-tags">
            <span class="context-tag">${escapeHtml(res.skinType)}</span>
            <span class="context-tag is-accent">DA BÌNH THƯỜNG / ỔN ĐỊNH</span>
          </div>
        </div>

        ${priorityNoteHtml}

        <article class="analysis-normal-card">
          <span class="normal-card-eyebrow">KẾT QUẢ ĐÁNH GIÁ LÂM SÀNG</span>
          <h3 class="normal-card-title">Không phát hiện vấn đề da thuộc 5 nhóm nhận diện.</h3>
          <p class="normal-card-desc">Làn da hiện tại duy trì trạng thái ổn định, bề mặt sáng khỏe và không ghi nhận tổn thương thuộc các nhóm mụn trứng cá, thâm mụn, mụn đầu đen, thâm sạm hoặc mẩn đỏ.</p>
          <div class="normal-card-guideline">
            <h4 class="guideline-title">KHUYẾN NGHỊ DUY TRÌ &amp; BẢO VỆ NỀN DA</h4>
            <p>Tiếp tục duy trì 3 bước chăm sóc bảo vệ cơ bản mỗi ngày: Làm sạch dịu nhẹ (độ pH 5.5), Dưỡng ẩm cân bằng sinh học phù hợp nền ${escapeHtml(res.skinType)}, và Sử dụng kem chống nắng phổ rộng SPF 50+ / PA++++ mỗi sáng để bảo vệ hàng rào da bền vững.</p>
          </div>
        </article>

        <section class="analysis-extra-block" aria-label="Lời khuyên kết cấu theo loại da">
          <div class="panel-subheading-row">
            <h3 class="panel-subheading">Lời khuyên kết cấu theo loại da</h3>
            <span class="panel-subnote">NỀN DA: ${escapeHtml(res.skinType.toUpperCase())}</span>
          </div>

          <div class="texture-advice-card">
            <p class="texture-advice-lead">${escapeHtml(textureAdvice.lead)}</p>
            <div class="texture-advice-grid">
              <article class="texture-block">
                <span class="texture-block-label">01 / KẾT CẤU NÊN ƯU TIÊN</span>
                <h4 class="texture-block-title">${escapeHtml(textureAdvice.preferredTitle)}</h4>
                <p class="texture-block-desc">${escapeHtml(textureAdvice.preferredDesc)}</p>
                <div class="texture-pill-list">${preferredTagsHtml}</div>
              </article>

              <article class="texture-block">
                <span class="texture-block-label">02 / KẾT CẤU CẦN HẠN CHẾ</span>
                <h4 class="texture-block-title">${escapeHtml(textureAdvice.avoidTitle)}</h4>
                <p class="texture-block-desc">${escapeHtml(textureAdvice.avoidDesc)}</p>
                <div class="texture-pill-list">${avoidTagsHtml}</div>
              </article>

              <article class="texture-block">
                <span class="texture-block-label">03 / NGUYÊN TẮC PHÂN LỚP</span>
                <h4 class="texture-block-title">Thứ tự từ lỏng đến đặc</h4>
                <p class="texture-block-desc">${escapeHtml(textureAdvice.layeringDesc)}</p>
              </article>
            </div>
          </div>
        </section>

        <section class="analysis-extra-block" aria-label="Quy tắc ăn uống và sinh hoạt duy trì da khỏe">
          <div class="panel-subheading-row">
            <h3 class="panel-subheading">Quy tắc ăn uống &amp; sinh hoạt duy trì da khỏe</h3>
            <span class="panel-subnote">${escapeHtml(lifestyleRules.subnote)}</span>
          </div>

          <div class="lifestyle-split">
            <article class="lifestyle-panel">
              <header class="lifestyle-panel-header">
                <h4 class="lifestyle-panel-title">QUY TẮC DINH DƯỠNG &amp; ĂN UỐNG</h4>
                <span class="lifestyle-panel-index">01</span>
              </header>
              <ul class="lifestyle-list">
                ${nutritionHtml}
              </ul>
            </article>

            <article class="lifestyle-panel">
              <header class="lifestyle-panel-header">
                <h4 class="lifestyle-panel-title">THÓI QUEN SINH HOẠT &amp; VỆ SINH DA</h4>
                <span class="lifestyle-panel-index">02</span>
              </header>
              <ul class="lifestyle-list">
                ${habitsHtml}
              </ul>
            </article>
          </div>
        </section>
      `;
      return;
    }

    // State C: Detected conditions
    let priorityNoteHtml = '';
    if (res.unmatchedPriorityNote) {
      priorityNoteHtml = `
        <aside class="priority-note-banner" role="note">
          <strong>GHI CHÚ MỐI QUAN TÂM ƯU TIÊN</strong>
          <p>${escapeHtml(res.unmatchedPriorityNote)}</p>
        </aside>
      `;
    }

    let alertBannerHtml = '';
    if (res.medicalWarning) {
      alertBannerHtml = `
        <aside class="clinical-warning-banner" role="alert" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem; background: rgba(166, 92, 109, 0.08); border-left: 3px solid #A65C6D;">
          <strong style="display: block; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #8D4355; margin-bottom: 0.25rem;">CẢNH BÁO Y KHOA</strong>
          <p style="font-size: 0.875rem; line-height: 1.5; color: #3C3734; margin: 0;">${escapeHtml(res.medicalWarning)}</p>
        </aside>
      `;
    } else if (res.rednessOverrideApplied) {
      alertBannerHtml = `
        <aside class="clinical-warning-banner" role="note" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem; background: rgba(216, 167, 177, 0.12); border-left: 3px solid #D8A7B1;">
          <strong style="display: block; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #8D4355; margin-bottom: 0.25rem;">ƯU TIÊN PHỤC HỒI HÀNG RÀO BẢO VỆ DA</strong>
          <p style="font-size: 0.875rem; line-height: 1.5; color: #3C3734; margin: 0;">Làn da ghi nhận dấu hiệu mẩn đỏ / suy yếu hàng rào bảo vệ. Phác đồ tự động giảm nồng độ hoạt chất mạnh (BHA, AHA, Retinoids) và ưu tiên nhóm phục hồi (Centella Asiatica, Panthenol B5, Ceramide).</p>
        </aside>
      `;
    }

    const concernTagsHtml =
      res.concerns.length > 0
        ? res.concerns
          .map((c) => `<span class="context-tag is-accent">${escapeHtml(c)}</span>`)
          .join('')
        : '<span class="context-tag">CHĂM SÓC CƠ BẢN</span>';

    // Problem 3: Render distinct detailed condition cards for each detected condition
    const conditionsHtml = (res.allConditions || []).map((cond, idx) => {
      const priorityBadge = cond.isPriority
        ? '<span class="condition-badge badge-priority">ƯU TIÊN CỦA BẠN</span>'
        : '';

      const signsListHtml = (cond.signs || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
      const careNotesListHtml = (cond.careNotes || []).map(c => `<li>${escapeHtml(c)}</li>`).join('');
      const warningsListHtml = (cond.warnings || []).map(w => `<li>${escapeHtml(w)}</li>`).join('');
      const ingredientsListHtml = (cond.activeIngredients || []).map(ing => `<li>${escapeHtml(ing)}</li>`).join('');

      return `
        <article class="condition-detail-card">
          <header class="condition-detail-header">
            <div class="condition-detail-title-wrap">
              <span class="zone-index">TÌNH TRẠNG 0${idx + 1}</span>
              <h4 class="condition-detail-name">${escapeHtml(cond.name)}</h4>
            </div>
            <div class="condition-badges-wrap">
              ${priorityBadge}
              <span class="condition-badge badge-count">${String(cond.spotCount).padStart(2, '0')} ĐIỂM PHÁT HIỆN</span>
              <span class="condition-badge badge-severity-${cond.severity}">MỨC ĐỘ: ${escapeHtml(cond.severityVi.toUpperCase())}</span>
              <span class="condition-badge badge-conf">ĐỘ TIN CẬY: ${cond.confidenceAvg}%</span>
            </div>
          </header>

          <div class="condition-section-grid">
            <div class="condition-info-box">
              <h5 class="condition-info-box-title">DẤU HIỆU NHẬN BIẾT ĐẶC TRƯNG</h5>
              <div class="condition-info-box-content">
                <ul>${signsListHtml || '<li>Theo dõi tổn thương bề mặt biểu bì.</li>'}</ul>
              </div>
            </div>

            <div class="condition-info-box">
              <h5 class="condition-info-box-title">LƯU Ý CHĂM SÓC RIÊNG BIỆT</h5>
              <div class="condition-info-box-content">
                <ul>${careNotesListHtml || '<li>Tuân thủ nguyên tắc dưỡng ẩm và bảo vệ màng chống nắng.</li>'}</ul>
              </div>
            </div>

            <div class="condition-info-box">
              <h5 class="condition-info-box-title">CẢNH BÁO &amp; THÀNH PHẦN CẦN TRÁNH</h5>
              <div class="condition-info-box-content">
                <ul>${warningsListHtml || '<li>Tránh cọ xát cơ học mạnh và dùng nhiều hoạt chất tẩy lột cùng lúc.</li>'}</ul>
              </div>
            </div>

            <div class="condition-info-box">
              <h5 class="condition-info-box-title">HOẠT CHẤT ĐIỀU TRỊ PHÙ HỢP</h5>
              <div class="condition-info-box-content">
                <ul>${ingredientsListHtml || '<li>Salicylic Acid (BHA), Niacinamide, Panthenol B5.</li>'}</ul>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    dom.panels.analysis.innerHTML = `
      <div class="analysis-context-bar">
        <p class="analysis-summary-text">${escapeHtml(res.summaryText)}</p>
        <div class="context-tags">
          <span class="context-tag">${escapeHtml(res.skinType)}</span>
          ${concernTagsHtml}
        </div>
      </div>

      ${priorityNoteHtml}
      ${alertBannerHtml}

      <div class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-label">TỔNG ĐIỂM PHÁT HIỆN</span>
          <p class="kpi-value">${String(res.kpis.totalSpots).padStart(2, '0')}</p>
          <span class="kpi-note">Tổng số điểm ghi nhận trên bề mặt</span>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">MỨC ĐỘ ƯU TIÊN</span>
          <p class="kpi-value is-text">${escapeHtml(res.kpis.priorityLevel)}</p>
          <span class="kpi-note">Đánh giá theo mức độ tổn thương</span>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">TÌNH TRẠNG TRỌNG TÂM</span>
          <p class="kpi-value is-text">${escapeHtml(res.kpis.focusZone)}</p>
          <span class="kpi-note">Tình trạng cần ưu tiên can thiệp</span>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">ĐỘ TIN CẬY AI</span>
          <p class="kpi-value">${escapeHtml(res.kpis.compatibilityScore)}</p>
          <span class="kpi-note">Độ tin cậy trung bình của mô hình</span>
        </article>
      </div>

      <div class="panel-subheading-row">
        <h3 class="panel-subheading">Phân tích chi tiết từng tình trạng da phát hiện</h3>
        <span class="panel-subnote">${(res.allConditions || []).length} TÌNH TRẠNG ĐƯỢC CHẨN ĐOÁN</span>
      </div>

      <div class="conditions-detail-list">
        ${conditionsHtml}
      </div>

      <section class="analysis-extra-block" aria-label="Lời khuyên kết cấu theo loại da">
        <div class="panel-subheading-row">
          <h3 class="panel-subheading">Lời khuyên kết cấu theo loại da</h3>
          <span class="panel-subnote">NỀN DA: ${escapeHtml(res.skinType.toUpperCase())}</span>
        </div>

        <div class="texture-advice-card">
          <p class="texture-advice-lead">${escapeHtml(textureAdvice.lead)}</p>
          <div class="texture-advice-grid">
            <article class="texture-block">
              <span class="texture-block-label">01 / KẾT CẤU NÊN ƯU TIÊN</span>
              <h4 class="texture-block-title">${escapeHtml(textureAdvice.preferredTitle)}</h4>
              <p class="texture-block-desc">${escapeHtml(textureAdvice.preferredDesc)}</p>
              <div class="texture-pill-list">${preferredTagsHtml}</div>
            </article>

            <article class="texture-block">
              <span class="texture-block-label">02 / KẾT CẤU CẦN HẠN CHẾ</span>
              <h4 class="texture-block-title">${escapeHtml(textureAdvice.avoidTitle)}</h4>
              <p class="texture-block-desc">${escapeHtml(textureAdvice.avoidDesc)}</p>
              <div class="texture-pill-list">${avoidTagsHtml}</div>
            </article>

            <article class="texture-block">
              <span class="texture-block-label">03 / NGUYÊN TẮC PHÂN LỚP</span>
              <h4 class="texture-block-title">Thứ tự từ lỏng đến đặc</h4>
              <p class="texture-block-desc">${escapeHtml(textureAdvice.layeringDesc)}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="analysis-extra-block" aria-label="Quy tắc ăn uống và sinh hoạt điều trị mụn">
        <div class="panel-subheading-row">
          <h3 class="panel-subheading">Quy tắc ăn uống &amp; sinh hoạt điều trị mụn</h3>
          <span class="panel-subnote">${escapeHtml(lifestyleRules.subnote)}</span>
        </div>

        <div class="lifestyle-split">
          <article class="lifestyle-panel">
            <header class="lifestyle-panel-header">
              <h4 class="lifestyle-panel-title">QUY TẮC DINH DƯỠNG &amp; ĂN UỐNG</h4>
              <span class="lifestyle-panel-index">01</span>
            </header>
            <ul class="lifestyle-list">
              ${nutritionHtml}
            </ul>
          </article>

          <article class="lifestyle-panel">
            <header class="lifestyle-panel-header">
              <h4 class="lifestyle-panel-title">THÓI QUEN SINH HOẠT &amp; VỆ SINH DA</h4>
              <span class="lifestyle-panel-index">02</span>
            </header>
            <ul class="lifestyle-list">
              ${habitsHtml}
            </ul>
          </article>
        </div>
      </section>
    `;
  }

  function renderRoutineTab() {
    if (!state.hasAnalysis || !state.currentResult) {
      dom.panels.routine.innerHTML = renderBlankStateHtml(BLANK_TAB_MESSAGE);
      return;
    }

    const res = state.currentResult;

    // Handle State B: No condition detected
    if (res.isNoCondition) {
      dom.panels.routine.innerHTML = `
        <article class="analysis-normal-card">
          <span class="normal-card-eyebrow">QUY TRÌNH DUY TRÌ NỀN DA CƠ BẢN</span>
          <h3 class="normal-card-title">Không yêu cầu phác đồ điều trị đặc trị</h3>
          <p class="normal-card-desc">Làn da không phát hiện bệnh lý thuộc 5 nhóm nhận diện (mụn trứng cá, thâm mụn, mụn đầu đen, thâm sạm, mẩn đỏ). Do đó, bạn không cần áp dụng các bước treatment đặc trị có hoạt chất mạnh. Chỉ cần duy trì 3 bước làm sạch - dưỡng ẩm - bảo vệ chống nắng cơ bản hằng ngày phù hợp nền ${escapeHtml(res.skinType)}.</p>
        </article>

        <div class="routine-grid">
          <section class="routine-column" aria-label="Quy trình buổi sáng">
            <header class="routine-col-header">
              <h3 class="routine-col-title">QUY TRÌNH BUỔI SÁNG (03 BƯỚC DUY TRÌ)</h3>
              <p class="routine-col-subtitle">Làm sạch dịu nhẹ, dưỡng ẩm cân bằng &amp; bảo vệ trước tia cực tím</p>
            </header>
            <div class="timeline-list">
              <article class="timeline-card">
                <span class="timeline-number">01</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 01 · LÀM SẠCH</span>
                  <h4 class="timeline-step-title">Sữa rửa mặt dịu nhẹ cân bằng pH 5.5</h4>
                  <p class="timeline-step-desc">Làm sạch bụi mịn và bã nhờn tích tụ qua đêm mà không làm tổn hại màng ẩm tự nhiên.</p>
                  <span class="timeline-step-texture">Gel / Bọt mịn dịu nhẹ</span>
                </div>
              </article>
              <article class="timeline-card">
                <span class="timeline-number">02</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 02 · CẤP ẨM</span>
                  <h4 class="timeline-step-title">Dưỡng ẩm cân bằng sinh học</h4>
                  <p class="timeline-step-desc">Bổ sung độ ẩm vừa đủ, giúp bề mặt mềm mại và duy trì hàng rào bảo vệ vững chắc.</p>
                  <span class="timeline-step-texture">Lotion / Kem mỏng nhẹ</span>
                </div>
              </article>
              <article class="timeline-card">
                <span class="timeline-number">03</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 03 · BẢO VỆ</span>
                  <h4 class="timeline-step-title">Kem chống nắng phổ rộng SPF 50+ / PA++++</h4>
                  <p class="timeline-step-desc">Bảo vệ tế bào da trước tia UVA, UVB và tác nhân oxy hóa từ môi trường hằng ngày.</p>
                  <span class="timeline-step-texture">Sữa lỏng / Kem chống nắng ráo mịn</span>
                </div>
              </article>
            </div>
          </section>

          <section class="routine-column" aria-label="Quy trình buổi tối">
            <header class="routine-col-header">
              <h3 class="routine-col-title">QUY TRÌNH BUỔI TỐI (03 BƯỚC PHỤC HỒI)</h3>
              <p class="routine-col-subtitle">Làm sạch kép dịu nhẹ &amp; khóa ẩm tái tạo màng bảo vệ ban đêm</p>
            </header>
            <div class="timeline-list">
              <article class="timeline-card">
                <span class="timeline-number">01</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 01 · TẨY TRANG</span>
                  <h4 class="timeline-step-title">Nước tẩy trang Micellar dịu nhẹ</h4>
                  <p class="timeline-step-desc">Hòa tan lớp kem chống nắng, bụi bẩn và dầu thừa tích tụ suốt cả ngày.</p>
                  <span class="timeline-step-texture">Dung dịch nước Micellar không cồn</span>
                </div>
              </article>
              <article class="timeline-card">
                <span class="timeline-number">02</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 02 · LÀM SẠCH</span>
                  <h4 class="timeline-step-title">Sữa rửa mặt làm sạch sâu dịu êm</h4>
                  <p class="timeline-step-desc">Hoàn tất quy trình làm sạch kép, chuẩn bị bề mặt biểu bì thông thoáng để hấp thu độ ẩm.</p>
                  <span class="timeline-step-texture">Gel rửa mặt sinh học</span>
                </div>
              </article>
              <article class="timeline-card">
                <span class="timeline-number">03</span>
                <div class="timeline-body">
                  <span class="timeline-step-type">BƯỚC 03 · PHỤC HỒI</span>
                  <h4 class="timeline-step-title">Kem dưỡng khóa ẩm phục hồi ban đêm</h4>
                  <p class="timeline-step-desc">Tăng cường Ceramide và Hyaluronic Acid giúp tái tạo màng lipid và ngăn ngừa mất nước qua da.</p>
                  <span class="timeline-step-texture">Kem dưỡng phục hồi ẩm mượt</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      `;
      return;
    }

    // State C: Render detailed treatment routine
    const { am, pm } = res.routine;

    const renderSteps = (steps) =>
      steps
        .map((step) => {
          const detailsHtml =
            step.dosage || step.timing
              ? `
                <div class="timeline-details-grid">
                  <div class="timeline-detail-item">
                    <span class="timeline-detail-label">LIỀU LƯỢNG</span>
                    <span class="timeline-detail-value">${escapeHtml(step.dosage || 'Vừa đủ phủ mỏng bề mặt')}</span>
                  </div>
                  <div class="timeline-detail-item">
                    <span class="timeline-detail-label">THỜI GIAN / TẦN SUẤT</span>
                    <span class="timeline-detail-value">${escapeHtml(step.timing || 'Hằng ngày')}</span>
                  </div>
                </div>
              `
              : '';

          const noteHtml = step.note
            ? `<p class="timeline-step-note">${escapeHtml(step.note)}</p>`
            : '';

          return `
            <article class="timeline-card">
              <span class="timeline-number">${escapeHtml(step.number)}</span>
              <div class="timeline-body">
                <span class="timeline-step-type">${escapeHtml(step.type)}</span>
                <h4 class="timeline-step-title">${escapeHtml(step.title)}</h4>
                <p class="timeline-step-desc">${escapeHtml(step.desc)}</p>
                ${detailsHtml}
                ${noteHtml}
                <span class="timeline-step-texture">${escapeHtml(step.texture)}</span>
              </div>
            </article>
          `;
        })
        .join('');

    // Nếu phát hiện nhiều tình trạng da, hiển thị phác đồ chi tiết cho TỪNG tình trạng (Yêu cầu 5)
    if (Array.isArray(res.allRoutines) && res.allRoutines.length > 1) {
      const allRoutinesHtml = res.allRoutines.map((r, rIdx) => {
        const badge = r.isPrimary
          ? '<span class="condition-badge badge-priority">TÌNH TRẠNG TRỌNG TÂM</span>'
          : '<span class="condition-badge">TÌNH TRẠNG KÈM THEO</span>';
        return `
          <div class="routine-condition-section" style="margin-bottom: 2.25rem;">
            <div class="panel-subheading-row" style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-soft); padding-bottom: 0.6rem;">
              <h3 class="panel-subheading">Phác đồ 0${rIdx + 1}: ${escapeHtml(r.conditionName)}</h3>
              ${badge}
            </div>
            <div class="routine-grid">
              <section class="routine-column" aria-label="Quy trình buổi sáng - ${escapeHtml(r.conditionName)}">
                <header class="routine-col-header">
                  <h3 class="routine-col-title">QUY TRÌNH BUỔI SÁNG (${String(r.am.length).padStart(2, '0')} BƯỚC)</h3>
                  <p class="routine-col-subtitle">Làm sạch dịu nhẹ, cân bằng &amp; bảo vệ cho ${escapeHtml(r.conditionName)}</p>
                </header>
                <div class="timeline-list">
                  ${renderSteps(r.am)}
                </div>
              </section>

              <section class="routine-column" aria-label="Quy trình buổi tối - ${escapeHtml(r.conditionName)}">
                <header class="routine-col-header">
                  <h3 class="routine-col-title">QUY TRÌNH BUỔI TỐI (${String(r.pm.length).padStart(2, '0')} BƯỚC)</h3>
                  <p class="routine-col-subtitle">Đặc trị &amp; phục hồi màng ẩm cho ${escapeHtml(r.conditionName)}</p>
                </header>
                <div class="timeline-list">
                  ${renderSteps(r.pm)}
                </div>
              </section>
            </div>
          </div>
        `;
      }).join('');

      dom.panels.routine.innerHTML = `
        <div class="multi-routine-container">
          ${allRoutinesHtml}
        </div>
      `;
      return;
    }

    // Mặc định hoặc khi chỉ có 1 tình trạng: hiển thị lưới quy trình đơn lẻ
    dom.panels.routine.innerHTML = `
      <div class="routine-grid">
        <section class="routine-column" aria-label="Quy trình buổi sáng">
          <header class="routine-col-header">
            <h3 class="routine-col-title">QUY TRÌNH BUỔI SÁNG (${String(am.length).padStart(2, '0')} BƯỚC CHI TIẾT)</h3>
            <p class="routine-col-subtitle">Làm sạch dịu nhẹ, chống oxy hóa, kiểm soát dầu &amp; bảo vệ trước tia cực tím</p>
          </header>
          <div class="timeline-list">
            ${renderSteps(am)}
          </div>
        </section>

        <section class="routine-column" aria-label="Quy trình buổi tối">
          <header class="routine-col-header">
            <h3 class="routine-col-title">QUY TRÌNH BUỔI TỐI (${String(pm.length).padStart(2, '0')} BƯỚC CHI TIẾT)</h3>
            <p class="routine-col-subtitle">Làm sạch kép, cân bằng pH, đặc trị trọng tâm &amp; phục hồi màng ẩm ban đêm</p>
          </header>
          <div class="timeline-list">
            ${renderSteps(pm)}
          </div>
        </section>
      </div>
    `;
  }

  function renderProductsTab() {
    if (!state.hasAnalysis || !state.currentResult) {
      dom.panels.products.innerHTML = renderBlankStateHtml(BLANK_TAB_MESSAGE);
      return;
    }

    const res = state.currentResult;

    // Handle State B: No condition detected
    if (res.isNoCondition) {
      dom.panels.products.innerHTML = `
        <article class="analysis-normal-card">
          <span class="normal-card-eyebrow">DANH MỤC SẢN PHẨM KHUYÊN DÙNG NỀN TẢNG</span>
          <h3 class="normal-card-title">Không gợi ý sản phẩm đặc trị theo bệnh lý</h3>
          <p class="normal-card-desc">Làn da hiện không có dấu hiệu bệnh lý thuộc 5 nhóm nhận diện. Hệ thống không chỉ định các sản phẩm đặc trị chứa hoạt chất tẩy lột hoặc nồng độ cao (BHA 2%, Retinol 1%, AHA 10%, Hydroquinone...). Để duy trì sức khỏe da tốt nhất, bạn chỉ cần lựa chọn các sản phẩm làm sạch, dưỡng ẩm và chống nắng lành tính phù hợp nền ${escapeHtml(res.skinType)}.</p>
        </article>

        <div class="dermo-grid">
          <article class="dermo-card">
            <div class="dermo-card-top">
              <span class="dermo-role">NHÓM 01 · LÀM SẠCH</span>
              <span class="dermo-price">pH 5.5</span>
            </div>
            <span class="dermo-brand">DƯỢC MỸ PHẨM LÀNH TÍNH</span>
            <h4 class="dermo-name">Sữa rửa mặt dạng gel sinh học làm sạch dịu êm</h4>
            <p class="dermo-active">Hoạt chất chính: Glycerin, Panthenol, Niacinamide</p>
            <p class="dermo-reason">Không xà phòng, làm sạch sâu lỗ chân lông mà vẫn bảo tồn lớp màng ẩm sinh học tự nhiên.</p>
          </article>

          <article class="dermo-card">
            <div class="dermo-card-top">
              <span class="dermo-role">NHÓM 02 · CẤP ẨM</span>
              <span class="dermo-price">Cân Bằng Sinh Học</span>
            </div>
            <span class="dermo-brand">DƯỢC MỸ PHẨM PHỤC HỒI</span>
            <h4 class="dermo-name">Nhũ tương dưỡng ẩm đa tầng củng cố màng da</h4>
            <p class="dermo-active">Hoạt chất chính: Ceramide NP, Hyaluronic Acid, Vitamin B5</p>
            <p class="dermo-reason">Cung cấp độ ẩm mịn màng, ngăn ngừa mất nước qua biểu bì mà không gây bít tắc chân lông.</p>
          </article>

          <article class="dermo-card">
            <div class="dermo-card-top">
              <span class="dermo-role">NHÓM 03 · BẢO VỆ</span>
              <span class="dermo-price">Phổ Rộng Toàn Diện</span>
            </div>
            <span class="dermo-brand">DƯỢC MỸ PHẨM CHỐNG NẮNG</span>
            <h4 class="dermo-name">Kem chống nắng phổ rộng SPF 50+ / PA++++</h4>
            <p class="dermo-active">Màng lọc: Tinosorb S/M, Mexoryl SX/XL, Vitamin E</p>
            <p class="dermo-reason">Bảo vệ tế bào da trước tia cực tím UVA/UVB và ánh sáng xanh, chống oxy hóa lâu dài.</p>
          </article>
        </div>
      `;
      return;
    }

    const { actives, cautions } = res.products;
    const tiers = Array.isArray(res.products.tiers) && res.products.tiers.length > 0
      ? res.products.tiers
      : buildDermocosmeticTiers(res.skinType, res.concerns || []);

    const activesHtml = actives
      .map(
        (item) => `
      <div class="active-ingredient-item">
        <span class="active-ingredient-name">${escapeHtml(item.name)}</span>
        <p class="active-ingredient-desc">${escapeHtml(item.desc)}</p>
      </div>
    `
      )
      .join('');

    const cautionsHtml = cautions
      .map(
        (item) => `
      <div class="caution-tag-item">
        <span class="caution-tag-name">${escapeHtml(item.name)}</span>
        <p class="caution-tag-desc">${escapeHtml(item.desc)}</p>
      </div>
    `
      )
      .join('');

    const filterOptions = [
      { id: 'all', label: 'Tất cả' },
      { id: 'student', label: 'Học sinh - Sinh viên' },
      { id: 'standard', label: 'Phổ thông' },
      { id: 'premium', label: 'Cao cấp' }
    ];

    const filterBarHtml = filterOptions
      .map(
        (opt) => `
      <button
        type="button"
        class="tier-filter-btn ${state.productTierFilter === opt.id ? 'is-active' : ''}"
        data-tier-filter="${opt.id}"
      >
        ${escapeHtml(opt.label)}
      </button>
    `
      )
      .join('');

    const visibleTiers =
      state.productTierFilter === 'all'
        ? tiers
        : tiers.filter((tier) => tier.id === state.productTierFilter);

    const tiersHtml = visibleTiers
      .map((tier) => {
        const itemsHtml = tier.items
          .map(
            (item) => `
          <article class="dermo-card">
            <div class="dermo-card-top">
              <span class="dermo-role">${escapeHtml(item.role)}</span>
              <span class="dermo-price">${escapeHtml(item.price)}</span>
            </div>
            <span class="dermo-brand">${escapeHtml(item.brand)}</span>
            <h4 class="dermo-name">${escapeHtml(item.name)}</h4>
            <p class="dermo-active">Hoạt chất chính: ${escapeHtml(item.active)}</p>
            <p class="dermo-reason">${escapeHtml(item.reason)}</p>
          </article>
        `
          )
          .join('');

        return `
          <section class="tier-section" aria-label="${escapeHtml(tier.title)}">
            <header class="tier-header">
              <div class="tier-title-group">
                <span class="tier-eyebrow">${escapeHtml(tier.eyebrow)}</span>
                <h4 class="tier-title">${escapeHtml(tier.title)}</h4>
                <p class="routine-col-subtitle">${escapeHtml(tier.description)}</p>
              </div>
              <span class="tier-price-range">${escapeHtml(tier.priceRange)}</span>
            </header>
            <div class="dermo-grid">
              ${itemsHtml}
            </div>
          </section>
        `;
      })
      .join('');

    dom.panels.products.innerHTML = `
      <div class="products-stack">
        <div class="ingredients-split">
          <section class="ingredient-panel" aria-label="Hoạt chất khuyên dùng">
            <h3 class="ingredient-panel-title">HOẠT CHẤT KHUYÊN DÙNG</h3>
            <div class="active-tags-list">
              ${activesHtml}
            </div>
          </section>

          <section class="ingredient-panel" aria-label="Thành phần cần lưu ý">
            <h3 class="ingredient-panel-title">THÀNH PHẦN CẦN LƯU Ý</h3>
            <div class="caution-tags-list">
              ${cautionsHtml}
            </div>
          </section>
        </div>

        <div>
          <div class="panel-subheading-row">
            <h3 class="panel-subheading">Dược mỹ phẩm gợi ý</h3>
          </div>

          <div class="tier-filter-bar" role="group" aria-label="Lọc phân khúc dược mỹ phẩm">
            ${filterBarHtml}
          </div>

          <div class="tier-stack">
            ${tiersHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderHistoryTab() {
    if (state.history.length === 0) {
      dom.panels.history.innerHTML = renderBlankStateHtml(EMPTY_HISTORY_MESSAGE);
      return;
    }

    const cardsHtml = state.history
      .map((entry) => {
        const concernTags =
          entry.concerns && entry.concerns.length > 0
            ? entry.concerns
              .map((c) => `<span class="history-tag">${escapeHtml(c)}</span>`)
              .join('')
            : '<span class="history-tag">Chăm sóc cơ bản</span>';

        const imgSrc = entry.imageUrl || entry.thumbnailDataUrl;
        const thumbHtml = imgSrc
          ? `<img class="history-thumb" src="${escapeHtml(imgSrc)}" alt="Ảnh thu nhỏ phiên phân tích">`
          : '';

        const totalSpots = entry.result?.summary_metrics?.total_spots
          ?? entry.result?.kpis?.totalSpots
          ?? 0;
        const priority = entry.result?.clinical_priority?.label
          ?? entry.result?.kpis?.priorityLevel
          ?? 'ỔN ĐỊNH';

        return `
          <article class="history-card" data-session-id="${escapeHtml(entry.id)}">
            <div class="history-thumb-wrap">
              ${thumbHtml}
            </div>
            <div class="history-info">
              <span class="history-time">${escapeHtml(entry.timestamp)}</span>
              <h4 class="history-title">${escapeHtml(entry.fileName || 'Ảnh làn da')}</h4>
              <div class="history-tags">
                <span class="history-tag is-skin">${escapeHtml(entry.skinType)}</span>
                ${concernTags}
              </div>
            </div>
            <div class="history-actions">
              <span class="history-kpi-summary">${String(totalSpots).padStart(2, '0')} ĐIỂM / ${escapeHtml(priority)}</span>
              <div class="history-action-btns">
                <button
                  type="button"
                  class="btn-view-session"
                  data-view-id="${escapeHtml(entry.id)}"
                >
                  XEM LẠI PHIÊN NÀY
                </button>
                <button
                  type="button"
                  class="btn-delete-session"
                  data-delete-id="${escapeHtml(entry.id)}"
                  title="Xóa bản ghi này"
                >
                  XÓA
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    dom.panels.history.innerHTML = `
      <div class="history-header-bar">
        <span class="history-count-label">ĐÃ LƯU ${String(state.history.length).padStart(2, '0')} BẢN GHI PHÂN TÍCH</span>
        <button type="button" class="btn-clear-history" id="clearHistoryBtn">
          XÓA LỊCH SỬ
        </button>
      </div>
      <div class="history-list">
        ${cardsHtml}
      </div>
    `;
  }

  function renderAllTabs() {
    renderAnalysisTab();
    renderRoutineTab();
    renderProductsTab();
    renderHistoryTab();
  }

  /* ------------------------------------------------------------------------
     9. PER-USER LOCALSTORAGE HISTORY & WORKSPACE ISOLATION
     ------------------------------------------------------------------------ */
  function getUserHistoryKey(user = state.currentUser) {
    if (!user || !user.email) return `${STORAGE_KEY_PREFIX}guest`;
    const normalized = String(user.email).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `${STORAGE_KEY_PREFIX}${normalized}`;
  }

  function loadHistoryFromStorage(user = state.currentUser) {
    try {
      const key = getUserHistoryKey(user);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function persistHistory(entries, user = state.currentUser) {
    const key = getUserHistoryKey(user);
    let listToSave = (Array.isArray(entries) ? entries : []).slice(0, MAX_HISTORY_ITEMS);
    while (listToSave.length >= 0) {
      try {
        localStorage.setItem(key, JSON.stringify(listToSave));
        state.history = listToSave;
        return;
      } catch (err) {
        if (listToSave.length <= 1) {
          return;
        }
        listToSave = listToSave.slice(0, listToSave.length - 1);
      }
    }
  }

  async function loadHistoryFromBackend() {
    if (!state.currentUser || !state.currentUser.token) {
      state.history = [];
      renderHistoryTab();
      return [];
    }

    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        headers: {
          'Authorization': `Bearer ${state.currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history)) {
          const mapped = data.history.map((item) => {
            const resObj = item.analysisResult || {};
            const itemSkinType = resObj.skin_type || 'Chưa xác định';
            const itemConcerns = Array.isArray(resObj.priority_concerns)
              ? resObj.priority_concerns
              : (item.detectedLabels || []);
            const report = buildReportFromBackend(resObj, itemSkinType, itemConcerns);

            return {
              id: item.id,
              userId: item.userId,
              userEmail: state.currentUser.email,
              timestamp: formatTimestamp(new Date(item.createdAt)),
              fileName: item.imageUrl ? item.imageUrl.split('/').pop() : 'Hồ sơ lưu trữ',
              dimensions: item.analysisResult?.image_dimensions
                ? `${item.analysisResult.image_dimensions.width} x ${item.analysisResult.image_dimensions.height} điểm ảnh`
                : '—',
              sizeFormatted: 'Lưu trữ đám mây',
              imageUrl: item.imageUrl,
              thumbnailDataUrl: item.imageUrl,
              skinType: itemSkinType,
              concerns: itemConcerns,
              result: report
            };
          });
          state.history = mapped;
          persistHistory(mapped, state.currentUser);
          renderHistoryTab();
          return mapped;
        }
      } else if (res.status === 401) {
        console.warn('Session expired or invalid, logging out.');
        handleLogout();
        return [];
      }
    } catch (err) {
      console.warn('Backend history fetch error, falling back to local storage cache:', err);
    }

    state.history = loadHistoryFromStorage(state.currentUser);
    renderHistoryTab();
    return state.history;
  }

  function saveCurrentSessionToHistory(result) {
    const thumbnailDataUrl = state.imageElement ? createThumbnailDataUrl(state.imageElement) : '';
    const sessionRecord = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userEmail: state.currentUser ? state.currentUser.email : 'guest',
      timestamp: formatTimestamp(new Date()),
      fileName: state.fileMeta ? state.fileMeta.name : 'Hồ sơ ảnh da',
      dimensions: state.fileMeta ? `${state.fileMeta.width} x ${state.fileMeta.height} điểm ảnh` : '—',
      sizeFormatted: state.fileMeta ? state.fileMeta.sizeFormatted : '—',
      thumbnailDataUrl,
      imageUrl: state.currentResult?.backendData?.image_url || '',
      skinType: state.skinType,
      concerns: [...state.concerns],
      result
    };

    const updated = [sessionRecord, ...state.history];
    persistHistory(updated, state.currentUser);
  }

  async function clearAllHistory() {
    if (state.currentUser && state.currentUser.token) {
      try {
        await fetch(`${API_BASE}/api/history`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${state.currentUser.token}`
          }
        });
      } catch (err) {
        console.warn('Failed to clear backend history:', err);
      }
    }
    try {
      const key = getUserHistoryKey(state.currentUser);
      localStorage.removeItem(key);
    } catch (err) {
      // Ignore storage access errors in restricted modes
    }
    state.history = [];
    renderHistoryTab();
    showToast('ĐÃ XÓA LỊCH SỬ', 'Toàn bộ hồ sơ lịch sử phân tích của tài khoản đã được dọn sạch.', 'info', 5000);
  }

  async function deleteHistorySession(sessionId) {
    if (!sessionId) return;
    if (state.currentUser && state.currentUser.token) {
      try {
        const res = await fetch(`${API_BASE}/api/history/${encodeURIComponent(sessionId)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${state.currentUser.token}`
          }
        });
        if (!res.ok) {
          console.warn('Backend history deletion returned status:', res.status);
        }
      } catch (err) {
        console.warn('Failed to delete history item from backend:', err);
      }
    }
    state.history = state.history.filter((item) => item.id !== sessionId);
    persistHistory(state.history, state.currentUser);
    renderHistoryTab();
    showToast('ĐÃ XÓA BẢN GHI', 'Bản ghi phân tích đã được xóa khỏi lịch sử tài khoản.', 'info', 3000);
  }

  function resetWorkspaceState() {
    // 1. Reset in-memory state variables
    state.hasImage = false;
    state.imageFile = null;
    state.imageDataUrl = null;
    state.imageElement = null;
    state.fileMeta = null;
    state.isScanning = false;
    state.scanToken += 1;
    state.hasAnalysis = false;
    state.activeTab = 'analysis';
    state.productTierFilter = 'all';
    state.skinType = 'Chưa xác định';
    state.concerns = [];
    state.currentResult = null;
    state.history = [];

    // 2. Reset sidebar form & context inputs
    if (dom.imageInput) {
      dom.imageInput.value = '';
    }
    if (dom.skinTypeSelect) {
      dom.skinTypeSelect.value = 'Chưa xác định';
    }
    syncConcernPillsUI();
    clearUploadError();

    // 3. Reset upload zone UI
    if (dom.uploadZone) {
      dom.uploadZone.classList.remove('has-file', 'is-dragover');
    }
    if (dom.uploadPrompt) {
      dom.uploadPrompt.hidden = false;
    }
    if (dom.uploadMeta) {
      dom.uploadMeta.hidden = true;
    }

    // 4. Reset workspace canvas & comparison grid
    if (dom.onboardingGuide) {
      dom.onboardingGuide.hidden = false;
    }
    if (dom.comparisonGrid) {
      dom.comparisonGrid.hidden = true;
    }
    if (dom.originalPreview) {
      dom.originalPreview.removeAttribute('src');
      dom.originalPreview.src = '';
    }
    if (dom.originalFrameMeta) {
      dom.originalFrameMeta.textContent = 'CHƯA CÓ ẢNH';
    }
    if (dom.scannedFrameMeta) {
      dom.scannedFrameMeta.textContent = 'CHỜ LỆNH';
    }
    if (dom.canvasStage) {
      dom.canvasStage.classList.remove('is-scanning');
    }
    if (dom.waitingOverlay) {
      dom.waitingOverlay.hidden = false;
    }
    if (dom.scannedCanvas) {
      const ctx = dom.scannedCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, dom.scannedCanvas.width, dom.scannedCanvas.height);
      }
      dom.scannedCanvas.width = 0;
      dom.scannedCanvas.height = 0;
      dom.scannedCanvas.style.aspectRatio = '';
    }

    // 5. Reset action button & status captions
    if (dom.analyzeBtn) {
      dom.analyzeBtn.disabled = true;
      dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
    }
    if (dom.workspaceStatusPill) {
      dom.workspaceStatusPill.textContent = 'SẴN SÀNG PHÂN TÍCH';
      dom.workspaceStatusPill.className = 'status-pill is-ready';
    }
    if (dom.analyzeCaption) {
      dom.analyzeCaption.textContent =
        'Vui lòng tải ảnh chân dung khuôn mặt rõ nét và chọn bối cảnh làn da để bắt đầu.';
    }

    // 6. Reset active tab and render all blank states
    switchTab('analysis');
    renderAllTabs();
  }

  function restoreHistorySession(sessionId) {
    if (state.isScanning) return;
    const entry = state.history.find((item) => item.id === sessionId);
    if (!entry || !entry.result) return;

    clearUploadError();

    // Sync sidebar context controls
    state.skinType = entry.skinType || 'Chưa xác định';
    dom.skinTypeSelect.value = state.skinType;
    state.concerns = Array.isArray(entry.concerns) ? [...entry.concerns] : [];
    syncConcernPillsUI();

    state.currentResult = entry.result;
    state.hasAnalysis = true;
    state.productTierFilter = 'all';

    const imgSrc = entry.imageUrl || entry.thumbnailDataUrl;
    if (imgSrc) {
      const img = new Image();
      img.onload = () => {
        state.hasImage = true;
        state.imageDataUrl = imgSrc;
        state.imageElement = img;
        state.fileMeta = {
          name: entry.fileName || 'Hồ sơ lưu trữ',
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeFormatted: entry.sizeFormatted || 'Lưu trữ đám mây'
        };

        applyUploadedImageUI(false);
        dom.waitingOverlay.hidden = true;
        dom.scannedFrameMeta.textContent = 'KHÔI PHỤC TỪ LỊCH SỬ';
        dom.workspaceStatusPill.textContent = 'ĐÃ KHÔI PHỤC PHIÊN';
        dom.workspaceStatusPill.className = 'status-pill is-complete';
        dom.analyzeCaption.textContent = `Đang xem lại bản ghi lúc ${entry.timestamp}.`;
        const itemsToRender = (Array.isArray(entry.result.detections) && entry.result.detections.length > 0)
          ? entry.result.detections
          : (Array.isArray(entry.result.backendData?.detections) ? entry.result.backendData.detections : (entry.result.zones || []));
        renderScannedCanvas(img, itemsToRender, true);
        renderAllTabs();
        switchTab('analysis');
        showToast('ĐÃ KHÔI PHỤC PHIÊN', 'Đã tải lại toàn bộ hình ảnh và kết quả phân tích của phiên đã chọn.', 'info', 3000);
      };
      img.onerror = () => {
        applyUploadedImageUI(false);
        renderAllTabs();
        switchTab('analysis');
      };
      img.src = imgSrc;
    } else {
      state.hasImage = false;
      state.imageDataUrl = null;
      state.imageElement = null;
      state.fileMeta = null;
      dom.uploadZone.classList.remove('has-file');
      dom.uploadPrompt.hidden = false;
      dom.uploadMeta.hidden = true;
      dom.onboardingGuide.hidden = false;
      dom.comparisonGrid.hidden = true;
      dom.analyzeBtn.disabled = true;
      dom.workspaceStatusPill.textContent = 'ĐÃ KHÔI PHỤC DỮ LIỆU';
      dom.workspaceStatusPill.className = 'status-pill is-complete';
      dom.analyzeCaption.textContent = `Đang xem lại dữ liệu tư vấn lúc ${entry.timestamp}.`;
      renderAllTabs();
      switchTab('analysis');
    }
  }

  /* ------------------------------------------------------------------------
     9B. CLIENT-SIDE & BACKEND AUTHENTICATION WITH TOAST NOTIFICATIONS
     ------------------------------------------------------------------------ */
  function loadAuthUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Purge any legacy demo account traces
      const cleaned = parsed.filter(
        (u) => u && u.email && u.email.toLowerCase() !== 'khachhang@auraskin.vn'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (err) {
      return [];
    }
  }

  function saveAuthUsers(users) {
    try {
      const cleaned = (Array.isArray(users) ? users : []).filter(
        (u) => u && u.email && u.email.toLowerCase() !== 'khachhang@auraskin.vn'
      );
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(cleaned));
    } catch (err) {
      // Ignore storage errors in restricted modes
    }
  }

  function loadAuthSession() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.email) return null;
      // Auto logout if previous session was demo user
      if (parsed.email.toLowerCase() === 'khachhang@auraskin.vn') {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
      return {
        id: parsed.id || '',
        fullName: parsed.fullName || '',
        email: parsed.email || '',
        token: parsed.token || ''
      };
    } catch (err) {
      return null;
    }
  }

  function persistAuthSession(user) {
    try {
      if (!user) {
        localStorage.removeItem(AUTH_SESSION_KEY);
      } else {
        localStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({
            id: user.id || '',
            fullName: user.fullName || '',
            email: user.email || '',
            token: user.token || ''
          })
        );
      }
    } catch (err) {
      // Ignore storage errors in restricted modes
    }
  }

  function showAuthError(message) {
    dom.authError.textContent = message;
    dom.authError.hidden = false;
  }

  function clearAuthError() {
    dom.authError.textContent = '';
    dom.authError.hidden = true;
  }

  function setAuthMode(mode) {
    state.authMode = mode === 'register' ? 'register' : 'login';
    const isRegister = state.authMode === 'register';

    dom.authTabLogin.classList.toggle('is-active', !isRegister);
    dom.authTabLogin.setAttribute('aria-selected', String(!isRegister));
    dom.authTabRegister.classList.toggle('is-active', isRegister);
    dom.authTabRegister.setAttribute('aria-selected', String(isRegister));

    dom.authNameGroup.hidden = !isRegister;
    dom.authConfirmGroup.hidden = !isRegister;

    dom.authSubmitBtn.textContent = isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP HỆ THỐNG';
    dom.authPassword.setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');

    clearAuthError();
  }

  function applyAuthState() {
    const isLoggedIn = Boolean(state.currentUser);
    dom.authView.hidden = isLoggedIn;
    dom.appShell.hidden = !isLoggedIn;

    if (isLoggedIn) {
      const displayName = state.currentUser.fullName || state.currentUser.email;
      dom.activeUserLabel.textContent = displayName;
    } else {
      dom.activeUserLabel.textContent = 'Khách';
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    clearAuthError();

    const email = (dom.authEmail.value || '').trim().toLowerCase();
    const password = dom.authPassword.value || '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const msg = 'Vui lòng nhập địa chỉ email hợp lệ.';
      showAuthError(msg);
      showToast('THÔNG TIN CHƯA HỢP LỆ', msg, 'error', 5000);
      return;
    }

    if (password.length < 6) {
      const msg = 'Mật khẩu cần có tối thiểu 6 ký tự.';
      showAuthError(msg);
      showToast('THÔNG TIN CHƯA HỢP LỆ', msg, 'error', 5000);
      return;
    }

    if (state.authMode === 'register') {
      const fullName = (dom.authFullName.value || '').trim();
      const confirmPassword = dom.authConfirmPassword.value || '';

      if (fullName.length < 2) {
        const msg = 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự).';
        showAuthError(msg);
        showToast('THÔNG TIN CHƯA HỢP LỆ', msg, 'error', 5000);
        return;
      }

      if (password !== confirmPassword) {
        const msg = 'Mật khẩu xác nhận chưa trùng khớp.';
        showAuthError(msg);
        showToast('THÔNG TIN CHƯA HỢP LỆ', msg, 'error', 5000);
        return;
      }

      const localUsers = loadAuthUsers();
      if (localUsers.some((u) => u.email.toLowerCase() === email)) {
        const msg = 'Email này đã được sử dụng. Vui lòng chuyển sang tab Đăng nhập.';
        showAuthError(msg);
        showToast('ĐĂNG KÝ THẤT BẠI', msg, 'error', 5000);
        return;
      }

      // 1. Persist to Backend API
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.detail || 'Email này đã tồn tại trong hệ thống. Vui lòng chuyển sang tab Đăng nhập.';
          showAuthError(msg);
          showToast('ĐĂNG KÝ THẤT BẠI', msg, 'error', 5000);
          return;
        }
      } catch (err) {
        console.warn('Backend API registration call failed, saving to local cache:', err);
      }

      // 2. Persist to localStorage for client durability (fullName, email, password)
      const newUser = {
        fullName,
        email,
        password,
        createdAt: new Date().toISOString()
      };
      saveAuthUsers([...localUsers, newUser]);

      // 3. Clear form and switch to login tab with prefilled email
      dom.authForm.reset();
      clearAuthError();
      setAuthMode('login');
      dom.authEmail.value = email;
      dom.authPassword.focus();

      // Ensure workspace is completely clean for the new account
      resetWorkspaceState();

      // 4. Show top-right 5-second toast notification
      showToast(
        'ĐĂNG KÝ THÀNH CÔNG',
        `Tài khoản ${fullName} (${email}) đã được tạo thành công! Vui lòng nhập mật khẩu để đăng nhập.`,
        'success',
        5000
      );
      return;
    }

    // LOGIN MODE
    let loggedInUser = null;

    // 1. Try Backend API first
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          loggedInUser = data.user;
          loggedInUser.token = data.token;
          // Đồng bộ vào cache local để bảo tồn tài khoản qua mọi lần redeploy
          const localUsers = loadAuthUsers();
          if (!localUsers.some((u) => u.email.toLowerCase() === email)) {
            saveAuthUsers([...localUsers, {
              fullName: data.user.fullName || email,
              email: email,
              password: password,
              createdAt: new Date().toISOString()
            }]);
          }
        }
      } else {
        // Nếu backend chưa có tài khoản (ví dụ vừa redeploy container mới trên cloud)
        // Kiểm tra xem trình duyệt đã từng đăng ký tài khoản này chưa để tự động khôi phục (Auto Re-sync)
        const localUsers = loadAuthUsers();
        const matched = localUsers.find(
          (u) => u.email.toLowerCase() === email && u.password === password
        );
        if (matched) {
          try {
            const regRes = await fetch(`${API_BASE}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fullName: matched.fullName || matched.email,
                email: matched.email,
                password: matched.password
              })
            });
            if (regRes.ok) {
              const regData = await regRes.json();
              if (regData.user) {
                loggedInUser = regData.user;
                loggedInUser.token = regData.token;
                console.info('Auto-restored account to refreshed backend container:', email);
              }
            }
          } catch (autoRegErr) {
            console.warn('Auto re-registration attempt failed:', autoRegErr);
          }
        }

        if (!loggedInUser) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.detail || 'Email hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại.';
          showAuthError(msg);
          showToast('ĐĂNG NHẬP THẤT BẠI', msg, 'error', 5000);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API login call failed, falling back to local credentials:', err);
    }

    // 2. Fallback to localStorage if backend is offline or unavailable
    if (!loggedInUser) {
      const localUsers = loadAuthUsers();
      const matched = localUsers.find(
        (u) => u.email.toLowerCase() === email && u.password === password
      );
      if (matched) {
        loggedInUser = { fullName: matched.fullName, email: matched.email };
      }
    }

    if (!loggedInUser) {
      const msg = 'Email hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại.';
      showAuthError(msg);
      showToast('ĐĂNG NHẬP THẤT BẠI', msg, 'error', 5000);
      return;
    }

    state.currentUser = {
      id: loggedInUser.id || '',
      fullName: loggedInUser.fullName || loggedInUser.email,
      email: loggedInUser.email,
      token: loggedInUser.token || ''
    };
    persistAuthSession(state.currentUser);
    dom.authForm.reset();

    // Reset workspace state and load isolated per-user history from backend
    resetWorkspaceState();
    await loadHistoryFromBackend();

    applyAuthState();
    renderAllTabs();

    showToast(
      'ĐĂNG NHẬP THÀNH CÔNG',
      `Chào mừng ${state.currentUser.fullName || state.currentUser.email} đã đăng nhập hệ thống AURASKIN.`,
      'success',
      5000
    );
  }

  async function handleLogout() {
    const prevName = state.currentUser ? (state.currentUser.fullName || state.currentUser.email) : 'quý khách';
    const token = state.currentUser ? state.currentUser.token : null;

    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn('Backend logout call error:', err);
      }
    }

    resetWorkspaceState();
    state.currentUser = null;
    state.history = [];
    persistAuthSession(null);
    setAuthMode('login');
    applyAuthState();
    renderAllTabs();
    showToast(
      'ĐÃ ĐĂNG XUẤT',
      `Tài khoản ${prevName} đã đăng xuất an toàn khỏi hệ thống.`,
      'info',
      5000
    );
  }

  /* ------------------------------------------------------------------------
     10. UI SYNC & EVENT HANDLERS
     ------------------------------------------------------------------------ */
  function syncConcernPillsUI() {
    const buttons = dom.concernPills.querySelectorAll('.pill-btn');
    buttons.forEach((btn) => {
      const concern = btn.dataset.concern;
      const isSelected = state.concerns.includes(concern);
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function applyUploadedImageUI(resetAnalysis = true) {
    dom.uploadZone.classList.add('has-file');
    dom.uploadPrompt.hidden = true;
    dom.uploadMeta.hidden = false;

    dom.onboardingGuide.hidden = true;
    dom.comparisonGrid.hidden = false;

    dom.originalPreview.src = state.imageDataUrl;
    dom.originalFrameMeta.textContent = `${state.fileMeta.width} x ${state.fileMeta.height} ĐIỂM ẢNH`;

    dom.analyzeBtn.disabled = false;

    if (resetAnalysis) {
      state.hasAnalysis = false;
      state.currentResult = null;
      state.productTierFilter = 'all';
      dom.waitingOverlay.hidden = false;
      dom.scannedFrameMeta.textContent = 'CHỜ LỆNH';
      dom.workspaceStatusPill.textContent = 'SẴN SÀNG PHÂN TÍCH';
      dom.workspaceStatusPill.className = 'status-pill is-ready';
      dom.analyzeCaption.textContent =
        'Hình ảnh đã sẵn sàng. Nhấn Bắt đầu phân tích để tiến hành quét bề mặt.';

      renderScannedCanvas(state.imageElement, null, false);
      renderAllTabs();
    }
  }

  function handleSelectedFile(file) {
    if (state.isScanning) return;
    clearUploadError();

    if (!isValidImageFile(file)) {
      showUploadError('Định dạng tệp không hợp lệ. Vui lòng chọn ảnh .JPG, .JPEG hoặc .PNG.');
      return;
    }

    state.imageFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl !== 'string') {
        showUploadError('Không thể đọc dữ liệu hình ảnh. Vui lòng thử tệp khác.');
        return;
      }

      const img = new Image();
      img.onload = () => {
        state.hasImage = true;
        state.imageDataUrl = dataUrl;
        state.imageElement = img;
        state.fileMeta = {
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
          sizeFormatted: formatFileSize(file.size)
        };

        applyUploadedImageUI(true);
      };
      img.onerror = () => {
        showUploadError('Tệp hình ảnh bị lỗi hoặc không thể giải mã.');
      };
      img.src = dataUrl;
    };

    reader.onerror = () => {
      showUploadError('Đã xảy ra lỗi khi đọc tệp từ thiết bị.');
    };

    reader.readAsDataURL(file);
  }

  /* ------------------------------------------------------------------------
     10B. BACKEND REPORT INTEGRATION
     ------------------------------------------------------------------------ */
  function buildReportFromBackend(backendData, skinType, concerns) {
    // === XỬ LÝ DA BÌNH THƯỜNG MỚI (BAO GỒM CLASS NULL TỪ WORKFLOW) ===
    const isNoCondition = backendData.status === 'no_condition'
      || backendData.status === 'normal_skin'
      || backendData.is_normal_skin === true
      || (!backendData.detections || backendData.detections.length === 0);

    const summary = backendData.summary_metrics || {};
    const detections = Array.isArray(backendData.detections) ? backendData.detections : [];
    const conditionCounts = summary.condition_counts || {};
    const effectiveSkinType = skinType && skinType !== 'Chưa xác định' ? skinType : 'Da dầu';
    const unmatchedPriorityNote = backendData.unmatched_priority_note || null;
    const allConditionsDetails = Array.isArray(backendData.all_detected_conditions_details) ? backendData.all_detected_conditions_details : [];

    // Skin type texture advice from backend adaptation or defaults
    const backendAdaptation = backendData.skin_type_adaptation || (backendData.primary_recommendation?.skin_type_adaptation) || {};
    const textureAdvice = buildTextureAdvice(effectiveSkinType, []);
    if (backendAdaptation.texture && Array.isArray(backendAdaptation.texture)) {
      textureAdvice.preferredTags = backendAdaptation.texture;
    }
    if (backendAdaptation.preferences && Array.isArray(backendAdaptation.preferences) && backendAdaptation.preferences.length > 0) {
      textureAdvice.lead = backendAdaptation.preferences[0];
      textureAdvice.preferredDesc = backendAdaptation.preferences.join('. ');
    }

    // Lifestyle guidance
    const backendLifestyle = backendData.lifestyle_guidance || (backendData.primary_recommendation?.lifestyle_guidance) || [];
    const lifestyleRules = buildAcneLifestyleRules(effectiveSkinType, []);
    if (Array.isArray(backendLifestyle) && backendLifestyle.length > 0) {
      lifestyleRules.nutrition = backendLifestyle.map((item) => ({
        title: item.length > 50 ? item.slice(0, 50) + '...' : item,
        desc: item
      }));
    }

    const safeConcerns = Array.isArray(concerns) ? concerns : [];
    if (isNoCondition) {
      return {
        timestamp: Date.now(),
        formattedTime: formatTimestamp(Date.now()),
        isNoCondition: true,
        skinType: effectiveSkinType,
        concerns: safeConcerns.length > 0 ? safeConcerns : ['Chăm sóc cơ bản'],
        summaryText: backendData.message || 'Không phát hiện vấn đề da thuộc 5 nhóm nhận diện.',
        kpis: {
          totalSpots: 0,
          priorityLevel: 'Ổn định',
          focusZone: 'Toàn diện',
          compatibilityScore: '100%'
        },
        zones: [],
        allConditions: [],
        routine: { am: [], pm: [] },
        textureAdvice,
        lifestyleRules,
        products: { actives: [], cautions: [], tiers: [] },
        medicalWarning: null,
        rednessOverrideApplied: false,
        unmatchedPriorityNote,
        detections: [],
        backendData
      };
    }

    // State C: Detected conditions
    const primaryRec = backendData.primary_recommendation || {};
    const totalSpots = summary.total_spots ?? detections.length;
    const primaryCondVi = summary.primary_condition_vi || primaryRec.skin_condition || 'Tình trạng trọng tâm';
    const overallSev = summary.overall_severity || 'mild';
    const overallSevVi =
      overallSev === 'severe'
        ? 'Nghiêm trọng / Cần can thiệp'
        : overallSev === 'moderate'
          ? 'Trung bình'
          : 'Nhẹ';

    // Format routines (am & pm)
    const morningSteps = Array.isArray(primaryRec.morning_routine) ? primaryRec.morning_routine : [];
    const eveningSteps = Array.isArray(primaryRec.evening_routine) ? primaryRec.evening_routine : [];

    const am = morningSteps.map((text, i) => {
      const parts = text.split(':');
      const title = parts.length > 1 ? parts[0].trim() : text.split('(')[0].trim();
      return {
        number: String(i + 1).padStart(2, '0'),
        type: `BƯỚC 0${i + 1}`,
        title: title || `Bước 0${i + 1}`,
        desc: text,
        dosage: 'Vừa đủ phủ mỏng bề mặt',
        timing: 'Buổi sáng',
        texture: i === 0 ? 'Gel / Nước' : i === morningSteps.length - 1 ? 'Chống nắng phổ rộng SPF 50+' : 'Serum / Kem lỏng',
        note: i === morningSteps.length - 1 ? 'Thoa trước khi ra nắng 20 phút.' : ''
      };
    });

    const pm = eveningSteps.map((text, i) => {
      const parts = text.split(':');
      const title = parts.length > 1 ? parts[0].trim() : text.split('(')[0].trim();
      return {
        number: String(i + 1).padStart(2, '0'),
        type: `BƯỚC 0${i + 1}`,
        title: title || `Bước 0${i + 1}`,
        desc: text,
        dosage: 'Vừa đủ cho vùng điều trị',
        timing: 'Buổi tối',
        texture: i === 0 ? 'Nước / Dầu tẩy trang' : i === eveningSteps.length - 1 ? 'Kem phục hồi ban đêm' : 'Tinh chất đặc trị',
        note: (primaryRec.routine_notes && primaryRec.routine_notes[i]) || ''
      };
    });

    // Format phác đồ buổi sáng & tối cho TẤT CẢ các tình trạng da phát hiện (Yêu cầu 5)
    const allRoutines = allConditionsDetails.map((condDetail) => {
      const rec = condDetail.process_ai_result || condDetail.recommendation || condDetail;
      const mSteps = Array.isArray(rec.morning_routine) ? rec.morning_routine : (Array.isArray(condDetail.morning_routine) ? condDetail.morning_routine : []);
      const eSteps = Array.isArray(rec.evening_routine) ? rec.evening_routine : (Array.isArray(condDetail.evening_routine) ? condDetail.evening_routine : []);
      const cName = condDetail.skin_condition || condDetail.name_vi || condDetail.skin_label;
      const isPrimary = (condDetail.skin_label === summary.primary_condition);

      const condAm = mSteps.map((text, i) => {
        const parts = text.split(':');
        const title = parts.length > 1 ? parts[0].trim() : text.split('(')[0].trim();
        return {
          number: String(i + 1).padStart(2, '0'),
          type: `BƯỚC 0${i + 1}`,
          title: title || `Bước 0${i + 1}`,
          desc: text,
          dosage: 'Vừa đủ phủ mỏng bề mặt',
          timing: 'Buổi sáng',
          texture: i === 0 ? 'Gel / Nước' : i === mSteps.length - 1 ? 'Chống nắng phổ rộng SPF 50+' : 'Serum / Kem lỏng',
          note: i === mSteps.length - 1 ? 'Thoa trước khi ra nắng 20 phút.' : ''
        };
      });

      const condPm = eSteps.map((text, i) => {
        const parts = text.split(':');
        const title = parts.length > 1 ? parts[0].trim() : text.split('(')[0].trim();
        return {
          number: String(i + 1).padStart(2, '0'),
          type: `BƯỚC 0${i + 1}`,
          title: title || `Bước 0${i + 1}`,
          desc: text,
          dosage: 'Vừa đủ cho vùng điều trị',
          timing: 'Buổi tối',
          texture: i === 0 ? 'Nước / Dầu tẩy trang' : i === eSteps.length - 1 ? 'Kem phục hồi ban đêm' : 'Tinh chất đặc trị',
          note: (rec.routine_notes && rec.routine_notes[i]) || ''
        };
      });

      return {
        conditionName: cName,
        label: condDetail.skin_label,
        severity: condDetail.severity,
        isPrimary,
        am: condAm.length > 0 ? condAm : am,
        pm: condPm.length > 0 ? condPm : pm,
        notes: rec.routine_notes || []
      };
    });

    // Format 3-tier products
    const formatProductTierItems = (prodList, defaultPriceRange, conditionTag = '') => {
      if (!Array.isArray(prodList) || prodList.length === 0) return [];
      return prodList.map((itemStr, idx) => {
        let role = conditionTag ? `0${idx + 1} · ${conditionTag.toUpperCase()}` : `0${idx + 1} · SẢN PHẨM KHUYÊN DÙNG`;
        let name = itemStr;
        let brand = 'DƯỢC MỸ PHẨM CHUYÊN KHOA';
        if (itemStr.includes(':')) {
          const split = itemStr.split(':');
          role = conditionTag ? `0${idx + 1} · ${split[0].trim().toUpperCase()} (${conditionTag})` : `0${idx + 1} · ${split[0].trim().toUpperCase()}`;
          name = split.slice(1).join(':').trim();
        }
        const words = name.split(' ');
        if (words.length > 1) {
          brand = words.slice(0, 2).join(' ').toUpperCase();
        }
        return {
          role,
          name,
          brand,
          active: 'Hoạt chất đạt chuẩn da liễu',
          price: defaultPriceRange,
          reason: conditionTag
            ? `Được lựa chọn tối ưu theo phân khúc chi phí và điều trị tình trạng ${conditionTag}.`
            : 'Được lựa chọn tối ưu theo phân khúc chi phí và khả năng tương thích của tình trạng da.'
        };
      });
    };

    // Tổng hợp sản phẩm của TẤT CẢ các tình trạng da phát hiện cho 3 phân khúc (Yêu cầu 5)
    let aggregatedStudentItems = [];
    let aggregatedMidItems = [];
    let aggregatedPremiumItems = [];

    allConditionsDetails.forEach((cd) => {
      const rec = cd.process_ai_result || cd.recommendation || cd;
      const pRecs = rec.product_recommendations || cd.product_recommendations || {};
      const cName = cd.skin_condition || cd.skin_label;

      const sItems = formatProductTierItems(pRecs.student_under_350k, '< 350.000đ', cName);
      const mItems = formatProductTierItems(pRecs.mid_350k_800k, '350.000đ – 800.000đ', cName);
      const pItems = formatProductTierItems(pRecs.premium_over_800k, '> 800.000đ', cName);

      aggregatedStudentItems = aggregatedStudentItems.concat(sItems);
      aggregatedMidItems = aggregatedMidItems.concat(mItems);
      aggregatedPremiumItems = aggregatedPremiumItems.concat(pItems);
    });

    const prodRecs = primaryRec.product_recommendations || {};
    const studentItems = aggregatedStudentItems.length > 0 ? aggregatedStudentItems : formatProductTierItems(prodRecs.student_under_350k, '< 350.000đ');
    const midItems = aggregatedMidItems.length > 0 ? aggregatedMidItems : formatProductTierItems(prodRecs.mid_350k_800k, '350.000đ – 800.000đ');
    const premiumItems = aggregatedPremiumItems.length > 0 ? aggregatedPremiumItems : formatProductTierItems(prodRecs.premium_over_800k, '> 800.000đ');

    const tiers = [
      {
        id: 'student',
        eyebrow: 'PHÂN KHÚC 01',
        title: 'Học sinh – Sinh viên',
        priceRange: '< 350.000đ / sản phẩm',
        description: 'Ưu tiên công thức tối giản, lành tính, chi phí tiết kiệm và dễ duy trì đều đặn hằng ngày.',
        items: studentItems.length > 0 ? studentItems : buildDermocosmeticTiers(effectiveSkinType, [primaryCondVi])[0].items
      },
      {
        id: 'standard',
        eyebrow: 'PHÂN KHÚC 02',
        title: 'Phổ thông',
        priceRange: '350.000đ – 800.000đ / sản phẩm',
        description: 'Các dòng dược mỹ phẩm chuẩn phòng khám, tối ưu hiệu quả kiểm soát và phục hồi chuyên sâu.',
        items: midItems.length > 0 ? midItems : buildDermocosmeticTiers(effectiveSkinType, [primaryCondVi])[1].items
      },
      {
        id: 'premium',
        eyebrow: 'PHÂN KHÚC 03',
        title: 'Cao cấp',
        priceRange: '> 800.000đ / sản phẩm',
        description: 'Dược mỹ phẩm nồng độ tinh khiết cao, công nghệ bọc dẫn hoạt chất thấm sâu và tối ưu tốc độ cải thiện.',
        items: premiumItems.length > 0 ? premiumItems : buildDermocosmeticTiers(effectiveSkinType, [primaryCondVi])[2].items
      }
    ];

    // Thu thập hoạt chất khuyên dùng từ TẤT CẢ tình trạng phát hiện
    const activeMap = new Map();
    allConditionsDetails.forEach((cd) => {
      const rec = cd.process_ai_result || cd.recommendation || cd;
      const acts = rec.active_ingredients || cd.active_ingredients || [];
      const cName = cd.skin_condition || cd.skin_label;
      acts.forEach((name) => {
        if (!activeMap.has(name)) {
          activeMap.set(name, `Hoạt chất lâm sàng điều trị hỗ trợ cho ${cName}.`);
        }
      });
    });
    if (activeMap.size === 0) {
      (primaryRec.active_ingredients || ['Salicylic Acid', 'Niacinamide', 'Panthenol B5']).forEach(name => {
        activeMap.set(name, 'Hoạt chất lâm sàng được hệ thống đề xuất để tối ưu hiệu quả điều trị.');
      });
    }
    const actives = Array.from(activeMap.entries()).map(([name, desc]) => ({ name, desc }));

    // Thu thập cảnh báo từ TẤT CẢ tình trạng phát hiện
    const cautionSet = new Set();
    allConditionsDetails.forEach((cd) => {
      const rec = cd.process_ai_result || cd.recommendation || cd;
      const warns = rec.warnings || cd.warnings || [];
      warns.forEach((w) => cautionSet.add(w));
    });
    if (cautionSet.size === 0) {
      (primaryRec.warnings || ['Không kết hợp nhiều hoạt chất mạnh cùng lúc.']).forEach(w => cautionSet.add(w));
    }
    const cautions = Array.from(cautionSet).map((desc) => ({
      name: 'Khuyến cáo lâm sàng',
      desc
    }));

    const detectedConcernNames = Object.keys(conditionCounts).length > 0
      ? Object.keys(conditionCounts).map(k => ({ Acne: 'Mụn', Acne_scar: 'Thâm mụn', Blackhead: 'Mụn đầu đen', Dark_spot: 'Thâm sạm', Redness: 'Mẩn đỏ' }[k] || k))
      : (concerns.length > 0 ? concerns : ['Chăm sóc cơ bản']);

    // Build condition cards data for Problem 3
    const allConditions = allConditionsDetails.map((condDetail) => {
      const sevVi =
        condDetail.severity === 'severe'
          ? 'Nghiêm trọng'
          : condDetail.severity === 'moderate'
            ? 'Trung bình'
            : 'Nhẹ';
      const signs = condDetail.recommendation?.signs || [];
      const careNotes = condDetail.recommendation?.care_notes || [];
      const warnings = condDetail.warnings || condDetail.recommendation?.warnings || [];
      const ingredients = condDetail.active_ingredients || condDetail.recommendation?.active_ingredients || [];

      return {
        name: condDetail.skin_condition,
        label: condDetail.skin_label,
        spotCount: condDetail.spot_count,
        severity: condDetail.severity,
        severityVi: sevVi,
        confidenceAvg: Math.round((condDetail.confidence_avg || 0) * 100),
        detectedZones: condDetail.detected_zones || [],
        isPriority: condDetail.is_user_priority || false,
        signs,
        careNotes,
        warnings,
        activeIngredients: ingredients
      };
    });

    return {
      timestamp: Date.now(),
      formattedTime: formatTimestamp(Date.now()),
      isNoCondition: false,
      skinType: effectiveSkinType,
      concerns: detectedConcernNames,
      summaryText: `Hệ thống ghi nhận tình trạng trọng tâm: ${primaryCondVi}. Mức độ đánh giá: ${overallSevVi} với tổng số ${totalSpots} điểm phát hiện trên bề mặt.`,
      kpis: {
        totalSpots,
        priorityLevel: overallSevVi,
        focusZone: primaryCondVi,
        compatibilityScore: summary.average_confidence ? `${Math.round(summary.average_confidence * 100)}%` : '94%'
      },
      zones: [],
      allConditions,
      routine: { am, pm },
      allRoutines,
      textureAdvice,
      lifestyleRules,
      products: { actives, cautions, tiers },
      medicalWarning: primaryRec.medical_warning || null,
      rednessOverrideApplied: summary.redness_override_applied || false,
      unmatchedPriorityNote,
      detections,
      backendData
    };
  }

  async function triggerAnalysis() {
    if (!state.hasImage || !state.imageElement || state.isScanning) return;

    state.isScanning = true;
    state.scanToken += 1;
    const activeToken = state.scanToken;

    dom.analyzeBtn.disabled = true;
    dom.analyzeBtn.textContent = 'ĐANG PHÂN TÍCH...';
    dom.analyzeCaption.textContent = 'Hệ thống đang gửi dữ liệu tới mô hình AI và tổng hợp phác đồ chuyên sâu.';

    dom.waitingOverlay.hidden = true;
    dom.scannedFrameMeta.textContent = 'ĐANG QUÉT BỀ MẶT...';
    dom.workspaceStatusPill.textContent = 'ĐANG QUÉT BỀ MẶT';
    dom.workspaceStatusPill.className = 'status-pill is-ready';

    // Draw clean base image before beam sweeps over it
    renderScannedCanvas(state.imageElement, null, false);

    // Force reflow so CSS 1.2s scan animation always restarts cleanly
    dom.canvasStage.classList.remove('is-scanning');
    void dom.canvasStage.offsetWidth;
    dom.canvasStage.classList.add('is-scanning');

    // Xóa sạch vùng khoanh và dữ liệu cũ trước khi thực hiện lượt quét mới
    renderScannedCanvas(state.imageElement, null, false);
    state.hasAnalysis = false;
    state.currentResult = null;

    try {
      // Prepare image file or blob
      let fileToSend = state.imageFile;
      if (!fileToSend && state.imageDataUrl) {
        const parts = state.imageDataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToSend = new Blob([u8arr], { type: mime });
      }

      const formData = new FormData();
      formData.append('file', fileToSend, state.fileMeta?.name || 'skin.jpg');
      if (state.skinType && state.skinType !== 'Chưa xác định') {
        formData.append('skin_type', state.skinType);
      }
      if (Array.isArray(state.concerns) && state.concerns.length > 0) {
        formData.append('priority_concerns', state.concerns.join(','));
      }
      formData.append('threshold', '0.20');

      const headers = {};
      if (state.currentUser && state.currentUser.token) {
        headers['Authorization'] = `Bearer ${state.currentUser.token}`;
      }

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (activeToken !== state.scanToken) return;

      if (!response.ok || data.status === 'error') {
        dom.canvasStage.classList.remove('is-scanning');
        state.isScanning = false;
        dom.analyzeBtn.disabled = false;
        dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
        dom.analyzeCaption.textContent = data.message || 'Máy chủ gặp sự cố khi xử lý ảnh. Vui lòng thử lại sau.';
        dom.scannedFrameMeta.textContent = 'LỖI MÁY CHỦ';
        dom.workspaceStatusPill.textContent = 'LỖI HỆ THỐNG';
        dom.workspaceStatusPill.className = 'status-pill is-ready';
        showToast(
          'LỖI PHÂN TÍCH',
          data.message || 'Máy chủ gặp sự cố trong quá trình xử lý ảnh. Vui lòng kiểm tra lại.',
          'error',
          5000
        );
        return;
      }

      // === XỬ LÝ CÁC TRẠNG THÁI LỖI / KHÔNG NHẬN DIỆN ĐƯỢC (TRƯỜNG HỢP 3) ===
      if (data.status === 'invalid_image' || data.status === 'low_confidence' || data.status === 'unrecognized') {
        dom.canvasStage.classList.remove('is-scanning');
        state.isScanning = false;
        dom.analyzeBtn.disabled = false;
        dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
        dom.analyzeCaption.textContent = 'Vui lòng chọn ảnh chụp rõ nét hơn với ánh sáng tốt và thử lại.';
        dom.scannedFrameMeta.textContent = data.status === 'unrecognized' ? 'KHÔNG NHẬN DIỆN ĐƯỢC' : 'ẢNH KHÔNG ĐẠT YÊU CẦU';
        dom.workspaceStatusPill.textContent = 'YÊU CẦU CHỤP LẠI';
        dom.workspaceStatusPill.className = 'status-pill is-ready';
        showUploadError(data.message || 'Ảnh không đủ điều kiện phân tích. Vui lòng chụp lại ảnh rõ hơn.');
        showToast(
          data.status === 'unrecognized' ? 'ẢNH KHÔNG NHẬN DIỆN ĐƯỢC' : 'ẢNH KHÔNG ĐỦ ĐIỀU KIỆN',
          data.message || 'Vui lòng chụp lại ảnh chính diện rõ nét hơn để AI có thể đánh giá chính xác.',
          'warning',
          5000
        );
        return;
      }

      // Build consultation report from backend clinical data
      const result = buildReportFromBackend(data, state.skinType, state.concerns);

      state.currentResult = result;
      state.hasAnalysis = true;
      state.isScanning = false;
      state.productTierFilter = 'all';

      dom.canvasStage.classList.remove('is-scanning');

      if (result.isNoCondition) {
        // State B: Normal skin / 0 detections on valid image
        // Strictly draw clean image without any bounding boxes or brackets
        renderScannedCanvas(state.imageElement, [], false);
        dom.analyzeBtn.disabled = false;
        dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
        dom.analyzeCaption.textContent =
          'Đã hoàn tất đánh giá. Không phát hiện dấu hiệu bệnh lý thuộc 5 nhóm nhận diện.';
        dom.scannedFrameMeta.textContent = 'BỀ MẶT ỔN ĐỊNH';
        dom.workspaceStatusPill.textContent = 'DA BÌNH THƯỜNG';
        dom.workspaceStatusPill.className = 'status-pill is-complete';

        if (state.currentUser && state.currentUser.token) {
          await loadHistoryFromBackend();
        } else {
          saveCurrentSessionToHistory(result);
        }
        renderAllTabs();
        switchTab('analysis');
        showToast(
          'KẾT QUẢ ĐÁNH GIÁ',
          'Không phát hiện vấn đề da thuộc 5 nhóm nhận diện.',
          'success',
          5000
        );
      } else {
        // State C: Detected conditions - lọc bỏ class null nếu có
        const itemsToRender = Array.isArray(data.detections)
          ? data.detections.filter((d) => {
              const cls = String(d.class || d.raw_class || '').toLowerCase();
              return cls !== 'null' && cls !== 'normal';
            })
          : [];
        renderScannedCanvas(state.imageElement, itemsToRender, true);

        dom.analyzeBtn.disabled = false;
        dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
        dom.analyzeCaption.textContent =
          'Phân tích hoàn tất. Hệ thống đã xây dựng phác đồ chăm sóc chuyên sâu.';
        dom.scannedFrameMeta.textContent = `HOÀN TẤT ĐỊNH VỊ (${itemsToRender.length} ĐIỂM)`;
        dom.workspaceStatusPill.textContent = 'HOÀN TẤT CHẨN ĐOÁN';
        dom.workspaceStatusPill.className = 'status-pill is-complete';

        if (state.currentUser && state.currentUser.token) {
          await loadHistoryFromBackend();
        } else {
          saveCurrentSessionToHistory(result);
        }
        renderAllTabs();
        switchTab('analysis');
        showToast(
          'HOÀN TẤT PHÂN TÍCH',
          `Hệ thống ghi nhận ${itemsToRender.length} điểm phát hiện và đã lập phác đồ tương ứng.`,
          'success',
          5000
        );
      }

    } catch (err) {
      console.error('Backend API call failed:', err);
      if (activeToken !== state.scanToken || !state.imageElement) return;

      dom.canvasStage.classList.remove('is-scanning');
      state.isScanning = false;
      dom.analyzeBtn.disabled = false;
      dom.analyzeBtn.textContent = 'BẮT ĐẦU PHÂN TÍCH';
      const isNetworkErr = err instanceof TypeError && String(err.message).toLowerCase().includes('fetch');
      const errDetail = isNetworkErr
        ? 'Không thể kết nối đến máy chủ backend (http://localhost:8000). Vui lòng đảm bảo file run.bat đang chạy và cửa sổ dòng lệnh không bị đóng.'
        : `Lỗi: ${err?.message || err}`;
      dom.analyzeCaption.textContent = errDetail;
      dom.scannedFrameMeta.textContent = isNetworkErr ? 'LỖI KẾT NỐI' : 'LỖI XỬ LÝ';
      dom.workspaceStatusPill.textContent = 'LỖI HỆ THỐNG';
      dom.workspaceStatusPill.className = 'status-pill is-ready';
      showToast(
        isNetworkErr ? 'LỖI KẾT NỐI MÁY CHỦ' : 'LỖI XỬ LÝ DỮ LIỆU',
        errDetail,
        'error',
        6000
      );
    }
  }

  function switchTab(targetTab) {
    if (!dom.panels[targetTab]) return;
    state.activeTab = targetTab;

    dom.tabButtons.forEach((btn) => {
      const isMatch = btn.dataset.tab === targetTab;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });

    Object.entries(dom.panels).forEach(([key, panelEl]) => {
      const isMatch = key === targetTab;
      panelEl.classList.toggle('is-active', isMatch);
      panelEl.hidden = !isMatch;
    });
  }

  /* ------------------------------------------------------------------------
     11. EVENT BINDINGS & INITIALIZATION
     ------------------------------------------------------------------------ */
  function openFileDialog() {
    if (state.isScanning) return;
    dom.imageInput.value = '';
    dom.imageInput.click();
  }

  function bindEvents() {
    // Authentication events
    dom.authTabLogin.addEventListener('click', () => setAuthMode('login'));
    dom.authTabRegister.addEventListener('click', () => setAuthMode('register'));
    dom.authForm.addEventListener('submit', handleAuthSubmit);
    dom.logoutBtn.addEventListener('click', handleLogout);

    dom.togglePasswordBtn.addEventListener('click', () => {
      const isHidden = dom.authPassword.type === 'password';
      dom.authPassword.type = isHidden ? 'text' : 'password';
      dom.togglePasswordBtn.textContent = isHidden ? 'ẨN' : 'HIỆN';
    });

    // Upload zone click & keyboard
    dom.uploadZone.addEventListener('click', (e) => {
      if (e.target === dom.changeImageBtn) return;
      if (!state.hasImage) {
        openFileDialog();
      }
    });

    dom.uploadZone.addEventListener('keydown', (e) => {
      if (e.target !== dom.uploadZone || state.hasImage) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFileDialog();
      }
    });

    dom.changeImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openFileDialog();
    });

    dom.imageInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleSelectedFile(file);
      }
    });

    // Drag and drop events
    ['dragenter', 'dragover'].forEach((eventName) => {
      dom.uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!state.isScanning) {
          dom.uploadZone.classList.add('is-dragover');
        }
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dom.uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.uploadZone.classList.remove('is-dragover');
      });
    });

    dom.uploadZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        handleSelectedFile(file);
      }
    });

    // Skin type select
    dom.skinTypeSelect.addEventListener('change', (e) => {
      state.skinType = e.target.value;
      if (state.hasAnalysis) {
        dom.analyzeCaption.textContent =
          'Thông tin làn da vừa thay đổi. Nhấn Bắt đầu phân tích để cập nhật kết quả mới.';
      }
    });

    // Multi-select concern pills
    dom.concernPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;

      const concern = btn.dataset.concern;
      if (!concern) return;

      if (state.concerns.includes(concern)) {
        state.concerns = state.concerns.filter((item) => item !== concern);
      } else {
        state.concerns = [...state.concerns, concern];
      }

      syncConcernPillsUI();

      if (state.hasAnalysis) {
        dom.analyzeCaption.textContent =
          'Mối quan tâm ưu tiên vừa thay đổi. Nhấn Bắt đầu phân tích để cập nhật phác đồ.';
      }
    });

    // Primary Analyze button
    dom.analyzeBtn.addEventListener('click', triggerAnalysis);

    // Tab navigation
    dom.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        if (target) switchTab(target);
      });
    });

    // Delegated Product tier filter actions
    dom.panels.products.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('[data-tier-filter]');
      if (!filterBtn) return;
      state.productTierFilter = filterBtn.dataset.tierFilter || 'all';
      renderProductsTab();
    });

    // Delegated History actions (Clear History / View Session / Delete Session)
    dom.panels.history.addEventListener('click', (e) => {
      if (e.target.closest('#clearHistoryBtn')) {
        clearAllHistory();
        return;
      }
      const deleteBtn = e.target.closest('[data-delete-id]');
      if (deleteBtn) {
        deleteHistorySession(deleteBtn.dataset.deleteId);
        return;
      }
      const viewBtn = e.target.closest('[data-view-id]');
      if (viewBtn) {
        restoreHistorySession(viewBtn.dataset.viewId);
      }
    });
  }

  async function init() {
    // Purge legacy shared history key from older versions
    try {
      localStorage.removeItem('auraskin_ui_history');
    } catch (e) {
      // Ignore storage errors in restricted modes
    }

    state.currentUser = loadAuthSession();
    resetWorkspaceState();

    if (state.currentUser && state.currentUser.token) {
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${state.currentUser.token}`
          }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            state.currentUser.id = meData.user.id;
            state.currentUser.fullName = meData.user.fullName;
            state.currentUser.email = meData.user.email;
            persistAuthSession(state.currentUser);
          }
          await loadHistoryFromBackend();
        } else {
          console.warn('Session expired or invalidated on backend, clearing login.');
          state.currentUser = null;
          persistAuthSession(null);
          state.history = [];
        }
      } catch (err) {
        console.warn('Backend reachability issue on auth verify, loading local history:', err);
        state.history = loadHistoryFromStorage(state.currentUser);
      }
    }

    setAuthMode('login');
    applyAuthState();
    bindEvents();
    renderAllTabs();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
