# 3. Updates to the effect() function

## Mô tả

Angular 19 cập nhật quan trọng cho hàm `effect()` — loại bỏ `allowSignalWrites` flag và thay đổi thời gian thực thi effects để chạy đồng bộ với change detection cycle thay vì microtasks.

## Vấn đề giải quyết

### 1. Loại bỏ `allowSignalWrites` flag

Trước Angular 19, để ghi signal trong effect, bạn phải bật flag này:

```ts
// ❌ Trước Angular 19 — phải khai báo flag
effect(
  () => {
    console.log(this.users());
    this.otherSignal.set('updated'); // Error nếu không có flag!
  },
  { allowSignalWrites: true } // Bắt buộc phải có
);
```

```ts
// ✅ Angular 19 — ghi signal được phép mặc định
effect(() => {
  console.log(this.users());
  this.otherSignal.set('updated'); // Hoạt động bình thường!
});
```

### 2. Thay đổi thời gian thực thi

```
Trước Angular 19:                    Angular 19:
┌─────────────────────┐             ┌─────────────────────┐
│ Change Detection     │             │ Change Detection     │
│       ↓              │             │       ↓              │
│ Microtask Queue      │             │ Effect executes      │
│       ↓              │             │ (cùng cycle)        │
│ Effect executes      │             └─────────────────────┘
│ (có thể quá sớm /   │
│  quá muộn)           │
└─────────────────────┘
```

## Files trong project

### `src/app/app.component.ts` — Component minh họa

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = '3_update-effect';
}
```

> Project này minh họa khái niệm hơn là demo phức tạp — xem code example bên dưới để hiểu rõ hơn.

## Code Examples

### Ví dụ 1: Effect ghi signal trực tiếp

```ts
@Component({...})
export class SearchComponent {
  query = signal('');
  results = signal<string[]>([]);

  constructor() {
    effect(() => {
      const q = this.query();
      // ✅ Không cần allowSignalWrites nữa!
      this.results.set(this.filterResults(q));
    });
  }

  filterResults(q: string): string[] {
    return items.filter(item => item.includes(q));
  }
}
```

### Ví dụ 2: Timing mới trong action

```ts
@Component({...})
export class TimingComponent {
  counter = signal(0);

  constructor() {
    effect(() => {
      // Chạy SAU khi DOM đã cập nhật
      // (không còn quá sớm như microtask)
      console.log('Counter:', this.counter());
      this.updateChart(); // DOM-safe operation
    });
  }

  increment() {
    this.counter.update(v => v + 1);
    // Effect chạy trong cùng change detection cycle
    // → DOM đã được update
  }
}
```

## So sánh effect() trước và sau Angular 19

| Feature | Trước Angular 19 | Angular 19 |
|---------|------------------|------------|
| `allowSignalWrites` | Bắt buộc bật thủ công | Mặc định `true` |
| Timing | Microtask | Change Detection cycle |
| predictability | Có thể chạy sai lúc | Đồng bộ với component tree |
| Khuyến nghị | Tránh ghi signal trong effect | An toàn để ghi signal |

## Lưu ý quan trọng

⚠️ `effect()` vẫn đang ở giai đoạn **Developer Preview** trong Angular 19. Tuy nhiên, những cập nhật này là bước tiến quan trọng hướng tới stable API.

## Reference

- [Angular 19 — Updates to effect()](https://angular.love/angular-19-whats-new)
- [Angular 19 Release Blog](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [effect() API Docs](https://angular.dev/api/core/effect)