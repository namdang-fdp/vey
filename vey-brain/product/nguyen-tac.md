---
title: Nguyên tắc sản phẩm (Product Principles)
---

# Nguyên tắc sản phẩm (Product Principles)

Tài liệu này định nghĩa các nguyên tắc chỉ đạo bất biến trong thiết kế trải nghiệm, logic nghiệp vụ và kiến trúc kỹ thuật của Vey.

---

## 1. Meeting không phải root của mọi knowledge
Cuộc họp chỉ là một loại sự kiện điểm thời gian (`[[product/thuat-ngu#Event|Event]]`) trong vòng đời công việc. Tri thức, bối cảnh và cam kết bắt nguồn từ trước cuộc họp và tiếp tục tiến hóa sau cuộc họp. Hệ thống không tổ chức dữ liệu cô lập xoay quanh từng bản ghi âm riêng rẽ, mà tổ chức theo dòng chảy công việc (`[[product/thuat-ngu#Thread|Thread]]`).

---

## 2. Decision phải có Lifecycle
Quyết định không phải là một chuỗi văn bản tĩnh hay một dòng tóm tắt bất biến trong biên bản họp. Một `[[product/thuat-ngu#Decision|Decision]]` là một thực thể sống có trạng thái rõ ràng:
* `Proposed` (Đang đề xuất)
* `Accepted` (Đã chấp thuận)
* `Active` (Đang hiệu lực / Đang thực thi)
* `Superseded` (Bị thay thế bởi quyết định mới)
* `Invalidated` (Bị vô hiệu / Hủy bỏ do thay đổi bối cảnh)

---

## 3. Provenance-first Reasoning (Nguồn gốc là Tối thượng)
Vey phải luôn trả lời được câu hỏi cốt lõi: *"Vì sao hệ thống nghĩ điều này là đúng?"*. Mọi kết luận, liên kết hoặc phát hiện đều phải có khả năng truy ngược (trace) về nguồn gốc xác thực:
* Đoạn trích transcript (kèm timestamp và speaker);
* Cuộc họp cụ thể (`[[product/thuat-ngu#Meeting|Meeting]]`);
* Tin nhắn trao đổi (Slack, Teams);
* Sự kiện thay đổi trên issue tracker (Jira, Linear);
* Sự kiện mã nguồn (GitHub commit, PR, CI run);
* Tài liệu đặc tả (Docs, Notion, Confluence);
* Xác nhận trực tiếp từ con người (human confirmation);
* Mối quan hệ suy luận logic tường minh.

```text
Decision D-14
"Release Friday"
│
├── source: Meeting M-31
├── evidence: transcript 31:22–32:48
├── accepted by: Tech Lead & PM
│
└── later evidence
    ├── Slack S-91: "move to Monday"
    └── Jira SEC-142: Blocked
```

> [!important] Nguyên tắc cốt tử
> **Confidence không thay thế provenance.**
> Một chỉ số tự tin cao do mô hình AI sinh ra không có giá trị nếu không đi kèm với trích dẫn bằng chứng cụ thể mà người dùng có thể tự kiểm tra.

---

## 4. Tích hợp phải hướng tới Bidirectional (Hai chiều)
Việc chỉ trích xuất action items một chiều ra công cụ bên ngoài là không đủ. Tích hợp của Vey phải vận hành hai chiều:
1. Đẩy ngữ cảnh/quyết định từ cuộc họp đến các công cụ thực thi;
2. Lắng nghe ngược lại sự biến động trạng thái từ external systems để phát hiện sự lệch pha (Reconciliation).

```text
Meeting
  ↓
Action A-17
  ↓
Jira SEC-142
  ↓
Jira: In Progress → Blocked
  ↓
Vey receives state change
  ↓
related Decision potentially becomes at-risk/stale
  ↓
next meeting context reflects this
```

> [!note] Ranh giới tích hợp
> Tích hợp hai chiều **không đồng nghĩa** với việc Vey phải sở hữu (own) mọi object ngoại vi hay tự ý ghi đè dữ liệu lên các hệ thống bên ngoài.

