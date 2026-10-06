# 4. Resource API (`resource()` — EXPERIMENTAL trong v20, stable v22)

> Đính chính: `resource()` trong v20 vẫn là **experimental** (stable từ v22).
> Signature đúng dùng **`params` + `loader`**, không phải `request`/`query`.
> Xem https://angular.dev/api/core/resource.

## API đúng (v20 experimental)

```typescript
import { resource, signal } from '@angular/core';

const userId = signal(1);

const userProfile = resource({
  params: () => ({ userId: userId() }), // ← đúng: params là reactive function
  loader: async ({ params }) => {
    const response = await fetch(`/api/users/${params.userId}`);
    return response.json();
  }
});
```

## Tại sao cần feature này?

| Trước | Sau (`resource()`) |
|---|---|
| Manual loading/error state | Auto `isLoading()`, `error()` |
| Complex RxJS pipe | Simple async loader |
| No built-in cache | Automatic cache |
| Manual re-fetch | Auto re-fetch khi `params` thay đổi |

## Ví dụ thực tế

### 1. Basic Usage

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    @if (profile.isLoading()) {
      <p>Loading...</p>
    } @else if (profile.error()) {
      <p>Error: {{ profile.error() }}</p>
    } @else {
      <h2>{{ profile.value()?.name }}</h2>
      <p>{{ profile.value()?.email }}</p>
    }
  `
})
export class UserProfileComponent {
  userId = signal(1);

  profile = resource({
    params: () => ({ id: this.userId() }),
    loader: async ({ params }) => {
      const res = await fetch(`/api/users/${params.id}`);
      return res.json();
    }
  });
}
```

### 2. Search

```typescript
@Component({
  selector: 'app-search',
  template: `
    <input [value]="query()" (input)="onSearch($event)" />
    @if (results.isLoading()) {
      <p>Searching...</p>
    } @else {
      @for (item of results.value(); track item.id) {
        <div>{{ item.name }}</div>
      }
    }
  `
})
export class SearchComponent {
  query = signal('');

  results = resource({
    params: () => ({ q: this.query() }),
    loader: async ({ params }) => {
      if (!params.q) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(params.q)}`);
      return res.json();
    }
  });

  onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
```

### 3. With `defaultValue`

```typescript
const items = resource({
  params: () => ({ cat: this.category() }),
  loader: async ({ params }) => {
    const res = await fetch(`/api/items?category=${params.cat}`);
    return res.json();
  },
  defaultValue: []  // Giá trị mặc định trước khi load xong
});
```

## Best practices

1. **Dùng `resource()`** thay vì manual fetch + state
2. **Set `defaultValue`** để tránh undefined errors
3. **Cache data** qua `params` signal thay đổi
4. **Handle errors** với `profile.error()`
5. **Combine** với `computed()` cho derived data

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/4_resource-api
npm install
ng serve