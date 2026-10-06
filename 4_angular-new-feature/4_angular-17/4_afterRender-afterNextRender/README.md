# `afterRender` / `afterNextRender`

## Tổng quan

Angular 17 giới thiệu hai lifecycle hooks mới — `afterRender` và `afterNextRender` — giúp truy cập DOM sau khi render một cách an toàn. Đây là sự thay thế hiện đại cho `ngAfterViewInit`, hỗ trợ phases (giai đoạn) để tách biệt đọc/ghi DOM, tránh layout thrashing.

> Note version: trong v17 API chỉ là `afterRender(cb, {phase})` / `afterNextRender(cb)` — `cb` nhận `AfterRenderRef` để cleanup bằng `.destroy()`. Object spec `{write, read, mixedReadWrite, earlyRead}` là từ v18.1+. `viewChild.required()` là v17.2 preview / v18 stable (v17.0 dùng `viewChild()` + optional check). Từ v20 `afterRender` được rename thành `afterEveryRender` (giữ alias).

## Cấu trúc files

```
4_afterRender-afterNextRender/
├── src/
│   ├── app/
│   │   ├── app.component.html    # Template demo — input với visual feedback
│   │   ├── app.component.ts      # Component dùng afterRender với phases
│   │   ├── app.component.scss    # Styles
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routes
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.component.ts` — AfterRender với Phases (v17 style)

Demonstrates `afterRender(cb, {phase})` và `afterNextRender(cb)` — object spec `{write, read, ...}` là từ v18.1+, không dùng cho ví dụ v17:

```ts
import { afterNextRender, afterRender, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule],
})
export class AppComponent {
  secretWord = signal('angular17');
  word = signal('');
  success = computed(() => this.secretWord() === this.word());
  // Note: viewChild.required() là v17.2 preview / v18 stable — v17.0 dùng viewChild() + optional check
  wordBlock = viewChild<ElementRef>('wordBlock');

  constructor() {
    // Chạy MỘT LẦN sau render đầu tiên
    afterNextRender(() => {
      console.log('First render done:', this.wordBlock()?.nativeElement);
    });

    // Chạy sau MỖI render cycle (v17 style: callback + options.phase)
    // Giữ AfterRenderRef để .destroy() khi cleanup — tránh leak
    // (không gọi interval(...).subscribe() trực tiếp trong write mà không cleanup)
    const ref = afterRender(
      () => {
        const el = this.wordBlock()?.nativeElement;
        if (el) {
          el.style.backgroundColor = this.success() ? 'green' : 'red';
        }
      },
      { phase: 'write' }
    );
    // Khi không cần nữa: ref.destroy();
  }
}
```

**Giải thích:**
- `afterNextRender(cb)` — Chạy 1 lần sau render đầu tiên
- `afterRender(cb, {phase})` — Ghi vào DOM (phase `write`) / đọc DOM (phase `read`, `earlyRead`, `mixedReadWrite`)
- Luôn giữ `AfterRenderRef` để `.destroy()` khi cleanup
- Thứ tự thực thi: `earlyRead` → `write` → `mixedReadWrite` → `read`

### `src/app/app.component.html` — Template Demo

Template demo minh họa input với visual feedback qua afterRender:

```html
<h1 style="margin-left: 10px;">
    Angular v17: afterRender & afterNextRender
</h1>

<div class="word-block" #wordBlock>
    <input
        type="text"
        class="beautiful-input"
        [ngModel]="word()"
        (ngModelChange)="word.set($event);"
        placeholder="Find the secret word!"
    >
</div>

<p>
  {{word()}} - {{success()}}
</p>
```

**Cách hoạt động:**
1. User nhập text vào input → `word` signal cập nhật
2. `success` computed tự động so sánh với `secretWord`
3. `afterRender` callback chạy sau mỗi render cycle
4. Background color chuyển sang `green` khi đúng, `red` khi sai
5. Width animation chạy mượt mà qua RxJS `interval`

## So sánh `afterRender` vs `afterNextRender`

| Aspect | `afterRender` | `afterNextRender` |
|--------|---------------|-------------------|
| Số lần chạy | Mỗi render cycle | Chỉ 1 lần (render tiếp theo) |
| Use case | Reactive DOM updates | Library init, setup observers |
| Performance | Sử dụng thận trọng | An toàn cho mọi use case |
| Ví dụ | Auto-resize elements | Initialize Chart.js, IntersectionObserver |

## Các phases trong `afterRender`

