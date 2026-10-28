# Quản lý Secrets trong ứng dụng Angular

> Nguồn: https://angular.dev/tools/cli/environments — https://angular.dev/guide/http — https://12factor.net/config

## Nguyên tắc số một: frontend không có secret

Mọi thứ nằm trong bundle Angular đều **đọc được bởi người dùng**. Build đã minify, biến số thành mã khó đọc — nhưng chỉ cần mở DevTools → Sources, hoặc vào tab Network là thấy hết:

```bash
# 30 giây để "bẻ khóa" key giấu trong bundle
curl -s https://app.example.com/main.js | grep -oE "AIza[A-Za-z0-9_-]{30,}"
```

Vì vậy, phân loại trước:

| Loại | Ví dụ | Đặt ở đâu |
|---|---|---|
| **Secret thật** | API key của Stripe/PayOS (server-side), DB password, JWT signing key, SMTP password | **Chỉ server** — env var, secret manager |
| **Key công khai** | Firebase/Pusher publishable key, Google Maps key (chặn theo referrer) | `environment.ts` — chấp nhận được |
| **Config thông thường** | URL API, feature flag, timeout | `environment.ts` hoặc runtime config |

> Publishable key (Firebase...) được thiết kế để lộ — bảo mật nằm ở **quyền hạn của key trên server** và các giới hạn (domain/HTTP referrer, App Check). API key server-side thì **không bao giờ** xuất hiện trong frontend, kể cả key "chỉ dùng cho test".

## Sai lầm phổ biến: giấu key trong environment.ts

```typescript
// ❌ environments/environment.prod.ts
export const environment = {
  production: true,
  stripeSecretKey: 'sk_live_...',   // sẽ nằm trong main.js
  dbPassword: 'hunter2',            // sẽ nằm trong main.js
};
```

`ng build` chỉ là **thay text** vào bundle — không mã hóa, không che giấu. .gitignore cũng không cứu được key đã commit: vào GitHub search tên key là ra. Nếu lỡ commit: **revoke và xoay key ngay**, history vẫn còn đó.

## Kiến trúc đúng: secret nằm sau backend

```
Angular (public) ── HTTPS ──► API Backend (secret) ──► Thanh toán, DB, LLM...
                              ▲
                       key nằm ở đây
```

- Angular chỉ gọi API của **chính bạn** (`/api/payments`); server đích đến gọi service bên thứ ba với secret giữ ở env var.
- Cần gọi service third-party trực tiếp từ browser? Đi qua **backend-for-frontend (BFF)**: một endpoint mỏng giữ key, kèm rate-limit và kiểm tra session.

```typescript
// ❌ key nằm trong client
this.http.post('https://api.openai.com/v1/chat', { prompt }, {
  headers: { Authorization: `Bearer ${environment.openAiKey}` },
});

// ✅ gọi endpoint trung gian của mình — key ở server
this.http.post('/api/chat', { prompt });
```

## Environment trong Angular v22

Angular CLI sinh `environments/` khi bạn bật tùy chọn qua `ng g environments` (từ v15 environment không sinh mặc định). Dùng để chứa **cấu hình công khai**:

```bash
ng generate environments
```

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  googleMapsKey: 'AIza...-dev-key-chỉ-hoạt-động-với-localhost',
};
```

```bash
# build production tự thay file theo fileReplacements trong angular.json
ng build --configuration production
```

> Chỉ đặt trong `environment.*.ts` những thứ đã được phân loại "công khai" ở bảng trên. Muốn cấm git commit cấu hình thật: giữ `environment.prod.ts` chỉ chứa placeholder, inject giá trị thật lúc deploy.

## Runtime config — một bundle, nhiều môi trường

Cách build một lần cho mọi môi trường (container/k8s): inject config lúc **khởi động**, đọc từ `window` hoặc file JSON mount vào.

```typescript
// runtime-config.ts
import { HttpClient } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';

export const RUNTIME_CONFIG_URL = '/assets/config.json';

export function provideRuntimeConfig() {
  return provideAppInitializer(async () => {
    const http = inject(HttpClient);
    const config = await firstValueFrom(http.get(RUNTIME_CONFIG_URL));
    (window as any).__APP_CONFIG__ = config;   // hoặc đưa vào InjectionToken
  });
}
```

```typescript
// app.config.ts
providers: [provideRuntimeConfig(), provideHttpClient()];
```

```json
// assets/config.json — mount từ k8s ConfigMap, không commit vào repo
{ "apiUrl": "https://api.example.com", "featureX": true }
```

Từ Angular v20, `provideAppInitializer` là cách hiện đại thay `APP_INITIALIZER` — trả về Promise/Observable, Angular chờ hoàn tất trước khi bootstrap.

## Secrets trong CI/CD và container

- **Không commit** file env thật; commit `.env.example` với placeholder.
- CI (GitHub Actions): dùng **repository secrets**, inject lúc deploy — không in ra log:

```yaml
# .github/workflows/deploy.yml
- name: Render config
  run: |
    echo '{"apiUrl":"'$API_URL'"}' > dist/app/browser/config.json
  env:
    API_URL: ${{ secrets.PROD_API_URL }}
```

- Container: truyền secret qua runtime (k8s Secret, docker secret), **không** `ENV` vào image — image cũ/ai kéo được image là đọc được.
- Cục dev: `.env` vào `.gitignore`; dùng dotenv ở server, nhưng chỉ load biến có prefix cho phép sang client nếu thật sự cần.

## Key công khai vẫn phải giới hạn

Kể cả key "được phép lộ", luôn thêm lớp giới hạn:

- Google Maps: chặn theo HTTP referrer + quota.
- Firebase: Security Rules chặt, bật **App Check** để chỉ app thật dùng được key.
- Chạy `npm audit`/bật Dependabot — key hợp lệ + dependency độc là combo thường gặp trong các vụ leak.

## Checklist

- [ ] `grep -r` token/key trên `dist/` trước khi deploy (thêm vào CI pipeline).
- [ ] Secret thật chỉ nằm ở server: env var, secret manager, không trong bundle.
- [ ] Một bundle cho mọi môi trường: dùng runtime config thay `environment.prod`.
- [ ] Key công khai có giới hạn domain/referrer/quota.
- [ ] Lệch tay lộ key? Xoay ngay + audit lịch sử git.

## Tham khảo

- [Angular — Configure application environments](https://angular.dev/tools/cli/environments)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App — Config](https://12factor.net/config)
- [Angular — provideAppInitializer](https://angular.dev/api/core/provideAppInitializer)
