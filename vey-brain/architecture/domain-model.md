---
title: Mô hình miền & Work Context Graph (Working Domain Model)
---

# Mô hình miền & Work Context Graph (Working Domain Model)

> [!important] Tình trạng kiến trúc & Giới hạn
> * Đây là **mô hình miền làm việc (working domain model)** và **mô hình biểu diễn khái niệm (conceptual model)** nhằm phân tích bài toán và kiểm chứng các giả thuyết MVP.
> * **Chưa lựa chọn cơ sở dữ liệu** cụ thể (chưa chốt Relational, Document hay Graph).
> * Khái niệm *Work Context Graph* **không đồng nghĩa** với việc đã quyết định sử dụng Graph Database.
> * **Chưa quyết định Event Sourcing**.

---

## 1. Work Context Graph (Mô hình Khái niệm)

Mục đích cốt lõi của Vey là bảo toàn **mối quan hệ (relationships)** và **nguồn gốc (provenance)** xuyên thời gian và xuyên hệ thống. Thay vì tổ chức dữ liệu thành các bảng phẳng rời rạc, Vey hình dung không gian nghiệp vụ như một mạng lưới ngữ cảnh làm việc (`Work Context Graph`).

### Các Thực thể trong Mô hình (Domain Entities)

| Thực thể              | Bản chất & Vai trò trong Domain                                                                                               |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **`Thread`**          | *Hypothesis*: Khung chứa ngữ cảnh xuyên thời gian của một luồng công việc/chủ đề.                                             |
| **`Meeting`**         | Sự kiện trao đổi đồng bộ; nơi phát sinh thảo luận, câu hỏi, cam kết và quyết định.                                            |
| **`Decision`**        | Quyết định có vòng đời (`Proposed` $\rightarrow$ `Accepted` $\rightarrow$ `Active` $\rightarrow$ `Superseded`/`Invalidated`). |
| **`Action`**          | Đầu việc phát sinh cần hoàn thành để thực thi `Decision` hoặc giải tỏa `Blocker`.                                             |
| **`Question`**        | Câu hỏi cần làm rõ. Tín hiệu quan sát chính để đánh giá `Meeting Closure`.                                                    |
| **`Blocker`**         | Yếu tố gây ách tắc tiến độ công việc, ảnh hưởng tới `Decision` hoặc `Action` (và `Thread` nếu áp dụng).                     |
| **`Dependency`**      | Mối quan hệ phụ thuộc hoặc ràng buộc điều kiện tiên quyết giữa các thực thể.                                                  |
| **`Person`**          | Cá nhân phát biểu, ra quyết định hoặc sở hữu công việc; đối tượng của bài toán Identity Resolution.                           |
| **`Rationale`**       | Lý do căn bản, căn cứ lập luận và bối cảnh giải thích việc hình thành quyết định.                                             |
| **`Evidence`**        | Dữ liệu chứng cứ (transcript snippet, commit hash, ticket ID, message) bảo đảm tính provenance.                               |
| **`External Object`** | Thực thể tham chiếu từ hệ thống ngoài (Jira issue, GitHub PR, Slack message).                                                 |
| **`Event`**           | Sự kiện điểm thời gian đánh dấu một hành động xảy ra trong không gian làm việc.                                               |
| **`State Change`**    | Bản ghi ghi nhận sự biến đổi trạng thái của các thực thể theo thời gian.                                                      |

### Thuộc tính Chung của Thực thể (Metadata Blueprint)
Khi phù hợp, mỗi thực thể có thể mang một tập hợp các trường sau (không bắt buộc mọi thực thể phải có tất cả):
* `source`: Nguồn gốc xuất xứ ban đầu.
* `evidence`: Liên kết tới bằng chứng xác thực.
* `timestamp`: Mốc thời gian phát sinh hoặc cập nhật.
* `confidence`: Mức độ tin cậy của dữ kiện trích xuất.
* `owner`: Người chịu trách nhiệm hoặc sở hữu thực thể.
* `status`: Trạng thái hiện tại của thực thể.
* `relationships`: Các cạnh liên kết tới thực thể khác trong Work Context Graph.
* `version / history`: Lịch sử biến đổi trạng thái qua thời gian.

---

## 2. Giả thuyết về `Thread` (Abstraction Hypothesis)

`[[product/thuat-ngu#Thread|Thread]]` hiện đang được xem xét như một ứng viên trừu tượng hóa (candidate abstraction) quan trọng nhằm giải quyết bài toán tính liên tục (Continuity).

### Minh họa Khái niệm Luồng công việc (Thread Lifecycle Example `[Giả thuyết]`)
Nếu giả thuyết `Thread` được áp dụng, một luồng ngữ cảnh bền vững có thể kéo dài qua nhiều sự kiện và hệ sinh thái công cụ theo hình dung sau:

```text
Work Thread
│
├── Meeting #1
│   ├── Question (chưa có câu trả lời)
│   ├── Decision (D-1: Proposed -> Accepted)
│   └── Action (gán cho Tech Lead)
│
├── Jira Issue (SEC-142 tạo từ Action)
│
├── Slack discussion (thảo luận vướng mắc kỹ thuật)
│
├── GitHub PR (PR liên quan bị đóng)
│
├── Decision invalidated (D-1 bị vô hiệu do giả định thay đổi)
│
└── Meeting #2 (Follow-up meeting để giải quyết bế tắc)
    └── New Decision (D-2 thay thế D-1)
```

