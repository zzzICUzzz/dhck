import chardet

def get_characters_after_asterisk(filename):
    """
    Hàm này đọc một tệp văn bản, tự động phát hiện mã hóa, và trích xuất tất cả các ký tự liền kề sau dấu '*'.

    Args:
        filename (str): Tên của tệp văn bản cần xử lý.

    Returns:
        list: Một danh sách chứa các chuỗi ký tự được tìm thấy.
    """
    characters_found = []

    # Tự động phát hiện mã hóa
    with open(filename, 'rb') as file:
        rawdata = file.read()
        result = chardet.detect(rawdata)
        encoding = result['encoding']

    try:
        # Mở tệp với mã hóa đã phát hiện
        with open(filename, 'r', encoding=encoding) as file:
            for line in file:
                i = 0
                while i < len(line):
                    if line[i] == '*':
                        j = i + 1
                        characters = ""
                        while j < len(line) and line[j].isalnum():
                            characters += line[j]
                            j += 1
                        if characters:
                            characters_found.append(characters)
                        i = j
                    else:
                        i += 1

    except UnicodeDecodeError:
        print(f"Lỗi giải mã tệp {filename}. Vui lòng kiểm tra lại mã hóa của tệp.")
        return []  # Hoặc xử lý lỗi theo cách khác

    return characters_found

# Ví dụ sử dụng:
filename = "NGÂN HÀNG TỐT NGHIỆP 2023.txt"  # Thay thế bằng tên tệp của bạn
result = get_characters_after_asterisk(filename)
print(result)
