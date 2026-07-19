# Zoneless Change Detection

## Tổng quan

Zoneless là một experimental feature trong Angular 18 cho phép chạy ứng dụng **không cần zone.js** — thư viện truyền thống chịu trách nhiệm kích hoạt change detection. Mục tiêu là loại bỏ overhead của zone.js, giúp ứng dụng nhanh hơn và developer có kiểm soát tốt hơn về thời điểm change detection xảy ra.

> Change detection has always been a hot topic, and it's no wonder – it's one of the core concepts of any framework.

### Vấn đề với Zone.js

- **Performance overhead**: Patch tất cả async operations (HTTP, events, timers), thêm chi phí không cần thiết
- **Debugging complexity**: Zone.js sửa đổi cách async hoạt động, khiến debug khó khăn hơn
- **Unnecessary change detection**: Change detection chạy ngay cả khi state không thay đổi
- **Compatibility issues**: Một số modern browser APIs và third-party libraries không hoạt động tốt với zone.js

### Zoneless giải quyết vấn đề gì?

- Loại bỏ zone.js → ứng dụng gọn gàng hơn, nhanh hơn
- Developer kiểm soát thời điểm chạy change detection
- Kết hợp với Signals để tự động cập nhật UI mà không cần gọi thủ công

## Cấu trúc files

```
1_zoneless/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component - demo 3 scenarios
│   │   ├── app.routes.ts                 # Routes
│   │   ├── config/
│   │   │   └── app.config.ts             # Cấu hình zoneless provider
│   │   ├── components/
│   │   │   ├── click-event/
│   │   │   │   └── click-event.component.ts    # Demo: click event binding
│   │   │   ├── http-request/
│   │   │   │   └── http-request.component.ts   # Demo: HTTP request
│   │   │   └── set-interval/
│   │   │       └── set-interval.component.ts   # Demo: setInterval async
│   │   └── services/
│   │       └── todo.service.ts            # Todo service với mock data
│   ├── index.html
│   ├── main.ts                            # Bootstrap
│   └── styles.scss
├── zonejs.md                              # Zone.js notes
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/config/app.config.ts` — Cấu hình Zoneless

Đây là file quan trọng nhất, nơi kích hoạt zoneless mode bằng cách sử dụng `provideExperimentalZonelessChangeDetection()` thay vì `provideZoneChangeDetection()`.

```ts
import { ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }), // ← Tắt zone.js
    provideExperimentalZonelessChangeDetection(),              // ← Bật zoneless
    provideRouter(routes),
    provideHttpClient()
  ],
};
```

**Giải thích:**
- `provideExperimentalZonelessChangeDetection()` — kích hoạt change detection không cần zone.js
- Khi dùng zoneless, Angular sẽ **không tự động** chạy change detection sau mỗi async operation
- Developer cần chủ động gọi `ChangeDetectorRef.detectChanges()` hoặc sử dụng Signals

### `src/app/app.component.ts` — Root Component

Demo 3 scenarios khác nhau: click event, setInterval, và HTTP request — tất cả đều chạy trong zoneless mode.

```ts
import { Component, inject, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Todo, TodoService } from './services/todo.service';
import { ClickEventComponent } from './components/click-event/click-event.component';
import { HttpRequestComponent } from './components/http-request/http-request.component';
import { IntervalComponent } from './components/set-interval/set-interval.component';

@Component({
  selector: 'app-root',
  template: `
    <h1>Angular Without Zone.js</h1>
    <app-click-event />
    <app-interval [tick]="tick"/>
    <app-http-request (getTodoEvent)="getTodo()" [todos]="todos" />
    <button (click)="manualTriggerChangeDetection()">Manual Trigger</button>
  `,
  imports: [ClickEventComponent, HttpRequestComponent, IntervalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
  todos: Array<Todo> = [];
  tick = 0;

  private _todoService = inject(TodoService);
  private _subscription = new Subscription();
  private _cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    setInterval(() => {
      this.tick += 1;
      // this._cdr.detectChanges(); // ← Cần gọi thủ công trong zoneless
    }, 1000);
  }

  getTodo() {
    const getTodos$ = this._todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
      // this._cdr.detectChanges(); // ← Cần gọi thủ công trong zoneless
    });
    this._subscription.add(getTodos$);
  }

  manualTriggerChangeDetection() { }
}
```

