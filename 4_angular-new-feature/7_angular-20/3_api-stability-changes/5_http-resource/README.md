# 5. httpResource (Angular 20)

## Tổng quan

Angular 20 giới thiệu `httpResource()` — API kết hợp giữa `resource()` và `HttpClient` — tự động gọi HTTP API, quản lý loading/error state, và tích hợp với Angular's dependency injection.

## API mới

```typescript
import { httpResource } from '@angular/common/http';

const userId = signal(1);

const user = httpResource(() => ({
  url: `/api/users/${userId()}`,
  method: 'GET'
}));
```

## Tại sao cần feature này?

| `resource()` | `httpResource()` |
|---|---|
| Generic async loader | Tích hợp HttpClient |
| Không có DI | Có DI support |
| Manual fetch | Auto interceptors |
| Không có retry | Built-in retry logic |

## Ví dụ thực tế

### 1. Basic Usage

```typescript
@Component({
  selector: 'app-user',
  template: `
    @if (user.isLoading()) {
      <p>Loading...</p>
    } @else if (user.error()) {
      <p>Error: {{ user.error() }}</p>
    } @else {
      <h2>{{ user.value()?.name }}</h2>
      <p>{{ user.value()?.email }}</p>
    }
  `
})
export class UserComponent {
  userId = signal(1);

  user = httpResource<User>(() => ({
    url: `/api/users/${this.userId()}`
  }));
}
```

### 2. POST Request

```typescript
const createOrder = httpResource(() => ({
  url: '/api/orders',
  method: 'POST',
  body: orderData()
}));

// Trigger
createOrder.reload();
```

### 3. With Headers

```typescript
const data = httpResource(() => ({
  url: '/api/protected',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token()}`
  }
}));
```

### 4. Combined Signals

```typescript
@Component({
  selector: 'app-products',
  template: `
    <select (change)="onCategoryChange($event)">
      @for (cat of categories; track cat) {
        <option [value]="cat">{{ cat }}</option>
      }
    </select>
    @for (product of products.value(); track product.id) {
      <div>{{ product.name }} - ${{ product.price }}</div>
    }
  `
})
export class ProductsComponent {
  category = signal('all');
  categories = ['all', 'electronics', 'clothing', 'food'];

  products = httpResource<Product[]>(() => ({
    url: `/api/products?category=${this.category()}`
  }));

  onCategoryChange(event: Event) {
    this.category.set((event.target as HTMLSelectElement).value);
  }
}
```

## Best practices

1. **Dùng `httpResource()`** cho HTTP calls thay manual `HttpClient`
2. **Type-safe** response với generic
3. **Handle errors** với `.error()`
4. **Retry logic** tự động
5. **Cache** qua signal dependency

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/5_http-resource
npm install
ng serve