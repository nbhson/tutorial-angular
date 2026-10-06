# 5. httpResource (EXPERIMENTAL trong v20, stable v22 — đã hiệu chỉnh)

> Đính chính: `httpResource()` trong v20 vẫn là **experimental** (stable v22).
> `request` bắt buộc là **reactive function** `() => HttpResourceRequest | undefined`;
> transform response bằng **`parse`** (không phải `map`).
> Xem https://angular.dev/api/common/http/httpResource.

## API đúng (v20 experimental)

```typescript
import { httpResource } from '@angular/common/http';

const userId = signal(1);

// request bắt buộc là function reactive:
const user = httpResource<User>(() => ({
  url: `/api/users/${userId()}`,
  method: 'GET',
  // parse (không phải map) để transform raw response:
  parse: (res) => res as User,
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

### 4. Transform Data bằng `parse` (không phải `map()`)

> **Đính chính:** `httpResource()` transform bằng **`parse`** trong request options,
> không phải `map`. `computed()` vẫn dùng được cho derived display values,
> nhưng transform raw response đúng là `parse`.

#### RxJS cũ (`map()`):

```typescript
user$ = this.http.get<User>(`/api/users/${id}`).pipe(
  map(res => res.data),
);
```

#### httpResource đúng (`parse`):

```typescript
user = httpResource<User>(() => ({
  url: `/api/users/${this.userId()}`,
  parse: (raw) => (raw as { data: User }).data, // ← thay cho map()
}));

// Derived display values vẫn có thể dùng computed():
userName = computed(() => this.user.value()?.name.toUpperCase() ?? 'Unknown');
```

#### So sánh RxJS `map()` vs `parse` + `computed()`

| | RxJS `map()` | `parse` (httpResource) + `computed()` |
|---|---|---|
| **Khi chạy** | Mỗi lần HTTP response về | `parse`: khi response về; `computed()`: khi signal đổi |
| **Nơi viết** | Trong `.pipe()` | `parse` trong request fn; `computed()` ngoài |

#### Kết luận (đúng)

- **`httpResource()` dùng `parse`** để transform raw response — không phải `map`.
- **Dùng `computed()`** cho derived display values — đây là cách "Angular way".
- Nếu cần transform **trước khi request** (ví dụ: transform URL params), viết logic trong callback của `httpResource()`:

```typescript
user = httpResource<User>(() => {
  const id = this.userId();
  // Transform URL params ở đây
  return {
    url: `/api/users/${id}`,
    method: 'GET',
    headers: { 'X-Request-Id': crypto.randomUUID() }
  };
});
```

---

### 5. Combined Signals

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