**Giải thích:**
- Component sử dụng `ChangeDetectionStrategy.OnPush` kết hợp zoneless
- Các method `detectChanges()` bị comment out — trong zoneless mode, Angular không tự động detect
- Signal sẽ là giải pháp tốt hơn để tự động trigger change detection

### `src/app/components/click-event/click-event.component.ts` — Click Event Demo

So sánh 2 cách xử lý click: Angular Event Binding vs Vanilla JS addEventListener.

```ts
@Component({
  selector: 'app-click-event',
  template: `
    <div class="events">
      Number: {{ number }}
      <div>
        <button id="myButton">Increase number (Vanilla JS)</button>
        <button (click)="increaseNumber()">Increase number (Event Binding)</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ClickEventComponent implements AfterViewInit, OnDestroy {
  number = 0;
  private _button: HTMLElement | null = null;
  private _cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.initEventListener();
  }

  increaseNumber() {
    this.number += 1;
  }

  private initEventListener() {
    this._button = document.getElementById('myButton');
    this._button?.addEventListener('click', () => {
      this.increaseNumber();
      // this._cdr.detectChanges(); // ← Vanilla JS cần gọi thủ công
    });
  }
}
```

**Giải thích:**
- **Event Binding `(click)`** — Angular tự động detect changes (kể cả trong zoneless mode vì Angular zoneless hỗ trợ event binding)
- **Vanilla JS addEventListener** — Không qua Angular, cần gọi `detectChanges()` thủ công

### `src/app/components/set-interval/set-interval.component.ts` — Interval Demo

Component nhận `@Input` tick từ parent, minh họa việc zoneless không tự động detect khi giá trị thay đổi qua setInterval.

```ts
@Component({
  selector: 'app-interval',
  template: `
    <div class="interval">
      <div>Simple property set asynchronously</div>
      <div>Tick: {{ tick }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class IntervalComponent implements OnChanges {
  @Input({ required: true }) tick = 0;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
}
```

### `src/app/components/http-request/http-request.component.ts` — HTTP Request Demo

Component hiển thị danh sách todos với `@for` control flow, sử dụng event emission để trigger HTTP request từ parent.

```ts
@Component({
  selector: 'app-http-request',
  template: `
    @for (todo of todos; track todo.id) {
      <div>
        <p>ID: {{ todo.id }}</p>
        <p>User ID: {{ todo.userId }}</p>
        <p>Title: {{ todo.title }}</p>
        <p>Completed: {{ todo.completed }}</p>
      </div>
    } @empty {
      <div>There are no todos.</div>
    }
    <button (click)="getTodos()">Get Todo</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class HttpRequestComponent implements OnChanges {
  @Input({ required: true }) todos: Array<Todo> = [];
  @Output() getTodoEvent = new EventEmitter<null>();

  getTodos() {
    this.getTodoEvent.emit();
  }
}
```

### `src/app/services/todo.service.ts` — Todo Service

Service返還 mock data với delay 1.5s, mô phỏng HTTP request.

```ts
@Injectable({ providedIn: 'root' })
export class TodoService {
  private _httpClient = inject(HttpClient);
  private _url = 'https://jsonplaceholder.typicode.com/todos/';

  getTodos() {
    return of<Array<Todo>>([
      { userId: 1, id: 1, title: "delectus aut autem", completed: false },
      // ... mock data
    ]).pipe(delay(1500));
  }
}
```

## Cách kích hoạt Zoneless

### Bước 1: Loại bỏ zone.js

```bash
npm uninstall zone.js
```

### Bước 2: Bootstrap không có zone.js

```ts
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
  ],
});
```

### Bước 3: Trigger change detection thủ công

**Sử dụng ChangeDetectorRef:**
```ts
constructor(private cdr: ChangeDetectorRef) {}

incrementCounter() {
  this.counter++;
  this.cdr.markForCheck(); // Đánh dấu component cần check
}
```

**Sử dụng ApplicationRef:**
```ts
constructor(private appRef: ApplicationRef) {}

