---
title: Tầm nhìn sản phẩm
---

# Tầm nhìn sản phẩm

> [!abstract] Bản chất cốt lõi
> Vey không phải là một công cụ ghi âm hay tóm tắt cuộc họp đơn thuần. Vey là **Meeting & Work Intelligence Layer** — hệ thống duy trì tính liên tục (continuity) giữa cuộc họp, quyết định (`[[product/thuat-ngu#Decision|Decision]]`) và thực tế triển khai công việc.

---

## 1. Bối cảnh & Không gian Vấn đề (Problem Space)

### Thực trạng thị trường
Công nghệ ghi âm (recording), chuyển giọng nói thành văn bản (transcription) và tóm tắt tự động (AI summarization) đã trở thành năng lực phổ thông (commodity). Hàng chục công cụ có thể nghe và tạo ra một biên bản họp gồm các gạch đầu dòng và danh sách action items.

Tuy nhiên, hầu hết các giải pháp hiện tại đều xem cuộc họp là **những sự kiện cô lập (isolated events)**:
1. Cuộc họp diễn ra $\rightarrow$ Biên bản được tạo ra $\rightarrow$ Biên bản trôi vào Slack, email hoặc tài liệu tĩnh.
2. Công việc thực tế tiếp tục vận hành trên các công cụ nghiệp vụ chuyên trách: Jira, GitHub, Notion, Slack.
3. Không có bất kỳ hệ thống nào theo dõi, liên kết và kiểm chứng xem những gì được thống nhất trong cuộc họp có thực sự diễn ra ngoài đời thực hay không.

### Ba đứt gãy cốt lõi trong tổ chức
* **Sự thiếu dứt điểm (Lack of Closure)**: Nhiều cuộc họp kết thúc khi các vấn đề quan trọng vẫn chưa đạt được kết luận rõ ràng, tạo ra lượng việc tồn đọng mơ hồ (`[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`).
* **Mất tính liên tục (Continuity Gap)**: Khi một vấn đề được đưa ra họp lại vào tuần sau, các bên tham gia thường không nhớ rõ lý do tại sao phải họp tiếp, blocker cũ đã giải quyết đến đâu và bối cảnh trước đó là gì.
* **Lệch pha giữa Quyết định và Thực thi (Reconciliation Gap)**: Một `[[product/thuat-ngu#Decision|Decision]]` được thống nhất, nhưng các external systems (Jira issue, GitHub PR, tài liệu kiến trúc) không được cập nhật tương ứng, hoặc thậm chí được triển khai sai lệch với quyết định mà không ai phát hiện.

---

## 2. Định hướng Dài hạn của Vey

Vey được xây dựng để giải quyết những đứt gãy này mà không cố gắng thay thế các công cụ làm việc chuyên biệt hiện có:

* **Không thay thế source of truth**: Jira vẫn quản lý task, GitHub vẫn quản lý source code, Slack vẫn quản lý hội thoại. Vey đóng vai trò là **lớp quan hệ, nguồn gốc (provenance) và trạng thái tổ chức (organizational state)** kết nối các hệ thống đó lại với nhau.
* **Theo dõi luồng công việc xuyên thời gian**: Thay vì nhìn từng cuộc họp rời rạc, Vey theo dõi các luồng công việc (`[[product/thuat-ngu#Thread|Thread]]`) kéo dài xuyên suốt nhiều cuộc họp, qua nhiều quyết định, hành động và thay đổi trạng thái trên các hệ thống bên ngoài.
* **Tích hợp hai chiều (Bidirectional Integration)**: Thay vì chỉ xuất action items một chiều ra Jira/Slack rồi bỏ mặc, Vey hướng tới việc liên tục đối soát hai chiều giữa quyết định trong cuộc họp và bằng chứng (`[[product/thuat-ngu#Evidence|Evidence]]`) biến đổi trạng thái trong thực tế.

---

## 3. Liên kết liên quan

* [[product/luan-de-san-pham|Luận đề sản phẩm]]: Ba giả thuyết khác biệt hóa (H1, H2, H3).
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Các nguyên tắc thiết kế bất biến.
* [[architecture/domain-model|Domain Model]]: Cấu trúc thực thể sơ bộ của Vey.
