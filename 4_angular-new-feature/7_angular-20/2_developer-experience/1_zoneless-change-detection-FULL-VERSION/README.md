# 1. Zoneless Change Detection (v20 Developer Preview — đã hiệu chỉnh)

> Đính chính: API đúng là **`provideZonelessChangeDetection()`**
> (KHÔNG có `provideExperimentalZonelessChangeDetection`).
> v20 là **Developer Preview** + thêm **`provideBrowserGlobalErrorListeners()`** (#60704);
> stable 20.2, default 21.

## API đúng

```typescript
import { provideZonelessChangeDetection } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),      // v20 Developer Preview
    provideBrowserGlobalErrorListeners(),  // #60704 — xử lý global errors khi không có Zone
  ]
});
```

## Tại sao cần feature này?

Zone.js là dependency lớn trong Angular, gây ra nhiều vấn đề:

| Vấn đề | Giải thích |
|---|---|
| **Bundle size** | Zone.js chiếm ~35KB gzipped |
| **Performance** | Zone.js patch mọi async operation |
| **Memory overhead** | Zone.js giữ reference cho mỗi task |
| **Third-party compatibility** | Một số libraries không hoạt động tốt với Zone.js |

Signals thay thế Zone.js bằng cách:
- Component tự báo cáo thay đổi qua `signal()` 
- Angular chỉ re-render component có signal thay đổi
- Không cần patch async operations

## Ví dụ thực tế

### 1. Basic Setup (`main.ts`) — đúng

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners()
  ]
}).catch(err => console.error(err));
```

### 2. Component với Signals

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Double: {{ double() }}</p>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
    </div>
  `
})
export class CounterComponent {
  // Signal thay thế @Input + property
  count = signal(0);

  // Computed signal thay thế getter
  double = computed(() => this.count() * 2);

  increment() {
    // .update() thay thế manual assignment
    this.count.update(c => c + 1);
  }

  decrement() {
    this.count.update(c => c - 1);
  }
}
```

### 3. Component với Effects

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-logger',
  template: `
    <input [value]="name()" (input)="onNameChange($event)">
    <p>Hello, {{ name() }}!</p>
  `
})
export class LoggerComponent {
  name = signal('');

  constructor() {
    // Effect tự chạy khi signal thay đổi
    // Thay thế ngOnInit + ngOnChanges
    effect(() => {
      console.log('Name changed:', this.name());
    });
  }

  onNameChange(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }
}
```

### 4. HTTP Data Fetching — `resource()` vẫn experimental trong v20

```typescript
import { Component, resource } from '@angular/core'; // experimental trong v20, stable v22

@Component({
  selector: 'app-users',
  template: `
    @if (users.isLoading()) {
      <p>Loading...</p>
    }
    @for (user of users.value(); track user.id) {
      <div>{{ user.name }}</div>
    }
  `
})
export class UsersComponent {
  userId = signal(1);

  users = resource({
    params: () => ({ userId: this.userId() }), // đúng: params (không phải request)
    loader: async ({ params }) => {
      const response = await fetch(`/api/users/${params.userId}`);
      return response.json();
    }
  });
}
```

## Trạng thái version

| v20 | 20.2 | 21 |
|---|---|---|
| Developer Preview + `provideBrowserGlobalErrorListeners` (#60704) | Stable | Default |

## So sánh trước và sau Angular 20

### Trước Angular 20 (Zone-based)

```typescript
// Cần Zone.js để detect changes
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<p>{{ count }}</p>`
})
export class CounterComponent {
  count = 0;

  increment() {
    // Zone.js detect thay đổi qua patched setTimeout
    this.count++;
    // Hoặc phải dùng NgZone.run()
    // Hoặc phải triggerChangeDetection thủ công
  }
}
```

### Sau Angular 20 (Zoneless)

```typescript
// Không cần Zone.js
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<p>{{ count() }}</p>`
})
export class CounterComponent {
  count = signal(0);

  increment() {
    // Signal tự báo cho Angular
    this.count.update(c => c + 1);
  }
}
```

**Lợi ích:**
- ✅ Bundle size giảm ~35KB gzipped
- ✅ Faster initial render
- ✅ Better performance
- ✅ Deterministic rendering
- ✅ Easier debugging

## Flow chi tiết

### Zone-based (trước)

```
User click button
        │
        ▼
Zone.js patch event handler
        │
        ▼
Zone.js detect async operation
        │
        ▼
Zone.js trigger change detection
        │
        ▼
Angular check ALL components
        │
        ▼
Re-render changed components
```

### Zoneless (sau)

```
User click button
        │
        ▼
Signal.update() called
        │
        ▼
Angular check ONLY affected components
        │
        ▼
Re-render specific components
```

## Signal API Reference

### `signal()`

```typescript
const count = signal(0);
count();        // Đọc giá trị
count.set(1);   // Set giá trị mới
count.update(c => c + 1);  // Update dựa trên giá trị cũ
```

### `computed()`

```typescript
const count = signal(0);
const double = computed(() => count() * 2);
double();  // Tự cập nhật khi count thay đổi
```

### `effect()`

```typescript
effect(() => {
  console.log(count());  // Tự chạy khi count thay đổi
});
```

### `resource()` — experimental trong v20

```typescript
const data = resource({
  params: () => ({ id: someSignal() }), // đúng: params function
  loader: async ({ params }) => {
    return await fetchData(params.id);
  }
});
```

## Best practices

1. **Dùng `signal()`** thay thế component properties
2. **Dùng `computed()`** thay thế getters
3. **Dùng `effect()`** thay thế subscriptions
4. **Migrate dần** — Zoneless hoạt động song song với Zone.js
5. **Test thoroughly** — Signal rendering deterministic hơn

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/2_developer-experience/1_zoneless-change-detection
npm install
ng serve