updateState() {
  this.message = 'Updated State';
  this.appRef.tick(); // Trigger change detection toàn cục
}
```

### Bước 4: Tối ưu với Signals (Recommended)

```ts
import { Component, signal } from '@angular/core';

@Component({
  template: `
    <h1>Signal Counter: {{ count() }}</h1>
    <button (click)="increment()">Increment</button>
  `,
})
export class SignalDemoComponent {
  count = signal(0);

  increment() {
    this.count.set(this.count() + 1); // Tự động trigger change detection
  }
}
```

## Tạo Zoneless App mặc định

```bash
ng new my-app --experimental-zoneless
```

## Coalescing trong Angular 18

Bắt đầu từ Angular 18, zone event coalescing được bật **theo mặc định** cho ứng dụng mới:

```ts
bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
});
```

Coalescing gộp nhiều change detection cycles thành một, giảm不必要的 rendering.

## So sánh: Zone.js vs Zoneless

| Aspect | Zone.js (Default) | Zoneless |
|--------|-------------------|----------|
| Change Detection Trigger | Tự động bởi zone.js | Thủ công hoặc Signal-based |
| Performance | Có overhead từ zone.js patching | Nhanh hơn, ít overhead |
| Debugging | Khó hơn do zone.js patching | Dễ hơn |
| Control | Framework tự quyết định | Developer kiểm soát |
| Setup | Mặc định | Cần cấu hình thủ công |
| Signals Integration | Hỗ trợ nhưng không bắt buộc | Optimized cho Signals |

## Lợi ích

1. **Tăng hiệu suất** — Loại bỏ overhead của zone.js patching
2. **Developer control** — Bạn quyết định thời điểm cập nhật UI
3. **Compatibility** — Hoạt động tốt với modern browser APIs và third-party libraries
4. **Reactive programming** — Kết hợp hoàn hảo với Signals

## Yêu cầu

- Angular 18+ (experimental)
- Node.js 18+

## Zoneless + OnPush: Vẫn cần hay không?

### Ngắn gọn: OnPush vẫn hữu ích nhưng vai trò thay đổi

### Khi dùng Zone.js (cũ)

- Zone.js tự động track tất cả async operations → trigger change detection toàn bộ app
- **OnPush** là cách tối ưu để **giới hạn** scope change detection, chỉ chạy khi `@Input` thay đổi reference hoặc `signal` thay đổi

### Khi dùng Zoneless (mới)

- Không còn Zone.js → Angular **không tự động** chạy change detection nữa
- Angular chỉ chạy change detection khi:
  1. **Signal** thay đổi giá trị
  2. Gọi `ChangeDetectorRef.markForCheck()` / `detectChanges()`
  3. Event handler trong template (click, input...)
  4. `async` pipe subscribed observable emit

### So sánh nhu cầu OnPush

| Trường hợp | Cần OnPush? | Lý do |
|---|---|---|
| Dùng **Signals** hoàn toàn | **Không cần** | Signals tự track dependency, Zoneless tự biết khi nào re-render |
| Vẫn dùng **`@Input()`** truyền object | **Vẫn cần** | OnPush đảm bảo component chỉ re-render khi input reference thay đổi |
| Vẫn dùng **Observables** + `async` pipe | **Vẫn cần** | OnPush + `markForCheck()` vẫn là pattern tốt |
| Legacy code chưa convert sang signals | **Vẫn cần** | Giữ behavior tương tự trước đây |

### Kết luận

```
Zoneless + Signals       = OnPush trở nên thừa
Zoneless + traditional   = OnPush vẫn hữu ích
```

Angular mới khuyến khích: **dùng Signals thay vì OnPush** vì Signals có **fine-grained reactivity** (chỉ re-render phần DOM thay đổi, không phải cả component). OnPush chỉ kiểm soát ở **component level**.

Vì vậy trong codebase mới với Zoneless, hãy ưu tiên **Signals** thay vì lo lắng về OnPush.

## Tài liệu tham khảo

- [Angular Zoneless Change Detection](https://angular.dev/guide/components/change-detection)
- [Zone.js và Angular](https://angular.dev/guide/overview)
- [Angular Signals](https://angular.dev/guide/signals)