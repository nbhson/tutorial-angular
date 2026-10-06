# Angular Signals (Angular 16 - Developer Preview)

> Signals là primitive reactive đại diện cho giá trị và cho phép theo dõi thay đổi theo cách được kiểm soát. Signals giúp Angular tối ưu change detection - chỉ update components thực sự thay đổi.

## Vấn đề

Với Default Change Detection, Angular phải check **tất cả components** trên trang vì không biết chính xác cái gì đã thay đổi. Signals giúp Angular biết **chính xác** phần nào cần update.

## Writable Signals

```ts
@Component({
  selector: 'app-counter',
  template: `
    <h1>Counter: {{counter()}}</h1>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  counter = signal(0);

  increment() {
    // set() - đặt giá trị mới trực tiếp
    this.counter.set(this.counter() + 1);

    // update() - tính từ giá trị cũ
    this.counter.update(prev => prev + 1);
  }
}
```

**Cách đọc giá trị:** Gọi signal như function → `counter()`

**Cách thay đổi:**
```ts
this.counter.set(5);                        // Đặt giá trị mới
this.counter.update(prev => prev + 1);      // Tính từ giá trị cũ
```

## Computed Signals

Signal được tạo từ signal khác. Tự động cập nhật khi signal nguồn thay đổi:

```ts
counter = signal(0);
multiplier = signal(10);
derivedCounter = computed(() => {
  return this.counter() * this.multiplier();
});
```

**Cơ chế hoạt động:**
1. Khi tạo computed, function được gọi 1 lần để lấy initial value
2. Angular theo dõi các signal nào được đọc (gọi dạng `counter()`) bên trong computed để xác định dependency
3. Khi signal nguồn thay đổi → computed signal tự động cập nhật (lazy - chỉ tính lại khi có nơi đọc)

**Lưu ý quan trọng - dependencies là động:**
```ts
counter = signal(0);
multiplier = signal(5);

// ❌ SAI - dependency bị mất khi multiplier() < 10 vì counter() không được gọi
derivedCounter = computed(() => {
  if (this.multiplier() < 10) return 0;
  return this.counter() * this.multiplier();  // counter() không được gọi ở nhánh này!
});

// ✅ ĐÚNG - luôn đọc signal nguồn trong mọi nhánh nếu muốn giữ dependency
derivedCounter = computed(() => {
  const count = this.counter();
  if (this.multiplier() < 10) return 0;
  return count * this.multiplier();
});
```

**Dependencies là động** - được xác định lại mỗi khi computed function chạy lại. Chỉ signal nào thực sự được đọc ở lần chạy đó mới là dependency.

## untracked() - Đọc không tạo dependency

```ts
derivedCounter = computed(() => {
  return untracked(() => this.counter()) * 10;  // Đọc counter nhưng không tạo dependency
});
```

> `untracked()` nhận vào một function, mọi signal đọc bên trong function đó đều không bị track làm dependency.

## Effect API

Effect dùng cho side effects (logging, localStorage, API calls...). Effect tự động theo dõi các signal được đọc bên trong và chạy lại khi chúng thay đổi:

```ts
counter = signal(0);
derivedCounter = computed(() => this.counter() * 10);

