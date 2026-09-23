---
title: Vey Brain
---

# Vey Brain

Chào mừng đến với **Vey Brain** — knowledge base chính thức của dự án **Vey**.

Vey là một sản phẩm về meeting và work intelligence, tập trung vào việc duy trì tính liên tục (continuity) giữa cuộc họp, quyết định (decision) và thực tế triển khai công việc.

---

## Bản chất của Vey Brain

* **Obsidian Vault & Filesystem Repository**: Được thiết kế để con người đọc/ghi qua Obsidian và các coding agents thao tác trực tiếp qua Markdown trên filesystem.
* **Knowledge & State Layer**: Brain lưu trữ tầm nhìn, nguyên tắc, thuật ngữ, nghiên cứu, domain model và các architecture decisions (ADR).
* **Không phải Task Tracker**: Brain **không** thay thế Jira, GitHub hay issue tracker. Jira quản lý execution và backlog; Brain lưu trữ context, rationale và organizational state.

---

## Luồng đọc tài liệu (Reading Order)

Để nắm bắt nhanh bối cảnh và tham gia đóng góp:

1. [[AGENTS|AGENTS.md]]: Contract và nguyên tắc làm việc bắt buộc cho AI agents khi thao tác với vault.
2. [[product/tam-nhin|Tầm nhìn sản phẩm]]: Bối cảnh vấn đề và hướng đi dài hạn của Vey (không phải meeting recorder đơn thuần).
3. [[product/luan-de-san-pham|Luận đề sản phẩm]]: Phân biệt commodity features và 3 giả thuyết cốt lõi (H1, H2, H3).
4. [[product/nguyen-tac|Nguyên tắc sản phẩm]]: Các nguyên tắc thiết kế bất biến của hệ thống.
5. [[product/thuat-ngu|Thuật ngữ]]: Định nghĩa chuẩn cho các khái niệm cốt lõi (`Thread`, `Decision`, `Meeting Closure`...).
6. [[architecture/domain-model|Domain Model]]: Working domain model sơ bộ và các câu hỏi kiến trúc đang mở.
7. [[roadmap/mvp|MVP Roadmap]]: Phạm vi vertical slice tối thiểu để kiểm chứng giả thuyết.
8. [[research/competitive-landscape|Competitive Landscape]]: Khung nghiên cứu thị trường và các nhóm giải pháp liên quan.

---

## Cấu trúc thư mục

```text
.
├── README.md                          # Tài liệu giới thiệu & chỉ dẫn đọc
├── AGENTS.md                          # Contract làm việc dành cho coding agents
├── 00-inbox/                          # Nơi lưu ghi chú thô, ý tưởng chờ xử lý
├── product/                           # Tầm nhìn, luận đề, nguyên tắc, thuật ngữ
│   ├── tam-nhin.md
│   ├── luan-de-san-pham.md
│   ├── nguyen-tac.md
│   └── thuat-ngu.md
├── research/                          # Nghiên cứu thị trường và đối thủ
│   └── competitive-landscape.md
├── architecture/                      # Domain model và quyết định kiến trúc
│   ├── domain-model.md
│   └── ADR/                           # Architecture Decision Records (khi có quyết định)
└── roadmap/                           # Định hướng MVP và lộ trình sản phẩm
    └── mvp.md
```
