# SSR & Hybrid Rendering v22 (CSR/SSR/SSG + Hydration)

> Nguồn: https://angular.dev/guide/ssr, /guide/hydration, /guide/incremental-hydration — repo cũ chỉ có `8-angular-universal`, `4_angular-17/1_hyration`

## Tổng quan
Mặc định app là CSR. Hybrid rendering cho phép chọn từng route: `Client` (CSR), `Server` (SSR), `Prerender` (SSG), cấu hình trong `app.routes.server.ts` bằng `RenderMode`.

## Điểm chính
- `ng new --ssr` (mới) hoặc `ng add @angular/ssr` (app cũ).
- `RenderMode.Client/Server/Prerender`; prerender tham số qua `getPrerenderParams`, fallback `PrerenderFallback.Client/Server/None`.
- Hydration: `provideClientHydration()`; incremental hydration với `@defer (hydrate on ...)`; Http transfer-cache tránh fetch trùng.
- Viết code tương thích server: tránh `window/document` trực tiếp, dùng `afterNextRender`, `DOCUMENT`, `REQUEST` tokens.

## Ví dụ Code
```bash
ng new my-app --ssr
ng add @angular/ssr
```

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'post/:id', renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const svc = inject(PostService);
      return (await svc.getIds()).map(id => ({ id }));
    } },
  { path: '**', renderMode: RenderMode.Server },
];
```

```typescript
// app.config.server.ts
import { provideServerRendering, withRoutes } from '@angular/ssr';
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};
```

```typescript
// app.config.ts — hydration + transfer cache
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
bootstrapApplication(App, {
  providers: [provideClientHydration(
    withHttpTransferCacheOptions({ includeHeaders: ['ETag'] })
  )],
});
```

```html
<!-- incremental hydration -->
@defer (hydrate on viewport) { <app-heavy /> }
```

## Tham khảo
- [Server and hybrid rendering](https://angular.dev/guide/ssr)
- [Hydration](https://angular.dev/guide/hydration) · [Incremental Hydration](https://angular.dev/guide/incremental-hydration)
