    Dữ liệu xây dựng nền tảng NHTN 2023.
    Truy cập index.html -> quiz.html dùng chung script.js và style.css
    Truy vấn hệ thống: nền tảng câu hỏi mỗi subject (lựa chọn bộ câu hỏi) nằm folder json. Hệ ngân hàng 2023 dùng số câu 4 số (1->2024 câu),
hệ ngân hàng update 2024 tiếp tục với Key số thứ tự câu là 5 số (10000: giải phẫu, 20000: sinh lý ,..., 60000: nhi khoa) số đuôi là số trong file 
2024, ví dụ 10456 là file cập nhật mới trong ngân hàng 2024, số thứ tự 456.
    Truy vấn đáp án chung trong file da.json
    Mẫu question trong json:
            "Key(số thứ tự)": {
            "question": "Đặc điểm tăng cân ở trẻ em:",
            "options": {
            "A": "Trẻ tăng cân liên tục xen kẽ giai đoạn giảm cân sinh lý (<10% cân nặng)",
            "B": "Trẻ tăng cân liên tục xen kẽ giai đoạn giảm cân sinh lý (>10% cân nặng)",
            "C": "Từ tháng thứ 7 đến tháng thứ 9 trẻ tăng trung bình gần 500 gram/tháng",
            "D": "Từ tháng thứ 7 đến tháng thứ 9 trẻ tăng trung bình gần 750 gram/tháng"
            }
        }
    sử dụng python truy vấn ngược từ mẫu txt sang câu hỏi và đáp án dạng json.
    mẫu txt (với số câu quy định và dấu "*" ngay trước đáp án):
            Câu 215.  Để thai dễ sổ ra ở những người sinh con so, thường cắt âm hộ ở vị trí
            A. 1 giờ hoặc 11 giờ	     
            *B. 3 giờ hoặc 9 giờ	     
            C. 5 giờ hoặc 7 giờ	     
            D. 6 giờ