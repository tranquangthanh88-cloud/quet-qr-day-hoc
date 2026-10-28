# QUÉT THẺ LỚP HỌC V7.2 — CẬP NHẬT NHIỀU TÀI KHOẢN VÀ GIẤY PHÉP

© Trần Quang Thạnh 2026.

## BẢN CẬP NHẬT NÀY LÀM ĐƯỢC GÌ?

- Cùng một tài khoản nhà sáng lập được sử dụng **2 khu vực: Dạy học và 🛡 Quản trị**. Không cần tạo tài khoản thứ hai.
- Giáo viên khác **đăng ký email/mật khẩu → chờ duyệt**. Không tự nhận được một năm sử dụng.
- Quản trị viên **phê duyệt 30 ngày, 365 ngày, hoặc ngày hết hạn riêng; gia hạn, tạm khóa, mở lại**.
- Nhà sáng lập xem danh sách/email giáo viên đã tạo hồ sơ nhưng **không có quyền đọc lớp, điểm, bài làm riêng**.
- Mỗi giáo viên sử dụng cùng website; lớp, đề, kết quả riêng và đồng bộ PC/iPhone theo tài khoản.
- Thư viện đề chung cho phép công bố và sao chép **chỉ nội dung câu hỏi, đáp án**; quản trị viên có quyền gỡ đề đã chia sẻ.
- Giữ nguyên **hai cách chấm: QR giấy từng câu; học sinh làm trên điện thoại rồi nộp QR nhóm** và phần hẹn giờ V6.2.
- Hoạt động ngoại tuyến trên thiết bị đã chuẩn bị; kiểm tra lại giấy phép khi có Internet. Giấy phép đã xác minh gần nhất được chấp nhận cục bộ tối đa 30 ngày, không vượt ngày hết hạn.

## A. CHUẨN BỊ TRƯỚC KHI CẬP NHẬT (QUAN TRỌNG)

1. Mở bản V7.0.1 hiện tại trên máy tính, vào **Sao lưu** để tải file JSON chứa dữ liệu; lưu riêng file này, **không tải lên GitHub công khai**.
2. Giữ nguyên Firebase Project đang dùng và tài khoản đăng nhập của nhà sáng lập.
3. **Tạo hồ sơ Super Admin bằng Firebase Console trước khi đưa quy tắc bảo mật V7.2 vào sử dụng**, theo phần B.
4. Không sửa hoặc xóa `firebase-config.js` đã có cấu hình thật trên GitHub.

## B. TẠO TÀI KHOẢN SUPER ADMIN (CHỈ MỘT LẦN)

1. Đăng nhập https://console.firebase.google.com/ và chọn **Quet-QR-Day-hoc**.
2. Mở **Authentication → Users**; tìm email của nhà sáng lập, sao chép đúng **User UID** (không phải email, không phải Project ID).
3. Mở **Firestore Database → Data**.
4. Nhấn **Start collection / Bắt đầu bộ sưu tập**. Collection ID là: `admins`.
5. Trong `admins`, tạo document ID **chính xác bằng UID vừa sao chép**.
6. Thêm field `role`, loại **string**, giá trị `super_admin`. Lưu. KHÔNG gán vai trò trong JavaScript, không tạo admin bằng tài khoản giáo viên bình thường.

Ví dụ cấu trúc (UID phải là UID thật):

```
admins/
  <UID_CUA_NHA_SANG_LAP>/
    role: "super_admin"
```

Chỉ chủ dự án thao tác này trực tiếp trong Firebase Console. Firestore Rules mới **cấm ứng dụng web tự tạo hoặc sửa tài liệu admins**, nên giáo viên không thể tự cấp quyền.

## C. CẬP NHẬT FIRESTORE RULES (BẮT BUỘC)

