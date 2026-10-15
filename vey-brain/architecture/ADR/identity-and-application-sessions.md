---
title: Identity và application session của VEY-14
status: Implemented
---

# Identity và application session của VEY-14

[Fact] Better Auth chạy trong Next.js, quản lý schema `auth`. IAM trong Spring quản lý schema `iam`. Nguồn hiện trạng là `frontend/src/lib/auth/server.ts`, auth route handler, `IamSessionService`, security chains và Flyway V1/V2. Đây là implementation của VEY-14; không thay stack trong [[architecture/ADR/event-driven-modular-monolith|kiến trúc backend]].

## Danh tính và quan hệ dữ liệu

[Decision] Giữ ranh giới identity/business. `auth.user` là danh tính xác thực; `auth.account` là từng phương thức credential/social của danh tính đó. FK thật là `auth.account.userId → auth.user.id`. IAM ánh xạ `iam.users.auth_user_id = auth.user.id` qua JWT `sub`, unique trong IAM, không thêm FK xuyên schema hoặc FK trực tiếp tới account. Một user có thể có nhiều account nhưng chỉ một IAM user.

[Decision] User N:N Workspace đi qua `workspace_memberships`; quyền nằm ở role/status của membership. `workspaces.created_by_user_id` ghi người tạo, `initial_for_user_id` unique nullable bảo đảm provision personal workspace đầu tiên đúng một lần. Hai field này không cấp quyền. Session thuộc user và giữ `active_workspace_id` như context đang chọn; mỗi request phải kiểm membership ACTIVE. Session không buộc vào một membership vì danh tính đăng nhập và context workspace có vòng đời khác nhau.

[Fact] Không có `clerk_user_id` hoặc `workspaces.last_seen_at`. `users.last_seen_at` cập nhật khi exchange danh tính; `sessions.last_seen_at` cập nhật khi dùng session. Profile fields từ identity được đồng bộ ở exchange; locale/timezone là dữ liệu Vey. DBML mô tả các FK thật và ghi rõ ánh xạ logic trong note.

## Luồng đăng nhập và session

[Fact] Email/social/verification thành công → `/auth/complete` → JWT ES256 15 phút → `POST /api/v1/auth/session`. Spring kiểm signature qua public JWKS, issuer/audience/time/claim types, mục đích `token_use=identity`, `sid` và UUID `jti`. JWKS cung cấp public keys, không gọi Better Auth để introspect từng token. IAM provision user/personal workspace/OWNER trong một transaction, ghi session opaque có hash token và binding identity, trả cookie `vey_session` HttpOnly/SameSite=Lax, mặc định 7 ngày. JWT chỉ tồn tại tạm trong RAM.

[Decision] Vey session quyết định quyền vào app shell/API; identity session phục vụ đăng nhập và khôi phục session. Hai cookie có trách nhiệm và thời hạn riêng:

| Vey session | Better Auth session | Hành vi |
| --- | --- | --- |
| Còn hợp lệ | Còn | Vào app bằng Vey session |
| Còn hợp lệ | Hết hạn tự nhiên/mất cookie | Tiếp tục app đến khi Vey hết hạn hoặc bị revoke |
| Hết hạn/mất | Còn hợp lệ | `/auth/complete` exchange passport mới; giữ ownership cũ |
| Hết hạn/mất | Hết hạn/mất | Login |

[Fact] 403 do membership/workspace không hợp lệ không kích hoạt exchange để vượt quyền. Backend/network lỗi hiển thị retry, không giả định mất session. Business API 401 chuyển qua recovery một lần; auth endpoints được loại khỏi vòng recovery.

## Logout, revoke và reset mật khẩu

[Fact] UI logout chờ Spring revoke các session cùng identity `sid` và ghi tombstone trước, sau đó gọi Better Auth sign-out. Nếu lỗi, UI báo retry. Better Auth có thể nuốt lỗi delete session rồi trả success; Next.js kiểm lại session bằng cookie gốc, bỏ cache, trước khi chuyển response xóa cookie cho trình duyệt.

[Fact] Hook trước khi Better Auth xóa session gửi JWT server-only `token_use=revocation`, TTL 60 giây, đến `/api/v1/auth/identity/revoke`. Spring không nhận identity passport ở endpoint này và không nhận revocation passport ở exchange. Ledger `iam.auth_revocations` giữ `sid` đã revoke hoặc cutoff toàn identity khi reset mật khẩu. Ledger có thể tồn tại trước user IAM, vì vậy không FK tới users. Advisory lock theo identity sắp thứ tự exchange/revoke; hash `issuer|jti` chặn passport replay kể cả khi compact JWT đổi encoding.

[Fact] Reset mật khẩu gửi cutoff trước khi tiêu thụ reset token, rồi revoke từng identity session khi xóa. Toàn bộ HTTP reset handler của Better Auth chạy trong transaction schema `auth`, vẫn dùng router kiểm Origin/rate limit/validation. Signing key được provision/rotate trước transaction để Spring đọc JWKS committed. Body giới hạn 8 KiB và 5 giây trước khi lấy DB connection. Nếu thông báo sau bị lỗi, password/reset token/identity sessions rollback để retry; IAM revocations đã nhận vẫn có hiệu lực để đóng quyền truy cập. Natural expiry cleanup không phát thông báo logout.

## Vận hành và bằng chứng

[Fact] Public frontend/API cần cùng hostname vì cookie host-only phải đến được Next.js server guard; local khác port vẫn hoạt động. HTTPS bật `VEY_AUTH_COOKIE_SECURE=true`. `VEY_API_INTERNAL_URL` dành cho server-to-server; public proxy `/api/v1` về Spring. Không query trực tiếp schema auth từ Spring.

[Fact] Ngày 2026-10-15: 57 backend test, 112 frontend unit test, 9 browser smoke/UI test và 1 lifecycle browser test đều pass; formatting/lint/typecheck/build pass. Backend có regression cho invalid passports, purpose confusion, replay với encoding khác, revocation trước provisioning, concurrency exchange/revoke, membership isolation, migrations và persistence. `bun run test:auth` dùng DB riêng, Next.js/Spring thật và hai thiết bị; lỗi notification thứ hai của reset đã chứng minh password/token/session rollback, retry thành công và IAM giữ revoke. README chứa lệnh chạy lại.

[Fact] Trong lượt kiểm tra dependency, `bun audit` báo 11 advisory trên dependency có sẵn (1 critical, 5 high, 4 moderate, 1 low), không có advisory Better Auth trong output. Đây chưa phải dependency audit sạch và cần xử lý riêng trước production; không đổi dependency ngoài scope chỉ để làm xanh báo cáo.

[Fact] Người dùng đã báo manual check theo kịch bản VEY-14 pass toàn bộ. Đây là kết quả do người dùng xác nhận; review ngoài do người dùng thực hiện riêng.

[Cần xác minh] Cấu hình OAuth/Resend trên môi trường production cần được kiểm tra tại môi trường đó. Enterprise SSO, workspace administration và billing ngoài scope VEY-14.