effect(() => {
  const currentCount = this.counter();
  const derived = this.derivedCounter();
  console.log(`values: ${currentCount} ${derived}`);
});
```

**Quy tắc theo official:**
- Effect theo dõi **động** các signal được đọc bên trong và chạy lại khi bất kỳ dependency nào thay đổi.
- Effect chạy **ít nhất 1 lần** khi khởi tạo.
- Thời điểm chạy do framework schedule (không đồng bộ ngay sau `set()`), nên chỉ dùng effect cho side-effect, không dùng để tạo derived value hay đồng bộ state.
- Effect phải được tạo trong **injection context** (vd: field initializer, constructor của component/directive/service). Nếu tạo ở nơi khác phải truyền `Injector` qua option `{ injector: ... }`.
- Mặc định effect tự hủy khi context (component/directive) bị destroy. Option `{ manualCleanup: true }` chỉ tồn tại trong giai đoạn v16 developer preview - từ v17 phải tạo effect trong injection context để tự cleanup, hoặc truyền `injector` tường minh nếu tạo ở nơi khác.

### Cơ chế Dependency Tracking trong Effect

**Điểm mấu chốt:** Chỉ có Signal **READ** (gọi signal function như `this.query()`) mới được theo dõi làm dependency. Signal **WRITE** (`.set()`, `.update()`) KHÔNG được track.

```ts
effect(() => {
  const q = this.query();                    // ✅ READ → được track làm dependency
  this.results.set(this.filterResults(q));   // ❌ GHI → KHÔNG được track
});
// → Effect chỉ chạy lại khi `query` thay đổi, KHÔNG chạy lại khi `results` thay đổi
```

**Bảng tóm tắt:**

| Thao tác | Code | Được track? | Gây effect chạy lại? |
|----------|------|-------------|---------------------|
| **Đọc signal** | `this.query()` | ✅ Có | ✅ Có (khi giá trị thay đổi) |
| **Ghi signal** | `this.results.set(...)` | ❌ Không | ❌ Không |
| **Đọc computed** | `this.fullName()` | ✅ Có | ✅ Có (khi giá trị thay đổi) |

**Vì sao không gây vòng lặp vô tận?**

```ts
// ✅ An toàn - chỉ đọc `query` làm trigger, ghi `results` không tạo loop
effect(() => {
  const q = this.query();              // READ → track query
  this.results.set(this.filterResults(q)); // WRITE → không track
});
```

**Trường hợp đọc và ghi CÙNG signal:**
```ts
// ❌ Angular phát hiện đọc + ghi cùng signal → BỎ QUA (skip write) để tránh loop
effect(() => {
  const count = this.count();          // READ → track count
  this.count.set(count + 1);           // WRITE count → Angular SKIP write
});
```

**Rule đơn giản:**
```
Gọi hàm signal ()  = READ  = Track (tạo dependency)
Gọi .set()/.update() = GHI   = Không track (không tạo dependency)
```

**Cleanup:**
```ts
// Tạo effect trong injection context (field/constructor) - tự cleanup khi destroy
export class CounterComponent {
  constructor() {
    effect(() => {
      console.log(this.counter());
    });  // ✅ Tự destroy theo component, không cần manualCleanup
  }
}

// onCleanup callback - dọn tài nguyên mỗi lần effect chạy lại hoặc bị destroy
effect((onCleanup) => {
  const subscription = this.dataService.getData().subscribe();
  onCleanup(() => {
    subscription.unsubscribe();  // Cleanup khi effect chạy lại hoặc destroyed
  });
});
```

> Lưu ý: `{ manualCleanup: true }` chỉ tồn tại ở v16 developer preview. Cách đúng từ v16 stable trở đi là tạo effect trong injection context để framework tự cleanup, hoặc truyền `injector` tường minh nếu cần.

## Equality Check

Signal mặc định dùng `===` (object identity) để so sánh (`equal` mặc định là `defaultEquals`). Quy trình 2-phase:

1. Khi `set()`/`update()` với giá trị mới, signal so sánh với giá trị cũ bằng hàm `equal`.
2. Nếu `equal(a, b) === true` → không emit, computed/effect/template phụ thuộc sẽ không chạy lại.

```ts
// Object signal - === luôn khác vì khác reference dù data giống nhau
object = signal({ id: 1, title: "Angular" });

// Click Update nhiều lần → computed/effect chạy lại mỗi lần (wasteful!)
this.object.set({ id: 1, title: "Angular" });  // Same data nhưng khác reference!

// Giải pháp - custom equality function
object = signal(
  { id: 1, title: "Angular" },
  {
    equal: (a, b) => a.id === b.id && a.title === b.title,
  }
);
```

## Mutating Objects/Arrays

```ts
list = signal(["Hello", "World"]);
object = signal({ id: 1, title: "Angular" });

// ❌ SAI - mutate trực tiếp qua dấu [] (không trigger signal update)
this.list().push("Again");
this.object().title = "New Title";

// ✅ ĐÚNG - luôn dùng set() hoặc update()
this.list.update(prev => [...prev, "Again"]);
this.object.update(prev => ({ ...prev, title: "New Title" }));
```

## `mutate()` - Có ở v16, bị xóa ở v17 ❌

> `mutate()` **vẫn tồn tại trong Angular 16** (developer preview). Nó chỉ bị **xóa từ Angular 17** (PR #51821). Từ v17 trở đi chỉ dùng `update()` với immutable pattern.

```ts
// ⚠️ mutate() - vẫn dùng được ở v16 nhưng KHÔNG nên dùng nữa (bị xóa ở v17)
qtyAvailable = signal([1, 2, 3, 4, 5]);

addQuantity() {
  this.qtyAvailable.mutate(v => v.push(v[v.length - 1] + 1));
}
// mutate() thay đổi array/object bên trong signal trên cùng reference
// → phá vỡ immutability, khó detect thay đổi → bị xóa ở v17 (PR #51821)
```

**Tại sao mutate bị xóa?**
- `mutate()` mutate trực tiếp giá trị bên trong signal (giống `this.list().push()`)
- Nó phá vỡ nguyên lý immutability của signals
- Không thể detect được thay đổi một cách đáng tin cậy

**Cách thay thế - dùng `update()`:**

```ts
qtyAvailable = signal([1, 2, 3, 4, 5]);