> [!important] Nguyên tắc thiết kế
> Cuộc họp (`Meeting`) chỉ là một sự kiện điểm thời gian (`[[product/thuat-ngu#Event|Event]]`) hoặc nguồn dữ liệu (`Source`), **không phải là root object** của toàn bộ tri thức. Trong mô hình giả thuyết về `Thread`, Meeting đóng vai trò là một điểm nút sinh ngữ cảnh trong luồng công việc, nhưng hệ thống không mặc định ép buộc mọi cuộc họp phải gắn cứng vào một cấu trúc Thread cố định.

### Các Câu hỏi Mở về `Thread` `[Đang mở]`
Vì `Thread` vẫn đang là một giả thuyết, các câu hỏi sau chưa được khẳng định và cần kiểm chứng qua người dùng:
* `Thread` được tạo chủ động bởi người dùng (explicit) hay được hệ thống tự động suy diễn (inferred)?
* Một thực thể (ví dụ: một Action hoặc Decision) có thể thuộc về nhiều `Thread` cùng lúc không?
* `Thread` có cấu trúc phân cấp (hierarchy - cha/con) hay phẳng?
* Ranh giới phân định một `Thread` (boundary) được xác định như thế nào?
* Cơ chế hợp nhất (merge) hoặc chia tách (split) `Thread` được xử lý ra sao?
* `Thread` có phải là một khái niệm lộ diện cho người dùng cuối (user-facing concept) hay chỉ là abstraction nội bộ dưới backend?

---

## 3. Mô hình Vòng đời Quyết định (Working Decision Lifecycle Model)

Một `[[product/thuat-ngu#Decision|Decision]]` trong Vey là một thực thể sống có vòng đời biến đổi, không phải một văn bản cố định:

```text
Proposed
    ↓
Accepted
    ↓
Active
    ├──→ Superseded  (Bị thay thế bởi quyết định mới)
    └──→ Invalidated (Bị vô hiệu / Hủy bỏ do thay đổi bối cảnh)
```

*Lưu ý: Không nhất thiết tất cả các Decision đều phải đi qua toàn bộ các trạng thái trên.*

### Dữ liệu Ngữ cảnh của Decision
Để phục vụ bài toán `[[product/thuat-ngu#Reconciliation|Reconciliation]]` và `Provenance`, một Decision cần có khả năng lưu trữ:
* Nội dung tóm lược của quyết định;
* Rationale (lý do và căn cứ đưa ra quyết định);
* Evidence (bằng chứng trích xuất từ transcript hoặc tài liệu);
* Timestamp (thời điểm quyết định được thông qua);
* Participants (những người có mặt lúc quyết định);
* Decision owner (người sở hữu hoặc bảo trợ quyết định);
* Authority context (thẩm quyền của người ra quyết định);
* Affected work (các đầu việc, module hoặc hệ thống bị ảnh hưởng);
* Related Thread (luồng công việc liên quan, nếu áp dụng);
* Source meeting (cuộc họp phát sinh quyết định);
* External evidence (bằng chứng đối soát từ Jira, GitHub, Slack);
* Current lifecycle state (trạng thái vòng đời hiện tại);
* State history (lịch sử các lần chuyển trạng thái kèm lý do);
* Superseding decision (con trỏ trỏ tới quyết định mới thay thế nếu có).

*Lưu ý: Đây là working lifecycle model, chưa phải database schema hay đặc tả bất biến.*

---

## 4. Các Câu hỏi Kiến trúc còn mở `[Đang mở]`

> [!question] Danh mục vấn đề kiến trúc cần nghiên cứu & quyết định sau
>
> 1. **Cấu trúc Dữ liệu của `Thread`**:
>    * Container phân cấp cứng hay đồ thị mềm liên kết động?
> 2. **Chiến lược Lưu trữ (`Storage Paradigm`)**:
>    * Mô hình dữ liệu của Vey kết hợp giữa văn bản bán cấu trúc (transcript), thực thể trạng thái (Decision, Action) và đồ thị quan hệ (Work Context Graph). Cần lựa chọn Relational DB (PostgreSQL), Graph DB hay Document Store dựa trên query pattern của Closure & Reconciliation?
> 3. **Cơ chế Quản lý Biến đổi Trạng thái (`State Tracking`)**:
>    * Áp dụng Event Sourcing toàn phần cho `State Change` hay sử dụng bảng Audit Log/History giản dị để tránh over-engineering ở giai đoạn MVP?
> 4. **Mô hình Tích hợp Ngoại vi (`Integration Mechanics`)**:
>    * Webhook thời gian thực, Polling định kỳ, hay ETL batch? Chiến lược xử lý rate limit và token refresh cho từng tenant doanh nghiệp.
> 5. **Khớp danh tính Người dùng (`Identity Resolution`)**:
>    * Thuật toán ánh xạ danh tính người phát biểu (voice speaker, email lịch họp) với user ID trên Jira, GitHub, Slack với độ chính xác cao.

---

## 5. Liên kết liên quan

* [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa chi tiết từng thực thể.
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Nguyên tắc provenance và rule-based reasoning.
* [[roadmap/mvp|Định hướng MVP]]: Phạm vi lát cắt dọc để validate domain model.
