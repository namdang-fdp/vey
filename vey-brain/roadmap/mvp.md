---
title: Định hướng MVP (MVP Scope)
---

# Định hướng MVP (MVP Scope)

> [!important] Trạng thái tài liệu
> Đây là **phạm vi làm việc ban đầu (working scope)** phục vụ cho việc kiểm chứng các giả thuyết kỹ thuật và giá trị cốt lõi. Đây **chưa phải** là committed roadmap chính thức và **không chứa backlog chi tiết** (backlog và issue execution sẽ được quản lý trên Jira).

---

## 1. Ranh giới & Lộ trình Sản phẩm theo Tầng (Layered Roadmap)

Roadmap sản phẩm của Vey được định hình theo nguyên tắc chỉ đạo:
> **Vey Core là differentiation. Meeting Platform là product foundation bắt buộc. Commodity ≠ optional.**

Thay vì dựa vào dữ liệu upload/import giả lập, Vey phát triển theo hai tầng kế thừa về mặt quan niệm:

### Tầng 1 — Meeting Platform Foundation (Nền tảng Sản phẩm Bắt buộc)
Vey phải hướng tới các capability cơ bản và đầy đủ cần thiết của một meeting platform để tự tạo ra dữ liệu thật (first-party meeting data), vận hành meeting lifecycle và cung cấp baseline workflow thực tế:
* Calendar integration (kết nối lịch họp);
* Meeting lifecycle (vòng đời cuộc họp);
* Real meeting capture & recording (thu nhận và ghi âm cuộc họp thực tế);
* Transcription (tận dụng provider/speech platform phù hợp, không cần xây dựng custom ASR model từ đầu);
* Speaker diarization (nhận diện người nói);
* Timestamps (mốc thời gian phát biểu);
* Searchable transcript (tìm kiếm toàn văn bản ghi);
* Multilingual support (hỗ trợ đa ngôn ngữ khi scope phù hợp);
* Meeting workspace / library (thư viện lưu trữ cuộc họp);
* Meeting search (tìm kiếm cuộc họp theo ngữ cảnh/từ khóa);
* Meeting summary & templates (tóm tắt cuộc họp và khung mẫu);
* Basic action item extraction (trích xuất đầu việc cơ bản);
* Basic decision extraction (trích xuất quyết định dạng văn bản tĩnh);
* Meeting Q&A (hỏi đáp nội dung cuộc họp);
* Baseline UX đủ để sử dụng Vey như một meeting product thật.

*Ranh giới làm việc*:
* Giữ ở cấp độ định hướng phạm vi sản phẩm (product scope), chưa chốt ngay toàn bộ implementation chi tiết hay release boundary của từng capability (backlog và issue execution sẽ được quản lý trên Jira).
* Không cần tự xây custom ASR model từ đầu nếu dùng provider/platform phù hợp hiệu quả hơn.
* **Upload/import**: Upload audio, import transcript hoặc webhook import là capability hữu ích phục vụ testing, migration, dữ liệu lịch sử và fallback, nhưng **không phải primary product path** và không được dùng làm lý do để né real meeting capture.

### Tầng 2 — Vey Core Validation (Kiểm chứng Khác biệt hóa Cốt lõi)
Sau khi Meeting Platform Foundation tạo được luồng dữ liệu thật đủ tin cậy, Vey tập trung kiểm chứng ba giả thuyết cốt lõi tạo nên lợi thế cạnh tranh chiến lược:
1. **H1 (Closure)**: *Người dùng có thấy việc phát hiện trạng thái chưa dứt điểm (unresolved meeting state) hữu ích và đủ chính xác không?*
2. **H2 (Continuity)**: *Vey có tái dựng được chuỗi nhân quả giải thích tại sao một chủ đề/đầu việc phải quay lại cuộc họp tiếp theo không?*
3. **H3 (Reconciliation)**: *Vey có phát hiện được các biến động trạng thái hoặc mâu thuẫn thực tế sau khi quyết định được ban hành không?*

Kèm theo các năng lực Vey Core: Structured Work Context, Decision lifecycle, cross-system reasoning/provenance, và khung khái niệm `[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`.

*Quan hệ phụ thuộc*: Dependency conceptual là `real meeting platform/data foundation → Vey intelligence`. Hai tầng có thể gối đầu (overlap) ở khâu engineering khi hợp lý, nhưng không thể chỉ dựa vào dữ liệu giả lập/import để coi là đã hoàn thành validation.

---

## 2. Lát cắt Dọc Tối thiểu (Vertical Slice)

Chuỗi xử lý dữ liệu khép kín xuyên suốt từ thu nhận cuộc họp thực tế đến đối soát ngoại vi:

```text
Real Meeting Capture / Calendar / Recording
              ↓
Transcription & Diarization (Foundation)
              ↓
   Structured Work Context
              ↓
        Closure Analysis
              ↓
       Decision Timeline
              ↓
   External-system Evidence
              ↓
        Reconciliation
              ↓
      Next-meeting Brief
```

