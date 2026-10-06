# SSR and Non-Destructive Hydration (Angular 16 - Developer Preview)

> Angular 16 thêm support cho non-destructive hydration (Developer Preview) - SSR hiệu quả hơn, không flickering, cải thiện Core Web Vitals (con số 45% là minh họa từ blog official, không phải cam kết cho mọi app).

## Cài đặt

```bash
# Thêm SSR (rutime Angular 16 dùng @nguniversal/express-engine)
ng add @nguniversal/express-engine
```

> Ghi chú: từ Angular 17+ mới có package `@angular/ssr` với lệnh `ng generate @angular/ssr:ng-add`. Doc này giữ lệnh v16 để tránh lạc chủ đề.

## SSR Setup - tách server/client đúng

```ts
// app.config.ts (client)
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideRouter(routes)
  ]
};
```

```ts
// app.config.server.ts (server)
import { provideServerRendering } from '@angular/platform-server';

export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};
```

> Không gộp `provideServerRendering()` + `provideClientHydration()` chung một `appConfig` cho cả 2 môi trường. `provideServerRendering()` chỉ dùng ở server config, `provideClientHydration()` chỉ dùng ở client config.

Nguồn official:
- https://angular.dev/guide/ssr
- https://angular.dev/guide/hydration
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## Tại sao dùng SSR?

```
Client-Side Rendering (CSR):
  Browser → Download JS → Execute → Render HTML → Display
  (Slow: user sees blank screen)

Server-Side Rendering (SSR):
  Browser → Request → Server render HTML → Display → Download JS → Hydrate
  (Fast: user sees content immediately)
```

| Metric (số minh họa, không phải cam kết cho mọi app) | CSR | SSR |
|--------|-----|-----|
| First Contentful Paint | 3.5s | 1.2s |
| Largest Contentful Paint | 5.0s | 2.1s |
| Cumulative Layout Shift | 0.25 | 0.05 |
| SEO | Poor | Excellent |

> Bảng số trên chỉ mang tính minh họa flow CSR vs SSR, không phải benchmark chính thức cho mọi project.

## Non-Destructive Hydration

Trước Angular 16, SSR có vấn đề: screen flickering và poor Core Web Vitals. Angular 16 solves this:

```ts
// Bật hydration
bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(),
    provideRouter(routes)
  ]
});
```

**Cơ chế hoạt động:**
```
Server Render → Browser receives HTML → Display immediately
                ↓
Client JS downloads → Bootstrap → Match existing DOM nodes
                                  ↓
                         Add event listeners
                         Enrich with client capabilities
                         (NOT re-create DOM!)
```

## Skip Hydration

Một số components dùng direct DOM manipulation cần skip hydration:

```html
<!-- Component skip hydration -->
<test-component ngSkipHydration />
```

```ts
@Component({
  template: `...`,
  host: { ngSkipHydration: 'true' }
})
export class TestComponent {
  // Direct DOM manipulation
  constructor(private el: ElementRef) {}

  updateDOM() {
    this.el.nativeElement.innerHTML = '<p>Updated</p>';
  }
}
```

> ⚠️ Cảnh báo: component gắn `ngSkipHydration` sẽ bị **destroy + re-render lại từ đầu ở client** thay vì reuse DOM từ server. Nếu gắn ở root component nghĩa là **tắt hydration cho toàn app**. Chỉ dùng cho component lẻ thao tác DOM trực tiếp, không dùng đại trà.

Nguồn official:
- https://angular.dev/guide/hydration#skip-hydration-for-particular-components
- https://angular.dev/guide/ssr

## Flow Diagram

```
Traditional SSR (pre-16):
  Server render → Client display → Client JS load → Destroy DOM → Recreate DOM
  (Flickering + poor performance)

Non-Destructive Hydration (16+, Developer Preview):
  Server render → Client display → Client JS load → Reuse DOM → Add event listeners
  (No flickering + LCP cải thiện - con số 45% trong blog official chỉ là minh họa)
```

## HttpClient transfer cache (tránh fetch 2 lần)

```ts
// app.config.ts (client) + app.config.server.ts (server)
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ]
};
```

> Request GET qua `HttpClient` ở server sẽ được cache vào `TransferState` và tái dùng ở client, tránh gọi API 2 lần.

## Ràng buộc khi dùng hydration (v16 Developer Preview)

- HTML từ server phải **valid** (cấu trúc khớp giữa server/client, tránh thẻ lồng sai), nếu không hydration thất bại và fallback sang re-render.
- Tránh **thao tác DOM trực tiếp** (`innerHTML`, lib chart/canvas...) trong component có hydration - dùng `ngSkipHydration` cho các node đó.
- Mở DevTools console để kiểm tra log `Angular hydrated N components` và các lỗi mismatch DOM; fix mismatch trước khi đo performance.
- CSP `nonce`: nếu site dùng Content Security Policy, truyền nonce cho Angular qua token `CSP_NONCE` để script/style của hydration không bị chặn:

```ts
bootstrapApplication(AppComponent, {
  providers: [{ provide: CSP_NONCE, useValue: globalThis.myRandomNonceValue }]
});
```

Nguồn official:
- https://angular.dev/guide/ssr
- https://angular.dev/guide/hydration
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## Best Practices

1. **Enable hydration** – Luôn dùng `provideClientHydration()` với SSR
2. **Skip hydration** – Cho components dùng direct DOM manipulation
3. **Test hydration errors** – Check browser console
4. **Monitor Core Web Vitals** – Đảm bảo performance improvement

## Reference

- https://angular.dev/guide/ssr
- https://angular.dev/guide/hydration
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://v16.angular.io/guide/hydration

---

**Summary**: Non-destructive hydration trong Angular 16 (Developer Preview) giúp SSR hiệu quả hơn bằng cách reuse existing DOM thay vì destroy và recreate. Kết quả minh họa: không flickering, LCP cải thiện (con số 45% trong blog official chỉ là ví dụ), và better SEO.