---

## 5. Không thay thế Source of Truth của External Systems
Vey tôn trọng domain boundary của các công cụ chuyên trách:
* **Jira / Linear**: Source of truth cho execution state, issue status, task assignments.
* **GitHub / GitLab**: Source of truth cho source code, PR, release state.
* **Slack / Teams**: Source of truth cho trao đổi tức thời và thảo luận nhóm.
* **Calendar**: Source of truth cho lịch họp và người tham gia.
* **Docs / Notion / Confluence**: Source of truth cho tài liệu và văn bản nội bộ.

Vey đóng vai trò là **nguồn chân lý cho các mối quan hệ (relationships), nguồn gốc xuất xứ (provenance), ngữ cảnh nhân quả (causal context) và trạng thái đối soát chéo (cross-system consistency)**.

---

## 6. Ưu tiên Deterministic / Rule-based Reasoning cho State quan trọng
Đối với các trạng thái mang tính quyết định vận hành (ví dụ: cuộc họp đã đạt `[[product/thuat-ngu#Meeting Closure|Meeting Closure]]` chưa, quyết định có bị mâu thuẫn hay mất hiệu lực không):
* Hệ thống ưu tiên logic có cấu trúc, tường minh và kiểm chứng được (deterministic / rule-based).
* **Tuyệt đối tránh** đưa ra các chỉ số "AI score" trừu tượng, mơ hồ mà người dùng không thể hiểu tại sao lại được chấm như vậy.

---

## 7. Người dùng luôn luôn truy ngược được Evidence
Mọi nhận định do AI đưa ra (ví dụ: *"Cuộc họp chưa giải quyết dứt điểm câu hỏi X"*, *"Jira issue Y đang mâu thuẫn với Decision Z"*) đều phải đi kèm với bằng chứng trực tiếp (`[[product/thuat-ngu#Evidence|Evidence]]`):
* Snippet trích dẫn nguyên văn từ hội thoại;
* Link trực tiếp tới issue, commit, message hoặc tài liệu liên quan.
Người dùng luôn là người giữ thẩm quyền kiểm chứng và ra phán quyết cuối cùng.

---

## 8. Phân định Công cụ Phát triển vs Tích hợp Môi trường Production

Cần phân biệt rạch ròi giữa hai tầng công nghệ:
* **Tầng Phát triển (Development Operations)**: Các AI agent và lập trình viên có thể sử dụng các công cụ kết nối nhanh (MCP như GitHub MCP, Jira/Atlassian MCP, Slack MCP, DBX MCP, filesystem) để tăng tốc xây dựng sản phẩm.
* **Tầng Sản phẩm Thực tế (Production Integrations)**: Khả năng đồng bộ của Vey trong môi trường người dùng cuối phải dựa trên các giao thức chuẩn mực doanh nghiệp (OAuth 2.0, official REST/GraphQL APIs, webhooks, event ingestion, và polling khi cần thiết), không bị ràng buộc vào các công cụ môi trường dev.

---

## 9. Vey Core là Differentiation, Meeting Platform là Foundation bắt buộc (Commodity ≠ Optional)

Các năng lực phổ thông của một meeting platform (calendar, capture/recording, transcription, diarization, summary, search) không phải là moat của Vey, nhưng là **table stakes bắt buộc** để sản phẩm hoàn chỉnh và tự tạo dữ liệu thật:
* Vey Core (`Meeting Closure`, `Continuity`, `Reconciliation`) cần first-party meeting data, meeting lifecycle và workflow thực tế để kiểm chứng giá trị.
* Upload audio hoặc import transcript chỉ là cơ chế hỗ trợ (testing, migration, dữ liệu lịch sử, fallback), không phải primary product path và không dùng để né real meeting capture.

---

## 10. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/luan-de-san-pham|Luận đề sản phẩm]]
* [[architecture/domain-model|Domain Model]]
* [[product/thuat-ngu|Thuật ngữ]]
