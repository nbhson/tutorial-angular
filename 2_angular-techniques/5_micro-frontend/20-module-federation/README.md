# Module Federation (Webpack/Rspack) cho Micro Frontends

> Nguồn: https://webpack.js.org/concepts/module-federation/ — https://module-federation.io — https://www.angulararchitects.io

## Module Federation là gì?

Module Federation (MF) là tính năng của **Webpack 5** (2020), cho phép một JavaScript app **tải code động từ một app khác lúc runtime** — dù hai app được build và deploy độc lập. Đây là nền tảng kỹ thuật cho micro frontend.

Khái niệm trung tâm:

| Khái niệm | Vai trò |
|---|---|
| **Host (shell)** | App chính, tiêu thụ module từ xa |
| **Remote** | App cung cấp module (component, service...) cho host |
| **Exposes** | Danh sách module remote công khai |
| **Shared** | Thư viện dùng chung (Angular, RxJS...) — load một lần, negotiate phiên bản |
| **Container** | Manifest mô tả remote, được runtime đọc khi load |

```javascript
// webpack.config.js — REMOTE (app mfe1)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe1',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/app/flights/flights.module.ts',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        rxjs: { singleton: true },
      },
    }),
  ],
};
```

```javascript
// webpack.config.js — HOST (shell)
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    mfe1: 'mfe1@http://localhost:4201/remoteEntry.js',
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    rxjs: { singleton: true },
  },
}),
```

```typescript
// Host — load remote module lúc runtime
import('mfe1/Module')
  .then((m) => m.FlightsModule)
  .then((routes) => router.config.push(...routes));
```

## Các quy tắc quan trọng

- **`singleton: true`** cho mọi package Angular: bắt buộc, vì Angular không cho chạy nhiều phiên bản framework song song trong cùng trang.
- **`strictVersion: true`**: cảnh báo/ném lỗi khi hai app build với phiên bản Angular khác nhau — tốt hơn là để lỗi runtime khó hiểu nổ ra sau này.
- **Không share trạng thái qua shared module**: mỗi remote giữ state riêng; giao tiếp qua API/service với hợp đồng rõ ràng.

## Trạng thái hiện tại (2026) — bạn nên dùng gì?

> **Quan trọng:** Angular đã chuyển hoàn toàn sang esbuild từ v17 (ApplicationBuilder) và không còn bundle bằng webpack. Với app Angular hiện đại (v20+), **Native Federation** là cách tiếp cận chuẩn — xem bài [21-native-federation](../21-native-federation/README.md). Module Federation "thuần" vẫn phù hợp trong các trường hợp sau:

1. **Workspace cũ còn dùng webpack builder** (`@angular-devkit/build-angular:browser` cho Angular ≤ 16).
2. **Trộn frontend đa framework**: Next.js (webpack), React app webpack, Angular cũ — dùng `@module-federation/enhanced` (MF 2.0) làm runtime chung.
3. **Backend-for-frontend style**: shell render trên Node bằng rspack/webpack federation.

Ví dụ cấu hình hiện đại với MF 2.0 (hỗ trợ rsbuild/rspack, build nhanh hơn webpack thuần):

```javascript
// rspack/rsbuild — dùng @module-federation/enhanced
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe1',
      exposes: { './Module': './src/app/flights/flights.module.ts' },
      shared: { '@angular/core': { singleton: true } },
    }),
  ],
};
```

## Cấu trúc monorepo tham khảo

```
mf-workspace/
├── apps/
│   ├── shell/            # host — chứa layout, điều hướng, đăng nhập
│   ├── mfe1-flights/     # remote — team A
│   └── mfe2-bookings/    # remote — team B
├── libs/
│   ├── shared-ui/        # thư viện dùng chung (npm package)
│   └── api-types/        # hợp đồng dữ liệu dùng chung
└── nginx/                # reverse proxy: / → shell, /flights → mfe1...
```

## Chiến lược tích hợp host–remote

- **Route-level**: remote lộ một lazy route (`loadChildren`/`loadComponent` qua `loadRemoteModule`) — ranh giới rõ nhất, dễ nhất.
- **Component-level**: remote render một component chèn giữa layout của host — cần hợp đồng chặt hơn (input/output).
- **Shared authentication**: cookie/token chung domain; shell lo đăng nhập, remote đọc user qua API.

```typescript
// loadRemoteModule (đối với Angular cũ + webpack MF plugin của angular-architects)
import { loadRemoteModule } from '@angular-architects/module-federation';

const routes = await loadRemoteModule({
  remoteName: 'mfe1',
  exposedModule: './Module',
}).then((m) => m.routes);
```

## So sánh Module Federation với các cách khác

| Phương pháp | Build tool | Điểm mạnh | Điểm yếu |
|---|---|---|---|
| Module Federation | webpack/rspack | Share dependency runtime, mature | Bị khóa vào webpack-ecosystem |
| Native Federation | esbuild (Angular chuẩn hiện nay) | Web standards (ESM + import maps), SSR, tách khỏi bundler | Cần esbuild-compatible |
| Web Components | Bất kỳ | Framework agnostic | Mất nhiều API Angular, bundle lớn hơn |
| iframe | Bất kỳ | Cách ly tuyệt đối | Navigation/UX khó, params khó truyền |

## Lỗi thường gặp

- **Quên `singleton` cho `@angular/core`** → hai bản Angular trong bundle, lỗi injector lạ.
- **Version drift không kiểm soát**: shell ở Angular 22, remote ở Angular 19 — negotiate thất bại. Chuẩn hóa phiên bản qua `package.json` chung hoặc version check lúc deploy.
- **remoteEntry.js bị cache** → shell load code cũ. Đặt header `Cache-Control: no-cache` cho file manifest, cache dài hạn cho chunk có hash.
- **Sự kiện điều hướng không đồng bộ**: mỗi remote một Router riêng → cần chiến lược URL/console log chung, tránh double navigation.

## Checklist

- [ ] Đã cân nhắc Native Federation trước (Angular 22 chuẩn là Native Federation).
- [ ] Mọi package Angular/RxJS đều `singleton: true, strictVersion: true`.
- [ ] Hợp đồng giữa shell và remote được version hóa (npm package hoặc runtime type check).
- [ ] Có orchestrator/version manifest để deploy remote không phá shell.

## Tham khảo

- [Webpack — Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Module Federation 2.0 (@module-federation/enhanced)](https://module-federation.io)
- [angular-architects.io — Module Federation với Angular](https://www.angulararchitects.io)
- [Micro Frontends —martinfowler.com](https://martinfowler.com/articles/micro-frontends.html)
