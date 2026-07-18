# 2. Resource API

## Mô tả

`resource()` là API mới trong Angular 19 (Developer Preview) giúp quản lý **async data loading** theo kiểu reactive, thay thế cách dùng `switchMap + httpClient` truyền thống. API này tích hợp liền mạch với Signals.

## Vấn đề giải quyết

Trước đây, loading async data trong Angular thường involve:
```ts
// Cách truyền thống — nhiều boilerplate
items$ = this.route.paramMap.pipe(
  switchMap(params => this.http.get(`/api/items/${params.get('id')}`))
);
```

`resource()` đơn giản hóa:
```ts
// Cách mới — reactive, signal-based
items = resource({
  request: () => this.itemId(),
  loader: async (params) => {
    return await fetch(`/api/items/${params.request}`);
  }
});
```

## Cú pháp

```ts
resource<T, R>({
  request: () => R,           // Signal hoặc getter — input
  loader: async (params) => { // Async function — fetch data
    params.request;           // Giá trị từ request
    params.abortSignal;       // AbortController signal
    return data as T;
  }
}): ResourceRef<T>
```

`ResourceRef<T>` cung cấp:
- `.value` — Signal chứa data
- `.isLoading` — Signal boolean
- `.error` — Signal chứa error
- `.reload()` — Trigger reload
- `.update()` — Update value locally

## Files trong project

### `src/app/service/resource.service.ts` — Service chính

```ts
import { Injectable, resource, signal } from '@angular/core';

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  // Input signal — thay đổi sẽ trigger reload
  todoId = signal<string>('1');

  // Resource — tự động fetch khi todoId thay đổi
  todoDetails = resource({
    request: this.todoId,
    loader: async (params) => {
      const todoId = params.request;
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        { signal: params.abortSignal }
      );
      return await response.json() as Todo;
    }
  });

  // Convenience accessors
  isTodoLoading = this.todoDetails.isLoading;
  todo = this.todoDetails.value;
  error = this.todoDetails.error;

  // Update locally
  updateTodo(name: string): void {
    this.todoDetails.update((fruit) =>
      fruit ? { ...fruit, name } : undefined
    );
  }

  // Manual reload
  reloadTodo(): void {
    this.todoDetails.reload();
  }

  // Change input → triggers automatic reload
  onTodoChange(id: string): void {
    this.todoId.set(id);
  }
}
```

### `src/app/app.component.ts` — Component sử dụng

```ts
import { Component, inject } from '@angular/core';
import { ResourceService } from './service/resource.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [JsonPipe]
})
export class AppComponent {
  resource = inject(ResourceService);

  ngOnInit(): void {
    this.resource.onTodoChange('2');  // Trigger load todo #2
    this.resource.reloadTodo();       // Manual reload
  }
}
```

## Flow diagram

```
todoId signal thay đổi
        │
        ▼
   resource loader chạy
   (fetch API call)
        │
        ▼
   isLoading = true
        │
        ▼
   Response về
        │
        ├──→ todo.value = data
        └──→ isLoading = false
```

## So sánh với approaches khác

| Feature | RxJS + switchMap | resource() | httpResource() (v20) |
|---------|-----------------|------------|---------------------|
| Reactive | ✅ | ✅ | ✅ |
| Abort signal | Manual | Built-in | Built-in |
| Loading state | Manual tracking | `.isLoading` | `.isLoading` |
| Error handling | subscribe/error | `.error` | `.error` |
| Cache | Manual | reload() | Built-in |
| Boilerplate | Nhiều | Ít | Ít nhất |

## Khi nào dùng resource()?

- **Data fetching** dựa trên reactive inputs (signals)
- **REST API calls** cần automatic refetch
- **Search functionality** cần debounce + abort
- **Dashboard widgets** cần periodic refresh

## Lưu ý

⚠️ `resource()` đang ở giai đoạn **Developer Preview** trong Angular 19 — API có thể thay đổi ở phiên bản stable.

## Reference

- [Angular Resource API Docs](https://angular.dev/guide/signals/resource)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) — Mock API used in demo