1. Trong Firebase Console chọn **Firestore Database → Rules / Quy tắc**.
2. Mở tệp `FIRESTORE_RULES_V72.txt` trong gói V7.2, sao chép **toàn bộ** nội dung, thay quy tắc cũ và nhấn **Publish / Xuất bản**.
3. Quy tắc dành cho:
   - `admins/{uid}`: chỉ đọc chính mình; không ai tạo/sửa qua web.
   - `teacherProfiles/{uid}`: giáo viên tạo hồ sơ chỉ của mình; Super Admin được xem danh sách hồ sơ.
   - `licenses/{uid}`: chỉ Super Admin tạo, gia hạn, tạm khóa, mở; giáo viên đọc giấy phép của chính mình.
   - `users/{uid}/app/{doc}`: giáo viên đọc dữ liệu riêng của mình; chỉ được ghi khi có giấy phép đang hạn (hoặc là Super Admin).
   - `sharedExams/{id}`: chỉ giáo viên có quyền sử dụng được đọc/công bố; quản trị viên có thể gỡ đề công khai.
4. **Nếu chưa Publish thành công, V7.2 sẽ không đăng nhập quản trị đúng cách.** Đây là đặc điểm an toàn mặc định, không phải lỗi giao diện.

## D. CẬP NHẬT GITHUB PAGES

Chọn **một** trong hai gói:

- `CAP_NHAT_V72_GIU_FIREBASE_CONFIG.zip`: chỉ gồm **3 tệp website `index.html`, `cloud-sync.js`, `sw.js`**, kèm tệp quy tắc/hướng dẫn. Đây là cách **khuyên dùng** để nâng từ V7.0.1 vì không ghi đè cấu hình Firebase thật.
- `QUET_THE_V72_DAY_DU_GITHUB.zip`: website đầy đủ cho trường hợp cài mới. **Trong gói đầy đủ có `firebase-config.js` mẫu = null; nếu đang dùng dự án thật, KHÔNG ghi đè tệp cấu hình đang chạy**.

Trên https://github.com/tranquangthanh88-cloud/quet-qr-day-hoc → **Add file → Upload files**, tải đúng các tệp website vào thư mục gốc, thay tệp trùng tên rồi **Commit changes**. KHÔNG tải tệp Rules, hướng dẫn hoặc bài làm JSON lên GitHub chỉ để chạy website.

Khi GitHub Pages triển khai xong, mở:

- Giáo viên: https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/index.html?v=720
- Học sinh: https://tranquangthanh88-cloud.github.io/quet-qr-day-hoc/hoc-sinh.html

Kiểm tra hiển thị **V7.2.0** trên màn hình đăng nhập và chỉ tài khoản đã được gán `admins/{uid}` mới thấy tab **🛡 Quản trị**.

## E. SỬ DỤNG TRANG QUẢN TRỊ

1. Nhà sáng lập đăng nhập tài khoản Firebase cũ: dùng đầy đủ các tab giáo viên; nhấn **🛡 Quản trị** khi muốn quản lý tài khoản.
2. Trong tab quản trị, nhấn **Tải danh sách giáo viên**, nhấn **Chọn** ở tài khoản cần cấp phép.
3. Chọn **Dùng thử 30 ngày**, **1 năm (365 ngày)** hoặc **Ngày hết hạn tùy chọn** → nhấn **Cấp/Gia hạn**. Gia hạn 30/365 ngày được cộng từ **ngày hết hạn còn hiệu lực** hoặc từ hiện tại, tùy ngày nào muộn hơn.
4. Có thể **Tạm khóa** quyền sử dụng hoặc **Mở lại** trong ngày hết hạn cũ (nếu chưa hết hạn). Không xóa tài khoản Authentication và không xóa dữ liệu giáo viên.
5. Ở phần **Kiểm duyệt thư viện đề**, nhà sáng lập có thể gỡ đề đã được chia sẻ. Bản sao giáo viên khác đã nhận không tự bị xóa.

**Lưu ý:** Danh sách giáo viên hiển thị các email đã vào ứng dụng và tạo hồ sơ `teacherProfiles`; đây **không phải** công cụ liệt kê/vô hiệu hóa mọi tài khoản Authentication. Vô hiệu hóa trực tiếp ở mức Firebase Auth phải thao tác bằng Firebase Console hoặc backend Admin SDK.

## F. GIÁO VIÊN MỚI ĐĂNG KÝ

