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

### 4. Transform Data (thay thế `map()` của RxJS)

> **Câu hỏi thường gặp:** "Với RxJS tôi dùng `map()` để transform data trước khi display. `httpResource()` có làm được không?"

**Có, nhưng theo cách khác.** `httpResource()` KHÔNG có `map()` hay `transform` trực tiếp. Thay vào đó, dùng `computed()` để transform:

#### Cách cũ với RxJS:

```typescript
// RxJS: dùng pipe(map())
user$ = this.http.get<User>(`/api/users/${id}`).pipe(
  map(res => res.data),           // Transform response
  map(user => user.name.toUpperCase())  // Transform tiếp
);
```

#### Cách mới với httpResource():

```typescript
// httpResource() + computed() để transform
user = httpResource<User>(() => ({
  url: `/api/users/${this.userId()}`
}));

// Transform bằng computed() — tương đương map()
userName = computed(() => {
  const data = this.user.value();
  return data ? data.name.toUpperCase() : 'Unknown';
});

// Transform nhiều bước — tương đương pipe(map(), map())
userDisplay = computed(() => {
  const data = this.user.value();
  if (!data) return null;
  return {
    fullName: `${data.firstName} ${data.lastName}`,
    avatar: data.avatarUrl ?? '/assets/default-avatar.png',
    isActive: data.status === 'active'
  };
});
```

#### So sánh RxJS `map()` vs `computed()` transform

| | RxJS `map()` | `computed()` transform |
|---|---|---|
| **Khi chạy** | Mỗi lần HTTP response về | Mỗi khi signal dependency thay đổi |
| **Lazy?** | Không (eager trong pipe) | Có (lazy, chỉ compute khi cần) |
| **Cache?** | Không | Có (auto-cache kết quả) |
| **Compose được?** | Có (pipe nhiều map) | Có (computed lồng computed) |
| **Nơi viết** | Trong `.pipe()` | Ngoài `httpResource()` |

#### Kết luận

- **`httpResource()` không có `map()`** vì nó không phải Observable —它 là Signal-based Resource
- **Dùng `computed()`** để transform data — đây là cách "Angular way"
- `computed()` thậm chí **tốt hơn** `map()` vì có **lazy evaluation** và **auto caching**
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