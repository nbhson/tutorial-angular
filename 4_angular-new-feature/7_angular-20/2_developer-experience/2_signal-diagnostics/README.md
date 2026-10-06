# 2. Signal Diagnostics (đã hiệu chỉnh — KHÔNG có `.debug` public API)

> Đính chính toàn file: **KHÔNG có `signal.debug` / `computed.debug` public API**.
> Feature thật quanh v20 là **Angular DevTools hiển thị signals graph**
> + **`provideCheckNoChangesConfig()`** (#60906, cấu hình check-no-changes)
> + cảnh báo circular dependency / error message cải thiện.
> Mọi ví dụ `count.debug` trước đây là **invented**.

## Feature thật

```typescript
// 1. DevTools: inspect signal values + dependency graph trong Components tab.
// 2. Cấu hình check-no-changes (thay vì debug property):
import { provideCheckNoChangesConfig } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    // #60906 — cấu hình mức check (ví dụ giữ behavior cũ khi migrate zoneless)
    // xem docs provideCheckNoChangesConfig
  ]
});
```

```typescript
// 3. Debug đúng cách: dùng effect() để log (runtime) + DevTools để inspect:
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('count changed:', count(), 'doubled:', doubled());
});
```

## Tại sao vẫn cần `effect()`?

| | `effect()` (runtime) | DevTools inspect (dev-time) |
|---|---|---|
| **Mục đích** | Thực thi side effects khi signal thay đổi | Xem trạng thái/dependency graph |
| **Chạy khi nào** | Tự động khi dependency thay đổi | Khi bạn mở DevTools |
| **Production?** | Có | Không |

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

### 1. Debug đúng: effect + DevTools (thay cho `.debug`)

```typescript
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('count:', count(), 'doubled:', doubled());
});
// + Mở Angular DevTools → Components tab → xem signal graph.
```

### 2. Component Debug đúng

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

  constructor() {
    effect(() => console.log('debug:', this.count(), this.doubled()));
  }

  increment() {
    this.count.update(c => c + 1);
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

### Sau (đúng): DevTools + effect + `provideCheckNoChangesConfig()` (#60906)

```typescript
const count = signal(0);

effect(() => {
  console.log('count changed:', count());
});
// + DevTools signals graph + error message cải thiện.
```

**Lợi ích (thật):**
- ✅ Inspect signals trong Angular DevTools
- ✅ `provideCheckNoChangesConfig()` (#60906)
- ✅ Detect circular dependencies (warning thật)
- ✅ Better error messages
- ✅ DevTools integration

## `effect()` vs inspect — phân biệt đúng

> **Câu hỏi thường gặp:** "Nếu đã có debug rồi thì effect còn ý nghĩa nữa không?"

**Câu trả lời: Có. `effect()` và debug là hai khái niệm hoàn toàn khác nhau.**

### `effect()` — Công cụ runtime (thực thi side effects)

`effect()` dùng để **thực thi code** mỗi khi signal thay đổi giá trị. Đây là reactive primitive phục vụ **business logic**:

```typescript
const count = signal(0);

// effect THỰC HIỆN một hành động khi count thay đổi
effect(() => {
  localStorage.setItem('count', count());  // Side effect: ghi localStorage
});

effect(() => {
  analytics.track('count_changed', count());  // Side effect: gửi analytics
});

effect(() => {
  document.title = `Count: ${count()}`;  // Side effect: cập nhật DOM
});
```

### Inspect (DevTools) — chỉ xem trạng thái

```typescript
// Mở DevTools → xem signal values/graph. Không thực thi logic.
// ❌ Không tồn tại: console.log(count.debug)
```

### So sánh

| | `effect()` | DevTools inspect |
|---|---|---|
| **Mục đích** | Thực thi side effects khi signal thay đổi | Kiểm tra/inspect trạng thái signal |
| **Chạy khi nào** | Tự động mỗi khi dependency thay đổi | Chỉ khi bạn mở DevTools |
| **Có thay đổi state không?** | Có thể (ghi file, gọi API, update DOM) | Không — chỉ đọc |
| **Cần trong production?** | Có | Không (chỉ dev mode) |
| **Ví dụ** | `effect(() => saveToDB(count()))` | DevTools Components tab |

### Kết luận

**`effect()` vẫn hoàn toàn có ý nghĩa** vì:

1. Debug chỉ cho bạn **xem** signal — `effect()` **hành động** khi signal thay đổi
2. Debug là **dev tool** — `effect()` là **runtime logic**
3. Không có `effect()` thì bạn không có cách nào chạy side effects reactive
4. Hai công cụ **bổ trợ** cho nhau: dùng debug để hiểu signal, dùng effect để phản ứng với sự thay đổi của signal

---

## Best practices

1. **Dùng Angular DevTools** để inspect signals (không có `.debug` API)
2. **Dùng `provideCheckNoChangesConfig()`** (#60906) khi cần cấu hình check
3. **Dùng computed()** thay vì manual dependency tracking
4. **Tránh circular dependencies**
5. **Use production mode** khi deploy

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/2_developer-experience/2_signal-diagnostics
npm install
ng serve