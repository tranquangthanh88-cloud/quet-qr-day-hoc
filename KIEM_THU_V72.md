# KẾT QUẢ KIỂM THỬ BẢN V7.2

## Đã kiểm tra

- Cú pháp JavaScript `cloud-sync.js` bằng Node.js `--check`: đạt.
- Cú pháp JavaScript nhúng trong `index.html`: đạt.
- Trạng thái giấy phép với mô phỏng Firestore: chưa được cấp → chờ duyệt; có giấy phép còn hạn → được cấp; đã hết hạn → không được cấp; có quyền Super Admin → vẫn được phép sử dụng.
- Quy tắc sử dụng ngoại tuyến cục bộ: từ chối giấy phép đã quá 30 ngày từ lần xác minh, hoặc đã quá hạn.
- Thao tác quản trị trong mô phỏng: cấp 365 ngày, tạm khóa, mở lại, từ chối người không có quyền Admin.
- Kiểm tra cấu trúc giao diện: tab Quản trị, bảng tài khoản, nút cấp/gia hạn, hộp thoại giấy phép.

## Chưa kiểm chứng

- Chưa kết nối với Firebase Project thật và chưa chạy Firestore Emulator để tự động xác nhận tất cả quy tắc bảo mật.
- Chưa thử trực tiếp trên iPhone/Safari với camera thật.
- Chưa kiểm tra công việc triển khai GitHub Pages, Service Worker và đồng bộ Firestore của dự án thật.

## Kiểm thử nghiệm thu nên làm trước khi phát hành

1. Xuất bản quy tắc Firestore V7.2 rồi chạy **Rules Playground**: một tài khoản giáo viên không thể sửa `admins` hoặc `licenses` của chính mình.
2. Đăng nhập UID nhà sáng lập; hiển thị tab Quản trị và tab dạy học.
3. Đăng ký giáo viên B mới; chưa có giấy phép, không thể ghi `users/B/app/data`.
4. Admin duyệt B 30 ngày; B tạo lớp/đề và đồng bộ hai thiết bị.
5. Admin tạm khóa B; kiểm tra app và server từ chối thao tác ghi tiếp.
6. Tài khoản B không đọc được `users/A/app/data` dù biết A UID.
7. Giáo viên B chia sẻ đề; người khác sao chép được mà không có danh sách học sinh và điểm.
8. Tắt mạng sau khi đã được cấp phép, thử cả hai chế độ quét. Mở lại mạng, kiểm tra đồng bộ.

Đây là **bản thử nghiệm kỹ thuật V7.2**, chưa phải phiên bản thương mại đã kiểm định bảo mật và chống can thiệp ngoại tuyến.
