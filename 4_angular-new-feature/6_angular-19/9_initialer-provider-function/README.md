# 9. Initializer Provider Functions

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
provideAppInitializer(fn: () => void | Promise<void>): Provider
provideEnvironmentInitializer(fn: () => void): Provider
providePlatformInitializer(fn: () => void): Provider
```

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

- **Migration tool**: Angular 19 cung cấp migration command để convert code cũ sang format mới
- **Backward compatible**: Tokens cũ (APP_INITIALIZER) vẫn hoạt động
- **Execution order**: Platform → Environment → App

## Reference

- [Angular Initializer Providers](https://angular.dev/api/core/provideAppInitializer)
- [APP_INITIALIZER Migration](https://angular.dev/update-guide)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)