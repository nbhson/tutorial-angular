# Signals-Based Performance — Fine-grained Reactivity & Zoneless

> Nguồn: https://angular.dev/guide/signals — https://angular.dev/guide/zoneless — https://angular.dev/best-practices/skipping-subtrees

## Ý tưởng cốt lõi

Change detection cổ điển quét **toàn bộ component tree** mỗi lần có sự kiện. Signals đổi cách chơi: mỗi chỗ đọc dữ liệu trong template được **đăng ký chính xác** với signal đã đọc — khi signal thay đổi, chỉ những chỗ đó được tính lại và render lại:

```
Zone.js:     mọi event → quét toàn bộ cây → tìm chỗ đổi → patch DOM
Signals:     signal.set() → chỉ graph phụ thuộc bị ảnh hưởng → patch DOM nhỏ nhất
```

Đây là lý do Angular chuyển hẳn sang signals + zoneless: **fine-grained reactivity** — chi phí change detection tỉ lệ với phần UI thực sự thay đổi, không còn tỉ lệ với tổng số component.

## Các building block hiệu năng

### 1. `signal()` — state gốc

```typescript
@Component({
  template: `
    <p>Bạn là: {{ count() }}</p>       <!-- chỉ render lại khi count đổi -->
    <button (click)="inc()">+1</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  inc() { this.count.update((c) => c + 1); }
}
```

Gọi `count()` trong template là **đăng ký phụ thuộc** — không cần `OnPush`, không cần `markForCheck`.

### 2. `computed()` — tính lại đúng chỗ cần

`computed()` cache kết quả và **chỉ tính lại khi dependency thực sự đổi**:

```typescript
export class OrderComponent {
  items = signal<CartItem[]>([]);
  total = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.qty, 0)
  ); // items() không đổi → lần đọc sau trả cache, không tính lại
}
```

So sánh với getter thường (mỗi lần CD chạy sẽ tính lại toàn bộ) — computed tiết kiệm hẳn phần tính toán thừa.

### 3. `input()` / `output()` — component graph gọn

```typescript
export class UserRowComponent {
  user = input.required<User>();
  selected = model(false); // two-way bằng signal
  onSelect = output<void>();
}
```

Signal input chỉ kích hoạt render khi **reference** đổi — thay thế phần lớn cạm bẫy mutation của `@Input` cũ.

### 4. `linkedSignal` — state phụ thuộc

```typescript
// reset về giá trị mặc định khi list đổi — không cần effect tự viết
sortKey = linkedSignal<string[], string>({
  source: this.columns,
  computation: (cols, previous) =>
    cols.includes(previous?.[0] ?? '') ? previous![0] : cols[0],
});
```

## So sánh với các kỹ thuật cũ

| Kỹ thuật cũ | Thay bằng signal | Lợi ích hiệu năng |
|---|---|---|
| `@Input()` + `ngOnChanges` | `input()`, `computed()` | Không chạy code thừa khi input không đổi thật |
| `async` pipe + BehaviorSubject | `toSignal()` / `resource()` | Bỏ subscribe/unsubscribe, tự track |
| `markForCheck()` tay | `signal.set()` | Không quét cả ancestor chain |
| Zone.js quét toàn cây | Zoneless + signal | Không có overhead zone, render đúng chỗ |
| `ngDoCheck` hack | `effect()`/`computed()` | Chạy đúng lúc, tránh CD storm |

## RxJS ↔ Signals: dùng đúng công cụ

- **State + derived state** → `signal`/`computed` (sync, push-based, fine-grained).
- **Luồng sự kiện async** (debounce, retry, stream) → RxJS, rồi chuyển sang signal bằng `toSignal`.
- **Async data fetch** → `resource`/`httpResource` (stable từ v22) — có loading/error state sẵn.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ template: '<span>{{ search() }}</span>' })
export class SearchComponent {
  query = signal('');
  private debounced$ = toObservable(this.search).pipe(
    debounceTime(300),
    switchMap((q) => this.api.search(q)),
  );
  results = toSignal(this.search$, { initialValue: [] }); // signal từ stream
}
```

## Zoneless: bỏ overhead cuối cùng

Từ v21 zoneless là mặc định, v22 tiếp tục chuẩn hóa — bỏ Zone.js nghĩa là:

- Bundle nhẹ hơn (không zone.js ~40KB gzipped gồm cả patch monkey).
- Mọi update đi qua **signal graph** → Angular biết chính xác cái gì đổi.
- `setTimeout`/Promise/timer ngoài template **không** gây re-render thừa.

```typescript
// app.config.ts — mặc định của app mới v21+, v22 giữ nguyên
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};
```

> App cũ có zone: migration `ng generate @angular/core:zoneless` (schematic chuyển đổi từng bước). Trước khi bỏ Zone, đảm bảo mọi nơi update state đều qua signal hoặc gọi `markForCheck` đúng chỗ.

## Pattern hiệu năng điển hình với signals

### 1. `computed` cho derived state — tránh tính lại trong template

```typescript
// ❌ gọi filter mỗi lần CD chạy
get filtered() { return this.items().filter((i) => i.active); }

// ✅ chỉ tính lại khi items đổi
filtered = computed(() => this.items().filter((i) => i.active));
```

### 2. `@for` + `track` — cho phép Angular tái sử dụng DOM node

```html
@for (row of rows(); track row.id) {
  <app-row [row]="row" />
}
```

Kết hợp `track` đúng + signal list → khi 1 row đổi, chỉ row đó re-render.

### 3. `untracked` — đọc signal không tạo phụ thuộc

```typescript
// tránh render lại khi chỉ đọc tham số, không dùng cho render
save() {
  const snapshot = untracked(this.formValue);
  this.api.save(snapshot);
}
```

### 4. `@defer` — chia nhỏ bundle theo tương tác

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="data()" />
} @placeholder {
  <div class="chart-skeleton"></div>
}
```

## Đo lường trước — sau

1. **Angular DevTools** (extension Chrome) → tab *Change Detection*: đếm số lần quét từng component.
2. `ng build` → so sánh **initial bundle size** trước/sau khi bỏ Zone.js.
3. Performance tab của Chrome: đo INP/LCP trước và sau khi zoneless — target là event handling không block main thread lâu.

## Checklist

- [ ] State dùng `signal`, derived dùng `computed` — không dùng property thường cho render.
- [ ] Đã bỏ Zone.js (zoneless) — mọi update state qua signal.
- [ ] Không còn `markForCheck()` tay trong code mới.
- [ ] `@for` luôn có `track`, list lớn có virtual scroll.
- [ ] Đo bằng DevTools trước và sau mỗi tối ưu.

## Tham khảo

- [Signals — angular.dev](https://angular.dev/guide/signals)
- [Zoneless change detection](https://angular.dev/guide/zoneless)
- [Skipping subtrees](https://angular.dev/best-practices/skipping-subtrees)
- [NgRx SignalStore — state lớn trên signals](https://ngrx.io/guide/signals/signal-store)
