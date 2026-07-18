# 5. HttpClient Provided by Default (Angular 21)

## Tổng quan

Từ Angular 21, **HttpClient được cung cấp mặc định** — developer không cần gọi `provideHttpClient()` trong `appConfig` nữa. Nếu project của bạn dùng Angular 21+, bạn có thể bỏ qua dòng `provideHttpClient()` trong providers array.

## Tại sao thay đổi?

Trước đây, mỗi project mới đều phải thêm `provideHttpClient()` thủ công:

```typescript
export const appConfig: AppConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),  // ← Bắt buộc phải có
  ]
};
```

Với Angular 21, HttpClient đã được provide mặc định — code trên vẫn hoạt động nhưng dòng `provideHttpClient()` không còn cần thiết nữa.

## Ví dụ

### Trước Angular 21

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

export const appConfig: AppConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),  // ← Bắt buộc
    provideAnimations(),
  ]
};
```

### Sau Angular 21

```typescript
// app.config.ts — HttpClient đã có sẵn
import { provideRouter } from '@angular/router';

export const appConfig: AppConfig = {
  providers: [
    provideRouter(routes),
    // provideHttpClient()  ← Không cần nữa!
    provideAnimations(),
  ]
};
```

### Full Example — Service không cần provide

```typescript
// data.service.ts — hoạt động bình thường
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this._http.get<User[]>('/api/users');
  }

  createUser(user: User): Observable<User> {
    return this._http.post<User>('/api/users', user);
  }
}
```

```typescript
// app.config.ts — không cần provideHttpClient
export const appConfig: AppConfig = {
  providers: [
    provideRouter(routes),
    // HttpClient đã được provide mặc định
  ]
};
```

## Compatibility

- **Hoàn toàn backward compatible** — `provideHttpClient()` vẫn hoạt động bình thường
- **Không cần migration** — Project hiện có vẫn chạy tốt
- **Project mới** — Bỏ qua `provideHttpClient()` để code gọn hơn

## Best Practices

1. **Project mới Angular 21+** — Bỏ `provideHttpClient()` để code gọn hơn
2. **Project hiện có** — Không cần thay đổi gì, nhưng có thể xóa dòng đó
3. **Kiểm tra compatibility** — Nếu dùng custom providers hoặc interceptors, vẫn cần configure riêng

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular HttpClient Guide](https://angular.dev/guide/http/making-requests)