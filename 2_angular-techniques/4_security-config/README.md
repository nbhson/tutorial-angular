# Security & Configuration — Tổng quan

Bảo mật và cấu hình cho ứng dụng Angular v22. Bảo mật frontend luôn đi kèm backend — Angular chỉ là lớp đầu tiên.

| # | Folder | Chủ đề |
|---|---|---|
| 17 | [17-angular-secure-configuration/](17-angular-secure-configuration/README.md) | Cấu hình bảo mật (demo fix lỗi config) |
| 24 | [24-csrf-protection/](24-csrf-protection/README.md) | Chống CSRF: XSRF token tự động của HttpClient |
| 25 | [25-csp-cors/](25-csp-cors/README.md) | CSP (Content Security Policy) và CORS |
| 26 | [26-xss-sanitization/](26-xss-sanitization/README.md) | XSS & sanitization: `DomSanitizer`, `innerHTML` |
| 27 | [27-secrets-management/](27-secrets-management/README.md) | Quản lý secrets: không nhúng key vào bundle |

## Nguyên tắc vàng

1. **Tin tưởng mỗi khi render** — Angular tự escape; chỉ `bypassSecurityTrust*` khi thật sự hiểu rủi ro.
2. **Secrets không bao giờ nằm trong frontend** — mọi API key đều đọc được trong `main.js`.
3. **Defense in depth** — CSRF/CSP/cookie httpOnly là việc của server; Angular chỉ cấu hình phần client.
4. **Cập nhật dependency** — chạy `ng update` và audit định kỳ (`npm audit`).

## Tham khảo

- [Security — angular.dev](https://angular.dev/best-practices/security)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