### Render Cycle

`afterRender` (với phases) là hook detect DOM đã render xong.

```
Component update (signal thay đổi)
    │
    ▼
Angular Change Detection
    │
    ▼
DOM update (render)
    │
    ▼
afterRender phases chạy theo thứ tự:
    │
    ├── ① earlyRead        — Đọc DOM trước khi ghi (measurements)
    ├── ② write            — Ghi vào DOM (style, attributes)
    ├── ③ mixedReadWrite   — Đọc và ghi xen kẽ
    └── ④ read             — Đọc DOM sau khi ghi xong ✅ DOM 100% stable
```

```
Thứ tự thực thi: earlyRead → write → mixedReadWrite → read
```

### Phase nào "đúng nhất" để biết DOM render 100%?

| Phase | Khi nào dùng |
|-------|---------------|
| `earlyRead` | Đo kích thước element **trước khi** thay đổi |
| `write` | Ghi vào DOM, nhưng DOM chưa hoàn tất |
| `read` | ✅ DOM đã render xong, **an toàn để đọc** (measurements, positions) |

### Ví dụ thực tế (v17: callback + `options.phase` — object spec là v18.1+)

```ts
constructor() {
  // v17: mỗi phase là một afterRender riêng
  afterRender(() => {
    // Đọc kích thước TRƯỚC KHI thay đổi
    console.log(this.element()?.nativeElement.offsetHeight);
  }, { phase: 'earlyRead' });

  afterRender(() => {
    // Ghi thay đổi vào DOM
    const el = this.element()?.nativeElement;
    if (el) el.style.height = '100px';
  }, { phase: 'write' });

  afterRender(() => {
    // DOM đã render xong → an toàn đọc kết quả
    // Có thể dùng IntersectionObserver, getBoundingClientRect()...
    console.log(this.element()?.nativeElement.getBoundingClientRect());
  }, { phase: 'read' });
}
```

### Parameter Passing Between Phases (v18.1+ object spec — chỉ để tham khảo)

> Trong v17 không có parameter passing giữa phases vì mỗi `afterRender(cb, {phase})` là độc lập. Từ v18.1+ object spec `afterRender({earlyRead, write, read})` mới cho phép return value của phase trước truyền vào phase sau.

## Use Cases thực tế

### 1. Initialize Third-party Library

```ts
constructor() {
  afterNextRender(() => {
    // Chạy MỘT LẦN sau render đầu tiên
    const el = this.chartContainer().nativeElement;
    new Chart(el, { /* config */ });
  });
}
```

### 2. ResizeObserver

```ts
constructor() {
  afterNextRender(() => {
    this._resizeObserver = new ResizeObserver(() => {
      console.log('WINDOW RESIZED!');
    });
    this._resizeObserver.observe(this.resize()!.nativeElement);
  });
}
```

### 3. Dynamic Styling với Signals (v17 style)

```ts
const ref = afterRender(() => {
  // React to signal changes và update DOM
  const el = this.elementRef()?.nativeElement;
  if (el) el.style.width = this.width() + 'px';
}, { phase: 'write' });
// Cleanup: ref.destroy();
```

## Custom Inject Function

Có thể đóng gói OnInit logic vào custom inject function:

```ts
function afterNextRenderInit(fn: () => void) {
  afterNextRender(fn);
}
```

## Lưu ý quan trọng

1. **Chỉ dùng trong injection context** — Constructor hoặc field initializer
2. **Không hoạt động trên SSR** — Chỉ chạy trên client-side
3. **`afterNextRender`: chạy 1 lần** — Lý tưởng cho third-party library init
4. **`afterRender`: chạy mỗi render cycle** — Dùng thận trọng vì performance, luôn giữ `AfterRenderRef` để `.destroy()` khi cleanup (tránh leak `interval().subscribe()` trong callback)
5. **Tránh layout thrashing** — Đọc trước, ghi sau trong các phases riêng (v17: qua `options.phase`)
6. **Object spec `afterRender({write, read, ...})` là v18.1+**, không dùng cho ví dụ v17
7. **Từ v20 `afterRender` rename thành `afterEveryRender`** (giữ alias `afterRender`)

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular afterRender API](https://angular.dev/api/core/afterRender)
- [Angular afterNextRender API](https://angular.dev/api/core/afterNextRender)
- [afterRender & afterNextRender Hooks](https://medium.com/@amosisaila/angular-afterrender-afternextrender-new-phases-api-ddf2432455e2)