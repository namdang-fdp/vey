---
title: Event-Driven Modular Monolith cho Vey backend
status: Accepted
---

# Event-Driven Modular Monolith cho Vey backend

## Context

[Decision] Vey cần deploy và phát triển đơn giản như một monolith, đồng thời giữ ranh giới chặt giữa business modules. Kafka phục vụ domain/integration events; JobRunr phục vụ persistent background work, retries và scheduling, không thay event bus.

## Decision

- Backend là disciplined event-driven modular monolith dưới `com.dorriss.vey`.
- Trong cùng module, controller, service và repository được gọi trực tiếp; event listener được gọi service của module mình.
- Module được dùng infrastructure abstractions. Infrastructure và common không import business modules.
- Giao tiếp giữa business modules mặc định qua Kafka events và event contracts; không direct-import internals của module khác.
- ArchUnit enforce các boundary. Chỉ tạo business module khi có feature thật.

## Consequences

- Module isolation và coupling tường minh giúp mở rộng provenance, events và tách service về sau.
- Kafka tăng overhead local/runtime; event flow có eventual consistency và cần quản lý schema/versioning. Vận hành phức tạp hơn monolith chỉ gọi trong bộ nhớ.
