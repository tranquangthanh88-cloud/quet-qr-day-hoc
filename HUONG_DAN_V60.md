# QUÉT THẺ LỚP HỌC V6.0 – HAI CHẾ ĐỘ

## 1. Tính năng

**Chế độ 1 – Quét thẻ giấy A/B/C/D:** giữ nguyên V5.3: mỗi học sinh dùng thẻ định danh riêng, giơ thẻ xoay theo đáp án; giáo viên quét theo nhóm 8 hoặc 12 người, ghi theo câu. Không cần học sinh có điện thoại.

**Chế độ 2 – Thu bài QR nhóm:** học sinh có điện thoại đã cài ứng dụng offline, làm bài trên điện thoại (phiếu trả lời), tạo QR bài làm; trưởng nhóm dùng điện thoại quét QR các bạn (tối đa 8 bài/nhóm), xuất một QR nhóm; giáo viên quét QR nhóm để lưu tất cả đáp án của từng học sinh theo mã thẻ. Với 45 học sinh, dự kiến 6 nhóm nếu mỗi nhóm tối đa 8 học sinh; thực tế có thể cần quét bù.

Hai chế độ chia sẻ lớp, đề, đáp án, điểm, thống kê và Firebase, dựa trên cùng cơ sở dữ liệu V5.x. Không mất kết quả cũ khi nâng cấp thông thường.

## 2. Cập nhật GitHub Pages

1. Trong website V5.3 trên máy tính và iPhone, chọn **Sao lưu** để giữ bản JSON ở từng thiết bị. Đồng bộ và tránh để hai thiết bị cùng chỉnh sửa trước khi nâng cấp.
2. Giải nén ZIP đầy đủ. Tải **tất cả tệp nằm bên trong `web-iphone`** lên thư mục gốc repository `tranquangthanh88-cloud/quet-qr-day-hoc`. Giữ nguyên tên tệp, thay thế các tệp trùng tên. Không tải nguyên thư mục lồng vào repository.
3. Nhấn Commit changes, kiểm tra Actions → pages build/deploy thành công.
4. Mở `https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/index.html?v=60` để kiểm tra ứng dụng giáo viên.
5. Mở `https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/hoc-sinh.html` để kiểm tra ứng dụng học sinh.
6. Nếu còn bản cũ, trước khi xóa cache hãy kiểm tra sao lưu JSON đã tải thành công. Nên dùng link có `?v=60` để kiểm tra triển khai trước.

## 3. Chuẩn bị dùng ngoại tuyến

- Trước giờ học, tất cả điện thoại học sinh/trưởng nhóm phải mở `hoc-sinh.html` qua Internet một lần, cài trang bằng Safari → Chia sẻ → Thêm vào Màn hình chính và thử chế độ máy bay.
- Ứng dụng quét QR dùng thư viện `jsQR` tải lần đầu từ CDN, được Service Worker cố gắng lưu để dùng offline; nếu CDN bị chặn hoặc trình duyệt không lưu đúng, thao tác đọc QR sẽ không hoạt động. Cần thử **thực tế** ở chế độ máy bay trước buổi học; QR sinh ra trên điện thoại không cần Internet.
- Ứng dụng giáo viên cũng cần mở trước và đồng bộ đầy đủ lớp, đề và **mã phiên kiểm tra** lên thiết bị giáo viên mang vào lớp. Giờ học không có mạng: tất cả kết quả chỉ lưu cục bộ cho tới lúc kết nối lại để đồng bộ Firebase.
- Mã QR bắt đầu đề **không chứa nguyên nội dung câu hỏi**. Học sinh xem câu hỏi trên TV hoặc đề giấy, chọn đáp án trong phiếu điện thoại.
- Trưởng nhóm cần đọc từng QR của các bạn để gom bài. Tốc độ giáo viên giảm, nhưng công đoạn quét được phân công cho học sinh và diễn ra song song giữa các nhóm.

## 4. Quy trình chế độ QR nhóm

