# QUÉT THẺ LỚP HỌC V6.1 – ĐỒNG HỒ LÀM BÀI & GIÁM SÁT RỜI MÀN HÌNH

Bản này **kế thừa V6.0**; chức năng mới chỉ áp dụng cho **Phương án 2: Học sinh dùng điện thoại, trưởng nhóm gom QR, giáo viên quét QR nhóm**. Phương án 1 (quét QR giấy theo từng câu) giữ nguyên.

## 1. Cập nhật GitHub Pages

1. Mở website phiên bản cũ trên **máy tính và iPhone giáo viên**, bấm **⬇ Sao lưu**; giữ an toàn file JSON.
2. Giải nén `V61_DAY_DU.zip` và tải các tệp bên trong (không tải nguyên ZIP) lên **thư mục gốc** repository `tranquangthanh88-cloud/quet-qr-day-hoc`. Thay thế tệp trùng tên.
3. Chờ Actions → Pages báo thành công. Mở `https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/index.html?v=61` (giáo viên) và `https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/hoc-sinh.html?v=61` (học sinh).
4. Trên **mọi iPhone học sinh**, cập nhật ứng dụng trước hôm thi, mở khi có Internet, thử mở lại và quét QR trong chế độ máy bay. Nếu vẫn là bản V6.0 hoặc thư viện jsQR chưa được lưu ngoại tuyến, chế độ mới có thể không hoạt động.
5. Giữ các tệp `firebase-config.js`, `cloud-sync.js` và cấu hình Firebase cá nhân như trước. Không cần tạo lại dự án Firebase.

Nếu chỉ nâng từ V6.0 đã hoạt động ổn, có thể cập nhật sáu tệp trong `V61_CAP_NHAT.zip`: `index.html`, `hoc-sinh.html`, `student-app.js`, `teacher-group.js`, `qr-wire.js`, `sw.js`.

## 2. Giáo viên: phát đề với thời lượng

Tab **Quét** → chọn **Thu bài QR nhóm** → chọn đúng lớp và đề → cài:

- **Thời gian làm bài:** nhập số phút từ 1 đến 180; giá trị `0` là không giới hạn. Mặc định 20 phút.
- **Giám sát rời màn hình:** `Cảnh báo lần đầu, tự khóa lần thứ hai` (mặc định) hoặc `Khóa ngay lần đầu`.
- Chọn **Tạo / hiện mã QR bắt đầu đề**, chiếu QR trên TV. Cấu hình thời gian và giám sát được đưa vào mã QR và áp dụng trên phiếu trả lời học sinh.

**Không đổi thời gian/chế độ sau khi học sinh đã nhận và bắt đầu làm**; nếu có thay đổi, phải cho cả lớp nhận lại mã phiên với cấu hình mới trước khi bắt đầu. Khi đã thu bài, chương trình không cho đổi thông số của phiên hiện tại.

## 3. Học sinh: đếm ngược, tự khóa, tạo QR

- Mở trang `hoc-sinh.html` đã cài / lưu ngoại tuyến từ trước, quét mã bắt đầu đề, nhập mã học sinh và chọn **Bắt đầu**.
- **Đồng hồ chạy từ lúc từng học sinh nhấn Bắt đầu**. Đây không phải đồng hồ toàn lớp được đồng bộ theo máy chủ vì lớp không có mạng.
- Đáp án tự lưu ở điện thoại theo mã phiên và mã học sinh. Hết giờ, phiếu **tự khóa**, không cho sửa và **tự hiện QR nộp bài**, kể cả còn câu trống.
- Nếu học sinh chuyển tab, chuyển ứng dụng hoặc khóa màn hình, trình duyệt **có thể** phát sự kiện trang bị ẩn. Ở cấu hình mặc định, lần đầu ghi cảnh báo, lần thứ hai khóa bài; ở chế độ nghiêm ngặt, lần đầu đã khóa.
- Nếu iOS ngừng chạy JavaScript khi tắt màn hình, đồng hồ không thể hiện QR lúc màn hình đang tắt. Khi mở lại, ứng dụng kiểm tra hạn và **khóa ngay nếu hết giờ**.
- Bài đã khóa vẫn được giữ khi mở lại trên cùng trình duyệt và bộ nhớ web chưa bị xóa. Học sinh đưa QR cá nhân cho trưởng nhóm quét.

## 4. Trưởng nhóm, giáo viên thu bài

- Trưởng nhóm quét mã QR bài làm như V6.0; tối đa khoảng 8 em (đề dài có thể giảm số em/QR). Tạo QR nhóm.
- Giáo viên quét QR nhóm. Dữ liệu vẫn gắn với **mã thẻ/học sinh riêng**. Chỉ số cảnh báo khi trang bài thi bị ẩn và lý do khóa được chuyển tiếp cùng bài làm.
- Tab **Thống kê** và file **Bảng điểm CSV** có thêm các trường **Số lần rời màn hình** và **Lý do khóa**: `time`, `focus`, `manual`. Đáp án và điểm vẫn tính như cũ.
- Đồng bộ Firebase sau khi có Internet. Sao lưu JSON sau mỗi buổi.

## 5. Giới hạn chống gian lận – rất quan trọng

Phiên bản website/PWA **không thể ngăn hoàn toàn** học sinh mở ứng dụng khác, không biết chắc vì sao trang bị ẩn và không thể xác thực đồng hồ/hành vi khi thiết bị không có mạng. `visibilitychange`/`pagehide` chỉ đưa ra **dấu hiệu**; cuộc gọi, thông báo hệ điều hành, lỗi Safari, bật chế độ khóa màn hình, bị hệ điều hành tắt app cũng có thể khiến ứng dụng ghi cảnh báo hoặc không phát sự kiện đầy đủ. Bộ đếm thời gian cục bộ có thể bị tác động nếu học sinh đổi giờ máy hoặc xóa dữ liệu web.

**Không kết luận gian lận tự động chỉ vì có sự kiện rời màn hình.** Giáo viên nên xem cờ cảnh báo và xác minh. Với bài kiểm tra chính thức, cần thử trước trên nhiều iPhone và Android, ưu tiên chế độ cảnh báo lần đầu; bật `Không tự khóa` không có trong bản hiện tại vì yêu cầu là chống rời màn hình. Nếu cần tính hợp pháp/chính xác cao hơn, phải cân nhắc ứng dụng giám sát thiết bị chuyên dụng hoặc hình thức kiểm tra trực tiếp.

## 6. Phần đã kiểm thử và chưa kiểm thử

**Đã kiểm thử bằng Chromium mô phỏng:** giới hạn giờ hết hạn, sinh QR tự động, khóa chỉnh sửa, rời màn hình lần 1/2, khóa lần 1 theo chế độ nghiêm ngặt, mở lại vẫn khóa, mã QR đơn/nhóm có metadata, giáo viên nhận và lưu cảnh báo, giao thức V6.0 cũ vẫn đọc được.

**Chưa kiểm thử:** iPhone/Safari thực tế, điện thoại bị tắt màn hình lâu, các cuộc gọi tới, camera trong lớp, Firebase thật của người dùng. Đây là **bản thử nghiệm**, chưa dùng để tự động xử phạt học sinh.
