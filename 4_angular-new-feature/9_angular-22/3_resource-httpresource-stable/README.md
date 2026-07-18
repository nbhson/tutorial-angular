# resource() and httpResource Go Stable

## Overview
`resource()` and `httpResource()` become stable in Angular 22. They let you keep async fetching inside the signal graph instead of moving in and out of RxJS for every request.

## Key Features

- **Stable API**: No more experimental warnings
- **Signal-based**: Async data stays in the signal graph
- **Automatic re-fetch**: Resources re-fetch when dependencies change
- **Loading/error states**: Built-in `isLoading()`, `hasValue()`, `error()`, `value()`
- **Subscription fix**: `rxResource` no longer leaks subscriptions

## Code Examples

### Basic httpResource

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
      <p>Loading…</p>
    } @else if (user.hasValue()) {
      <h1>{{ user.value().name }}</h1>
      <p>{{ user.value().email }}</p>
    } @else if (user.error()) {
      <p>Error loading user</p>
    }
  `
})
export class UserComponent {
  userId = signal(1);
  
  // Re-fetches automatically whenever userId changes
  user = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

### resource() with custom loader

```typescript
import { resource, signal } from '@angular/core';

@Component({
  selector: 'app-posts',
  template: `
    @if (posts.isLoading()) {
      <p>Loading posts...</p>
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

### rxResource (RxJS-based)

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

### Resource with error handling

```typescript
@Component({
  selector: 'app-data',
  template: `
    @if (data.isLoading()) {
      <p>Loading...</p>
    } @else if (data.error()) {
      <div class="error">
        <p>{{ data.error()?.message }}</p>
        <button (click)="data.reload()">Retry</button>
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

## Resource API Reference

| Method | Description |
|--------|-------------|
| `value()` | Returns current value |
| `isLoading()` | Returns `true` while loading |
| `hasValue()` | Returns `true` if value exists |
| `error()` | Returns error if any |
| `reload()` | Triggers refetch |
| `cancel()` | Cancels pending request |

## Bug Fixes in Angular 22

| Fix | Description |
|-----|-------------|
| **Subscription leak** | `rxResource` no longer leaks subscriptions in long-running apps |
| **URL sanitizer** | Resource URL sanitizer lookup is now case-insensitive |

## Migration from v21

If you used resources in v21, the API is identical:

```typescript
// Angular 21 (experimental) - same code works in Angular 22 (stable)
import { httpResource } from '@angular/common/http'; // No longer experimental!
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)