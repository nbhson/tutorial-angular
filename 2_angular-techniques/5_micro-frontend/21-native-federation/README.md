# Native Federation — Cách tiếp cận hiện tại cho Angular 22

> Nguồn: https://native-federation.com — https://angular.dev/tools/cli/build-system-migration — blog.angular.dev "Micro Frontends with Angular and Native Federation"

## Tại sao cần Native Federation?

Từ Angular 17, CLI dùng **esbuild-based ApplicationBuilder** thay webpack — build nhanh hơn nhiều, nhưng cũng đồng nghĩa **Module Federation (webpack) không còn cách chạy trực tiếp**. Native Federation của Manfred Steyer (@angular-architects) giải quyết vấn đề này:

> **Cùng mental model của Module Federation (host, remote, shared dependencies) nhưng cài đặt bằng chuẩn web: ES Modules + Import Maps** — không phụ thuộc bundler nào.

Ưu điểm cốt lõi:

- **Tách khỏi bundler**: không dính webpack, theo kịp mọi cải tiến của Angular CLI (esbuild, SSR, hydration).
- **Web standards**: import maps + dynamic import — browser runtime hiểu bản chất, không cần "runtime giấu kỹ thuật".
- **SSR & Incremental Hydration** được hỗ trợ chính thức (từ v18 của adapter), i18n từ v19.
- **API tương đồng**: schematics gần như giống Module Federation plugin — chuyển đổi chủ yếu là đổi import path.

Phiên bản tương ứng (đã xác minh trên npm, 10/2026):

| Angular | Adapter |
|---|---|
| 22.x | `@angular-architects/native-federation` (v4, package gốc quay lại) |
| 20–21 | `@angular-architects/native-federation-v4` (bridge package) |
| ≤ 19 | `@angular-architects/module-federation` (v3, webpack) |

> Từ Angular 22, adapter v4 quay lại tên gốc — **bỏ `-v4`** khi nâng cấp: `ng update @angular-architects/native-federation`.

## Cài đặt và scaffold

```bash
# 1. Cài adapter (devDependency)
npm i -D @angular-architects/native-federation

# 2. Biến app thành host hoặc remote
ng g @angular-architects/native-federation:init --project shell --port 4200 --type dynamic-host
ng g @angular-architects/native-federation:init --project mfe1 --port 4201 --type remote
```

Schematic `init` tự động:

- Thêm `es-module-shims` vào polyfills (hỗ trợ import maps cho browser cũ).
- Sinh `federation.config.mjs` và `tsconfig.federation.json`.
- Đổi `build`/`serve` trong `angular.json` sang builder `@angular-architects/native-federation:build` — builder này **ủy quyền cho** `@angular/build:application`, bạn giữ nguyên mọi tối ưu của CLI.
- Tách `main.ts` thành bootstrap federation + `bootstrap.ts` (Angular app thật).

```javascript
// federation.config.mjs — remote
import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'mfe1',
  exposes: {
    './Routes': './src/app/flights/flights.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: [],
});
```

```javascript
// federation.config.mjs — host (dynamic host)
import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) },
});
```

```typescript
// src/main.ts — host khai báo remotes lúc runtime
import { initFederation } from '@angular-architects/native-federation';

initFederation({
  'mfe1': 'http://localhost:4201/remoteEntry.json',
})
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
```

## Load remote component/route vào host

```typescript
// app.routes.ts — host
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'flights',
    loadChildren: () =>
      loadRemoteModule('mfe1', './Routes').then((m) => m.FLIGHTS_ROUTES),
  },
  { path: '', redirectTo: 'flights', pathMatch: 'full' },
];
```

> Khác webpack MF (`remoteEntry.js`), Native Federation expose **`remoteEntry.json`** — một manifest mô tả ES modules và import maps. Orchestrator đọc manifest, negotiate phiên bản shared dependency, rồi **chèn import map vào trang** và load remote bằng native `import()`.

## Orchestrator runtime (v4, hiện tại)

Từ v4, runtime được tách thành `@softarc/native-federation-orchestrator` (4.8.x):

