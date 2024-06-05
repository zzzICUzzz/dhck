def format_questions(filename):
    """Định dạng lại file txt để mỗi đáp án nằm trên một dòng."""
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()

    formatted_text = ""
    for line in text.split("\n"):  # Tách thành các dòng
        if line.startswith(("A.", "B.", "C.", "D.")):  # Kiểm tra nếu dòng bắt đầu bằng A., B., C., D.
            formatted_text += "\n" + line  # Thêm xuống dòng trước đáp án
        else:
            formatted_text += line + "\n"  # Giữ nguyên dòng và thêm xuống dòng

    with open(filename, "w", encoding="utf-8") as f:
        f.write(formatted_text.strip())  # Loại bỏ xuống dòng thừa ở đầu và cuối

if __name__ == "__main__":
    filename = "NHTN.txt"  # Tên file cần chỉnh sửa
    format_questions(filename)
    print(f"Đã định dạng lại file {filename} thành công!")
