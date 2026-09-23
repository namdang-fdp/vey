---
title: Luận đề sản phẩm (Product Thesis)
---

# Luận đề sản phẩm (Product Thesis)

Tài liệu này xác định vị thế chiến lược của Vey bằng cách phân định ranh giới giữa năng lực phổ thông (commodity baseline) và các giả thuyết tạo nên giá trị khác biệt cốt lõi.

---

## 1. Năng lực Phổ thông (Market Baseline)

Các năng lực sau **không được xem là moat (hào kinh tế) của Vey**:
* Meeting recording (ghi âm)
* Transcription (chuyển giọng nói thành văn bản)
* Speaker diarization (nhận diện người nói)
* Timestamps (mốc thời gian phát biểu)
* Multilingual transcription/translation (phiên âm/dịch đa ngôn ngữ)
* Searchable transcript (tìm kiếm toàn văn bản ghi)
* AI summaries (tóm tắt cuộc họp tự động)
* Meeting templates (khung mẫu biên bản)
* Basic action item extraction (trích xuất đầu việc cơ bản)
* Basic decision extraction (trích xuất quyết định dạng văn bản tĩnh)
* Meeting library (thư viện lưu trữ cuộc họp)
* Meeting search (tìm kiếm meeting theo từ khóa)
* Calendar integration (kết nối lịch họp)
* Meeting Q&A (hỏi đáp nội dung cuộc họp)
* Cross-meeting memory ở mức cơ bản

> [!important] Định vị chiến lược
> **Cross-meeting memory một mình không phải là moat.**
> Vey sau này có thể tích hợp các năng lực trên như điều kiện cần (table stakes) để trở thành công cụ làm việc hàng ngày, nhưng chúng hoàn toàn **không phải** là differentiated thesis ban đầu của sản phẩm.

---

## 2. Giả thuyết Khác biệt cốt lõi (Differentiated Hypotheses)

Vey tập trung toàn bộ nguồn lực ban đầu để kiểm chứng ba giả thuyết cốt lõi:

### H1: Meeting Closure (Đóng phiên Cuộc họp)
* **Câu hỏi định tâm**: *Cuộc họp này đã đủ điều kiện kết thúc chưa?*
* **Nguyên tắc**: Không đánh giá bằng một "AI score" mơ hồ, không giải thích được.
* **Cơ chế suy luận (Closure Engine `[Giả thuyết]`)**: Ưu tiên lập luận dựa trên các điều kiện quan sát được (observable conditions):
  1. Required decision chưa đạt được kết luận;
  2. Câu hỏi quan trọng (`[[product/thuat-ngu#Question|Question]]`) chưa được trả lời;
  3. Action chưa được gán người chịu trách nhiệm (ownerless action);
  4. Action cần thời hạn nhưng chưa có deadline cụ thể;
  5. Mâu thuẫn/bất đồng quan điểm (contradiction) chưa được giải quyết dứt điểm;
  6. Điểm nghẽn (`[[product/thuat-ngu#Blocker|Blocker]]`) chưa có phương án xử lý (resolution path);
  7. Quyết định thiếu sự tham gia của người có thẩm quyền phù hợp (authority context);
  8. Điều kiện tiên quyết hoặc quan hệ phụ thuộc (`[[product/thuat-ngu#Dependency|Dependency]]`) chưa được giải quyết;
  9. Một vấn đề được nhắc lại nhiều lần trong buổi họp nhưng không có bước chuyển trạng thái (state transition) rõ ràng.
* **Định hướng kỹ thuật**: LLM chịu trách nhiệm trích xuất ứng viên dữ kiện/thực thể (candidate facts/entities). Các trạng thái quan trọng ưu tiên xử lý qua:
  `structured data + deterministic rules + graph/relationship reasoning` khi phù hợp *(chưa chốt implementation architecture)*.

### H2: Continuity (Tính liên tục qua Thời gian)
* **Câu hỏi định tâm**: *Tại sao chúng ta lại phải họp về chuyện này lần nữa?*
* **Nguyên tắc**: Vượt ra ngoài việc "tìm kiếm các cuộc họp cũ", mục tiêu là **tái dựng chuỗi quan hệ nguyên nhân - kết quả (reconstruct causal chain)**.
* **Các căn cứ giải thích follow-up meeting**:
  1. Trạng thái chưa dứt điểm (unresolved state) từ cuộc họp trước;
  2. Quyết định trước đó chưa được thực thi;
  3. Giả định ban đầu (assumption) đã thay đổi;
  4. Xuất hiện điểm nghẽn mới (`[[product/thuat-ngu#Blocker|Blocker]]`);
  5. Quan hệ phụ thuộc (`[[product/thuat-ngu#Dependency|Dependency]]`) bị biến động;
  6. Công việc thực tế bên dưới (downstream work) không đạt kết quả kỳ vọng;
  7. Xuất hiện mâu thuẫn mới giữa các bên liên quan;
  8. Cuộc họp trước thiếu stakeholder hoặc người có thẩm quyền;
  9. Một quyết định cũ bị thay thế (`Superseded`) hoặc vô hiệu hóa (`Invalidated`);
  10. Cần một quyết định mới do trạng thái bên ngoài (external state) đã thay đổi.

