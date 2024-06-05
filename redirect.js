// Kiểm tra nếu người dùng đã truy cập index.html trong phiên làm việc hiện tại
if (!sessionStorage.getItem('visitedIndex')) {
    // Nếu chưa, kiểm tra nếu trang hiện tại không phải là index.html
    if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        // Chuyển hướng tới index.html
        window.location.href = '/index.html';
    } else {
        // Nếu là index.html, lưu trạng thái đã truy cập trong phiên làm việc hiện tại
        sessionStorage.setItem('visitedIndex', 'true');
    }
}