# QUÉT THẺ LỚP HỌC V7.3 – QUÉT ĐA THẺ ARUCO + THỐNG KÊ V7.2.1

**Tác giả ứng dụng: Trần Quang Thạnh · © 2026**

## 1. Cập nhật một lần từ V7.2 lên V7.3

Tải **CAP_NHAT_V73_GOP_V721_TU_V72.zip**, giải nén và đưa 8 tệp vào thư mục gốc GitHub repo `tranquangthanh88-cloud/quet-qr-day-hoc`, thay tệp cũ nếu được hỏi:

1. `index.html` – chọn công nghệ QR/ArUco, tích hợp biểu đồ V7.2.1.
2. `hoc-sinh.html` – giữ phiếu học sinh V7.2, cập nhật nhãn V7.3.
3. `report-insights.js` – biểu đồ theo câu, chọn câu hiện danh sách đúng/sai.
4. `multi-marker.js` – adapter bộ nhận dạng nhiều thẻ ArUco.
5. `in-the-aruco.html` – trang tạo/in thẻ ArUco 01–63.
6. `sw.js` – cache phiên bản V7.3 cùng thư viện nhận dạng.
7. `manifest.webmanifest` – thông tin PWA.
8. `THIRD_PARTY_NOTICES.txt` – ghi nhận thư viện mã nguồn mở.

**Không ghi đè** `firebase-config.js`, `cloud-sync.js`, `FIRESTORE_RULES_V72.txt`. Không cần Blaze, không phải sửa Firestore Rules nếu đã dùng rules V7.2 chính xác.

**LƯU Ý:** Bấm **Sao lưu** trên app V7.2 trước khi cập nhật. Sau Commit, kiểm tra trang `https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/index.html?v=730` khi có Internet. Nếu trên iPhone đã cài PWA cũ, mở online để cập nhật các tệp cache; trước khi vào lớp bật chế độ máy bay và thử camera.

Nếu trước đó mới ở V7.0/V7.0.1, không nên chỉ đưa gói cập nhật này lên – cần triển khai V7.2 (gồm cấu hình quyền Super Admin/Firestore Rules) hoặc dùng **bộ V7.3 đầy đủ** và làm theo hướng dẫn V7.2 bên trong.

## 2. Chế độ QR giấy cũ (không cần in lại)

Chọn **Quét → Phương thức chấm = Quét thẻ giấy → Công nghệ nhận dạng = QR truyền thống**, giữ thẻ QR `LTHI:01`…`LTHI:63` và chức năng quét 8/12 thẻ, không đổi dữ liệu cũ.

## 3. Chế độ ArUco đa thẻ mới

1. Khi có Internet, mở **Quét → In bộ thẻ ArUco 01–63** hoặc truy cập `in-the-aruco.html`.
2. Chọn **in 9,2 cm (4 thẻ/trang A4)** để thử gần hoặc **14 cm (1 thẻ/trang)** để thử trong lớp. In các mã mà lớp cần; thẻ số 07 dùng cho học sinh mang mã 07; không phụ thuộc chỗ ngồi.
3. Mỗi thẻ có chữ **A trên, B phải, C dưới, D trái**. Học sinh đưa lựa chọn lên cạnh trên và hướng mặt có mã về camera.
4. Chọn **Công nghệ nhận dạng = ArUco đa thẻ**; chọn đúng lớp, đề, câu, nhấn **Bật camera**. Giữ máy ổn định, lia chậm qua học sinh. Mỗi mã cần được nhận dạng ổn định trong **ít nhất 2 khung hình** để ghi, giảm lỗi khi học sinh đang xoay thẻ.
5. Thẻ đã nhận hiển thị ở bảng **Đã quét**, thẻ còn thiếu ở bảng **Chưa quét**. Có thể nhấn **Chụp/chọn ảnh HD** bổ sung. Nếu không nhận đủ, đứng gần, tăng ánh sáng hoặc trở về QR cũ.
6. Ở câu tiếp theo, danh sách kết quả được tính riêng; không gắn đáp án với vị trí ngồi.

**ArUco V7.3 sử dụng bộ mã `ARUCO` 7×7 của `js-aruco2` v2.0.0 (JavaScript, MIT); không phải AprilTag 3/WASM.** Bộ tạo thẻ và bộ đọc dùng cùng một bộ mã. Thẻ QR cũ không đọc bằng chế độ ArUco và ngược lại.

