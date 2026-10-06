# 2. Zoneless là Default (Angular 21)

## Tổng quan

Angular 21 đưa **Zoneless change detection** trở thành **default cho ứng dụng mới**. Trước đó, zoneless đã ổn định từ Angular 20.2. Từ Angular 21, mọi project mới tạo bằng `ng new` sẽ mặc định dùng zoneless, và Angular team đã chuẩn bị schematics để migrate project hiện có.

## Zoneless là gì?

Zoneless là cơ chế change detection **không sử dụng Zone.js**. Thay vào đó, Angular dựa vào **Signals** để theo dõi thay đổi state và tự động cập nhật UI.

| Zone.js (trước) | Zoneless (sau) |
|---|---|
| Monkey-patching browser APIs | Không patch browser APIs |
| Theo dõi async operations tự động | Developer chủ động update signals |
| Change detection toàn app | Change detection targeted |
| Larger bundle size | Bundle size nhỏ hơn |

## Tại sao cần zoneless mặc định?

1. **Performance**: Không cần Zone.js nên bundle nhỏ hơn và change detection nhanh hơn
2. **Signals-first**: Align với hướng phát triển của Angular — Signals là core primitive
3. **Predictability**: Developer chủ động control khi nào UI update, ít surprise hơn

## Setup

### Project Mới (Angular 21+)

```bash
ng new my-app
# Zoneless đã là default — không cần thêm gì
```

### Migrate Project Hiện Có

```bash
# Angular 21: chạy ng update — CLI tự thêm provideZoneChangeDetection()
# và gợi ý migration onpush_zoneless_migration khi phù hợp
ng update @angular/cli @angular/core
```

> ℹ️ Migration `onpush_zoneless_migration` (MCP/lschematics) hỗ trợ chuyển các component sang `OnPush` + zoneless. Tên schematic có thể khác nhau theo version CLI — chạy `ng update` để CLI gợi ý lệnh đúng cho project của bạn.

## So sánh trước và sau Angular 21

### Trước Angular 21 — Zone.js là Default

```typescript
// app.config.ts (Angular 20 trở về trước, standalone)
import { provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ]
};
```

```typescript
// main.ts — bootstrap standalone (không dùng NgModule từ v17+)
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

### Sau Angular 21 — Zoneless là Default

```typescript
// main.ts — bootstrap với zoneless (không đổi)
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

```typescript
// app.config.ts — zoneless: dùng provideZoneChangeDetection()
// (ng update tự thêm khi migrate; project mới đã có sẵn)
import { provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
  ]
};
```

## Khi nào cần Loại Zone.js?

- **Dùng Signals** cho state management → zoneless hoạt động tự nhiên
- **Sử dụng `input()`, `output()`, `model()`** → reactive primitives
- **Async pipes trong template** → tự động detect với signals
- **Không dùng `NgZone.run()`** anywhere → migrate trước

## Best Practices

1. **Dùng Signals** — Zoneless hoạt động tốt nhất với Signals
2. **Tránh `zone.js`-dependent patterns** — như `setTimeout` directly trong component
3. **Test kỹ** trước khi migrate production apps
4. **Đọc migration guide** từ Angular team

## Tham khảo

- [Angular 20.2 — Zoneless Stable](https://angular.love/angular-20-2-the-recent-changes)
- [Angular Signals](https://angular.love/angular-signals-a-new-feature-in-angular-16)
- [Angular 21 Announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)