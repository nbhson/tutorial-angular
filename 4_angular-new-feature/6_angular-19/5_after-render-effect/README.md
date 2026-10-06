# 5. afterRenderEffect

## Mô tả

`afterRenderEffect()` là lifecycle hook mới trong Angular 19 (experimental trong v19, **stable từ v20 / hiện tại đã stable**) kết hợp giữa `afterRender()` và `effect()`. Nó chỉ chạy lại callback khi **các signal dependency thay đổi** SAU KHI component render xong — thay vì chạy mỗi lần render như `afterRender()`.

> Cả `afterRender()` và `afterRenderEffect()` đều nhận callback `(onCleanup) => void` — dùng `onCleanup(fn)` để đăng ký hàm dọn dẹp trước lần chạy kế tiếp. Điểm khác: `afterRender()` trả về `void`, còn `afterRenderEffect()` trả về **`AfterRenderRef`** có method `.destroy()` để hủy effect.

## Vấn đề giải quyết

```ts
// ❌ afterRender() — chạy MỖI LẦN render, dù signal không thay đổi
afterRender(() => {
  console.log('rendered!'); // Log cả khi counter không đổi
});
```

```ts
// ✅ afterRenderEffect() — chỉ chạy KHI dependency thay đổi
afterRenderEffect(() => {
  console.log('counter:', this.counter()); // Chỉ log khi counter thay đổi
});
```

## Cú pháp

```ts
import { afterRenderEffect, AfterRenderPhase } from '@angular/core';

// Chạy ít nhất 1 lần sau lần render kế tiếp, sau đó chỉ chạy lại khi signal đổi
const ref: AfterRenderRef = afterRenderEffect((onCleanup) => {
  // Đọc signal ở đây — Angular tự track dependency
  const value = this.someSignal();
  // Side effect sau render khi value thay đổi
  doSomething(value);

  onCleanup(() => cleanup(value));
},
// options mở rộng — chọn phase đọc/ghi DOM:
{ injector, debugName, phase: 'mixedReadWrite' /* | 'earlyRead' | 'write' | 'read' */ });

// Hủy khi không cần nữa
ref.destroy();
```

| Phase | Mô tả |
|-------|-------|
| `earlyRead` | Đọc DOM sớm, trước khi Angular ghi |
| `write` | Ghi DOM (thay đổi layout) |
| `mixedReadWrite` | Vừa đọc vừa ghi (mặc định) |
| `read` | Chỉ đọc DOM sau khi ghi xong |

> Chỉ chạy trên **browser** (không chạy trên server/SSR). Callback **luôn chạy ít nhất 1 lần** sau lần render kế tiếp, kể cả khi chưa có dependency nào — các lần sau mới gate theo signal change.

## Files trong project

### `src/app/app.component.ts`

```ts
import { afterRender, afterRenderEffect, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  counter = signal(0);
  number = 0;

  constructor() {
    // ✅ Only runs when counter() changes, after render
    afterRenderEffect(() => {
      console.log('after render effect', this.counter());
    });

    // ❌ Runs every render, even if counter unchanged
    afterRender(() => {
      console.log('after render', this.counter());
    });
  }

  updateSignal() {
    this.counter.update(value => value + 1);
    console.log('update view', this.counter());
  }

  updateNumber() {
    this.number++;
    console.log('update number', this.number);
  }
}
```

### `src/app/app.component.html`

```html
<button (click)="updateSignal()">Update signal</button>
<button (click)="updateNumber()">Update normal view</button>

<br>
{{ counter() }}
<br>
{{ number }}
```

## Flow so sánh

```
Click "Update signal":
├── counter.signal++ → re-render
├── afterRenderEffect: CHẠY (counter thay đổi) ✅
└── afterRender: CHẠY ✅

Click "Update normal view":
├── number++ → re-render (signal KHÔNG thay đổi)
├── afterRenderEffect: KHÔNG chạy (no dependency change) ✅
└── afterRender: CHẠY (luôn chạy) ❌ wasteful!
```

## So sánh chi tiết

| Feature | `afterRender()` | `afterRenderEffect()` |
|---------|----------------|----------------------|
| Khi chạy | Sau mỗi lần render | Sau render khi dependency thay đổi |
| Track signals | ❌ Không | ✅ Có |
| Return value | `void` | `AfterRenderRef` (có `.destroy()` để hủy effect) |
| Cleanup | `onCleanup(fn)` | `onCleanup(fn)` |
| Use case | DOM operations cố định | Side effects phụ thuộc signal |
| Performance | Chạy thừa nếu không thay đổi | Tối ưu — chỉ chạy khi cần |

## Khi nào dùng afterRenderEffect?

- **Third-party library integration** cần update khi data thay đổi (chart, map)
- **DOM manipulation** phụ thuộc reactive data
- **Analytics/tracking** chỉ khi user thực sự thay đổi state
- **Scroll position** restore sau khi data load xong

## Reference

- [Angular afterRenderEffect API](https://angular.dev/api/core/afterRenderEffect)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [afterRender vs afterRenderEffect](https://angular.love/angular-19-whats-new)