1. Người dùng mở link giáo viên, nhập email/mật khẩu → **Đăng ký mới**.
2. App báo **Chờ quản trị viên phê duyệt**, chưa truy cập khu vực dữ liệu lớp.
3. Nhà sáng lập vào Quản trị, tải danh sách và cấp giấy phép.
4. Khi Internet có kết nối, giáo viên nhấn **Kiểm tra lại giấy phép** hoặc chờ đồng bộ, sau đó sử dụng mọi chức năng giáo viên.
5. Giáo viên có thể mở trên iPhone và PC, đăng nhập cùng tài khoản, dữ liệu thuộc UID của riêng mình. Không cấp chung mật khẩu hoặc dùng chung tài khoản giữa các giáo viên.

## G. GIẤY PHÉP HẾT HẠN, NGOẠI TUYẾN VÀ SAO LƯU

- Khi kết nối Internet, Firestore Rules dùng **request.time của máy chủ** để kiểm soát quyền ghi. Thay ngày giờ điện thoại **không giúp ghi qua Firestore** sau khi hết hạn.
- Khi ngoại tuyến, thiết bị chỉ có thể kiểm tra theo giấy phép đã lưu gần nhất: tối đa 30 ngày từ lần xác minh và không vượt ngày hết hạn theo đồng hồ thiết bị. **Không thể bảo đảm chống giả mạo thời gian/biến đổi mã nguồn khi hoàn toàn offline** trên một trang web công khai.
- Khi chờ duyệt hoặc hết hạn, người dùng có thể chọn **Sao lưu dữ liệu của tôi** (nếu có dữ liệu từ trước), nhưng không được tạo/chấm mới hoặc đồng bộ thay đổi.
- Không xóa dữ liệu trang web Safari/Chrome nếu còn bài chưa đồng bộ; xuất JSON dự phòng mỗi buổi kiểm tra.
- Nếu Firestore từ chối ghi vì hết hạn/suspend, bài làm cục bộ không tự xóa; cần gia hạn để tiếp tục đồng bộ. Tránh đăng nhập trên thiết bị dùng chung.
- Thiết bị khác chỉ thấy dữ liệu đã được đồng bộ trước đó; xung đột khi sửa đồng thời trên PC/iPhone vẫn cần xử lý thủ công như V7.0.1.

## H. KIỂM THỬ AN TOÀN TRƯỚC KHI PHÁT CHO ĐỒNG NGHIỆP

1. Tài khoản nhà sáng lập: nhìn thấy cả tab giáo viên và quản trị, vẫn xem lớp/đề của chính mình.
2. Tài khoản B mới: đăng ký, nằm trong danh sách chờ, không thể sử dụng khi chưa duyệt.
3. Cấp 30 ngày cho B: B đăng nhập được, tạo lớp 10/8 và đề mẫu; nhà sáng lập không nhìn thấy điểm của B.
4. Tạm khóa B: sau khi B có mạng, ứng dụng ngừng quyền sử dụng và không thể ghi Firestore. Thử mở lại và gia hạn.
5. Thư viện: B công bố đề mẫu, nhà sáng lập sao chép được **nội dung đề**, không có danh sách lớp/kết quả của B.
6. Trên iPhone, thử mở ở chế độ máy bay và kiểm tra quét thẻ giấy / thu QR nhóm thật trước khi dùng cho lớp.

## GIỚI HẠN ĐÃ BIẾT

- Bản này chưa có tích hợp thanh toán tự động, không cần Blaze và không yêu cầu liên kết thẻ ngân hàng.
- Không thể chống sao chép mã nguồn public hay bỏ qua khóa cục bộ khi thiết bị cố tình sửa mã/giờ offline.
- Hệ thống đồng bộ nguyên một hồ sơ JSON, giới hạn khoảng **850 KB/giáo viên**. Nếu dùng lâu năm, cần tách Firestore theo lớp và đề.
- Chưa kiểm thử dự án Firebase thật, iPhone Safari thật và Firestore Emulator trong môi trường tạo bản này. Các bài kiểm tra logic cấp phép và cú pháp đã qua; **cần kiểm thử thực tế bằng dữ liệu mẫu**.
