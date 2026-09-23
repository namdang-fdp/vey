---
title: Bức tranh cạnh tranh (Competitive Landscape)
---

# Bức tranh cạnh tranh (Competitive Landscape)

> [!note] Tình trạng tài liệu
> Đây là **tài liệu khung (research skeleton)** ghi nhận sơ bộ các nhóm giải pháp và đối thủ đã biết trên thị trường. Mọi nhận định chi tiết về tính năng, cơ chế kỹ thuật và mô hình giá đều ở trạng thái `[Cần xác minh]` vì chưa có benchmark trực tiếp trong repository. Tuyệt đối không bịa đặt số liệu, URL hay tính năng.

---

## 1. Phân nhóm Đối thủ hiện biết

### Nhóm 1: Meeting Transcription & Summarization (Ghi âm & Tóm tắt)
* **Các sản phẩm**: Otter.ai, Fathom, Fireflies.ai, tl;dv, MeetGeek, Jamie, Supernormal.
* **Đặc điểm chung**: Tập trung vào hạ tầng ghi âm (bot tham gia hoặc audio capture cục bộ), chuyển văn bản thời gian thực, tóm tắt ý chính và trích xuất danh sách action items.
* **Nhận định sơ bộ `[Cần xác minh]`**: Phần lớn xem từng cuộc họp là một tài liệu cô lập. Qua research công khai hiện tại, khả năng duy trì tính liên tục của luồng công việc qua thời gian và đối soát với trạng thái thực tế sau cuộc họp chưa thấy được đặt làm trọng tâm rõ ràng ở các sản phẩm thuộc nhóm này.

### Nhóm 2: Meeting Assistant & In-meeting Experience (Trợ lý trong cuộc họp)
* **Các sản phẩm**: Granola, Read AI, Avoma, Fellow, Notion AI Meeting Notes.
* **Đặc điểm chung**: Nâng cao trải nghiệm ghi chép thông minh (human-in-the-loop notes), phân tích mức độ tham gia/cảm xúc (sentiment/engagement), hoặc hỗ trợ quản lý agenda và 1-on-1.
* **Nhận định sơ bộ `[Cần xác minh]`**: Tập trung chủ yếu vào trải nghiệm của cá nhân người ghi chép hoặc hiệu suất nội bộ của buổi họp. Khả năng kết nối hai chiều và theo dõi vòng đời quyết định liên hệ thống chưa được giải quyết thấu đáo.

### Nhóm 3: Cross-meeting Memory & Continuity-adjacent (Bộ nhớ xuyên cuộc họp)
* **Các sản phẩm**: Continuum State, imeetly, Oryn.
* **Đặc điểm chung**: Khai thác khả năng ghi nhớ thông tin qua nhiều cuộc họp để phục vụ tra cứu tổng hợp (cross-meeting Q&A/retrieval).
* **Nhận định sơ bộ `[Cần xác minh]`**:
  > [!important] Định vị cốt lõi
  > **Cross-meeting memory một mình không phải là moat.**
  > Khả năng truy vấn ngữ nghĩa (semantic search) qua nhiều cuộc họp là cần thiết nhưng không đủ để tái dựng chuỗi quan hệ nguyên nhân (`causal chain`), phát hiện thiếu dứt điểm (`Meeting Closure`) hay đối soát trạng thái (`Reconciliation`).

### Nhóm 4: Suite-native Assistants (Trợ lý Tích hợp Hệ sinh thái)
* **Các sản phẩm**: Microsoft Teams Copilot, Zoom AI Companion.
* **Đặc điểm chung**: Lợi thế cạnh tranh vượt trội nhờ tích hợp sẵn và khai thác context sâu bên trong hệ sinh thái đồng nhất của hãng (Office 365, Zoom Workplace).
* **Giới hạn nhận biết `[Cần xác minh]`**: Bị giới hạn trong phạm vi nền tảng của chính họ (walled garden), khó đóng vai trò lớp ngữ cảnh trung lập cho các doanh nghiệp sử dụng toolchain phân mảnh.

---

## 2. Giả thuyết Hệ sinh thái Microsoft & Lợi thế Trung lập (Ecosystem Hypothesis `[Giả thuyết]`)

* **Quan sát**: Các suite-native assistant như Microsoft Teams Copilot có lợi thế cực mạnh khi toàn bộ dữ liệu người dùng nằm trọn trong hệ sinh thái Microsoft (Teams, Outlook, Word, SharePoint).
* **Chiến lược khác biệt hóa của Vey**:
  * Vey không cố gắng cạnh tranh bằng cách sao chép chiều sâu hệ sinh thái của Microsoft bên trong Microsoft.
  * Lợi thế tiềm năng của Vey nằm ở **lớp ngữ cảnh trung lập đa hệ thống (vendor-neutral cross-system context)**, kết nối linh hoạt các công cụ phân mảnh mà doanh nghiệp thực tế đang dùng song song:
    `Google Meet / Zoom` + `Slack` + `Jira / Linear` + `GitHub` + `Notion` + `Google Docs` + `Confluence`.

---

## 3. Khoảng trống thị trường (White Space) mục tiêu của Vey

Qua research công khai hiện tại, các năng lực sau chưa thấy được đặt làm trọng tâm rõ ràng ở các sản phẩm đã xem xét:

1. **H1 — Closure**: Đảm bảo cuộc họp đạt đủ điều kiện kết thúc dựa trên observable conditions, chủ động ngăn ngừa `[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`.
2. **H2 — Continuity**: Tái dựng chuỗi nhân quả (causal chain) để giải thích tường minh lý do tại sao một vấn đề phải họp lại trong cùng một `[[product/thuat-ngu#Thread|Thread]]`.
3. **H3 — Reconciliation**: Đối soát hai chiều giữa quyết định (`[[product/thuat-ngu#Decision|Decision]]`) và diễn biến thực thi trên Jira, GitHub, Slack.

---

## 4. Hàng đợi Nghiên cứu (Research Queue `[Đang mở]`)

Ghi nhận các sản phẩm có hướng tiếp cận hoặc tên gọi liên quan được phát hiện trong quá trình nghiên cứu thị trường cần tìm hiểu sâu hơn:

* [ ] **Pact**: Nghiên cứu cơ chế cam kết, thỏa thuận nhóm và theo dõi thực thi. `[Cần xác minh]`
* [ ] **Venn**: Khảo sát mô hình kết nối quan hệ và tích hợp dữ liệu làm việc. `[Cần xác minh]`
* [ ] **Kord**: Đánh giá kiến trúc luồng trao đổi công việc và điều phối cộng tác. `[Cần xác minh]`
* [ ] **Continuum State**: Phân tích chi tiết cơ chế duy trì trạng thái xuyên cuộc họp và mức độ cấu trúc hóa dữ liệu. `[Cần xác minh]`
* [ ] **Oryn & imeetly**: Khảo sát trải nghiệm người dùng đối với bộ nhớ cuộc họp dài hạn. `[Cần xác minh]`

---

## 5. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/luan-de-san-pham|Luận đề sản phẩm]]
* [[roadmap/mvp|Định hướng MVP]]
