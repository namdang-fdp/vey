---
title: Thuật ngữ (Glossary)
---

# Thuật ngữ (Glossary)

Danh mục các thuật ngữ cốt lõi được định nghĩa và sử dụng nhất quán trong toàn bộ hệ thống tài liệu của **Vey**. Không tự tiện tạo thêm ontology phức tạp ngoài danh mục này khi chưa có nhu cầu thực tế.

---

### Meeting
Sự kiện giao tiếp đồng bộ (synchronous session) diễn ra giữa các cá nhân/nhóm trong một khung thời gian cụ thể. Meeting tạo ra các phát biểu, câu hỏi, điểm nghẽn và các cam kết/quyết định. Trong Vey, Meeting là một loại `Event` nằm bên trong một hoặc nhiều `Thread`.

### Thread
Luồng công việc hoặc chủ đề ngữ cảnh xuyên suốt thời gian, kết nối các cuộc họp (`Meeting`), quyết định (`Decision`), hành động (`Action`), bằng chứng (`Evidence`) và đối tượng bên ngoài (`External Object`) liên quan. `Thread` hiện là một **giả thuyết trừu tượng hóa (abstraction hypothesis)** nhằm duy trì tính liên tục (Continuity).

### Decision
Thỏa thuận hoặc kết luận có tính cam kết về một định hướng, phương án kỹ thuật hoặc quy trình.
* **Vòng đời trạng thái (Working Lifecycle Model)**:
  `Proposed` $\rightarrow$ `Accepted` $\rightarrow$ `Active` $\rightarrow$ `Superseded` hoặc `Invalidated`.
* **Thuộc tính lưu trữ**: Có khả năng lưu nội dung, rationale, evidence, timestamp, participants, decision owner, authority context, affected work, related Thread, source meeting, external evidence, current lifecycle state, state history và superseding decision (nếu có).

### Action
Nhiệm vụ hoặc hành động cụ thể phát sinh từ thảo luận cần được một hoặc nhiều cá nhân thực hiện để thúc đẩy tiến độ của `Thread` hoặc hoàn tất một `Decision`.

### Question
Câu hỏi, vấn đề nghi vấn hoặc thắc mắc được nêu ra trong luồng thảo luận nhưng chưa có câu trả lời xác đáng tại thời điểm đó. Nếu không được giải quyết hoặc phân công xử lý, Question là tín hiệu hàng đầu khiến cuộc họp không đạt `Meeting Closure`.

### Blocker
Yếu tố khách quan hoặc chủ quan cản trở tiến độ của một `Thread`, làm đình trệ việc ra `Decision` hoặc ngăn cản việc thực thi một `Action`.

### Dependency
Mối quan hệ phụ thuộc, ràng buộc điều kiện tiên quyết (prerequisite) giữa các Action, Decision hoặc các luồng công việc trong hệ thống.

### Person
Thực thể cá nhân tham gia phát biểu trong cuộc họp, đưa ra quyết định, hoặc sở hữu (owner) các Action/External Objects. Đòi hỏi cơ chế ánh xạ danh tính (Identity Resolution) xuyên suốt giữa giọng nói/email lịch với tài khoản trên Jira, GitHub, Slack.

### Rationale
Lý do căn bản, căn cứ lập luận và bối cảnh giải thích tại sao một `Decision` được đưa ra hoặc tại sao một `State Change` xuất hiện.

### Evidence
Bằng chứng xác thực chứng minh cho một nhận định, suy luận hoặc trạng thái. Evidence có thể là đoạn trích (quote/timestamp) trong transcript cuộc họp, một pull request commit, một Jira ticket status, hoặc một tài liệu cụ thể.

### External Object
Thực thể dữ liệu thuộc về các hệ thống chuyên trách bên ngoài mà Vey tích hợp và tham chiếu tới (ví dụ: Jira Issue, GitHub PR, Slack Message, Notion Page, Google Doc). Vey không sao chép toàn bộ nội dung mà chỉ lưu trữ tham chiếu, quan hệ và trạng thái đối soát.

### Event
Một sự kiện điểm thời gian đánh dấu một hành động xảy ra trong không gian làm việc (ví dụ: cuộc họp bắt đầu/kết thúc, một PR được merge, một quyết định được chấp thuận, một ticket chuyển trạng thái).

### State Change
Sự biến đổi trạng thái của một thực thể trong hệ thống theo thời gian (ví dụ: một `Decision` chuyển từ `Proposed` sang `Accepted`, hoặc một `Action` chuyển từ `Open` sang `Done`).

### Work Context Graph
Mô hình biểu diễn khái niệm (conceptual model) kết nối mạng lưới các thực thể nghiệp vụ (Thread, Meeting, Decision, Action, Question, Blocker, Evidence...) và các mối quan hệ nhân quả xuyên thời gian và hệ thống. *Lưu ý: Đây là mô hình khái niệm, không phải quyết định lựa chọn graph database.*

### Meeting Closure
Trạng thái hoàn tất trọn vẹn của một cuộc họp, khi tất cả các mục tiêu bắt buộc, các câu hỏi then chốt (`Question`) và điểm nghẽn (`Blocker`) đã đạt được kết luận rõ ràng, hoặc đã được phân định người phụ trách và thời hạn xử lý dứt điểm trước khi cuộc họp kết thúc.

### Reconciliation
Quá trình liên tục đối soát và phát hiện sự sai lệch hoặc mâu thuẫn giữa quyết định đã thống nhất trong cuộc họp (`Decision`) và trạng thái thực tế đang diễn ra trên các `External Object` hoặc trong các cuộc thảo luận tiếp theo.

### Meeting Debt
Khung khái niệm đo lường lượng trạng thái tồn đọng chưa được giải quyết (unresolved organizational state) tích lũy qua các cuộc họp do thiếu `Meeting Closure`. Biểu hiện qua: quyết định dở dang, việc vô chủ, cam kết quá hạn, các cuộc họp lặp đi lặp lại vô ích và mâu thuẫn triển khai downstream.

---

## Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]
* [[architecture/domain-model|Domain Model]]
