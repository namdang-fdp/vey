---
title: Thuật ngữ (Glossary)
---

# Thuật ngữ

Danh mục các thuật ngữ cốt lõi được sử dụng nhất quán trong toàn bộ hệ thống tài liệu của **Vey**. Không tự tiện sáng tạo thêm các thực thể ontology ngoài danh sách này khi chưa có nhu cầu thực tế.

---

### Meeting
Sự kiện giao tiếp đồng bộ (synchronous session) diễn ra giữa các cá nhân/nhóm trong một khung thời gian cụ thể. Meeting tạo ra các phát biểu, câu hỏi, điểm nghẽn và các cam kết/quyết định. Trong Vey, Meeting là một loại `Event` nằm bên trong một hoặc nhiều `Thread`.

### Thread
Luồng công việc hoặc chủ đề ngữ cảnh xuyên suốt thời gian, kết nối các cuộc họp (`Meeting`), quyết định (`Decision`), hành động (`Action`), bằng chứng (`Evidence`) và đối tượng bên ngoài (`External Object`) liên quan. `Thread` hiện là một giả thuyết trừu tượng hóa nhằm duy trì tính liên tục (Continuity).

### Decision
Thỏa thuận hoặc kết luận có tính cam kết về một định hướng, phương án kỹ thuật hoặc quy trình. Một Decision không phải là văn bản tĩnh mà có vòng đời (`Proposed` $\rightarrow$ `Accepted` $\rightarrow$ `Active` $\rightarrow$ `Superseded` / `Invalidated`).

### Action
Nhiệm vụ hoặc hành động cụ thể phát sinh từ thảo luận cần được một hoặc nhiều cá nhân thực hiện để thúc đẩy tiến độ của `Thread` hoặc hoàn tất một `Decision`.

### Question
Câu hỏi, vấn đề nghi vấn hoặc thắc mắc được nêu ra trong luồng thảo luận nhưng chưa có câu trả lời xác đáng tại thời điểm đó. Nếu không được giải quyết, Question có thể trở thành nguyên nhân khiến cuộc họp không đạt `Meeting Closure`.

### Blocker
Yếu tố khách quan hoặc chủ quan cản trở tiến độ của một `Thread`, làm đình trệ việc ra `Decision` hoặc ngăn cản việc thực thi một `Action`.

### Evidence
Bằng chứng xác thực chứng minh cho một nhận định, suy luận hoặc trạng thái. Evidence có thể là đoạn trích (quote/timestamp) trong transcript cuộc họp, một pull request commit, một Jira ticket status, hoặc một tài liệu cụ thể.

### External Object
Thực thể dữ liệu thuộc về các hệ thống chuyên trách bên ngoài mà Vey tích hợp và tham chiếu tới, ví dụ: Jira Issue, GitHub PR, Slack Message, Notion Page, Google Doc. Vey không sao chép toàn bộ thực thể này mà chỉ lưu trữ tham chiếu, quan hệ và trạng thái đồng bộ.

### Event
Một sự kiện điểm thời gian đánh dấu một hành động xảy ra trong không gian làm việc (ví dụ: cuộc họp bắt đầu/kết thúc, một PR được merge, một quyết định được chấp thuận, một ticket chuyển trạng thái).

### State Change
Sự biến đổi trạng thái của một thực thể trong hệ thống theo thời gian (ví dụ: một `Decision` chuyển từ `Proposed` sang `Accepted`, hoặc một `Action` chuyển từ `Open` sang `Done`).

### Meeting Closure
Trạng thái hoàn tất trọn vẹn của một cuộc họp, khi tất cả các mục tiêu bắt buộc, các câu hỏi then chốt (`Question`) và điểm nghẽn (`Blocker`) đã đạt được kết luận rõ ràng, hoặc đã được phân định người phụ trách và lộ trình xử lý dứt điểm trước khi cuộc họp kết thúc.

### Reconciliation
Quá trình liên tục đối soát và phát hiện sự sai lệch hoặc mâu thuẫn giữa quyết định đã thống nhất trong cuộc họp (`Decision`) và trạng thái thực tế đang diễn ra trên các `External Object` hoặc trong các cuộc thảo luận tiếp theo.

### Meeting Debt
Lượng tri thức mơ hồ, các câu hỏi chưa dứt điểm, các cam kết bị lãng quên hoặc các cuộc họp phải tổ chức lại lặp đi lãng phí do các cuộc họp trước thiếu `Meeting Closure`.

---

## Liên kết liên quan

* [[product/tam-nhin|Tầm nhìn sản phẩm]]
* [[product/nguyen-tac|Nguyên tắc sản phẩm]]
* [[architecture/domain-model|Domain Model]]
