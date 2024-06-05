import re

def parse_questions(file_path):
    """Phân tích câu hỏi trắc nghiệm từ tệp TXT và trả về danh sách các câu hỏi."""
    questions = []
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

        # Biểu thức chính quy linh hoạt hơn
        question_pattern = r"Câu \d+\. (.+?)(?=\n\s*[A-D]\. |$)"
        option_pattern = r"\n\s*([A-D]\. .+)"

        question_matches = re.finditer(question_pattern, text)

        for question_match in question_matches:
            question_text = question_match.group(1).strip()
            start = question_match.end()
            end = start
            options = []

            # Tìm kiếm các lựa chọn cho câu hỏi hiện tại
            while True:
                option_match = re.search(option_pattern, text[end:])
                if option_match:
                    options.append(option_match.group(1).strip())
                    end = end + option_match.end()
                else:
                    break

            questions.append({"text": question_text, "options": options})

    return questions

def generate_html(questions):
    """Tạo mã HTML cho các câu hỏi trắc nghiệm."""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Câu hỏi trắc nghiệm</title>
    </head>
    <body>
    """
    for i, question in enumerate(questions):
        html += f"""
        <div class="question">
            <p>{i + 1}. {question["text"]}</p>
            <form>
    """
        for option in question["options"]:
            html += f"""
                <label><input type="radio" name="q{i + 1}">{option}</label><br>
    """
        html += """
            </form>
        </div>
    """
    html += """
    </body>
    </html>
    """
    return html

# Đường dẫn đến tệp TXT của bạn
file_path = r"C:\Users\mayde\Desktop\dhck\NHTN.txt" 

# Phân tích câu hỏi
questions = parse_questions(file_path)

# Tạo HTML
html = generate_html(questions)

# Lưu HTML vào tệp
with open("cau_hoi.html", "w", encoding="utf-8") as f:
    f.write(html)
