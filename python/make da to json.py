import json
import re

def txt_to_json(txt_file, json_file):
    with open(txt_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    data = {}
    for line in lines:
        match = re.search(r'Câu (\d+)', line)
        if match:
            key = int(match.group(1)) + 40000  # Thêm 60000 vào số thứ tự câu
            value = None
        elif line.startswith('*'):
            value = line[1]
            if key is not None and value is not None:
                data[str(key)] = value  # Chuyển key về dạng chuỗi

    with open(json_file, 'w', encoding='utf-8') as f:
        for key, value in data.items():
            f.write('"' + key + '":"' + value + '",\n')  # Xuống hàng sau mỗi cặp giá trị

txt_to_json('ngoainew.txt', 'dangoainew.json')
