---
title: Bức tranh cạnh tranh (Competitive Landscape)
---

# Bức tranh cạnh tranh (Competitive Landscape)

> [!note] Tình trạng tài liệu
> Đây là **tài liệu khung (research skeleton)** ghi nhận sơ bộ các nhóm giải pháp và đối thủ đã biết trên thị trường. Mọi nhận định chi tiết về tính năng, cơ chế kỹ thuật và mô hình giá đều ở trạng thái `[Cần xác minh]` vì chưa có benchmark trực tiếp trong repository. Tuyệt đối không bịa số liệu, URL hay tính năng.

---

## 1. Phân nhóm Đối thủ hiện biết

### Nhóm 1: Meeting Transcription & Summary (Ghi âm & Tóm tắt cơ bản)
* **Các sản phẩm**: Otter.ai, Fathom, Fireflies.ai, tl;dv, MeetGeek, Jamie, Supernormal.
* **Đặc điểm chung**: Tập trung vào việc tham gia cuộc họp (bot hoặc audio capture local), ghi âm, chuyển text thời gian thực và sinh bản tóm tắt tự động gồm các ý chính kèm action items.
* **Giới hạn nhận biết `[Cần xác minh]`**: Phần lớn xem từng cuộc họp là một tài liệu cô lập. Thiếu sự kết nối liên tục qua thời gian và không đối soát với trạng thái thực tế của công việc sau cuộc họp.

### Nhóm 2: Meeting Assistant & In-meeting Experience (Trợ lý trong cuộc họp)
* **Các sản phẩm**: Granola, Read AI, Avoma, Fellow.
* **Đặc điểm chung**: Hỗ trợ người dùng ghi chú thông minh (human-in-the-loop notes), phân tích cảm xúc/mức độ tham gia (sentiment/engagement), hoặc cung cấp gợi ý ngay trong khi họp.
* **Giới hạn nhận biết `[Cần xác minh]`**: Chủ yếu tập trung vào trải nghiệm của cá nhân người ghi chú hoặc đánh giá hiệu suất của buổi họp, chưa giải quyết sâu bài toán organizational state và reconciliation xuyên hệ thống.

### Nhóm 3: Cross-meeting Memory (Bộ nhớ xuyên cuộc họp)
* **Các sản phẩm**: Continuum State, imeetly, Oryn.
* **Đặc điểm chung**: Hướng tới việc ghi nhớ kiến thức qua nhiều cuộc họp khác nhau để trả lời câu hỏi tổng hợp (Q&A / retrieval qua nhiều bản ghi).
* **Giới hạn nhận biết `[Cần xác minh]`**: Mức độ cấu trúc hóa dữ liệu (structured vs raw semantic search) và khả năng suy luận logic nghiệp vụ (Closure, Reconciliation) cần được nghiên cứu và kiểm chứng chi tiết.

### Nhóm 4: Decision & Follow-through (Quản lý quyết định & Thực thi)
* **Các sản phẩm**: Fellow, Avoma.
* **Đặc điểm chung**: Cung cấp luồng quản lý agenda, biên bản 1-on-1, theo dõi việc thực hiện action items.
* **Giới hạn nhận biết `[Cần xác minh]`**: Cơ chế theo dõi quyết định có lifecycle thực sự hay chỉ là checklist; khả năng phát hiện mâu thuẫn hai chiều với Jira/GitHub hiện chưa rõ ràng.

### Nhóm 5: Suite-native Assistants (Trợ lý tích hợp sẵn trong hệ sinh thái)
* **Các sản phẩm**: Microsoft Teams Copilot, Zoom AI Companion, Notion AI Meeting Notes.
* **Đặc điểm chung**: Tận dụng lợi thế tích hợp sâu trong nền tảng giao tiếp hoặc ghi chú sẵn có của doanh nghiệp.
* **Giới hạn nhận biết `[Cần xác minh]`**: Thường bị bó hẹp trong hệ sinh thái của chính họ (walled garden), khó đóng vai trò một lớp trung lập kết nối đa hệ thống (cross-platform state layer) giữa Zoom/Meet, Jira, GitHub, Slack và Notion.

---

## 2. Khoảng trống thị trường (White Space) mục tiêu của Vey

Dựa trên phân tích sơ bộ, Vey không cạnh tranh trực tiếp vào lớp transcription/summarization (vốn đã là commodity), mà tập trung vào khoảng trống chưa được giải quyết thấu đáo:

1. **Closure**: Đảm bảo cuộc họp giải quyết dứt điểm các câu hỏi cốt lõi, không để lại `[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`.
2. **Continuity**: Giải thích ngữ cảnh "tại sao phải họp lại" qua concept `[[product/thuat-ngu#Thread|Thread]]`.
3. **Reconciliation**: Đối soát hai chiều giữa quyết định (`[[product/thuat-ngu#Decision|Decision]]`) và diễn biến thực tế trên các external systems.

---

## 3. Kế hoạch nghiên cứu tiếp theo `[Đang mở]`

* [ ] Lập tiêu chí so sánh (comparison matrix) dựa trên bằng chứng và dùng thử thực tế.
* [ ] Kiểm chứng cơ chế cross-meeting memory của Continuum State, imeetly và Oryn.
* [ ] Đánh giá khả năng tích hợp webhook/API hai chiều của Jira, GitHub, Slack để phục vụ bài toán Reconciliation.

---

## 4. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/luan-de-san-pham|Luận đề sản phẩm]]