1. **Giáo viên:** Chọn lớp, đề → tab Quét → Phương thức chấm chọn **Thu bài QR nhóm** → **Tạo / hiện mã QR bắt đầu đề**. Chiếu mã cho học sinh quét, hoặc đọc mã phiên và số câu cho học sinh nhập bằng tay.
2. **Học sinh:** Mở `hoc-sinh.html` trên điện thoại đã cài. Quét QR bắt đầu đề hoặc nhập mã phiên, số câu, lớp, tên đề. Nhập **mã thẻ cố định 01–63**. Chọn A/B/C/D theo từng câu, nhấn **Hoàn tất · Tạo QR nộp bài**.
3. **Trưởng nhóm:** Mở `hoc-sinh.html` → **Gom bài nhóm**, dùng camera quét QR nộp bài trên điện thoại các bạn. Có thể đưa bài làm của mình vào nhóm bằng nút **Thêm bài này vào nhóm**. Tạo QR nhóm tối đa 8 học sinh (với đề >40 câu ứng dụng giới hạn 6, >80 câu giới hạn 4 để QR nhỏ hơn).
4. **Giáo viên:** Bật camera trong phần **Quét QR nhóm để thu bài**, quét QR trên điện thoại trưởng nhóm. Ứng dụng đối chiếu **đúng mã phiên + số câu + mã thẻ trong lớp** và lưu mỗi đáp án vào đúng câu và học sinh. Nhóm khác tiếp tục.
5. Giáo viên quan sát số bài đã nhận, đối chiếu danh sách học sinh còn thiếu, xem tab **Thống kê** hoặc xuất CSV. Khi có Internet, kiểm tra Firebase đã đồng bộ thành công rồi mới xóa dữ liệu thiết bị.

## 5. Kiểm tra an toàn và giới hạn

- Chỉ hỗ trợ phiếu A/B/C/D và câu bỏ trống, không chuyển câu hỏi/tự luận/hình vẽ qua QR.
- Không quét được nếu học sinh chưa cài/cache ứng dụng và ở nơi hoàn toàn không có Internet.
- Mã QR có **mã kiểm tra lỗi không phải chữ ký số**; không ngăn được cố tình mạo danh học sinh hoặc sửa nội dung. Cần giám sát và đối chiếu ID.
- Một đề được dùng cho một lần kiểm tra tại mỗi lớp theo cấu trúc V5.x. Nếu cần làm lại vào ngày khác, nên tạo **Đề mới** hoặc sao chép đề trong hệ thống để tránh ghi đè.
- Quét lại bài đã nhận sẽ được nhận diện là trùng; QR chứa đáp án khác so với bài đã lưu bị **cảnh báo xung đột** và không tự ghi đè.
- Nếu mã thẻ học sinh không nằm trong danh sách lớp, ứng dụng báo mã lạ và không ghi bài.
- Khi nhập file Excel/thi trên học sinh, điểm và danh sách tên học sinh vẫn giữ trên thiết bị giáo viên/Firebase cá nhân; không đăng dữ liệu học sinh lên GitHub Public.
- **Chưa có kiểm thử camera iPhone thực tế, đồng bộ Firebase thật hay hiệu quả thu 8 điện thoại cùng lúc**. Đã thử mô phỏng logic giao thức và giao diện trên Chromium; nên thử trước với 4 em, rồi 8 em trước khi triển khai 45 em.

## 6. Cấu trúc file website

`index.html` (giáo viên), `hoc-sinh.html` (học sinh/trưởng nhóm), `qrgen.js` (QR offline), `qr-wire.js` (định dạng bài), `teacher-group.js` (thu QR nhóm giáo viên), `student-app.js` (phiếu trả lời + gom nhóm), `sw.js` (bộ nhớ offline), `cloud-sync.js`, `firebase-config.js`, `manifest.webmanifest`, `manifest-hoc-sinh.webmanifest`, `icon.png` và `THIRD_PARTY_NOTICES.txt`.
