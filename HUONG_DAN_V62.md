# QUÉT THẺ LỚP HỌC V6.2 – THỜI GIAN NẰM TRONG MÃ QR

Bản V6.2 kế thừa V6.1, điều chỉnh quy trình thời gian của **chế độ 2: học sinh làm bài bằng điện thoại, trưởng nhóm gom QR**. Chế độ quét thẻ giấy A/B/C/D, quản lý lớp, đề, thống kê và đồng bộ Firebase được giữ nguyên.

## I. Cập nhật GitHub Pages

1. **Sao lưu JSON trước** trong ứng dụng giáo viên (nút ⬇ Sao lưu).
2. Nếu đã sử dụng V6.1: giải nén `CAP_NHAT_V62_CHI_5_TEP.zip`; thay **5 tệp** `index.html`, `teacher-group.js`, `hoc-sinh.html`, `student-app.js`, `sw.js` (tệp `sw.js` làm mới cache). Các tệp khác giữ nguyên.
3. Nếu cài mới: giải nén gói đầy đủ và tải các tệp website bên trong lên thư mục gốc của repository GitHub.
4. Commit, kiểm tra GitHub Pages đã triển khai xong rồi mở `index.html?v=62` (giáo viên) và `hoc-sinh.html?v=62` (học sinh). Nếu vẫn thấy V6.1, làm mới website và cập nhật biểu tượng PWA.
5. Mở ứng dụng trên điện thoại một lần có Internet, kiểm tra thử khi bật chế độ máy bay. Không xóa dữ liệu Safari trên thiết bị đang có kết quả chưa sao lưu.

## II. Giáo viên – nhập thời gian trước rồi sinh QR

1. Chọn lớp, đề kiểm tra và chế độ **Thu bài QR nhóm**.
2. Trong cùng khung xanh, **nhập thời gian** (0–180 phút, 0 = không giới hạn) ngay bên cạnh nút **🔑 Tạo QR với thời gian đã nhập**.
3. Chọn chính sách rời màn hình, nhấn **Tạo QR với thời gian đã nhập**. Ứng dụng lưu thông số và tạo QR mới mang thông tin: mã phiên, lớp, tên đề, số câu, **số phút làm bài** và chính sách rời màn hình.
4. Chiếu QR lên TV cho học sinh mở bằng ứng dụng học sinh đã cài sẵn.
5. Nếu chỉnh thời gian/chính sách sau khi tạo QR, mã đang chiếu sẽ ẩn cho tới khi tạo lại. Nếu mã phiên đã được dùng rồi và cần thay thời gian, ứng dụng sinh **mã phiên khác** và yêu cầu mọi học sinh quét lại. Khi đã thu bài, ứng dụng không cho thay đổi các thông số của phiên.

## III. Học sinh – đồng hồ chạy ngay sau khi quét

1. Mở trang `hoc-sinh.html` đã cài sẵn ngoại tuyến, **nhập mã thẻ học sinh** (ví dụ 07).
2. Bấm **📷 Quét QR · Đồng hồ bắt đầu ngay** và hướng camera vào QR của giáo viên trên TV.
3. Ngay khi ứng dụng nhận QR, đồng hồ **đếm ngược lập tức**, hiện tên lớp, đề, số câu và thời lượng. Nếu mã thẻ đã được nhập hợp lệ, phiếu đáp án A/B/C/D tự mở; không phải nhấn thêm Bắt đầu để tính giờ.
4. Nếu chưa nhập mã thẻ, đồng hồ vẫn chạy; hãy nhập mã rồi nhấn **Vào phiếu trả lời / tiếp tục**. Thời gian nhập mã thẻ được tính vào thời lượng.
5. Khi hết giờ, phiếu khóa mọi lựa chọn, lưu đáp án đang có và tự tạo mã QR bài làm. Nếu iOS tạm dừng trang khi tắt màn hình, việc khóa và tạo QR xảy ra ngay khi ứng dụng được mở lại.
6. Quét lại **cùng mã phiên** hoặc mở lại trang không khởi động lại đồng hồ: thời điểm bắt đầu và hạn cuối được lưu trên thiết bị. Muốn đổi đề/phiên khi đang làm bài phải được giáo viên hướng dẫn; hệ thống không cho đổi trực tiếp khi bài chưa khóa.

## IV. Giới hạn an toàn – công bằng

- Do lớp không có mạng, đây là **thời gian riêng của từng điện thoại tính từ lúc quét thành công**, không phải đồng hồ kết thúc cùng một thời điểm trên toàn lớp. Giáo viên nên cho các em quét QR đồng thời và quan sát lớp.
- Trang web không có đồng hồ máy chủ đáng tin cậy: học sinh có thể can thiệp thời gian thiết bị hoặc dữ liệu trình duyệt. Chức năng chỉ giúp kiểm soát thông thường, không đảm bảo chống gian lận tuyệt đối.
- QR chứa thời gian và mã đề/phiên, **không chứa toàn bộ 20 câu hỏi**. Nội dung câu hỏi vẫn chiếu trên TV hoặc in giấy.
- Sự kiện rời màn hình có thể do cuộc gọi, thông báo hệ thống; cần kiểm tra trước khi kết luận gian lận.
- Cần kiểm tra thực tế trên Safari/iPhone và Chrome/Android trước khi áp dụng cho bài đánh giá chính thức.

## V. Thử nghiệm đã thực hiện

- Mô phỏng trình duyệt: tạo QR từ 17 phút, giải mã dữ liệu thời gian đúng; quét QR hiển thị 17:00 ngay lập tức; sau 30 giây còn 16:30; mở phiếu đáp án và khi hết hạn tự khóa, sinh QR kết quả.
- Mã QR thời gian dùng cùng giao thức EX7 với V6.1, tương thích QR nhóm hiện có.
- **Chưa kiểm thử camera thật hoặc Firebase thực tế của giáo viên**.
