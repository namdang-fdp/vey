---
title: Nguyên tắc sản phẩm (Product Principles)
---

# Nguyên tắc sản phẩm

Tài liệu này định nghĩa các nguyên tắc chỉ đạo bất biến trong thiết kế trải nghiệm, logic nghiệp vụ và kiến trúc kỹ thuật của Vey.

---

## 1. Meeting không phải root của mọi knowledge
Cuộc họp chỉ là một loại sự kiện điểm thời gian (`[[product/thuat-ngu#Event|Event]]`) trong vòng đời công việc. Tri thức, bối cảnh và cam kết bắt nguồn từ trước cuộc họp và tiếp tục tiến hóa sau cuộc họp. Hệ thống không tổ chức dữ liệu xoay quanh từng file ghi âm riêng rẽ, mà tổ chức theo dòng chảy công việc (`[[product/thuat-ngu#Thread|Thread]]`).

---

## 2. Decision phải có Lifecycle
Quyết định không phải là một chuỗi văn bản tĩnh hay một dòng tóm tắt bất biến. Một `[[product/thuat-ngu#Decision|Decision]]` là một thực thể sống có trạng thái rõ ràng:
* `Proposed` (Đang đề xuất)
* `Accepted` (Đã chấp thuận)
* `Active` (Đang hiệu lực / Đang thực thi)
* `Superseded` (Bị thay thế bởi quyết định mới)
* `Invalidated` (Bị vô hiệu / Hủy bỏ do thay đổi bối cảnh)

---

## 3. Provenance (Nguồn gốc) là bắt buộc
Mọi thông tin, phân loại hay phát hiện của Vey đều phải gắn liền với nguồn gốc xuất xứ (`Provenance`):
* Ai đã phát biểu hoặc cam kết?
* Tại mốc thời gian (timestamp) nào trong transcript?
* Xuất phát từ external object nào (commit nào, Jira ticket nào, message nào)?
Không có khẳng định nào trong hệ thống được tồn tại mà không có liên kết nguồn gốc.

---

## 4. Tích hợp phải hướng tới Bidirectional (Hai chiều)
Việc xuất một danh sách action items ra công cụ khác là không đủ. Tích hợp của Vey phải mang tính hai chiều:
1. Đẩy ngữ cảnh/quyết định đến nơi làm việc thực tế.
2. Lắng nghe ngược lại các thay đổi trạng thái từ external systems để phát hiện sự lệch pha (Reconciliation).

---

## 5. Không thay thế Source of Truth của External Systems
Vey tôn trọng domain boundary của các công cụ hiện hữu:
* Jira vẫn là source of truth cho việc theo dõi task và backlog.
* GitHub/GitLab vẫn là source of truth cho mã nguồn và PR.
* Slack/Teams vẫn là source of truth cho kênh trao đổi tức thời.
* Notion/Confluence vẫn là source of truth cho tài liệu nội bộ.
Vey đóng vai trò là **lớp lưu trữ mối quan hệ (relationships), nguồn gốc (provenance) và trạng thái tổ chức (organizational state)** bắc cầu qua các hệ thống đó.

---

## 6. Ưu tiên Deterministic / Rule-based Reasoning cho State quan trọng
Đối với các trạng thái mang tính quyết định và ảnh hưởng đến vận hành (ví dụ: cuộc họp đã đạt Closure chưa, Decision có bị vi phạm không):
* Hệ thống ưu tiên logic tường minh, có thể kiểm chứng (deterministic / rule-based).
* **Tuyệt đối tránh** đưa ra các chỉ số "AI score" trừu tượng, mơ hồ mà người dùng không thể hiểu tại sao lại được chấm điểm như vậy.

---

## 7. Người dùng luôn luôn truy ngược được Evidence
Mọi kết luận hoặc cảnh báo do AI sinh ra (ví dụ: *"Cuộc họp chưa dứt điểm vấn đề X"*, *"Jira issue Y đang mâu thuẫn với Decision Z"*) đều phải đi kèm với bằng chứng trực tiếp (`[[product/thuat-ngu#Evidence|Evidence]]`):
* Snippet trích từ hội thoại.
* Link trực tiếp tới issue, commit hoặc tài liệu liên quan.
Người dùng phải là người có quyền kiểm chứng và ra phán quyết cuối cùng, không bị áp đặt bởi "hộp đen" AI.

---

## 8. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/luan-de-san-pham|Luận đề sản phẩm]]
* [[architecture/domain-model|Domain Model]]
* [[product/thuat-ngu|Thuật ngữ]]
