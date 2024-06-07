import re
import json

def txt_to_json(txt_filename, json_filename):
    data = {}
    current_question = None
    question_text = ""

    with open(txt_filename, 'r', encoding='utf-8') as txt_file:
        for line in txt_file:
            match_question = re.match(r'Câu (\d+)\.', line.strip())
            if match_question:
                if current_question:  # Lưu câu hỏi trước đó
                    data[current_question]["question"] = question_text.strip()

                # Xử lý câu hỏi mới, thêm 60000 vào số thứ tự
                current_question = int(match_question.group(1)) + 40000 
                question_text = line.strip()[len(match_question.group(0)):].strip()
                data[current_question] = {
                    "question": "",
                    "options": {}
                }

            elif current_question:  # Xử lý các lựa chọn đáp án và phần còn lại của câu hỏi
                match_options = re.findall(r'\b([A-D])\. (.*?)(?=\b[A-D]\.|$)', line.strip())
                if match_options:
                    for option, answer in match_options:
                        data[current_question]["options"][option] = answer.strip()
                else:
                    question_text += " " + line.strip()

    # Lưu câu hỏi cuối cùng
    if current_question:
        data[current_question]["question"] = question_text.strip()

    # Ghi dữ liệu vào tệp JSON
    with open(json_filename, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=2)

# Sử dụng hàm
txt_to_json('ngoainew.txt', 'ngoainew.json')
