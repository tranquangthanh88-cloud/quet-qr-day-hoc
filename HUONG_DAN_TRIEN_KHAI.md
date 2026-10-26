# QUÉT THẺ LỚP HỌC V3 — iPHONE — 48 HỌC SINH

## Thay đổi quan trọng: thẻ định danh cố định, quét nhóm tự do

- **Mã thẻ 01 luôn thuộc một học sinh được chỉ định** trong danh sách lớp. Dù em ấy đổi chỗ ngồi, mã không đổi.
- **Mỗi lượt quét có thể nhận bất kỳ nhóm mã nào**, ví dụ: `01, 07, 08, 05, 09, 40, 34, 21`. Không áp đặt nhóm mã hoặc vị trí cố định.
- Khi app phát hiện mã, ứng dụng ghi liên kết **câu hỏi → mã thẻ → học sinh → A/B/C/D**.
- Một mã được ghi tối đa một lựa chọn trong **mỗi câu**. Quét lặp trong cùng câu không làm tăng số người; mặc định không ghi đè câu trả lời đã lưu.
- Bấm **Lượt mới** để bắt đầu xem kết quả của nhóm kế tiếp; nút này **không xóa** kết quả các nhóm trước trong câu.
- Mỗi câu có danh sách chưa ghi nhận. Giáo viên có thể khai báo **mã vắng** để không tính những em ấy vào số dự kiến quét, vẫn giữ tên và thẻ trong danh sách lớp.
- Điểm và lựa chọn từng câu xuất theo đúng học sinh, mở trong Excel được.

## Các tệp trong gói

- `BO_THE_01_48_IN_A4.pdf`: 48 thẻ mã số 01–48, in 2 thẻ trên 1 trang A4, cắt theo đường kẻ.
- `BO_THE_01_4_IN_A4.pdf`: 4 thẻ để thử nhanh trước khi dùng cả lớp.
- `DANH_SACH_48_MAU.csv`: mẫu mã thẻ và họ tên, mở bằng Excel rồi điền tên.
- `web-iphone/`: bản chạy bằng Safari trên iPhone, cần cài qua website HTTPS một lần có Internet.
- `QRClassroomScanner/`: dự án SwiftUI, Apple Vision, dành cho iPhone nếu có máy Mac và Xcode để biên dịch.

## 1. Gán số thẻ cho học sinh

1. In và phát cố định mã số 01–48 cho 48 học sinh. Nên ghi tên học sinh lên mặt sau thẻ (không che mã ở mặt trước).
2. Trên app chọn **Lớp** rồi nhập danh sách, một dòng theo dạng **`01;Nguyễn Văn An`**, **`07;Trần Thị Bình`**. Có thể nhập không theo thứ tự số thẻ, app sẽ tự liên kết bằng **mã số**.
3. Có thể sao chép thẳng cột họ tên từ Excel nếu đúng thứ tự 01, 02... nhưng dạng `số;họ tên` an toàn hơn khi học sinh đổi vị trí trong danh sách lớp.
4. Đặt sĩ số 48 (hoặc giảm theo sĩ số thực). Nếu học sinh nghỉ, nhập số thẻ vắng, ví dụ `3, 14, 29`, tại phần **Học sinh vắng**.

Lưu ý: số thẻ là định danh trong phạm vi một lớp. Nếu dùng nhiều lớp, phải lưu và nạp danh sách đúng từng lớp; bản thử nghiệm V3 vẫn quản lý một lớp/bài trên cùng thiết bị tại một thời điểm. Hãy sao lưu JSON/CSV trước khi đổi lớp.

## 2. Quét mỗi câu theo nhóm tự do

1. Chiếu câu hỏi trên TV như thông thường. Mỗi học sinh giơ thẻ với **A/B/C/D mà mình chọn hướng lên trên**.
2. Chọn câu hiện tại trên app, bấm **Bật quét** (hoặc chụp ảnh từng cụm).
3. Lia camera qua bất kỳ 8 thẻ nào đang giơ. Ví dụ camera thấy các thẻ `01, 07, 08, 05, 09, 40, 34, 21`, app ghi câu trả lời của đúng các học sinh mang mã này.
4. Màn hình **Nhóm quét tự do** hiển thị bảng `Mã thẻ | Học sinh | Chọn`. Khi quét sang nhóm khác, bấm **+ Lượt mới** để bộ đếm của nhóm về 0; các đáp án vừa thu **không mất**.
5. Cuối câu, so sánh **Đã quét / Dự kiến** và danh sách **Chưa quét** (đã loại học sinh vắng). Quét bù những em chưa thấy rõ.
6. Chuyển **Câu sau**. Học sinh giữ thẻ nhưng xoay đáp án theo câu mới; app ghi lựa chọn mới theo cùng mã thẻ.
7. Tab **Kết quả** xuất CSV để dùng trong Excel, lưu JSON để sao lưu.

