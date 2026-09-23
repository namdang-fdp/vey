---
title: Agent Operating Contract
---

# Agent Operating Contract

Tài liệu này là quy chuẩn bắt buộc (contract) cho mọi AI agent khi đọc, ghi hoặc sửa đổi nội dung trong **Vey Brain**.

---

## 1. Ngôn ngữ & Thuật ngữ

* **Ngôn ngữ chính**: Toàn bộ nội dung tài liệu viết bằng **tiếng Việt**.
* **Technical & Domain Terms**: Giữ nguyên tiếng Anh khi thuật ngữ chuẩn xác và phổ biến hơn, ví dụ: `Decision`, `Thread`, `Meeting Closure`, `Reconciliation`, `Meeting Debt`, `Evidence`, `External Object`, `API`, `webhook`.

---

## 2. Quy ước đặt tên & Đường dẫn (Naming & Paths)

* Thư mục và tập tin phải dùng **lowercase ASCII kebab-case** (ví dụ: `domain-model.md`, `luan-de-san-pham.md`).
* **Tuyệt đối không** dùng dấu tiếng Việt, ký tự đặc biệt hoặc khoảng trắng trong tên file/thư mục.
* Định dạng tập tin mặc định là Markdown (`.md`).

---

## 3. Phân biệt Trạng thái Tri thức (Knowledge States)

Mọi nhận định, thông tin trong vault phải được phân loại rõ ràng:

* **Fact (Sự thật/Hiện trạng)**: Đã kiểm chứng, có bằng chứng (`Evidence`) hoặc code/kết quả thực tế.
* **Giả thuyết (`Giả thuyết`)**: Nhận định phỏng đoán cần kiểm chứng thông qua người dùng hoặc thực nghiệm. Tuyệt đối không biến giả thuyết thành fact.
* **Câu hỏi mở (`Đang mở` / `Cần xác minh`)**: Vấn đề chưa có lời giải hoặc chưa đủ dữ liệu.
* **Quyết định (`Decision`)**: Đã được thống nhất chính thức (đối với kiến trúc thì ghi nhận qua ADR).

> [!important] Nguyên tắc trung thực
> Khi chưa có bằng chứng hoặc quyết định chính thức, agent phải ghi rõ `[Giả thuyết]` hoặc `[Cần xác minh]`. Không tự tiện khẳng định.

---

## 4. Quản lý Tài liệu & Cấu trúc Vault

* **Ưu tiên cập nhật tài liệu canonical**: Khi có thông tin mới, cập nhật vào tài liệu gốc hiện có (ví dụ: cập nhật thuật ngữ vào `thuat-ngu.md`, cập nhật mô hình vào `domain-model.md`).
* **Không duplicate thông tin vô ích**: Tránh sao chép nội dung giữa các file. Tránh sao chép backlog hoặc ticket từ Jira vào Brain.
* **Khi nào được tạo file mới**: Chỉ tạo khi một chủ đề hoặc thực thể mới độc lập cần không gian riêng và không thể gộp vào tài liệu canonical.
* **Không tự ý tạo folder / taxonomy**:
  * Giữ cấu trúc thư mục hiện tại theo quy định.
  * Không tạo folder "để dành" hoặc "phòng khi cần".
  * Không tự chế hệ thống tag, properties, template hay Canvas phức tạp khi chưa có yêu cầu.

---

## 5. Quyết định Kỹ thuật & Sản phẩm

* Agent **không tự ý chốt** product feature, architecture hoặc technology stack (ví dụ: không tự chọn database, không tự quyết định graph DB hay event sourcing).
* Mọi đề xuất công nghệ chỉ dừng ở mức phương án cân nhắc và liệt kê ưu/nhược điểm trong phần câu hỏi mở.

---

## 6. Liên kết & Wikilinks

* Sử dụng Obsidian wikilink (ví dụ: `[[product/tam-nhin|Tầm nhìn]]` hoặc `[[tam-nhin]]`) để liên kết giữa các tài liệu có quan hệ ngữ nghĩa.
* Trước khi lưu file, phải đảm bảo target của mọi wikilink trỏ tới tài liệu thực sự tồn tại trong vault.

---

## 7. Quy trình Git

* Sau mỗi thay đổi đáng kể, agent phải chạy `git diff` để tự kiểm tra chất lượng và độ sạch của code/markdown.
* **Không tự ý chạy `git commit` hoặc `git push`** trừ khi người dùng yêu cầu rõ ràng.
* Không tự tạo branch mới nếu không cần thiết.
