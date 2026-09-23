---
title: Định hướng MVP (MVP Scope)
---

# Định hướng MVP (MVP Scope)

> [!important] Trạng thái tài liệu
> Đây là **phạm vi làm việc ban đầu (working scope)** phục vụ cho việc kiểm chứng các giả thuyết kỹ thuật và giá trị cốt lõi. Đây **chưa phải** là committed roadmap chính thức và **không chứa backlog chi tiết** (backlog và issue execution sẽ được quản lý trên Jira).

---

## 1. Mục tiêu Cốt lõi của MVP

MVP của Vey được thiết kế tập trung duy nhất vào việc kiểm chứng 3 giả thuyết khác biệt hóa đã nêu trong [[product/luan-de-san-pham|Luận đề sản phẩm]]:

1. **H1 — Closure**: Hệ thống có phát hiện được các câu hỏi/điểm nghẽn chưa được giải quyết trước khi kết thúc cuộc họp hay không?
2. **H2 — Continuity**: Hệ thống có giải thích được lý do tại sao một vấn đề phải được họp tiếp hay không?
3. **H3 — Reconciliation**: Hệ thống có đối soát và cảnh báo được sự sai lệch giữa quyết định và trạng thái trên external systems hay không?

---

## 2. Lát cắt Dọc Tối thiểu (Vertical Slice)

Thay vì xây dựng dàn trải nhiều tính năng bề rộng, MVP đề xuất một chuỗi xử lý khép kín từ đầu vào cuộc họp đến bằng chứng thực tế:

```text
[Transcript / Recording Import]
             │
             ▼
[Structured Work Context] (Trích xuất Thread, Question, Blocker, Decision, Action)
             │
             ▼
[Closure Analysis] (Đánh giá mức độ đóng phiên và tồn đọng Meeting Debt)
             │
             ▼
[Decision Timeline] (Theo dõi vòng đời trạng thái của Decision theo thời gian)
             │
             ▼
[External-System Evidence] (Đối soát trạng thái với Jira Issue / GitHub PR)
             │
             ▼
[Next-Meeting Brief] (Tổng hợp ngữ cảnh Continuity cho cuộc họp tiếp theo)
```

### Chi tiết các chặng trong Slice:
* **Import**: Nhận transcript thô (từ file ghi âm, text upload hoặc webhook từ công cụ ghi âm sẵn có) để không mất nguồn lực tự làm recording engine.
* **Structured Context**: Phân loại và cấu trúc hóa nội dung thành các thực thể trong [[architecture/domain-model|Domain Model]].
* **Closure Analysis**: Xác định những `Question` hoặc `Blocker` nào chưa có câu trả lời hoặc người phụ trách rõ ràng.
* **Decision Timeline**: Lưu vết các `Decision` được đưa ra kèm trạng thái ban đầu (`Accepted`).
* **External Evidence**: Kết nối tối thiểu với một hệ thống ngoài (ví dụ: Jira hoặc GitHub) để lấy trạng thái thực tế của ticket/PR liên quan đến `Decision`.
* **Next-Meeting Brief**: Khi có cuộc họp mới về cùng chủ đề, tự động sinh bản tóm tắt giải thích: "Lần trước đã quyết định gì, ngoài thực tế đã làm gì, và tại sao hôm nay cần họp tiếp?".

---

## 3. Tiêu chí Đánh giá Thành công (Success Criteria `[Giả thuyết]`)

* **Đối với H1 (Closure)**: Người dùng đồng tình với ít nhất 80% cảnh báo về việc "vấn đề X chưa đạt closure" mà hệ thống đưa ra.
* **Đối với H2 (Continuity)**: Bản tóm tắt trước cuộc họp (brief) giúp người tham gia nắm được ngữ cảnh trong dưới 2 phút mà không cần đọc lại toàn bộ transcript cũ.
* **Đối với H3 (Reconciliation)**: Phát hiện được ít nhất một trường hợp trạng thái external system (ví dụ: Jira ticket bị đóng hoặc PR bị rejected) mâu thuẫn với `Decision` đã thỏa thuận.

---

## 4. Những điều Không làm trong MVP (Out of Scope)

* Không xây dựng audio recording app hoặc custom transcription model từ đầu.
* Không xây dựng task management full-featured thay thế Jira/Trello.
* Không tích hợp hàng loạt hệ thống bên ngoài cùng lúc (chỉ chọn 1-2 hệ thống tiêu biểu để chứng minh concept).
* Không xây dựng UI/UX phức tạp trước khi logic phân tích và đối soát được kiểm chứng.

---

## 5. Liên kết liên quan

* [[product/luan-de-san-pham|Luận đề sản phẩm]]
* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[architecture/domain-model|Domain Model]]
