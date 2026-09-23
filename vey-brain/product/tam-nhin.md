---
title: Tầm nhìn sản phẩm (Product Vision)
---

# Tầm nhìn sản phẩm (Product Vision)

> [!abstract] Luận đề Cốt lõi (Core Thesis)
> Phần lớn meeting AI trên thị trường tập trung vào việc **nhớ và tóm tắt những gì đã được nói**.
> Vey tập trung vào việc **hiểu những gì vẫn chưa được giải quyết, những decision nào còn hiệu lực, và trạng thái công việc sau meeting có còn nhất quán với chúng hay không**.
>
> *Tham chiếu (Reference Formulation)*:
> *"Make every meeting reach a decision, preserve why it was made, and ensure what happens afterward remains consistent with it."*

---

## 1. Bối cảnh & Không gian Vấn đề (Problem Space)

### Thực trạng thị trường
Công nghệ ghi âm (recording), chuyển giọng nói thành văn bản (transcription) và tóm tắt tự động (AI summarization) đã trở thành năng lực phổ thông (commodity). Tuy nhiên, **commodity không đồng nghĩa với tùy chọn (commodity ≠ optional)**: đây là nền tảng sản phẩm bắt buộc (table stakes) để Vey vận hành như một meeting product thật và tự tạo ra luồng dữ liệu first-party tin cậy.

Khác biệt hóa của Vey tập trung vào khoảng trống mà nghiên cứu sơ bộ hiện tại ghi nhận ở các công cụ phổ biến: cuộc họp thường có xu hướng bị xử lý như **những sự kiện rời rạc (isolated events)**:
1. Cuộc họp diễn ra $\rightarrow$ Biên bản được tạo ra $\rightarrow$ Biên bản trôi vào Slack, email hoặc tài liệu tĩnh.
2. Công việc thực tế tiếp tục vận hành trên các công cụ chuyên trách: Jira, GitHub, Notion, Slack.
3. Qua các giải pháp đã khảo sát, việc liên tục theo dõi, liên kết và đối soát xem những gì đã thống nhất trong cuộc họp có thực sự được duy trì và nhất quán với diễn biến thực tế hay không chưa thấy được đặt làm trọng tâm rõ ràng.

### Ba đứt gãy cốt lõi trong tổ chức
* **Sự thiếu dứt điểm (Lack of Closure)**: Cuộc họp kết thúc khi các vấn đề quan trọng vẫn chưa đạt được kết luận rõ ràng, tạo ra lượng việc tồn đọng mơ hồ (`[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`).
* **Mất tính liên tục (Continuity Gap)**: Khi một vấn đề được đưa ra họp lại vào tuần sau, các bên tham gia thường không nhớ rõ lý do tại sao phải họp tiếp, blocker cũ đã giải quyết đến đâu và bối cảnh trước đó là gì.
* **Lệch pha giữa Quyết định và Thực thi (Reconciliation Gap)**: Một `[[product/thuat-ngu#Decision|Decision]]` được thống nhất, nhưng các external systems (Jira issue, GitHub PR, tài liệu kỹ thuật) không được cập nhật tương ứng, hoặc thậm chí được triển khai sai lệch với quyết định mà không ai phát hiện.

---

## 2. Định hướng Dài hạn của Vey

Vey được xây dựng như một **Meeting & Work Intelligence Layer** — hệ thống duy trì tính liên tục (continuity) giữa cuộc họp, quyết định và thực tế triển khai công việc:

### Mô hình Tích hợp Hai chiều (Bidirectional Work Context)
Khác với mô hình trích xuất một chiều truyền thống:
* **Mô hình phổ biến (Một chiều)**:
  `Meeting → Extract Information → Jira / Slack / CRM / Notes`
* **Mô hình Vey (Hai chiều)**:
  `Meeting ↔ Vey Work Context ↔ Jira / GitHub / Slack / Docs / Calendar / ...`

Khi external system thay đổi, context bên trong Vey cũng có khả năng thay đổi theo để phản ánh đúng thực trạng tổ chức.

### Mô hình Nguồn chân lý (Source of Truth Model `[Định hướng sản phẩm]`)
Vey tôn trọng domain boundary của các công cụ chuyên trách và **không cố trở thành source of truth của từng domain riêng**:
* **Jira / Linear**: Source of truth cho execution state, issue status, task assignments.
* **GitHub / GitLab**: Source of truth cho source code, PR, CI/CD, release state.
* **Slack / Teams**: Source of truth cho trao đổi tức thời và discussion evidence.
* **Calendar**: Source of truth cho lịch họp và người tham dự.
* **Docs / Notion / Confluence**: Source of truth cho tài liệu nội bộ và văn bản đặc tả.

**Vey hướng tới trở thành source of truth cho:**
* Các mối quan hệ (Relationships) kết nối giữa các thực thể làm việc.
* Nguồn gốc xuất xứ (Provenance) của các quyết định và cam kết.
* Ngữ cảnh nguyên nhân (Causal Context) giải thích dòng chảy công việc.
* Trạng thái vòng đời quyết định (Decision State).
* Tính nhất quán liên hệ thống (Cross-system Consistency).
* Trạng thái tổ chức/công việc (Organizational/Work State) được suy luận tổng hợp từ nhiều nguồn.

### Lớp Ngữ cảnh Trung lập (Vendor-neutral Cross-system Context `[Giả thuyết]`)
Các trợ lý tích hợp sẵn trong hệ sinh thái (như Microsoft Teams Copilot) có lợi thế cực mạnh khi toàn bộ dữ liệu nằm trong cùng một hệ sinh thái đóng (walled garden). Vey không cạnh tranh bằng cách cố sao chép chiều sâu đó bên trong từng hệ sinh thái riêng lẻ, mà tập trung vào lợi thế **lớp ngữ cảnh trung lập đa hệ thống (vendor-neutral)**, bắc cầu liền mạch giữa Google Meet, Slack, Jira, GitHub, Notion, Linear, Teams và Confluence.

---

## 3. Liên kết liên quan

* [[product/luan-de-san-pham|Luận đề sản phẩm]]: Ba giả thuyết khác biệt hóa (H1, H2, H3).
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Các nguyên tắc thiết kế bất biến.
* [[architecture/domain-model|Domain Model]]: Cấu trúc thực thể và Work Context Graph.
* [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa `Thread`, `Decision`, `Meeting Closure`, `Reconciliation`.
