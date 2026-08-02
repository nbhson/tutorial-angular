# resource() và httpResource() Trở Nên Stable

## Tổng quan
`resource()` và `httpResource()` trở thành stable trong Angular 22. Chúng giúp bạn giữ việc fetch bất đồng bộ bên trong signal graph thay vì phải chuyển qua lại giữa RxJS cho mỗi request.

## Tính năng chính

- **API stable**: Không còn cảnh báo experimental
- **Dựa trên signals**: Dữ liệu bất đồng bộ nằm trong signal graph
- **Tự động re-fetch**: Resources tự fetch lại khi dependencies thay đổi
- **Trạng thái loading/error**: Có sẵn `isLoading()`, `hasValue()`, `error()`, `value()`
- **Sửa lỗi subscription**: `rxResource` không còn rò rỉ subscriptions

## Ví dụ Code

### httpResource cơ bản

```typescript
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user',
  template: `
    @if (user.isLoading()) {
      <p>Đang tải…</p>
    } @else if (user.hasValue()) {
      <h1>{{ user.value().name }}</h1>
      <p>{{ user.value().email }}</p>
    } @else if (user.error()) {
      <p>Lỗi khi tải user</p>
    }
  `
})
export class UserComponent {
  userId = signal(1);
  
  // Tự động re-fetch mỗi khi userId thay đổi
  user = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

### resource() với custom loader

```typescript
import { resource, signal } from '@angular/core';

@Component({
  selector: 'app-posts',
  template: `
    @if (posts.isLoading()) {
      <p>Đang tải posts...</p>
    } @else {
      @for (post of posts.value(); track post.id) {
        <article>{{ post.title }}</article>
      }
    }
  `
})
export class PostsComponent {
  authorId = signal(1);
  
  posts = resource({
    request: () => ({ authorId: this.authorId() }),
    loader: async ({ request }) => {
      const response = await fetch(`/api/posts?author=${request.authorId}`);
      return response.json();
    }
  });
}
```

### rxResource (dựa trên RxJS)

```typescript
import { rxResource } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product',
  template: `
    @if (product.isLoading()) {
      <spinner />
    } @else if (product.hasValue()) {
      <h2>{{ product.value().name }}</h2>
      <p>{{ product.value().price | currency }}</p>
    }
  `
})
export class ProductComponent {
  private http = inject(HttpClient);
  productId = signal(1);
  
  product = rxResource({
    request: () => ({ id: this.productId() }),
    loader: ({ request }) => this.http.get<Product>(`/api/products/${request.id}`)
  });
}
```

### Resource với xử lý lỗi

```typescript
@Component({
  selector: 'app-data',
  template: `
    @if (data.isLoading()) {
      <p>Đang tải...</p>
    } @else if (data.error()) {
      <div class="error">
        <p>{{ data.error()?.message }}</p>
        <button (click)="data.reload()">Thử lại</button>
      </div>
    } @else {
      <pre>{{ data.value() | json }}</pre>
    }
  `
})
export class DataComponent {
  private http = inject(HttpClient);
  
  data = httpResource(() => '/api/data', {
    defaultValue: [],
    equal: (a, b) => JSON.stringify(a) === JSON.stringify(b)
  });
}
```

## Tham Chiếu API Resource

| Phương thức | Mô tả |
|--------|-------------|
| `value()` | Trả về giá trị hiện tại |
| `isLoading()` | Trả về `true` khi đang tải |
| `hasValue()` | Trả về `true` nếu có giá trị |
| `error()` | Trả về lỗi nếu có |
| `reload()` | Kích hoạt fetch lại |
| `cancel()` | Hủy request đang chờ |

## Sửa Lỗi trong Angular 22

| Sửa lỗi | Mô tả |
|-----|-------------|
| **Rò rỉ subscription** | `rxResource` không còn rò rỉ subscriptions trong các app chạy lâu |
| **URL sanitizer** | Tra cứu sanitizer URL resource giờ không phân biệt hoa thường |

## Migration từ v21

Nếu bạn đã dùng resources ở v21, API giống hệt:

```typescript
// Angular 21 (experimental) - cùng code vẫn chạy ở Angular 22 (stable)
import { httpResource } from '@angular/common/http'; // Không còn experimental!
```

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
