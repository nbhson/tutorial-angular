# 9. Initializer Provider Functions

> Ghi chú tên folder: `9_initialer-provider-function` thiếu chữ `i` (đúng phải là `9_initializer-provider-function`). Giữ nguyên tên để tránh gãy link, không rename.

## Mô tả

Angular 19 giới thiệu các helper functions mới: `provideAppInitializer()`, `provideEnvironmentInitializer()`, và `providePlatformInitializer()` — thay thế cách dùng `APP_INITIALIZER`, `ENVIRONMENT_INITIALIZER`, và `PLATFORM_INITIALIZER` tokens truyền thống.

## Vấn đề giải quyết

```ts
// ❌ Cách cũ — verbose, dùng DI tokens
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: () => () => {
      console.log('app initialized');
    },
    multi: true
  }
]
```

```ts
// ✅ Cách mới — clean, readable
providers: [
  provideAppInitializer(() => {
    console.log('app initialized');
  })
]
```

## Cú pháp

```ts
// Signature đầy đủ — fn có thể sync hoặc async, nhận Injector context
provideAppInitializer(fn: () => void | Promise<void>): EnvironmentProvider;
provideEnvironmentInitializer(fn: () => void | Promise<void>): EnvironmentProvider;
providePlatformInitializer(fn: () => void | Promise<void>): Provider;
```

> `APP_INITIALIZER` (và 2 token còn lại) đã **deprecated** từ v19 — vẫn chạy (backward compatible) nhưng nên migrate sang `provide*Initializer()`. Dùng schematic tự động:
> ```bash
> ng generate @angular/core:cleanup-unused-imports
> # và migration APP_INITIALIZER:
> ng generate @angular/core:app-initializer-migration
> ```

## Files trong project

### `src/app/app.config.ts` — Tất cả 3 loại initializer

```ts
import {
  ApplicationConfig,
  provideAppInitializer,
  provideEnvironmentInitializer,
  providePlatformInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Environment initializer — chạy khi environment được init
    provideEnvironmentInitializer(() => {
      console.log('Environment initializer running...');
    }),

    // App initializer — chạy khi app start
    provideAppInitializer(() => {
      console.log('App initializer running...');
    }),

    // Platform initializer — chạy khi platform boot
    providePlatformInitializer(() => {
      console.log('Platform initializer running...');
    }),
  ]
};
```

## So sánh trước/sau

| Feature | Trước Angular 19 | Angular 19 |
|---------|------------------|------------|
| Syntax | Token-based (provide/useFactory/multi) | Function-based |
| Readability | Verbose, boilerplate nhiều | Clean, concise |
| Type safety | Less strict | Full TypeScript support |
| Async support | useFactory + Promise | Direct async/await |
| Migration | Manual refactor | Built-in migration tool |

## Chi tiết từng loại

### provideAppInitializer

Chạy khi Angular app khởi tạo — phù hợp cho:
- Load config từ server
- Initialize logging/analytics
- Pre-fetch user data

```ts
provideAppInitializer(async () => {
  const config = await fetch('/api/config');
  AppConfig.set(await config.json());
})
```

### provideEnvironmentInitializer

Chạy khi specific environment được inject — phù hợp cho:
- Setup environment-specific services
- Register global event handlers

```ts
provideEnvironmentInitializer(() => {
  console.log('Environment-specific setup');
})
```

### providePlatformInitializer

Chạy khi platform boot — phù hợp cho:
- Platform-level initialization
- Global DOM setup

```ts
providePlatformInitializer(() => {
  console.log('Platform boot');
})
```

## Lưu ý quan trọng

- **Migration tool**: Angular 19 cung cấp migration command để convert code cũ sang format mới (`ng generate @angular/core:app-initializer-migration`)
- **Deprecated**: `APP_INITIALIZER` / `ENVIRONMENT_INITIALIZER` / `PLATFORM_INITIALIZER` tokens đã deprecated từ v19, vẫn hoạt động (backward compatible) nhưng không nên dùng cho code mới
- **Execution order**: Platform → Environment → App
- Tham khảo official: [Angular 19 Release Blog](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)

## Reference

- [Angular Initializer Providers](https://angular.dev/api/core/provideAppInitializer)
- [APP_INITIALIZER Migration](https://angular.dev/update-guide)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)