// ✅ Thay thế mutate bằng update + spread operator
addQuantity() {
  this.qtyAvailable.update(prev => [...prev, prev[prev.length - 1] + 1]);
}

// ✅ Thay thế mutate cho object
selectedVehicle = signal({ id: 1, name: 'AT-AT', price: 10000 });

updatePrice() {
  // ❌ mutate (deprecated)
  // this.selectedVehicle.mutate(v => v.price = v.price + (v.price * 0.2));

  // ✅ update (cách đúng)
  this.selectedVehicle.update(prev => ({
    ...prev,
    price: prev.price + (prev.price * 0.2)
  }));
}
```

**So sánh mutate vs update:**
```
mutate():                          update():
┌─────────────┐                    ┌─────────────┐
│signal [1,2,3]│──push──► [1,2,3,4]│signal [1,2,3]│
│cùng reference│  (same object!)   │              │
└─────────────┘                    └──────┬──────┘
  ❌ === true (same ref)                  │
  ❌ Không trigger update                 ▼
                                    ┌─────────────┐
                                    │[1,2,3]→[...p,4]│
                                    │object mới!    │
                                    │ !== true      │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ✅ Trigger update!
```

## Read-Only Signals

```ts
counter = signal(0);

// computed() tạo read-only signal
const derived = computed(() => this.counter() * 10);
// derived.set(50);  // ❌ Compile error

// asReadonly() chuyển writable → read-only
const readonlyCounter = this.counter.asReadonly();
// readonlyCounter.set(5);  // ❌ Compile error
```

## Signals & OnPush

Signals tự động integrate với OnPush components - không cần `markForCheck()`:

```ts
@Component({
  selector: 'counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update(v => v + 1);  // Auto markForCheck!
  }
}
```

**So sánh với OnPush cũ:**
```ts
// Cũ - phải dùng markForCheck()
num = 1;
private cdr = inject(ChangeDetectorRef);
ngOnInit() {
  setInterval(() => {
    this.num++;
    this.cdr.markForCheck();  // Manual!
  }, 1000);
}

// Mới - dùng signal
num = signal(1);
ngOnInit() {
  setInterval(() => {
    this.num.update(v => v + 1);  // Auto!
  }, 1000);
}
```

## Sharing Signals Across Components

```ts
// counter.service.ts
@Injectable({ providedIn: 'root' })
export class CounterService {
  private counterSignal = signal(0);
  readonly counter = this.counterSignal.asReadonly();

  incrementCounter() {
    this.counterSignal.update(val => val + 1);
  }
}

// component.ts
export class AppComponent {
  private counterService = inject(CounterService);
  counter = this.counterService.counter;

  increment() {
    this.counterService.incrementCounter();
  }
}
```

> **HTML sẽ tự động cập nhật khi signal ở Service thay đổi.** Không cần `markForCheck()` hay bất kỳ thao tác thủ công nào.

### Cơ chế hoạt động

```
counter.service.ts          component.ts                template.html
┌──────────────┐          ┌──────────────┐            ┌──────────────┐
│counterSignal │◄─update──│increment()   │            │{{counter()}} │
│  = signal(0) │          │              │            │              │
│              │          │counter =     │◄──lookup───│ Angular      │
│readonly      │──────────│  inject(...).│            │ dependency   │
│  counter     │          │  counter     │            │ tracking     │
└──────────────┘          └──────────────┘            └──────────────┘
       │                        │                           │
       │    khi update signal   │                           │
       └────────────────────────┴───────────────────────────┘
                                    │
                                    ▼
                              Angular detects change
                              → re-render {{counter()}}
```

### Bước chi tiết

1. **Template render** `{{counter()}}` → Angular gọi `counter()` → **tự động tạo dependency** giữa template và signal
2. **Component gọi** `increment()` → `counterService.incrementCounter()` → `counterSignal.update(val => val + 1)`
3. **Signal thay đổi** → Angular biết template có dependency với signal này → **tự động re-render**

> **Điểm mấu chốt:** Không quan trọng signal được tạo ở Component hay Service. Angular theo dõi việc **đọc signal** (`counter()`) ở đâu, và khi signal thay đổi, tất cả nơi đọc đều được update.

### So sánh với cách cũ

```ts
// ❌ Cách cũ (OnPush) - service thay đổi, component KHÔNG tự update
// Phải dùng markForCheck() thủ công
increment() {
  this.counterService.incrementCounter();
  this.cdr.markForCheck();  // ← phải gọi thủ công!
}

