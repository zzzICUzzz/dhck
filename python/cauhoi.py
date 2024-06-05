import re
import json

def txt_to_json(txt_filename, json_filename):
    """Chuyển đổi dữ liệu từ tệp TXT sang tệp JSON.

    Args:
        txt_filename: Tên tệp TXT đầu vào.
        json_filename: Tên tệp JSON đầu ra.
    """

    data = {}
    current_question = None
    question_text = ""  # Biến để lưu trữ nội dung câu hỏi đầy đủ

    with open(txt_filename, 'r', encoding='utf-8') as txt_file:
        for line in txt_file:
            # Tìm số câu hỏi
            match_question = re.match(r'Câu (\d+)\.', line.strip())
            if match_question:
                # Nếu đã có câu hỏi trước đó, lưu lại câu hỏi đó
                if current_question:
                    data[current_question]["question"] = question_text.strip()

                # Bắt đầu câu hỏi mới
                current_question = int(match_question.group(1))
                question_text = line.strip()[len(match_question.group(0)):].strip()  # Lấy phần còn lại của dòng
                data[current_question] = {
                    "question": "",  # Chưa có nội dung câu hỏi đầy đủ
                    "options": {}
                }
            # Tìm các lựa chọn đáp án trên cùng dòng
            elif current_question:
                match_options = re.findall(r'\b([A-D])\. (.*?)(?=\b[A-D]\.|$)', line.strip())
                if match_options:
                    for option, answer in match_options:
                        data[current_question]["options"][option] = answer.strip()
                else:
                    # Nếu không phải lựa chọn đáp án, thêm dòng này vào nội dung câu hỏi
                    question_text += " " + line.strip()

    # Lưu câu hỏi cuối cùng (nếu có)
    if current_question:
        data[current_question]["question"] = question_text.strip()

    # Ghi dữ liệu vào tệp JSON
    with open(json_filename, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=2)

# Sử dụng hàm
txt_to_json(r'txt\nhi1736_2028.txt', r'json\nhi1736_2028.json')
