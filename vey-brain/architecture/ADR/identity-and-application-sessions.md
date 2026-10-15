---
title: Identity và application session của VEY-14
status: Implemented
---

# Identity và application session của VEY-14

[Fact] Better Auth chạy trong Next.js, quản lý schema `auth`. IAM trong Spring quản lý schema `iam`. Nguồn hiện trạng là `frontend/src/lib/auth/server.ts`, auth route handler, `IamSessionService`, security chains và Flyway V1/V2. Đây là implementation của VEY-14; không thay stack trong [[architecture/ADR/event-driven-modular-monolith|kiến trúc backend]].

[Decision] Package IAM tách theo trách nhiệm: `domain.entity` chứa JPA entities, `domain.enums` chứa role/status/type; `application.service` điều phối use case và transaction, `application.dto` chứa input/output records, `application.support` chứa tiện ích token. `api`, `persistence` và `security` giữ vai trò HTTP boundary, repositories và cơ chế xác thực. Cách tổ chức này không thay đổi schema hoặc giao thức API.

## Danh tính và quan hệ dữ liệu

[Decision] Giữ ranh giới identity/business. `auth.user` là danh tính xác thực; `auth.account` là từng phương thức credential/social của danh tính đó. FK thật là `auth.account.userId → auth.user.id`. IAM ánh xạ `iam.users.auth_user_id = auth.user.id` qua JWT `sub`, unique trong IAM, không thêm FK xuyên schema hoặc FK trực tiếp tới account. Một user có thể có nhiều account nhưng chỉ một IAM user.

[Decision] User N:N Workspace đi qua `workspace_memberships`; quyền nằm ở role/status của membership. `workspaces.created_by_user_id` ghi người tạo, `initial_for_user_id` unique nullable bảo đảm provision personal workspace đầu tiên đúng một lần. Hai field này không cấp quyền. Session thuộc user và giữ `active_workspace_id` như context đang chọn; mỗi request phải kiểm membership ACTIVE. Session không buộc vào một membership vì danh tính đăng nhập và context workspace có vòng đời khác nhau.

[Decision] Bật Spring Security method security và ánh xạ role của membership trong active workspace thành authority `ROLE_<membershipRole>` ở mỗi request đã xác thực. Các method do Spring quản lý có thể dùng `@PreAuthorize("hasRole('OWNER')")` hoặc `hasAnyRole(...)`. Không có role hierarchy ngầm định; role được đọc lại từ database mỗi request. Kiểm tra role phải đi cùng kiểm tra tài nguyên thuộc active workspace.

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

## API IAM và database

[Fact] Bốn endpoint trong `AuthController` chỉ đọc/ghi schema `iam`; các endpoint đăng ký, đăng nhập, xác minh email và reset mật khẩu của Better Auth quản lý schema `auth` riêng.

| Endpoint | Đọc/ghi database | Kết quả |
| --- | --- | --- |
| `POST /api/v1/auth/session` | Kiểm `auth_revocations` và fingerprint passport trong `sessions`; insert user nếu thiếu, đồng bộ profile; tìm/tạo workspace cá nhân khởi tạo và membership OWNER; insert Vey session mới. Toàn bộ exchange nằm trong một transaction, khóa theo identity và user row. | `200` với context và cookie `vey_session`; user/workspace ban đầu được dùng lại ở những lần exchange sau. |
| `GET /api/v1/auth/me` | Filter đọc `sessions`, `users`, `workspaces`, `workspace_memberships`, kiểm trạng thái rồi ghi `sessions.last_seen_at`. Sau đó service đọc lại user/workspace/membership trong transaction read-only để tạo DTO. | `200` với context; heartbeat không gia hạn `expires_at`. |
| `POST /api/v1/auth/session/logout` | Nếu tìm được session có identity binding: insert event `SESSION_REVOKED` vào `auth_revocations`, thu hồi các Vey session cùng user/sid. Cập nhật `LOGOUT` là fallback cho session chưa được thu hồi. Các thao tác nằm trong transaction logout. | `204` và cookie Max-Age=0, kể cả không có token hoặc token không tìm thấy; frontend tiếp tục sign-out Better Auth. |
| `POST /api/v1/auth/identity/revoke` | Insert event vào `auth_revocations` theo JWT jti; event trùng ID không xử lý lại. Thu hồi session theo user/sid hoặc cutoff `auth_session_created_at <= occurred_at` khi reset mật khẩu, trong cùng transaction. Ledger vẫn ghi được khi user IAM chưa tồn tại. | `204`; các request dùng session bị thu hồi nhận `401`, passport thuộc phạm vi thu hồi không exchange được nữa. |

