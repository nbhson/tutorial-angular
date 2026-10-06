# linkedSignal: Thêm Option `set` Tùy Biến

## Tổng quan
Đính chính quan trọng: `linkedSignal` **đã writable từ trước** (có `.set()`/`.update()` từ lúc ra mắt) — không phải v22 mới thêm. Thay đổi thật trong Angular 22 là thêm option **`set` tùy biến** trong options, cho phép chặn (override) hành vi ghi mặc định để viết ngược (write back) về source of truth.

## Tính năng chính

- **Đã writable từ trước**: `linkedSignal` luôn trả về `WritableSignal` — `.set()`, `.update()`, `.asReadonly()` đều có sẵn
- **Mới trong v22: option `set`**: `linkedSignal(computation, { set })` hoặc `linkedSignal({ source, computation, set })`
- **Signature**: `set: (value, rawSet) => void` — `rawSet` là setter mặc định để ghi trực tiếp khi cần
- **Use case**: Convert ngược (Fahrenheit → Celsius), update property lồng trong parent object, tránh `effect` đồng bộ 2 signals gây cycle

## Ví dụ Code

### linkedSignal vốn đã `.set()` được từ trước

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <h2>Bộ đếm: {{ counter() }}</h2>
    <button (click)="reset()">Đặt lại</button>
    <button (click)="setToTen()">Đặt thành 10</button>
  `
})
export class CounterComponent {
  source = signal(0);

  counter = linkedSignal(() => this.source());

  reset() {
    this.source.set(0); // Thay đổi source, counter tự cập nhật
  }

  setToTen() {
    this.counter.set(10); // Đã làm được từ trước v22 — KHÔNG phải mới
    this.counter.update(v => v + 1); // Cũng có sẵn từ trước
  }
}
```

### Mới v22: Custom `set` viết ngược về source

```typescript
import { signal, linkedSignal } from '@angular/core';

const tempC = signal(0);
// Hiển thị Fahrenheit nhưng source of truth là Celsius
const tempF = linkedSignal(() => (tempC() * 9) / 5 + 32, {
  set: (valF) => tempC.set(((valF - 32) * 5) / 9),
});

console.log(tempF()); // 32

tempF.set(212); // Ghi F → tự convert ngược về C
console.log(tempC()); // 100
console.log(tempF()); // 212
```

### Custom `set` update property trong parent object

```typescript
import { signal, linkedSignal } from '@angular/core';

const order = signal({ id: 42, shippingMethod: 'Ground' });

const shippingMethod = linkedSignal(() => order().shippingMethod, {
  set: (newMethod) => {
    // Ghi immutable ngược về parent object
    order.update((current) => ({
      ...current,
      shippingMethod: newMethod,
    }));
  },
});

shippingMethod.set('Air'); // Cập nhật parent, không ghi đè local
console.log(order()); // { id: 42, shippingMethod: 'Air' }
```

### Dùng `rawSet` khi muốn ghi trực tiếp

```typescript
const tempF2 = linkedSignal(() => (tempC() * 9) / 5 + 32, {
  set: (valF, rawSet) => {
    // Vừa write-back về source, vừa ghi trực tiếp để tránh recompute đắt đỏ
    tempC.set(((valF - 32) * 5) / 9);
    rawSet(valF);
  },
});
```

## Tham Chiếu API

| Phương thức | Mô tả | Từ khi nào |
|--------|-------------|------------|
| `linkedSignal(() => expr)` | Tạo một linked signal có thể ghi | Có từ trước v22 |
| `.set(value)` | Đặt giá trị trực tiếp | Có từ trước v22 |
| `.update(fn)` | Cập nhật qua hàm | Có từ trước v22 |
| `option set(value, rawSet)` | Tùy biến hành vi ghi, write-back về source | ✅ **Mới v22** |
| `.asReadonly()` | Lấy phiên bản chỉ đọc | Có sẵn |

## Migration

Không cần thay đổi gì cho các app hiện có. Option `set` mới hoàn toàn bổ sung thêm — chỉ dùng khi bạn cần write-back về source thay vì ghi đè local:

```typescript
// Pattern cũ vẫn chạy
const counter = linkedSignal(() => this.source());
counter.set(10);

// Pattern mới v22 — khi cần convert ngược / update parent
const tempF = linkedSignal(() => (tempC() * 9) / 5 + 32, {
  set: (valF) => tempC.set(((valF - 32) * 5) / 9),
});
```

## Tham khảo
- [Angular v22 changelog — feat(core): add custom set option to linkedSignal](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