- **Một build mỗi package** — Orchestrator 4.8 bỏ "stitching", mỗi shared lib build một lần rồi tái sử dụng, giảm thời gian build đáng kể.
- **Version negotiation semver-aware**: nếu host và remote cần hai major khác nhau, runtime tải **cả hai phiên bản** thay vì nổ — bạn chọn chấp nhận hai bản hoặc ép chuẩn hóa.
- Endpoint điều khiển: host gọi `initFederation(manifest)`, remote được mount như ES module thường.

## Angular 22 specifics

- App mới (`ng new`) từ v22 là **standalone + zoneless mặc định** — Native Federation hỗ trợ cả hai; remotes zoneless chạy tốt trong host zoneless.
- **SSR**: hỗ trợ đầy đủ; thiết lập SSR cho host và từng remote, adapter xử lý hydration xuyên federation.
- **I18N**: `shareAngularLocales` trong config để share locale packs.

```typescript
// Kiểm tra host/remote có chung phiên bản Angular không — script chạy lúc deploy
// npx @angular-architects/native-federation:build --project shell --version-check
```

## Ví dụ chạy thử (2 terminal)

```bash
# Workspace
ng new mf-tutorial --no-create-application
cd mf-tutorial
ng generate application shell --routing
ng generate application mfe1 --routing

# Federation
npm i -D @angular-architects/native-federation
ng g @angular-architects/native-federation:init --project mfe1 --port 4201 --type remote
ng g @angular-architects/native-federation:init --project shell --port 4200 --type dynamic-host

# Terminal 1 — remote trước
ng serve mfe1 -o
# Terminal 2 — host sau
ng serve shell -o
```

## Deploy trong production

- Mỗi app deploy riêng (CDN, container, Netlify...); chỉ cần host biết **URL của `remoteEntry.json`** — có thể đưa vào file manifest riêng để đổi không cần build lại shell:

```typescript
// manifest thay vì hardcode — deploy "version registry" như một JSON tĩnh
await initFederation('/assets/federation-manifest.json');
// federation-manifest.json: { "mfe1": "https://cdn.example.com/mfe1/remoteEntry.json" }
```

- Shared dependency: chỉ bundle một lần (host giữ), remote không đóng gói Angular → bundle remote nhẹ đi đáng kể so với mỗi app tự bundle.
- CDN cache: cache dài hạn cho chunk có hash; `remoteEntry.json` + manifest đặt `no-cache`.

## So sánh nhanh với Module Federation (webpack)

| Tiêu chí | Native Federation v4 | Module Federation (webpack) |
|---|---|---|
| Build tool | esbuild (chuẩn Angular 22) | webpack/rspack |
| Chuẩn runtime | ES Modules + Import Maps | Custom JS runtime |
| SSR / hydration | ✅ | ❌ (cần cách khác) |
| Package ngang Angular | 22.x | n/a |
| Tương thích Angular 22 | ✅ | Chỉ qua rspack/MF 2.0 |

## Lỗi thường gặp

- **Dùng `-v4` trên Angular 22** → vẫn chạy được nhưng đây là package bridge; chuẩn là package gốc `@angular-architects/native-federation` 22.x.
- **Quên khởi động remote trước host** trong dev → host không load được manifest (tinh chỉnh `ng serve` port khớp manifest).
- **Share quá tay**: chỉ `shareAll` khi demo; production nên `share` theo từng package để tránh bundle phình.
- **Thư viện CommonJS cũ** không tương thích chia sẻ — cần polyfill/adapter hoặc không share.

## Checklist

- [ ] Adapter cùng major với Angular CLI (22.x cho Angular 22).
- [ ] `remoteEntry.json` + federation manifest được deploy và không cache.
- [ ] Version registry để nâng cấp remote độc lập.
- [ ] SSR được kiểm thử nếu host bật SSR.

## Tham khảo

- [Native Federation — docs chính thức](https://native-federation.com)
- [Angular Adapter v4](https://native-federation.com/docs/v4/angular-adapter/)
- [Tutorial — Angular 22 + Native Federation](https://native-federation.com/docs/v4/tutorial/)
- [blog.angular.dev — Micro Frontends with Angular](https://blog.angular.dev/micro-frontends-with-angular-and-native-federation-7623cfc5f413)
