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
// ✅ Angular 19 — flag bị XÓA hẳn, effect chỉ còn (fn, options)
// options còn lại: injector, manualCleanup, debugName... — KHÔNG còn allowSignalWrites
effect(() => {
  console.log(this.users());
  this.otherSignal.set('updated'); // Hoạt động bình thường!
});
```

> Đính chính: nói "mặc định `true`" là SAI — v19 **xóa** option `allowSignalWrites` khỏi signature `effect(fn, options)`. Truyền `{ allowSignalWrites: true }` sẽ báo lỗi type/compile.

### 2. Thay đổi thời gian thực thi

```
Trước Angular 19:                    Angular 19:
┌─────────────────────┐             ┌─────────────────────────────────┐
│ Change Detection     │             │ Component effects: chạy ĐỒNG BỘ │
│       ↓              │             │ trong change detection cycle    │
│ Microtask Queue      │             │ (cùng cycle, DOM đã update)     │
│       ↓              │             ├─────────────────────────────────┤
│ Effect executes      │             │ Root effects (tạo ngoài CD,     │
│ (có thể quá sớm /   │             │ vd. ở root injector): vẫn chạy  │
│  quá muộn)           │             │ qua microtask như cũ            │
└─────────────────────┘             └─────────────────────────────────┘
```

> Phân biệt: **component effects** (tạo trong component/directive context) → chạy trong CD cycle; **root effects** (tạo ở application root, ngoài CD) → vẫn schedule qua microtask.

## Files trong project

### `src/app/app.component.ts` — Component minh họa

```ts
import { Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = '3_update-effect';
  query = signal('');
  results = signal<string[]>([]);

  constructor() {
    // Demo thật: ghi signal trong effect — v19 không cần allowSignalWrites
    effect(() => {
      const q = this.query().trim().toLowerCase();
      // ✅ Ghi signal khác trong effect — hợp lệ từ v19
      this.results.set(
        ['apple', 'banana', 'orange'].filter((f) => f.includes(q))
      );
    });
  }

  onInput(value: string): void {
    this.query.set(value);
  }
}
```

### `src/app/app.component.html` — Template minh họa

```html
<input #q type="text" placeholder="Filter fruits" (input)="onInput(q.value)" />
<p>Query: {{ query() }}</p>
<ul>
  @for (r of results(); track r) {
    <li>{{ r }}</li>
  }
</ul>
```

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
| `allowSignalWrites` | Phải bật thủ công `{ allowSignalWrites: true }` | **Bị xóa** khỏi signature `effect(fn, options)` — ghi signal luôn được phép |
| Timing (component effects) | Microtask | Change Detection cycle |
| Timing (root effects) | Microtask | Vẫn microtask (ngoài CD context) |
| predictability | Có thể chạy sai lúc | Đồng bộ với component tree (component effects) |
| Khuyến nghị | Tránh ghi signal trong effect | An toàn để ghi signal |

## Lưu ý quan trọng

⚠️ `effect()` vẫn đang ở giai đoạn **Developer Preview** trong Angular 19, trở thành **stable từ v20**. Tuy nhiên, những cập nhật này là bước tiến quan trọng hướng tới stable API.

## Reference

- [Angular 19 — Updates to effect()](https://angular.love/angular-19-whats-new)
- [Angular 19 Release Blog](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [effect() API Docs](https://angular.dev/api/core/effect)