Bộ nhận dạng của `js-aruco2` được nạp từ CDN jsDelivr khi có Internet và được service worker lưu đệm trên thiết bị. **Cần mở ứng dụng, in thẻ mẫu, xác nhận bộ thư viện đã lưu, rồi kiểm tra ngoại tuyến trước buổi học.** Bản này chưa đóng gói sẵn bản sao thư viện vào ZIP, nên nếu chưa từng tải online không chạy chế độ ArUco khi mất Internet.

### Độ chính xác / tốc độ

Công nghệ được thiết kế để nhận *nhiều thẻ mỗi ảnh* và cộng dồn nhiều ảnh qua một lượt lia camera. Không cam kết **45 thẻ chỉ trong một khung hình**, không cam kết một số giây cố định và chưa kiểm thử trực tiếp trên iPhone Safari trong lớp đông. Khi thẻ mờ, rất nhỏ hoặc xoay chéo 45°, chương trình bỏ qua thay vì đoán. Khi cần kiểm tra chính xác, giáo viên so sánh tổng **Đã quét/Chưa quét** và xem phương án từng học sinh.

## 4. Biểu đồ tương tác đã gộp từ V7.2.1

Vào **Thống kê → Chọn đề → Chọn lớp**. Mỗi câu có thanh phân bố **Đúng / Sai / Chưa trả lời**; học sinh **Vắng** được tách riêng và không tính vào mẫu số. Nếu câu chưa có đáp án chuẩn, hiển thị **Chưa chấm**.

Bấm **Câu N** để thấy danh sách học sinh, lớp, mã thẻ và phương án; lọc theo **Sai / Đúng / Chưa trả lời / Vắng / Tất cả**. Bảng phân bố A/B/C/D, xuất CSV và điểm số cũ vẫn tồn tại. Chỉ sử dụng dữ liệu trong tài khoản giáo viên đã đăng nhập.

## 5. Những phần V7.2 giữ nguyên

- Super Admin đồng thời là giáo viên, quản lý phê duyệt, cấp phép 30 ngày/365 ngày, gia hạn/tạm khóa thủ công.
- Đăng ký/đăng nhập email, mỗi giáo viên có dữ liệu riêng.
- Đồng bộ PC/iPhone qua Firebase Spark; dùng ngoại tuyến sau khi tải đủ dữ liệu.
- Thu bài bằng điện thoại học sinh → QR cá nhân → QR nhóm.
- QR khởi tạo bài thi kèm thời gian, đếm ngược, khóa khi hết giờ.
- Thư viện đề dùng chung, không sao chép dữ liệu điểm của người chia sẻ.

**Không có chức năng tự động xác nhận thanh toán ngân hàng trong V7.3** (theo yêu cầu).

## 6. Kiểm tra thực tế nên làm trước khi dùng cả lớp

Dùng 5–10 thẻ in trước để thử các góc A/B/C/D, so với đáp án học sinh đang giơ; sau đó thử 20 thẻ, rồi 40–45. Thử khoảng cách gần/xa, ánh sáng yếu, thẻ bị che, nhiều em trùng số thẻ *ở các lớp khác nhau*, quét ảnh tĩnh và camera trực tiếp trên iPhone và Android. Chưa nên ngừng sử dụng bộ QR cũ trước khi đủ dữ liệu thử nghiệm.

## 7. Sự cố thường gặp

- **“Thiếu thư viện ArUco”**: mở online, tải lại trang (trên iPhone cần mở trang PWA sau khi GitHub Pages cập nhật), chờ tải đủ và thử lại.
- **Đã thấy thẻ nhưng không ghi**: yêu cầu học sinh giữ yên thẻ; xoay lệch 45° hoặc thẻ quá nhỏ sẽ bị bỏ qua; chương trình yêu cầu ít nhất hai khung hình cho video.
- **Bộ thẻ không nhận**: phải in từ chính trang `in-the-aruco.html` của V7.3; bộ QR cũ không dùng cho ArUco.
- **Bảng điểm của lớp khác**: chọn đúng lớp và đề trước khi chấm; mã thẻ được giải theo *lớp đang chọn*.
- **Cảnh báo quyền Firebase**: phải hoàn thiện quy tắc V7.2, xem hướng dẫn V7.2; ArUco không sửa quyền Firebase.

## 8. Nguồn kỹ thuật và giấy phép

Thư viện `js-aruco2` v2.0.0 (MIT): <https://github.com/damianofalcioni/js-aruco2>. Thư viện trình duyệt là mã nguồn mở, không gọi dịch vụ AI/quét ảnh trả phí. Tham khảo `THIRD_PARTY_NOTICES.txt`.
