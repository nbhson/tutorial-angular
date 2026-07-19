# `afterRender` / `afterNextRender`

## Tổng quan

Angular 17 giới thiệu hai lifecycle hooks mới — `afterRender` và `afterNextRender` — giúp truy cập DOM sau khi render một cách an toàn. Đây là sự thay thế hiện đại cho `ngAfterViewInit`, hỗ trợ phases (giai đoạn) để tách biệt đọc/ghi DOM, tránh layout thrashing.

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

### `src/app/app.component.ts` — AfterRender với Phases

Demonstrates `afterRender` với 3 phases: `write`, `mixedReadWrite`, `read`:

```ts
import { afterRender, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { animationFrameScheduler, interval, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule],
})
export class AppComponent {
  secretWord = signal('angular18');
  word = signal('');
  success = computed(() => this.secretWord() === this.word());
  wordBlock = viewChild<ElementRef>('wordBlock');
  subscriptions: Subscription[] = [];

  constructor() {
    afterRender({
      write: () => {
        // Ghi vào DOM — thay đổi background color
        this.wordBlock()!.nativeElement.style.backgroundColor = this.success()
          ? 'green'
          : 'red';

        // Animation với RxJS
        this.subscriptions.push(
          interval(0, animationFrameScheduler)
            .pipe(take(10))
            .subscribe({
              next: (percentage) => {
                this.wordBlock()!.nativeElement.style.width = percentage + '%';
              },
              complete: () => {
                this.subscriptions.forEach((subs) => subs.unsubscribe());
              }
            })
        );
      },
      read: (data) => {
        // Đọc DOM sau khi ghi
        console.log(data);
      },
      mixedReadWrite: (data) => {
        // Đọc và ghi xen kẽ
        console.log(data);
      },
    });
  }
}
```

**Giải thích:**
- `write` phase — Ghi vào DOM (thay đổi style, thêm/xóa elements)
- `read` phase — Đọc DOM sau khi ghi (lấy measurements)
- `mixedReadWrite` phase — Đọc và ghi xen kẽ (sử dụng thận trọng)
- Thứ tự thực thi: `earlyRead` → `write` → `mixedReadWrite` → `read`

### `src/app/app.component.html` — Template Demo

Template demo minh họa input với visual feedback qua afterRender:

```html
<h1 style="margin-left: 10px;">
    Angular v18.1.0-next.2: afterNextRender & afterRender new Design
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

### Ví dụ thực tế

```ts
constructor() {
  afterRender({
    earlyRead: () => {
      // Đọc kích thước TRƯỚC KHI thay đổi
      return this.element().nativeElement.offsetHeight;
    },
    write: (oldHeight) => {
      // Ghi thay đổi vào DOM
      this.element().nativeElement.style.height = oldHeight * 2 + 'px';
    },
    read: (newHeight) => {
      // DOM đã render xong → an toàn đọc kết quả
      console.log('New height:', newHeight);
      // Có thể dùng IntersectionObserver, getBoundingClientRect()...
    },
  });
}
```

### Parameter Passing Between Phases

```ts
afterRender({
  earlyRead: () => {
    // Không nhận tham số từ phase trước
    return this.measureElement();
  },
  write: (measurement) => {
    // Nhận return value từ earlyRead
    this.applyStyles(measurement);
  },
  read: (previousResult) => {
    // Nhận return value từ write
    return this.verifyUpdate();
  },
});
```

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

### 3. Dynamic Styling với Signals

```ts
afterRender({
  write: () => {
    // React to signal changes và update DOM
    this.elementRef().nativeElement.style.width = this.width() + 'px';
  }
});
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
4. **`afterRender`: chạy mỗi render cycle** — Dùng thận trọng vì performance
5. **Tránh layout thrashing** — Đọc trước, ghi sau trong các phases riêng

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular afterRender API](https://angular.dev/api/core/afterRender)
- [Angular afterNextRender API](https://angular.dev/api/core/afterNextRender)
- [afterRender & afterNextRender Hooks](https://medium.com/@amosisaila/angular-afterrender-afternextrender-new-phases-api-ddf2432455e2)