**Quan trọng:** “Lượt quét” là lượt tổng hợp trên màn hình. Phần mềm có thể cần **nhiều khung hình camera** để đọc đủ 8 mã. Một lần hướng camera vào 8 người **không bảo đảm** nhận đủ cả 8 ngay lập tức, do khoảng cách, kích thước thẻ, ánh sáng, góc giơ thẻ và thiết bị.

## 3. Cài bản Safari nếu KHÔNG có máy Mac

1. Đưa bốn tệp `index.html`, `sw.js`, `manifest.webmanifest`, `icon.png` trong thư mục `web-iphone` lên hosting HTTPS tĩnh. Ví dụ GitHub Pages hoặc một website HTTPS của nhà trường. Không đưa danh sách tên/kết quả vào mã nguồn hoặc kho website công khai.
2. Trên Safari của iPhone, mở địa chỉ HTTPS **khi còn Internet**, cho trang tải đầy đủ thư viện quét QR. Chọn **Chia sẻ → Thêm vào Màn hình chính**.
3. Mở biểu tượng ứng dụng mới, vào **Hướng dẫn → Kiểm tra lưu ngoại tuyến**. Sau đó bật **chế độ máy bay**, đóng và mở lại biểu tượng, thử camera và bốn thẻ thử.
4. Nếu không chạy khi ngoại tuyến, **không triển khai cho lớp** cho đến khi đã khắc phục vấn đề cache/HTTPS. Safari có thể hạn chế quyền camera hoặc xóa bộ nhớ web. Nên xuất bản sao lưu sau mỗi giờ.

Bản web dùng jsQR JavaScript theo cách xử lý nhiều vùng ảnh. Đây là nguyên mẫu; chưa thử trên camera Safari thật. Không tương thích với thẻ Plickers chính hãng.

## 4. Cài bản iOS gốc nếu CÓ máy Mac

1. Mở `QRClassroomScanner/QRClassroomScanner.xcodeproj` bằng Xcode trên macOS; chọn Apple ID/Team và iPhone mục tiêu để ký/cài bản ứng dụng.
2. Cấp quyền camera. App sử dụng **Apple Vision** trên iPhone để tìm **nhiều QR trong một khung hình** và xác định hướng thẻ.
3. Vào **Lớp** nhập ánh xạ tên ↔ mã, đánh dấu thẻ vắng nếu cần; vào **Quét** quét nhóm 8 bất kỳ, bấm **Lượt mới** khi đổi nhóm; sau mỗi câu kiểm tra còn thiếu.
4. Vào **Kết quả** xuất CSV/JSON sang ứng dụng Tệp (Files). Không cần Internet trong giờ học sau khi cài xong.

Bản iOS gốc **là mã nguồn Xcode, không phải IPA đã ký sẵn**, chưa được biên dịch/kiểm tra trực tiếp trên iPhone trong môi trường tạo bản mẫu. Cần máy Mac để biên dịch và cài trực tiếp.

## 5. Kiểm thử và giới hạn

Đã kiểm tra trên trình duyệt máy tính đối với 8 mã không liên tiếp: `01, 07, 08, 05, 09, 40, 34, 21` → đúng danh tính và đáp án trong dữ liệu mẫu; quét trùng không tăng số người; vắng 3/48 → 45 dự kiến; bấm Lượt mới không xóa kết quả câu; đổi câu và xuất bảng 48 dòng. Mã JavaScript được kiểm tra cú pháp Node; mã Swift được kiểm tra cú pháp bằng Swift parser (chưa biên dịch bằng Xcode).

Chưa kiểm tra **camera iPhone thật**, 8 QR trong một khung hình hoặc tốc độ quét thực tế tại lớp, và quyền camera/khả năng hoạt động ngoại tuyến của Safari trên máy của giáo viên. Trước khi dùng thật: thử 4 thẻ × 4 hướng, sau đó thử 8 thẻ như cụm dự kiến, cuối cùng chạy 1 bài 5–10 câu với 48 em. Đối chiếu lựa chọn với ghi tay để kiểm tra tỷ lệ đọc sai. Không dùng làm kiểm tra đánh giá chính thức khi chưa nghiệm thu thực tế.
