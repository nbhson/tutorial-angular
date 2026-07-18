# 8. Default Query Params Handling Strategy

## Mô tả

Angular 19 giới thiệu **default query params handling strategy** — cho phép set mặc định cách xử lý query parameters (preserve, merge, hoặc replace) cho tất cả routes trong `provideRouter()` config. Trước đây, strategy này chỉ có thể set riêng lẻ cho mỗi navigation.

## Vấn đề giải quyết

```ts
// ❌ Trước Angular 19 — phải set cho mỗi navigation riêng
this.router.navigate(['/details'], {
  queryParams: { page: 2 },
  queryParamsHandling: 'merge' // Bắt buộc khai báo mỗi lần
});
```

```ts
// ✅ Angular 19 — set mặc định một lần
provideRouter(routes, withRouterConfig({
  defaultQueryParamsHandling: 'preserve'
}));
// Tất cả routes đều dùng preserve mặc định
```

## Cú pháp

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({
      defaultQueryParamsHandling: 'preserve' // hoặc 'merge' hoặc 'replace'
    }))
  ]
};
```

## Query Params Handling Options

### queryParamsHandling: 'preserve'

Giữ nguyên TOÀN BỘ query parameters hiện tại, không thêm/xóa/sửa.

```
URL hiện tại:  /products?page=1&sort=asc
Navigate đến:  /details (preserve)
Kết quả URL:   /details?page=1&sort=asc  ✅ giữ nguyên
```

### queryParamsHandling: 'merge'

Kết hợp params hiện tại với params mới. Nếu trùng tên → giá trị mới ghi đè.

```
URL hiện tại:  /products?page=1&sort=asc
Navigate đến:  /details (merge + queryParams: { sort: 'desc' })
Kết quả URL:   /details?page=1&sort=desc  ✅ sort ghi đè, page giữ nguyên
```

### queryParamsHandling: 'replace' (default)

Thay thế hoàn toàn — chỉ giữ params mới truyền vào.

```
URL hiện tại:  /products?page=1&sort=asc
Navigate đến:  /details (replace + queryParams: { page: 2 })
Kết quả URL:   /details?page=2  ❌ sort bị mất!
```

## Files trong project

### `src/app/app.config.ts`

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
```

> Demo này minh họa concept — trong thực tế bạn sẽ thêm `withRouterConfig({ defaultQueryParamsHandling: 'preserve' })` vào providers.

## So sánh chi tiết

| Feature | preserve | merge | replace (default) |
|---------|----------|-------|-------------------|
| Giữ params hiện tại | ✅ | ✅ (trừ trùng tên) | ❌ |
| Thêm params mới | ❌ | ✅ | ✅ |
| Ghi đè params trùng tên | ❌ | ✅ | ✅ |
| Xóa params cũ | ❌ | ❌ | ✅ |

## Use Cases phổ biến

### preserve — Pagination filter
```ts
// Từ /products?page=1&sort=asc
// Navigate sang chi tiết, giữ nguyên page & sort
this.router.navigate(['/product', id], {
  queryParamsHandling: 'preserve'
});
// → /product/123?page=1&sort=asc
```

### merge — Update sort
```ts
// Từ /products?page=1&sort=asc
// Chỉ đổi sort, giữ page
this.router.navigate(['/products'], {
  queryParams: { sort: 'desc' },
  queryParamsHandling: 'merge'
});
// → /products?page=1&sort=desc
```

### Default config — Most common pattern
```ts
//大多数情况下 dùng preserve để giữ nguyên context
provideRouter(routes, withRouterConfig({
  defaultQueryParamsHandling: 'preserve'
}))
```

## Lưu ý

- **Default strategy**: `replace` — Angular mặc định replace, KHÔNG giữ params cũ
- **Override per-navigation**: Vẫn có thể override default bằng cách set `queryParamsHandling` trong navigation options
- **Backward compatible**: Không ảnh hưởng code hiện có — chỉ thêm option mới

## Reference

- [Angular Router Query Params](https://angular.dev/guide/routing/read-route-params)
- [withRouterConfig API](https://angular.dev/api/router/withRouterConfig)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [Angular 19 — Query Params Handling](https://angular.love/angular-19-whats-new)