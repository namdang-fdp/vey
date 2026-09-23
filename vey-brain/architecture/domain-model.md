---
title: Mô hình miền (Working Domain Model)
---

# Mô hình miền (Working Domain Model)

> [!important] Tình trạng kiến trúc
> Đây là **working domain model** sơ bộ nhằm phục vụ việc phân tích bài toán và kiểm chứng các giả thuyết MVP. Tài liệu này **chưa phải** kiến trúc đã chốt.
> * **Chưa lựa chọn database** cụ thể (chưa chốt Relational, Document hay Graph).
> * **Chưa quyết định Graph Database**.
> * **Chưa quyết định Event Sourcing**.

---

## 1. Cấu trúc Quan hệ Tổng quan

Khung quan hệ sơ bộ giữa các thực thể cốt lõi:

```text
Thread
 ├─ Meeting
 ├─ Decision
 ├─ Action
 ├─ Question
 ├─ Blocker
 ├─ Evidence
 ├─ External Object
 └─ Event / State Change
```

### Giả thuyết về `Thread`
`[[product/thuat-ngu#Thread|Thread]]` hiện đang được xem xét như một **giả thuyết trừu tượng hóa (abstraction hypothesis)**:
* Một luồng công việc tồn tại bền vững xuyên suốt thời gian, kết nối các cuộc họp rời rạc (`[[product/thuat-ngu#Meeting|Meeting]]`).
* Chứa đựng ngữ cảnh của các câu hỏi (`[[product/thuat-ngu#Question|Question]]`), điểm nghẽn (`[[product/thuat-ngu#Blocker|Blocker]]`), quyết định (`[[product/thuat-ngu#Decision|Decision]]`) và hành động (`[[product/thuat-ngu#Action|Action]]`).
* Neo giữ các bằng chứng (`[[product/thuat-ngu#Evidence|Evidence]]`) và liên kết tới các thực thể bên ngoài (`[[product/thuat-ngu#External Object|External Object]]`).

---

## 2. Định nghĩa Vai trò Thực thể

| Thực thể | Vai trò trong Domain Model |
| :--- | :--- |
| **`Thread`** | *Hypothesis*: Khung chứa ngữ cảnh xuyên thời gian của một luồng công việc/vấn đề. |
| **`Meeting`** | Điểm hội tụ đồng bộ; nơi các ý kiến được trao đổi và trạng thái được cập nhật. |
| **`Decision`** | Quyết định có vòng đời (`Proposed` $\rightarrow$ `Accepted` $\rightarrow$ `Active` $\rightarrow$ `Superseded`/`Invalidated`). |
| **`Action`** | Đầu việc phát sinh cần hoàn thành để hiện thực hóa `Decision` hoặc giải tỏa `Blocker`. |
| **`Question`** | Câu hỏi cần làm rõ. Là tín hiệu chính để đánh giá cuộc họp có đạt `Meeting Closure` hay không. |
| **`Blocker`** | Yếu tố gây tắc nghẽn tiến độ của `Thread` hoặc `Decision`. |
| **`Evidence`** | Dữ liệu chứng cứ (transcript quote, commit hash, ticket ID) bảo đảm tính provenance. |
| **`External Object`** | Đối tượng tham chiếu từ hệ thống ngoài (Jira issue, GitHub PR, Slack message). |
| **`Event / State Change`** | Bản ghi ghi nhận sự thay đổi trạng thái của các thực thể theo dòng thời gian. |

---

## 3. Các Câu hỏi Kiến trúc còn mở `[Đang mở]`

> [!question] Danh mục vấn đề kiến trúc cần nghiên cứu & quyết định sau
> 
> 1. **Bản chất của `Thread` (`Data Structure`)**:
>    * `Thread` nên là một container phân cấp cứng (hierarchical container) hay là một cấu trúc đồ thị mềm/nhãn gắn kết nối động giữa các thực thể?
> 2. **Chiến lược Lưu trữ Dữ liệu (`Storage Paradigm`)**:
>    * Mô hình dữ liệu của Vey kết hợp giữa văn bản bán cấu trúc (transcript), thực thể trạng thái (Decision, Action) và quan hệ liên kết (provenance). Cần lựa chọn Relational DB (PostgreSQL) hay Graph DB hay Document Store dựa trên query pattern của Closure & Reconciliation?
> 3. **Cơ chế Quản lý Biến đổi Trạng thái (`State Tracking`)**:
>    * Có nên áp dụng Event Sourcing toàn phần cho `State Change` không, hay chỉ cần một bảng Audit Log/History giản dị để tránh over-engineering ở giai đoạn MVP?
> 4. **Mô hình Đồng bộ Hệ thống ngoài (`Integration Mechanics`)**:
>    * Webhook thời gian thực, Polling định kỳ, hay ETL theo batch? Chiến lược xử lý rate limit và quyền truy cập theo từng tenant như thế nào?
> 5. **Khớp danh tính Người dùng (`Identity Resolution`)**:
>    * Làm thế nào để map danh tính một người phát biểu trong cuộc họp (audio speaker / email lịch) với user account trên Jira, GitHub và Slack một cách chính xác?

---

## 4. Liên kết liên quan

* [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa chi tiết từng thực thể.
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Nguyên tắc provenance và rule-based reasoning.
* [[roadmap/mvp|Kế hoạch MVP]]: Phạm vi thực nghiệm ban đầu.
