---
title: Luận đề sản phẩm (Product Thesis)
---

# Luận đề sản phẩm

Tài liệu này xác định vị thế chiến lược của Vey bằng cách phân định ranh giới giữa những năng lực đã phổ thông hóa trên thị trường và các giả thuyết tạo nên giá trị khác biệt cốt lõi.

---

## 1. Năng lực Phổ thông (Commodity Capabilities)

Thị trường meeting tools hiện nay đã bão hòa với các tính năng sau:
* **Audio recording & Transcription**: Thu âm, lọc tạp âm và chuyển giọng nói thành văn bản đa ngôn ngữ với độ trễ thấp.
* **Basic Summarization**: Sinh tóm tắt tổng quan, liệt kê các ý chính dưới dạng gạch đầu dòng.
* **One-way Action Item Extraction**: Trích xuất các đầu việc phát sinh và xuất một chiều sang Slack, Trello, hoặc Jira.

> [!important] Định vị kỹ thuật
> Vey xem các năng lực trên là nền tảng hạ tầng (commodity inputs), không coi chúng là lợi thế cạnh tranh cốt lõi hay điểm đến của sản phẩm.

---

## 2. Giả thuyết Khác biệt cốt lõi (Differentiated Hypotheses)

Vey tập trung toàn bộ nguồn lực để kiểm chứng ba giả thuyết chính cho giai đoạn MVP:

### H1: Giả thuyết Đóng phiên (Closure)
* **Câu hỏi**: *Vey có thể giúp người dùng xác định cuộc họp còn vấn đề bắt buộc nào chưa được giải quyết dứt điểm trước khi kết thúc không?*
* **Mục tiêu**: Giảm thiểu `[[product/thuat-ngu#Meeting Debt|Meeting Debt]]` bằng cách phát hiện các câu hỏi trọng tâm (`[[product/thuat-ngu#Question|Question]]`) hoặc điểm nghẽn (`[[product/thuat-ngu#Blocker|Blocker]]`) đang bị bỏ lửng mà không có kết luận (`[[product/thuat-ngu#Meeting Closure|Meeting Closure]]`).

### H2: Giả thuyết Tính liên tục (Continuity)
* **Câu hỏi**: *Vey có thể giải thích chính xác tại sao một vấn đề lại phải được họp tiếp không?*
* **Mục tiêu**: Tự động tổng hợp bối cảnh, các quyết định trước đó và lý do xuất hiện cuộc họp tiếp theo trong cùng một luồng (`[[product/thuat-ngu#Thread|Thread]]`), loại bỏ tình trạng người tham gia phải tự hỏi "Tại sao chúng ta lại ngồi ở đây hôm nay?".

### H3: Giả thuyết Đối soát Trạng thái (Reconciliation)
* **Câu hỏi**: *Vey có thể phát hiện những gì đã thay đổi hoặc mâu thuẫn sau khi một quyết định (`[[product/thuat-ngu#Decision|Decision]]`) được đưa ra không?*
* **Mục tiêu**: Đối soát hai chiều giữa quyết định trong cuộc họp và trạng thái thực tế trên các external systems (Jira issue status, GitHub PR merge, Slack conversation, tài liệu kỹ thuật), cảnh báo khi có sự lệch pha hoặc vi phạm quyết định đã thỏa thuận.

---

## 3. Những điều Chưa được Chứng minh (Unproven / Cần xác minh)

> [!warning] Rủi ro & Điểm cần kiểm chứng
> Các điểm sau đây đang ở trạng thái `[Cần xác minh]` và cần kiểm chứng qua thực nghiệm sản phẩm:

1. **Độ chính xác của suy luận (Inference Reliability)**: Liệu các mô hình ngôn ngữ kết hợp với rule-based logic có thể phân tích Closure và Reconciliation với tỷ lệ dương tính giả (false positive) đủ thấp để người dùng tin cậy?
2. **Rào cản quyền truy cập dữ liệu (Integration & Privacy Friction)**: Mức độ sẵn sàng của các tổ chức doanh nghiệp trong việc cấp quyền đọc/ghi hai chiều vào Jira, GitHub, Slack và lịch làm việc.
3. **Mô hình Trừu tượng hóa `Thread` (Abstraction Overhead)**: Liệu việc gom tụ các sự kiện và quyết định thành các `[[product/thuat-ngu#Thread|Thread]]` có đem lại trải nghiệm trực quan tự nhiên, hay sẽ tạo thêm gánh nặng nhận thức (cognitive overhead) cho người dùng?

---

## 4. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]: Bối cảnh dài hạn.
* [[roadmap/mvp|Kế hoạch MVP]]: Cách thiết kế vertical slice để kiểm chứng H1, H2, H3.
* [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa `Closure`, `Continuity`, `Reconciliation`.
