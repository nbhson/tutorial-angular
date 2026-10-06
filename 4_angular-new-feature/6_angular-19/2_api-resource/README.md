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
// v19 dùng key `request:` — từ v20 đổi tên thành `params:` (breaking rename)
resource<T, R>({
  request: () => R,           // v19 — Signal hoặc getter — input
  // params: () => R,        // v20+ — tên mới thay cho `request`
  loader: async (params) => { // Async function — fetch data
    params.request;           // v19 — giá trị từ request (v20: params.params)
    params.abortSignal;       // AbortController signal
    return data as T;
  }
}): ResourceRef<T>
```

`ResourceRef<T>` cung cấp:
- `.value` — Signal chứa data
- `.status` — Signal `ResourceStatus` (`idle` | `loading` | `reloading` | `resolved` | `error` | `local`)
- `.isLoading` — Signal boolean
- `.error` — Signal chứa error
- `.hasValue()` — kiểm tra đã có giá trị chưa
- `.reload()` — Trigger reload
- `.update()` / `.set()` — Update value locally
- `.id` — định danh instance (hữu ích khi debug nhiều resource)
- `.defaultValue` / `stream` — giá trị mặc định / resource dạng stream (các option mở rộng)

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
  status = this.todoDetails.status; // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
  todo = this.todoDetails.value;
  error = this.todoDetails.error;

  // Update locally — Todo KHÔNG có field `name`, phải spread đúng field `title`
  updateTodo(title: string): void {
    this.todoDetails.update((todo) =>
      todo ? { ...todo, title } : undefined
    );
    // hoặc: this.todoDetails.set({ userId: 1, id: 1, title, completed: false });
    // kiểm tra: this.todoDetails.hasValue();
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

- Key `request:` chỉ đúng cho **v19**. Từ **v20** đổi thành **`params:`** (`params.request` → `params.params`). Khi đọc guide mới, nhớ map lại tên.
- Đừng quên các member hay bị bỏ sót: `.status`, `.hasValue()`, `.set()`, `.id`, `defaultValue`, `stream`.
- Họ `*Resource`: `resource()` (generic) → `rxResource()` (wrap Observable) → `httpResource()` (wrap HttpClient, stable từ v20).

## Reference

- [Angular Resource API Docs](https://angular.dev/guide/signals/resource)
- [resource API](https://angular.dev/api/core/resource)
- [rxResource API](https://angular.dev/api/core/rxjs-interop/rxResource)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) — Mock API used in demo