# 2. Signal Diagnostics (Angular 20)

## Tổng quan

Angular 20 giới thiệu **Signal Diagnostics** — bộ công cụ debug mới giúp developer hiểu tại sao **signal không cập nhật**, **component không re-render**, hoặc **computed value không thay đổi**. Đây là tooling quan trọng khi làm việc với Signals.

## API mới

```typescript
// Trong development mode
import { signal, computed } from '@angular/core';

const count = signal(0);
const double = computed(() => count() * 2);

// Debug thông tin
console.log(count.debug);
console.log(double.debug);
```

## Tại sao cần feature này?

Khi làm việc với Signals, developer thường gặp các vấn đề:

| Vấn đề | Giải thích |
|---|---|
| **Signal không update** | Không biết tại sao signal không thay đổi |
| **Component không re-render** | Không biết signal nào đang liên kết |
| **Computed stale** | Không biết dependency chain |
| **Circular dependency** | Signals tham chiếu lẫn nhau |

Signal Diagnostics cung cấp:
- **Debug metadata** cho mỗi signal
- **Dependency graph** visualization
- **Change tracking** logs
- **Error messages** rõ ràng hơn

## Ví dụ thực tế

### 1. Basic Debug

```typescript
import { signal, computed } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

// Xem debug info
console.log(count.debug);
// {
//   name: 'count',
//   value: 0,
//   equality: Object.is,
//   ...
// }

console.log(doubled.debug);
// {
//   name: 'doubled',
//   value: 0,
//   equal: ...,
//   ...
// }
```

### 2. Component Debug

```typescript
@Component({
  selector: 'app-debug',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubled() }}</p>
    <button (click)="increment()">+</button>
  `
})
export class DebugComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }

  // Debug trong dev mode
  ngDoCheck() {
    console.log('Debug info:', {
      count: this.count.debug,
      doubled: this.doubled.debug
    });
  }
}
```

### 3. Template Debug

```html
<!-- Dev mode hiển thị signal values -->
@defer {
  <p>{{ count() }}</p>
}

<!-- Dev mode logs signal changes -->
@if (count() > 10) {
  <p>Count is large</p>
}
```

### 4. Circular Dependency Detection

```typescript
// Angular sẽ detect và warn
const a = computed(() => b() + 1);  // ⚠️ Warning
const b = computed(() => a() + 1);  // Circular dependency!
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// Không có debug tools
const count = signal(0);

// Phải console.log thủ công
effect(() => {
  console.log('count changed:', count());
});
```

### Sau Angular 20

```typescript
const count = signal(0);

// Built-in debug info
console.log(count.debug);

// Better error messages
// "Signal 'count' has not been updated because..."
```

**Lợi ích:**
- ✅ Debug signal values dễ dàng
- ✅ Xem dependency graph
- ✅ Detect circular dependencies
- ✅ Better error messages
- ✅ DevTools integration

## Best practices

1. **Dùng Angular DevTools** để inspect signals
2. **Kiểm tra `debug` property** khi debug
3. **Dùng computed()** thay vì manual dependency tracking
4. **Tránh circular dependencies**
5. **Use production mode** khi deploy

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/2_developer-experience/2_signal-diagnostics
npm install
ng serve