### H3: Reconciliation (Đối soát Thực thi Ngoại vi)
* **Câu hỏi định tâm**: *Trạng thái công việc ngoài thực tế sau cuộc họp có còn nhất quán với quyết định đã thống nhất hay không?*
* **Ví dụ thực tế**:
  * Trong cuộc họp: Thống nhất *"Release vào thứ Sáu"*.
  * Sau đó trên Slack: Thảo luận *"Dời sang thứ Hai"*.
  * Trên Jira: Ticket chuyển sang trạng thái *"Blocked"*.
  * Trên GitHub: Release PR bị đóng hoặc chưa được merge.
  * *Hành vi của Vey*: Không âm thầm coi quyết định ban đầu vẫn còn đúng, mà phải nhận biết sự lệch pha để cảnh báo.
* **Sáu năng lực của Reconciliation**:
  1. Tiếp nhận bằng chứng mới (`[[product/thuat-ngu#Evidence|Evidence]]`) từ external systems;
  2. Liên kết evidence với quyết định (`[[product/thuat-ngu#Decision|Decision]]`) và luồng công việc (`[[product/thuat-ngu#Thread|Thread]]`);
  3. Phát hiện nguy cơ mâu thuẫn hoặc trạng thái lạc hậu (possible contradiction / staleness);
  4. Đánh dấu quyết định cần được rà soát (needs review);
  5. Yêu cầu xác nhận từ con người (human confirmation) khi cần thiết;
  6. Lưu giữ nguồn gốc (provenance) của toàn bộ tiến trình thay đổi trạng thái.
* **Nguyên tắc**: Không tự tiện kết luận mọi khác biệt (discrepancy) đều là mâu thuẫn (contradiction); cần xem xét ngữ cảnh trước khi đánh giá.

---

## 3. Khung Khái niệm Meeting Debt `[Giả thuyết]`

`[[product/thuat-ngu#Meeting Debt|Meeting Debt]]` là một khung khái niệm (conceptual framework) dùng để quan sát lượng trạng thái tồn đọng chưa được giải quyết (unresolved organizational state) tích lũy qua các cuộc họp.

* **Các tín hiệu nhận diện (Possible Signals)**:
  * Quyết định chưa dứt điểm (unresolved decisions);
  * Đầu việc vô chủ (ownerless actions);
  * Cam kết quá hạn (overdue commitments);
  * Chủ đề tồn đọng lặp đi lặp lại nhiều lần (recurring unresolved topics);
  * Điểm nghẽn chưa được khai thông (unresolved blockers);
  * Các quyết định xung đột nhau (conflicting decisions);
  * Các cuộc họp bị lặp lại do cuộc họp trước thất bại trong việc đạt closure;
  * Quyết định bị đóng băng hoặc lạc hậu (stale decision state);
  * Mâu thuẫn phát sinh ở các hệ thống triển khai thực tế (downstream contradictions).
* **Use case cấp tổ chức**: Trả lời câu hỏi quản trị chiến lược: *"Tại sao tổ chức của chúng ta đã tiêu tốn từng này giờ họp mà công việc vẫn ách tắc?"*.
* *Lưu ý*: Meeting Debt là một hướng nghiên cứu sản phẩm, chưa phải một chỉ số toán học hay đặc tả kỹ thuật cố định.

---

## 4. Những điều Chưa được Chứng minh (Unproven / Cần xác minh)

> [!warning] Điểm cần kiểm chứng thực nghiệm
> Các vấn đề sau đây đang ở trạng thái `[Cần xác minh]`:

1. **Độ tin cậy của suy luận kết hợp (Inference Reliability)**: Khả năng phối hợp giữa trích xuất LLM và deterministic rules để phát hiện Closure và Reconciliation với tỷ lệ cảnh báo sai (false alarm) đủ thấp để người dùng chấp nhận.
2. **Mức độ sẵn sàng phân quyền (Integration Friction)**: Sự cởi mở của doanh nghiệp trong việc cấp quyền đọc/ghi hai chiều vào Jira, GitHub, Slack và Calendar.
3. **Tính tự nhiên của `Thread`**: Liệu trừu tượng hóa luồng công việc (`[[product/thuat-ngu#Thread|Thread]]`) có giúp giảm tải hay lại tạo thêm gánh nặng nhận thức cho người dùng?

---

## 5. Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]: Problem space và source of truth model.
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Nguyên tắc provenance và rule-based reasoning.
* [[roadmap/mvp|Kế hoạch MVP]]: Phạm vi vertical slice kiểm chứng H1, H2, H3.
* [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa `Closure`, `Continuity`, `Reconciliation`, `Meeting Debt`.
