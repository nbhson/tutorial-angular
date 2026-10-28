# SSR với @angular/ssr (thay thế Angular Universal)

> Nguồn: https://angular.dev/guide/ssr — https://angular.dev/guide/hydration — https://angular.dev/tools/cli/ssr

## Angular Universal đã được thay thế

`@nguniversal/*` packages (Angular Universal) đã ngừng phát triển từ Angular 19 và được thay thế chính thức bằng **`@angular/ssr`** — server-side rendering tích hợp sẵn vào Angular CLI và ApplicationBuilder (esbuild). Tên gọi chính thức hiện nay là **Server-Side Rendering (SSR)**, không còn "Angular Universal".

```
Angular ≤ 16:   @nguniversal/express-engine (riêng biệt, config tay)
Angular 17+:    @angular/ssr (tích hợp CLI, `ng add @angular/ssr`)
Angular 22:     @angular/ssr + hybrid rendering (RenderMode per route)
```

## CSR vs SSR vs SSG — khi nào dùng gì

| | CSR | SSR | SSG (Prerender) |
|---|---|---|---|
| Render | Client (browser) | Server, mỗi request | Server, lúc build |
| TTFB | Chậm hơn (JS phải tải + chạy) | Nhanh | Nhanh nhất (static) |
| SEO | Kém (bot cần chạy JS) | Tốt | Rất tốt |
| Tải server | Thấp | Cao (mỗi request render) | Gần như không (CDN) |
| Phù hợp | Dashboard, app nội bộ | Trang động cá nhân hoá | Trang nội dung (blog, landing, docs) |

**Hybrid rendering**: mỗi route chọn một chế độ — trang landing prerender, trang `/products/:id` SSR, trang `/dashboard` CSR.

## Thiết lập với Angular CLI

```bash
# Project mới
ng new my-app --ssr

# Project cũ
ng add @angular/ssr
```

Lệnh này tự sinh:
- `app.config.server.ts` — config server, `provideServerRendering`
- `app.routes.server.ts` — khai báo `RenderMode` cho từng route
- `main.server.ts` — bootstrap server-side
- Server Express (trong `server.ts`) — có thể deploy với Node hoặc serverless

## app.routes.server.ts — hybrid rendering

```typescript
// app.routes.server.ts
import {
  RenderMode,
  ServerRoute,
  PrerenderFallback,
} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Trang nội dung tĩnh → build một lần, deploy static
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },

  // Trang động theo tham số — render lúc request
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client, // nếu prerender thất bại → CSR
    // Angular tự gọi hàm này để biết danh sách tham số cần prerender
    async getPrerenderParams() {
      const svc = inject(PostService);
      const ids = await svc.getIds();
      return ids.map((id) => ({ id }));
    },
  },

  // Trang cần request-time data → SSR
  { path: 'search', renderMode: RenderMode.Server },

  // Dashboard nội bộ → CSR thuần
  { path: '**', renderMode: RenderMode.Client },
];
```

```typescript
// app.config.server.ts
import { ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

```typescript
// app.config.ts — client, bật hydration
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag', 'Cache-Control'],
        includePostRequests: true,
      }),
    ),
  ],
};
```

## Hydration — tránh "flash" và re-render

Sau khi server trả HTML, client Angular **hydrates** — gắn event listener và dữ liệu lên DOM có sẵn thay vì render lại từ đầu:

- **Không hydration**: server render HTML → client tải JS → **xoá DOM và render lại** → flash nội dung, layout shift.
- **Có hydration**: client nhận diện DOM có sẵn, tái sử dụng trực tiếp — mượt hơn đáng kể về CLS/LCP.

```typescript
// Cấu hình hydration tối giản
provideClientHydration()

// Với incremental hydration (Angular 19+, ổn định ở v22):
// chỉ hydrate section khi cần, phần còn lại giữ tĩnh
```

```html
<!-- @defer kết hợp hydration -->
@defer (hydrate on viewport) {
  <app-heavy-comments [postId]="postId()" />
} @placeholder {
  <div class="comments-skeleton"></div>
}
```

Lợi ích incremental hydration so với hydration toàn trang: chỉ hydrate phần nhìn thấy (viewport), các phần còn lại giữ là HTML tĩnh đến khi người dùng tương tác — giảm JS chạy lúc đầu.

## Viết code tương thích server

```typescript
// ❌ LỖI khi SSR: window/document không tồn tại trên Node
@Component({...})
export class MyComponent {
  ngOnInit() {
    console.log(window.innerWidth);
  }
}

// ✅ sauNextRender — chạy chỉ ở client, sau khi render
export class MyComponent {
  private el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      // an toàn để dùng window ở đây
      this.setupChart(this.el.nativeElement);
    });
  }
}

// ✅ DOCUMENT token — thay document trực tiếp
export class MyComponent {
  private document = inject(DOCUMENT);
  title = this.document.title;
}
```

```typescript
// HTTP state — dùng với HttpClient + provideServerRendering
// Angular tự chờ Promise/Observable trả về, rồi render với data có sẵn
this.http.get('/api/products').subscribe(); // SSR tự xử lý
```

### `REQUEST` token — đọc thông tin request từ server

```typescript
import { REQUEST } from '@angular/ssr'; // hoặc REQUEST_CONTEXT

export class SeoComponent {
  private request = inject(REQUEST);
  userAgent = this.request.headers.get('user-agent');
}
```

## Build và deploy

```bash
ng build                    # build cả client + server
node dist/my-app/server/server.mjs   # chạy server Node
```

```json
// angular.json — SSR builder
{
  "projects": {
    "my-app": {
      "architect": {
        "server": {
          "builder": "@angular-devkit/build-angular:server-application",
          "options": {
            "outputPath": "dist/my-app/server",
            "main": "src/main.server.ts",
            "tsConfig": "tsconfig.app.json"
          }
        }
      }
    }
  }
}
```

Deploy với Docker / Cloud Run / Vercel / Netlify (Angular preset tự nhận diện SSR). Trước khi deploy, chạy `ng build` và test server locally.

## Chuyển từ Angular Universal cũ sang @angular/ssr

```bash
# 1. Xoá dependency cũ
npm uninstall @nguniversal/express-engine @nguniversal/builders

# 2. Cài mới
ng add @angular/ssr
```

Cần review lại: custom Express server (nếu có), config route render mode, hydration setting.

## Checklist

- [ ] Chọn RenderMode per route (Prerender/Server/Client), không để toàn bộ SSR một cách vô bổ.
- [ ] Bật `provideClientHydration()`.
- [ ] Không dùng `window`/`document` trong `ngOnInit` — dùng `afterNextRender`/`DOCUMENT`/`isPlatformBrowser`.
- [ ] Đã test chạy SSR (`ng build && node dist/.../server.mjs`) trước khi deploy.

## Tham khảo

- [angular.dev — Server-side rendering](https://angular.dev/guide/ssr)
- [angular.dev — Hydration](https://angular.dev/guide/hydration)
- [angular.dev — Incremental hydration](https://angular.dev/guide/incremental-hydration)
- [Bài 25 — SSR & Hybrid v22](../25-ssr-hybrid-v22/README.md)
