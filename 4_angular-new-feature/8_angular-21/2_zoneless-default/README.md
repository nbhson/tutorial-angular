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

1. **Performance**: Không cần Zone.js意味着 bundle nhỏ hơn và change detection nhanh hơn
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
# Chạy schematic để migrate sang zoneless
ng generate @angular/core:zoneless
```

## So sánh trước và sau Angular 21

### Trước Angular 21 — Zone.js là Default

```typescript
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

```json
// angular.json — zone.js được include mặc định
{
  "scripts": [
    "node_modules/zone.js/bundles/zone.umd.js"
  ]
}
```

### Sau Angular 21 — Zoneless là Default

```typescript
// main.ts — bootstrap với zoneless
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

```typescript
// app.config.ts — không cần provideZoneChangeDetection
export const appConfig: AppConfig = {
  providers: [
    // Zoneless — zone.js không cần thiết
    provideRouter(routes),
    provideHttpClient(),
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