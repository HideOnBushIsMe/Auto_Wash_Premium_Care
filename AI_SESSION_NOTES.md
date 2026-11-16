# AI Session Notes - Auto Wash Premium Care
**Ngày ghi nhận:** 04/09/2026
**Mục tiêu:** Cải tiến hệ thống phục vụ Vận hành thương mại & Tối ưu hóa CV/Portfolio.

## 1. Các tính năng đã hoàn thành trong phiên
### A. Phía Staff & Vận hành (Staff App)
- **Staff Live Tracking:** Tạo trang `/staff/live-tracking` và component `StaffWashSimulation` để nhân viên theo dõi tiến trình rửa xe của từng khoang.
- **Giả lập sự cố IoT (Incident Management):** Thêm nút cảnh báo lỗi (isFaulted) trên màn hình Live Tracking. Khi bật, luồng rửa xe bị tạm dừng và màn hình nháy đỏ cảnh báo nhân viên can thiệp thủ công -> *Điểm nhấn cho CV chứng minh tư duy xử lý edge-case.*
- **Checkout Summary 3 bước:** Nâng cấp modal thanh toán của Staff thành 3 bước (Tóm tắt -> Chi tiết dịch vụ -> Phương thức thanh toán), sử dụng component `WashProcessTimeline` để hiển thị rõ 13 bước rửa xe.

### B. Phía Khách hàng (Customer App)
- **Chi tiết Booking (Booking History):** Khách hàng khi xem lại đơn hàng đã hoàn tất (`Completed` / `CheckedOut`) sẽ thấy toàn bộ Timeline quy trình rửa xe đã được thực hiện.

### C. Phía Admin (Back-office)
- **Quản lý & Đối soát Giao dịch:** Bổ sung trang `AdminTransactions` (`/admin/transactions`), kết nối với API `/api/admin/payments/audit` (đã có sẵn ở Backend nhưng FE chưa dùng).
- **Tính năng:** Lọc giao dịch theo trạng thái, tìm kiếm theo mã, phân trang. Đặc biệt tích hợp nút **Tải Chi tiết Bill (PDF)** trực tiếp.

### D. Backend (.NET 8 - QuestPDF)
- **Minh bạch Hóa đơn PDF:** Chỉnh sửa file `InvoiceDocument.cs` để tự động parse danh sách `Features` của Gói rửa và in chi tiết các bước chăm sóc (ví dụ: Rửa ngoại thất • Hút bụi • Phủ bóng...) ngay trên hóa đơn giấy/PDF.

### E. Code Quality
- Đã dọn dẹp toàn bộ lỗi TypeScript (Unused variables, Type overlap, Type-only imports). Lệnh `npm run build` trên Frontend đã Pass 100%, sẵn sàng deploy Vercel không lỗi.

## 2. Ghi chú Kỹ thuật (Technical Notes)
- Component `WashProcessTimeline`: Dùng chung cho cả Staff (Checkout) và Customer (Booking Detail), nhận data từ `booking.features`.
- File config cần lưu ý: `WASH_FEATURE_META` lưu trữ mapping từ string key sang UI Icon/Màu sắc.

## 3. Điểm nhấn System Design (Tối ưu cho CV/Phỏng vấn)
- **Xử lý Race Condition & Overbooking:** Thiết kế cơ chế chống đặt trùng slot (cùng 1 khung giờ/chi nhánh) bằng 2 lớp bảo vệ:
  1. **Soft Lock (Temporary Hold):** Khóa slot tạm thời (3-5 phút) khi user vào màn hình thanh toán (PayOS/VNPAY). Hết thời gian giao dịch, tự động release slot. Giúp tối ưu trải nghiệm người dùng (UX).
  2. **Hard Lock (DB Optimistic Locking):** Chốt chặn cuối ở Database (dùng RowVersion EF Core) bảo vệ toàn vẹn dữ liệu nếu có 2 request xử lý đồng thời tới mức mili-giây.

## 4. Đề xuất cho phiên làm việc tiếp theo (Next Steps)
1. **Tích hợp SignalR thật cho Live Tracking:** Thay thế hàm `setInterval` ở Frontend bằng WebSockets để đồng bộ trạng thái thực từ máy IoT hoặc Staff.
2. **Nâng cấp README.md:** Viết lại file tài liệu (Tech stack, Architecture Diagram, Demo GIF, Docker compose) để tối ưu cho việc show CV.
3. **Cơ chế Fallback Thanh toán:** Thêm nút "Sync Status" để truy vấn trạng thái PayOS/VNPAY khi Webhook bị rớt mạng.

---
*Ghi chú: Ở phiên làm việc sau, AI chỉ cần đọc file này để nắm toàn bộ bối cảnh hệ thống mà không cần scan lại source code.*
