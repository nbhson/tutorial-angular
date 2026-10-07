# Unhandled Errors in Angular

> Nguồn: https://angular.dev/best-practices/error-handling

## Tổng quan
Từ v16+, `ErrorHandler` + `provideBrowserGlobalErrorListeners` (stable v20) là đường chuẩn hứng lỗi chưa xử lý, thay `window.onerror` rời rạc.

## Điểm chính
- Global: `ClassProvider ErrorHandler` custom → log lên server + toast cho user.
- Zoneless (default v21): bắt buộc `provideBrowserGlobalErrorListeners()` để không mất lỗi async.
- HTTP: `HttpInterceptor`/`catchError` cho lỗi API; `resource`/`httpResource` expose `error()` signal.

## Ví dụ Code
```typescript
// app.config.ts
import { provideBrowserGlobalErrorListeners } from '@angular/core';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(err: unknown) {
    console.error(err); // TODO: gửi lên logging server
  }
}
```

```typescript
// httpResource — đọc lỗi qua signal
const users = httpResource<User[]>(() => '/api/users');
// template: @if (users.error()) { <p>Load thất bại</p> }
```

## Tham khảo
- [Unhandled errors in Angular](https://angular.dev/best-practices/error-handling)