// ✅ Cách mới (Signals) - TỰ ĐỘNG update, không cần markForCheck()
export class AppComponent {
  private counterService = inject(CounterService);

  increment() {
    this.counterService.incrementCounter();  // ← Done! Tự update
  }
}
```

## Flow Diagram

```
Default Change Detection:
  Any change → Check ALL components → Render

With Signals:
  Signal change → Angular knows dependency tree → Only update affected components
```

## Signals vs RxJS

| Feature | Signals | RxJS |
|---------|---------|------|
| Syntax | Simple getter functions | Complex operators |
| Learning curve | Low | High |
| Use case | UI state, simple reactivity | Complex async, event streams |
| Zone.js dependency | Future: no | Yes |

## So sánh: computed vs effect vs update/set

| | `computed()` | `effect()` | `update()`/`set()` |
|---|---|---|---|
| **Mục đích** | Tạo derived value (giá trị mới từ signal cũ) | Thực hiện side effect (log, API, DOM...) | **Thay đổi** signal |
| **Trả về** | Signal mới (read-only) | void | void |
| **Đọc signal** | ✅ Tạo dependency | ✅ Tạo dependency | ❌ Không đọc |
| **Ghi signal** | ❌ Không được phép | ❌ Không được phép | ✅ Chính nó |
| **Side effect** | ❌ Không được phép | ✅ Chính purpose | ❌ Không nên |
| **Khi nào chạy** | Lazy - chỉ khi có subscriber đọc | Mỗi lần signal dependency thay đổi | Chỉ khi gọi |
| **Auto cleanup** | ❌ Không cần | ✅ Tự cleanup khi component destroy | ❌ Không cần |

### Ví dụ minh họa

```ts
@Component({ ... })
export class ExampleComponent {
  count = signal(0);

  // ✅ computed - tạo derived value, đọc signal, trả về signal mới
  double = computed(() => this.count() * 2);

  // ❌ computed KHÔNG được dùng cho side effect
  // computed(() => { console.log(this.count()); });  // SAI!

  // ✅ effect - thực hiện side effect, đọc signal, không trả về gì
  // constructor() {
  //   effect(() => { console.log('count changed:', this.count()); });
  // }

  // ❌ effect KHÔNG được dùng cho derived value
  // double = effect(() => this.count() * 2);  // SAI!

  // ✅ update/set - thay đổi signal, KHÔNG đọc signal
  increment() {
    this.count.update(v => v + 1);
  }
}
```

### Flow khi signal thay đổi

```
this.count.set(5)
     │
     ▼
computed(() => this.count() * 2)    ← Tự update double = 10
     │
     ▼
effect(() => { console.log(double()); })  ← Chạy side effect
```

**Quy tắc đơn giản:**
- **Đọc signal + tạo giá trị mới** → dùng `computed()`
- **Đọc signal + làm gì đó bên ngoài** (log, save, call API) → dùng `effect()`
- **Ghi signal** → dùng `set()` hoặc `update()`

## Best Practices

1. **Luôn dùng `set()` hoặc `update()`** – Không mutate trực tiếp
2. **Computed dependencies phải stable** – Luôn gọi signal trong mọi nhánh
3. **Effect cho side effects** – Không dùng computed cho side effects
4. **Signals + OnPush** – Kết hợp để tối ưu performance

## RxJS Interop - toSignal / takeUntilDestroyed (Developer Preview ở v16)

```ts
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Observable → Signal
export class UserComponent {
  private userService = inject(UserService);

  // ❌ RxJS thuần - phải subscribe/unsubscribe thủ công
  // users$ = this.userService.getUsers();

  // ✅ toSignal - tự unsubscribe theo DestroyRef
  users = toSignal(this.userService.getUsers(), { initialValue: [] });
  // template: @for (u of users(); track u.id) { ... }

  constructor() {
    // ✅ takeUntilDestroyed - thay cho takeUntil/ngOnDestroy boilerplate
    this.userService.getUsers()
      .pipe(takeUntilDestroyed())
      .subscribe(users => console.log(users));
  }
}
```

> `toSignal()` / `toObservable()` / `takeUntilDestroyed()` nằm trong `@angular/core/rxjs-interop`, ở v16 vẫn là developer preview. `takeUntilDestroyed()` phải gọi trong injection context (constructor/field initializer), hoặc truyền `DestroyRef` tường minh.

## Reference

- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://angular.dev/guide/signals
- https://angular.dev/guide/rxjs-interop
- https://blog.angular-university.io/angular-signals/