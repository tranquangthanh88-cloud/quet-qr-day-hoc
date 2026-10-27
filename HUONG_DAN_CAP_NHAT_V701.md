# Cập nhật giao diện đăng nhập V7.0.1

## Đã thay đổi
- Màn hình đăng nhập của giáo viên chỉ hiển thị tiêu đề, email, mật khẩu, Đăng nhập / Đăng ký mới / Quên mật khẩu, thông báo trạng thái và dòng **© Trần Quang Thạnh 2026**.
- Ẩn phần Cài đặt kết nối Firebase (quản trị viên) và đoạn giải thích kỹ thuật trên màn hình đăng nhập thông thường.
- Thêm bản quyền © Trần Quang Thạnh 2026 ở chân trang sau khi đăng nhập và trang học sinh.
- Giữ tính năng dùng ngoại tuyến khi thiết bị đã có hồ sơ đăng nhập đáng tin cậy; nếu có hồ sơ phù hợp sẽ hiện nút “Mở dữ liệu ngoại tuyến”.
- Bản vá không thay đổi danh sách lớp, đề, bài làm, quyền Firebase hay việc đọc QR.

## Cập nhật GitHub
1. Trên ứng dụng hiện tại, nhấn **Sao lưu** để tải dữ liệu JSON.
2. Giải nén ZIP cập nhật, thay đúng 4 tệp tại thư mục gốc repository: `index.html`, `hoc-sinh.html`, `cloud-sync.js`, `sw.js`.
3. Nhấn **Commit changes**. Sau khi Pages triển khai xong, tải lại bằng URL `index.html?v=701`.
4. Nếu iPhone vẫn thấy bản cũ, đóng ứng dụng rồi mở lại; không xóa dữ liệu web khi chưa sao lưu.

## Thiết lập Firebase dành riêng cho quản trị viên
- Người dùng bình thường **không thấy** mục thiết lập Firebase ở trang đăng nhập.
- Nếu cấu hình Firebase chưa có, quản trị viên có thể mở `index.html?setup=firebase` để hiện ô cấu hình như trước.
- Để nhiều giáo viên đăng ký/đăng nhập ngay trên mọi thiết bị, quản trị viên nên điền cấu hình Web Firebase vào `firebase-config.js` của dự án GitHub một lần; đây là cấu hình công khai của ứng dụng, **không phải mật khẩu**.
- Không đưa danh sách học sinh, điểm, mật khẩu hay khóa dịch vụ đặc quyền lên GitHub.

## Giới hạn
- Bản vá đã được kiểm tra cấu trúc và hiển thị trên trình duyệt máy tính. Chưa kiểm thử đồng bộ Firebase/iPhone thật của giáo viên.