### Chi tiết các chặng trong Lát cắt:
1. **Meeting Capture & Foundation**: Thu nhận cuộc họp thực tế (kết nối lịch, capture audio/video, sinh transcript kèm diarization và timestamps qua provider phù hợp). *Cơ chế upload audio / import transcript được duy trì song song làm luồng testing/fallback, nhưng primary path là real capture.*
2. **Structured Work Context**: Trích xuất các thực thể nghiệp vụ ban đầu (Question, Blocker, Decision, Action, và ứng viên trừu tượng hóa Thread nếu áp dụng) vào [[architecture/domain-model#Work Context Graph (Mô hình Khái niệm)|Work Context Graph]].
3. **Closure Analysis**: Đánh giá các điều kiện quan sát được (observable conditions) để chỉ ra những câu hỏi chưa có giải đáp, action thiếu owner/deadline, hoặc blocker bỏ lửng.
4. **Decision Timeline**: Lưu vết các `[[product/thuat-ngu#Decision|Decision]]` kèm trạng thái vòng đời ban đầu (`Accepted`), rationale và timestamp.
5. **External-system Evidence**: Thu thập bằng chứng thực tế từ ít nhất một hệ thống ngoài đại diện (Jira issue hoặc GitHub PR) liên quan đến quyết định.
6. **Reconciliation**: Đối soát xem trạng thái ngoài đời thực (Jira ticket status, PR merge status) có còn phù hợp với quyết định hay đang có nguy cơ mâu thuẫn/lạc hậu.
7. **Next-meeting Brief**: Khi cuộc họp tiếp theo về cùng chủ đề diễn ra, tự động sinh bản tóm tắt bối cảnh liên tục (continuity brief), giải thích: *"Lần trước đã quyết định gì, ngoài thực tế đã biến động ra sao, và tại sao hôm nay cần họp tiếp?"*.

---

## 3. Định hướng Dogfooding (Dogfooding Direction)

Vey dự kiến được kiểm nghiệm nội bộ (dogfooding) ngay trong chính môi trường công cụ phân mảnh (heterogeneous toolchain) mà đội ngũ đang sử dụng hàng ngày:
* **Jira**: Quản lý backlog và tiến độ thực thi (execution state).
* **GitHub**: Lưu trữ mã nguồn, Pull Requests và CI/CD pipelines.
* **Obsidian Brain**: Lưu trữ rationale, research, architectural context và knowledge.
* **Slack**: Kênh thảo luận và trao đổi tức thời.
* **Google Calendar**: Quản lý lịch trình và thành phần tham gia cuộc họp.
* **Google Meet**: Nguồn trao đổi đàm thoại trực tiếp.
* **PostgreSQL / DBX**: Dữ liệu môi trường phát triển cục bộ.
* **Bruno**: Quản lý và kiểm thử API collections.
* **Open Design / Local Artifacts**: Thiết kế giao diện và nguyên mẫu ban đầu.

> [!tip] Ý nghĩa dogfooding
> Vey phải sinh tồn và chứng minh giá trị trong chính loại môi trường làm việc phân mảnh mà nó hướng tới giải quyết cho người dùng.

---

## 4. Phân định Công cụ Dev vs Tích hợp Production

* **Development Operations (Giai đoạn Phát triển)**: Các coding agent sử dụng các MCP server chuyên dụng (GitHub MCP, Jira/Atlassian MCP, Slack tools, DBX MCP, filesystem) để thao tác và phát triển nhanh.
* **Production Integrations (Môi trường Người dùng Cuối)**: Hệ thống production của Vey sẽ tích hợp qua các cơ thức chuẩn mực doanh nghiệp (OAuth 2.0, official REST/GraphQL APIs, webhooks, event ingestion, và polling khi cần). Cơ chế production không phụ thuộc vào công cụ môi trường dev.

---

## 5. Những điều Nằm ngoài Phạm vi MVP (Out of Scope)

* Không tự huấn luyện hoặc xây dựng custom ASR model từ đầu (ưu tiên tích hợp các speech-to-text provider / platform phù hợp và hiệu quả).
* Không xây dựng ứng dụng quản trị công việc toàn diện thay thế Jira.
* Không tích hợp ồ ạt nhiều hệ thống cùng lúc (chỉ chọn 1-2 hệ sinh thái đại diện để chứng minh giả thuyết H3).
* Không xây dựng hệ thống báo cáo số học phức tạp cho `[[product/thuat-ngu#Meeting Debt|Meeting Debt]]`.

---

## 6. Liên kết liên quan

* [[product/luan-de-san-pham|Luận đề sản phẩm]]: Ba giả thuyết H1, H2, H3.
* [[product/tam-nhin|Tầm nhìn sản phẩm]]: Problem space và source of truth model.
* [[architecture/domain-model|Domain Model]]: Cấu trúc thực thể và Work Context Graph.
