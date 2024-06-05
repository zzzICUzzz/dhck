def process_file(input_filename, output_filename):
    with open(input_filename, 'r', encoding='utf-8') as infile, \
         open(output_filename, 'w', encoding='utf-8') as outfile:

        for line in infile:
            new_line = ""  # Chuỗi để lưu dòng mới
            i = 0
            while i < len(line):
                char = line[i]
                if char in ('B', 'b', 'C', 'c', 'D', 'd') and i + 1 < len(line) and line[i + 1] == '.':
                    # Nếu gặp B., b., C., c., D. hoặc d.
                    if new_line:  # Nếu dòng mới không rỗng, thêm xuống dòng trước khi thêm B., b., C., c., D. hoặc d.
                        outfile.write(new_line + '\n')
                        new_line = ""

                    outfile.write(char )  # Đưa B., b., C., c., D. hoặc d. xuống dòng mới
                    i += 1  # Bỏ qua dấu "."
                else:
                    new_line += char  # Thêm ký tự vào dòng mới
                    i += 1

            if new_line:  # Ghi phần còn lại của dòng nếu có
                outfile.write(new_line + '\n')

# Nhập tên file đầu vào và đầu ra
input_filename = 'NHTN.txt'
output_filename = '1.txt'

process_file(input_filename, output_filename)
print("Đã xử lý xong! Kết quả được lưu trong file:", output_filename)
