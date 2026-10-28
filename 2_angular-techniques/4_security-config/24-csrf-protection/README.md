# Chống CSRF (Cross-Site Request Forgery) trong Angular

> Nguồn: https://angular.dev/best-practices/security#csrf — https://developer.mozilla.org/en-US/docs/Web/Security/CSRF

## CSRF là gì?

CSRF là tấn công khai thác việc **trình duyệt tự động gửi kèm cookie** trong mọi request đến một domain. Giả sử:

1. Bạn đã đăng nhập `bank.example`, session cookie đã lưu trong trình duyệt.
2. Bạn truy cập một site độc hại, site này có form tự submit về `bank.example/transfer`.
3. Trình duyệt gửi request kèm **cookie đăng nhập hợp lệ** → server tưởng là bạn và thực hiện chuyển tiền.

> Kẻ tấn công không đọc được response (Same-Origin Policy chặn), nhưng đã khiến hành động được thực thi với danh nghĩa của bạn. Đây là điểm mấu chốt: CSRF không cần đọc dữ liệu, chỉ cần "mượn tay" trình duyệt.

### Điều kiện để CSRF xảy ra

- Server xác thực bằng **cookie** (session cookie, JWT trong cookie...).
- Cookie được gửi tự động (không có SameSite chặt, hoặc request từ cùng site).
- Hành động quan trọng được thực hiện bằng request đơn giản (POST/GET thay đổi state) **mà không yêu cầu gì chỉ có trang thật mới biết**.

## Cơ chế phòng chống

### 1. Double-submit cookie (cách Angular làm mặc định)

Server set một cookie ngẫu nhiên **không** phải cookie đăng nhập, ví dụ `XSRF-TOKEN`. Client đọc giá trị cookie đó và gửi lại trong header `X-XSRF-TOKEN`. Server so sánh hai giá trị:

- Hacker ở domain khác **không thể đọc cookie** của `bank.example` (Same-Origin Policy), cũng không thể **đặt** cookie cho domain đó → không làm giả được header này.

### 2. SameSite cookie

Server set `SameSite=Lax` (mặc định của các trình duyệt hiện đại) hoặc `SameSite=Strict`: cookie không được gửi kèm trong cross-site request. Đây là lớp phòng thủ mạnh nhất hiện nay, nhưng vẫn nên kết hợp token vì có browser cũ và các cạnh biên (subdomain).

### 3. Yêu cầu xác thực lại cho hành động nhạy cảm

Với thao tác tiền/tài khoản: yêu cầu nhập lại mật khẩu/OTP. Không kỹ thuật nào thay thế được lớp này.

## Angular có sẵn chống CSRF

`HttpClient` đọc cookie `XSRF-TOKEN` và tự gửi header `X-XSRF-TOKEN` cho **mọi** request ra cùng origin. Bạn gần như không cần code gì:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      // Tùy chỉnh tên nếu server dùng tên khác mặc định
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
  ],
};
```

| Mặc định | Giá trị |
|---|---|
| Cookie server set | `XSRF-TOKEN` |
| Header client gửi | `X-XSRF-TOKEN` |
| Request được áp dụng | cùng origin (`GET/HEAD` bị loại trừ một phần) |

> **Lưu ý**: cơ chế này chỉ hoạt động khi server **đã set cookie `XSRF-TOKEN`**. Angular không tự sinh token — server mới là bên sinh và kiểm tra. Nếu server không set, bạn cần bật ở server (Spring Security, ASP.NET Antiforgery, Express `csurf`/tự triển khai...).

## Ví dụ đầy đủ (Express làm server)

```typescript
// Server (Node/Express) — sinh token và kiểm tra
import crypto from 'node:crypto';

app.use((req, res, next) => {
  if (!req.cookies['XSRF-TOKEN']) {
    res.cookie('XSRF-TOKEN', crypto.randomBytes(32).toString('hex'), {
      httpOnly: false,           // client cần đọc được để gửi lại header
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }
  next();
});

app.use('/api', (req, res, next) => {
  const cookie = req.cookies['XSRF-TOKEN'];
  const header = req.get('X-XSRF-TOKEN');
  if (req.method !== 'GET' && (!cookie || cookie !== header)) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  next();
});
```

```typescript
// Client (Angular) — không cần code thêm, chỉ đảm bảo withCredentials khi cross-origin
this.http.post('/api/transfer', { amount: 100 }, { withCredentials: true });
```

## Các lỗi thường gặp

- **Cookie `httpOnly` cho XSRF token**: client JavaScript không đọc được → không gửi lại được header. Token CSRF phải đọc được từ JS (không phải secret, chỉ là giá trị so khớp).
- **Quên SameSite khi set session cookie**: mở đường tấn công ngay cả khi đã có token.
- **Chỉ chống CSRF ở một số route**: mọi endpoint thay đổi state đều phải kiểm tra.
- **CORS lỏng lẻo (`Access-Control-Allow-Origin: *` với credentials)**: kết hợp cookie xác thực thì vô hiệu hóa mọi lớp phòng còn lại.
- **GET làm thay đổi state**: nhiều hệ thống lọc CSRF bỏ qua GET → tuyệt đối không dùng GET để đổi dữ liệu.

## Checklist

- [ ] Server set cookie `XSRF-TOKEN` (`SameSite=Lax`, `Secure`).
- [ ] `provideHttpClient(withXsrfConfiguration(...))` nếu đổi tên mặc định.
- [ ] Server so khớp cookie ↔ header trên mọi request đổi state.
- [ ] Cookie xác thực `SameSite=Lax`/`Strict`, `HttpOnly`, `Secure`.
- [ ] Hành động nhạy cảm yêu cầu xác thực lại (OTP/mật khẩu).

## Tham khảo

- [Angular — Security: CSRF](https://angular.dev/best-practices/security#csrf)
- [MDN — Cross-Site Request Forgery](https://developer.mozilla.org/en-US/docs/Web/Security/CSRF)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
