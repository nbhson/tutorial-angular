# CSP (Content Security Policy) và CORS cho Angular

> Nguồn: https://angular.dev/best-practices/security — https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

## Content Security Policy (CSP)

CSP là một **HTTP response header** (hoặc thẻ `<meta>`) ra lệnh cho trình duyệt: script/style/ảnh/frame chỉ được tải từ những nguồn được liệt kê. Đây là lớp phòng thủ hiệu quả nhất chống XSS — kể cả khi kẻ tấn công nhúng được `<script>` vào DOM, trình duyệt vẫn không chạy nó.

### CSP cơ bản cho app Angular

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://cdn.example.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
```

Giải thích từng chỉ thị quan trọng:

| Chỉ thị | Ý nghĩa |
|---|---|
| `default-src 'self'` | Mặc định chỉ cho phép nguồn cùng origin |
| `script-src 'self'` | JS chỉ được tải từ chính app — **không** có `'unsafe-inline'`, không `eval` |
| `style-src` | CSS; Angular CLI có thể sinh style inline lúc bootstrap, thường cần `'unsafe-inline'` hoặc nonce |
| `connect-src` | các domain API được phép gọi (fetch/XHR/WebSocket) |
| `frame-ancestors 'none'` | chống clickjacking — không cho app bị nhúng vào iframe |
| `object-src 'none'` | chặn `<object>/<embed>` (vector cài Flash/plugin cũ) |

### CSP với Vite dev server

Trong môi trường dev, Vite inject script qua `eval` và WebSocket HMR, nên CSP chặt sẽ phá dev server. Thông thường:

- **Dev**: không set CSP (hoặc chỉ set CSP report-only).
- **Production**: set CSP bằng header từ server/CDN/reverse proxy (nginx, Cloudflare, Netlify headers...).

### Chế độ report-only để thử nghiệm

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violations
```

Trình duyệt chỉ **báo cáo** vi phạm chứ không chặn — dùng để phát hiện những nguồn bạn quên liệt kê trước khi bật chặn thật.

### CSP trong Angular 22

- Angular render style inline lúc runtime (khi client load chunk CSS) → có thể cần `'unsafe-inline'` cho `style-src`, hoặc dùng nonce nếu server của bạn hỗ trợ render header theo request.
- Tránh `eval`/`new Function` trong code và thư viện — với CSP `script-src 'self'` không có `'unsafe-eval'`, những đoạn này sẽ nổ.
- Cân nhắc thêm header bổ trợ: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

```nginx
# nginx — set CSP cho static files của Angular
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'" always;
```

```json
// angular.json — CSP qua thẻ meta trong index.html (kém an toàn hơn header, dùng khi không kiểm soát được server)
// <meta http-equiv="Content-Security-Policy" content="default-src 'self'; ...">
```

## CORS (Cross-Origin Resource Sharing)

CORS là cơ chế **server** cho phép browser gọi API từ origin khác. Browser tự chặn response nếu thiếu header phù hợp — Angular không thể "tắt" CORS từ phía client, và đây là việc đúng đắn: CORS là chính sách của server, không phải của app.

### Chuỗi handshake

1. Với request "không đơn giản" (PUT/DELETE, header tùy chỉnh, content-type JSON...), browser gửi trước một **preflight OPTIONS**.
2. Server phải trả lời `Access-Control-Allow-Origin` (và `Access-Control-Allow-Methods`, `-Headers`, `-Credentials` nếu cần).
3. Request thật chỉ được thực thi khi preflight thành công.

### Lỗi phổ biến trên console

```text
Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:4200'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

Cách xử lý **đúng** là sửa ở server:

```typescript
// Express
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));
```

### Dev proxy — cách xử lý ở phía Angular

Không bắt server production đích nào cấu hình CORS cho `localhost`. Dùng proxy của Angular CLI để browser tưởng request là same-origin:

```json
// proxy.conf.json
{
  "/api": {
    "target": "https://api.example.com",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": { "^/api": "" }
  }
}
```

```bash
ng serve --proxy-config proxy.conf.json
```

```json
// angular.json (v22)
{
  "projects": {
    "app": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

> Với proxy này, code Angular chỉ gọi `/api/users` — same-origin, không preflight, không lộ domain API thật. Khi lên production, reverse proxy (nginx) làm vai trò tương tự.

## Mối quan hệ CSP ↔ CORS ↔ CSRF

| Kỹ thuật | Chống gì | Nơi cấu hình |
|---|---|---|
| CSP | XSS (chặn script lạ), clickjacking | Header/meta của **trang** |
| CORS | Đọc response từ origin khác (chống đọc dữ liệu, không chống "mượn tay") | **Server API** |
| CSRF token | Làm giả request với cookie xác thực | Server + HttpClient |

> CORS **không** chống CSRF: request vẫn được gửi đi đầy đủ, chỉ là response bị chặn đọc. Muốn chống CSRF thì xem bài [24-csrf-protection](../24-csrf-protection/README.md).

## Checklist

- [ ] Production set CSP bằng HTTP header (không chỉ meta tag).
- [ ] `script-src` không có `'unsafe-inline'`/`'unsafe-eval'`.
- [ ] `frame-ancestors 'none'` để chống clickjacking.
- [ ] CORS ở server: whitelist origin cụ thể, không dùng `*` kèm credentials.
- [ ] Dev dùng `proxy.conf.json` thay vì mở CORS cho localhost.

## Tham khảo

- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Angular — Security](https://angular.dev/best-practices/security)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