[Fact] JWT bị từ chối ở security boundary không đi vào use case database. Với API dùng cookie, session/user không hợp lệ trả `401`; workspace/membership không ACTIVE hoặc thiếu role được yêu cầu trả `403`. Logout vẫn kiểm Origin cho mutation dù không yêu cầu session hợp lệ.

## Logout, revoke và reset mật khẩu

[Fact] UI logout chờ Spring revoke các session cùng identity `sid` và ghi tombstone trước, sau đó gọi Better Auth sign-out. Nếu lỗi, UI báo retry. Better Auth có thể nuốt lỗi delete session rồi trả success; Next.js kiểm lại session bằng cookie gốc, bỏ cache, trước khi chuyển response xóa cookie cho trình duyệt.

[Fact] Hook trước khi Better Auth xóa session gửi JWT server-only `token_use=revocation`, TTL 60 giây, đến `/api/v1/auth/identity/revoke`. Spring không nhận identity passport ở endpoint này và không nhận revocation passport ở exchange. Ledger `iam.auth_revocations` giữ `sid` đã revoke hoặc cutoff toàn identity khi reset mật khẩu. Ledger có thể tồn tại trước user IAM, vì vậy không FK tới users. Advisory lock theo identity sắp thứ tự exchange/revoke; hash `issuer|jti` chặn passport replay kể cả khi compact JWT đổi encoding.

[Fact] Reset mật khẩu gửi cutoff trước khi tiêu thụ reset token, rồi revoke từng identity session khi xóa. Toàn bộ HTTP reset handler của Better Auth chạy trong transaction schema `auth`, vẫn dùng router kiểm Origin/rate limit/validation. Signing key được provision/rotate trước transaction để Spring đọc JWKS committed. Body giới hạn 8 KiB và 5 giây trước khi lấy DB connection. Nếu thông báo sau bị lỗi, password/reset token/identity sessions rollback để retry; IAM revocations đã nhận vẫn có hiệu lực để đóng quyền truy cập. Natural expiry cleanup không phát thông báo logout.

## Vận hành và bằng chứng

[Fact] Public frontend/API cần cùng hostname vì cookie host-only phải đến được Next.js server guard; local khác port vẫn hoạt động. HTTPS bật `VEY_AUTH_COOKIE_SECURE=true`. `VEY_API_INTERNAL_URL` dành cho server-to-server; public proxy `/api/v1` về Spring. Không query trực tiếp schema auth từ Spring.

[Fact] Ngày 2026-10-15: 64 backend test, 112 frontend unit test, 9 browser smoke/UI test và 1 lifecycle browser test đều pass; formatting/lint/typecheck/build pass. Backend có regression cho invalid passports, purpose confusion, replay với encoding khác, revocation trước provisioning, concurrency exchange/revoke, membership isolation, method security theo active workspace, migrations và persistence. `bun run test:auth` dùng DB riêng, Next.js/Spring thật và hai thiết bị; lỗi notification thứ hai của reset đã chứng minh password/token/session rollback, retry thành công và IAM giữ revoke. README chứa lệnh chạy lại.

[Fact] Trong lượt kiểm tra dependency, `bun audit` báo 11 advisory trên dependency có sẵn (1 critical, 5 high, 4 moderate, 1 low), không có advisory Better Auth trong output. Đây chưa phải dependency audit sạch và cần xử lý riêng trước production; không đổi dependency ngoài scope chỉ để làm xanh báo cáo.

[Fact] Người dùng đã báo manual check theo kịch bản VEY-14 pass toàn bộ. Đây là kết quả do người dùng xác nhận; review ngoài do người dùng thực hiện riêng.

[Cần xác minh] Cấu hình OAuth/Resend trên môi trường production cần được kiểm tra tại môi trường đó. Enterprise SSO, workspace administration và billing ngoài scope VEY-14.
