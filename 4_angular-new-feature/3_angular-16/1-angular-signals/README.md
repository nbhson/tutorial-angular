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
derivedCounter = computed(() => {
  return this.counter() * 10;
});
```

**Cơ chế hoạt động:**
1. Khi tạo computed, function được gọi 1 lần để lấy initial value
2. Angular theo dõi các signal getter function nào được gọi bên trong computed
3. Khi signal nguồn thay đổi → computed signal tự động cập nhật

**Lưu ý quan trọng:**
```ts
// ❌ SAI - dependency bị phá vỡ khi multiplier = 0
derivedCounter = computed(() => {
  if (this.multiplier < 10) return 0;
  return this.counter() * this.multiplier;  // counter() không được gọi!
});

// ✅ ĐÚNG - luôn gọi signal nguồn trong mọi nhánh
derivedCounter = computed(() => {
  if (this.counter() === 0) return 0;
  return this.counter() * this.multiplier;
});
```

**Dependencies là động** - được xác định lại mỗi khi computed function chạy lại.

## untracked() - Đọc không tạo dependency

```ts
derivedCounter = computed(() => {
  return untracked(this.counter) * 10;  // Không tạo dependency
});
```

## Effect API

Effect phát hiện signal thay đổi để thực hiện side effects (logging, localStorage, API calls...):

```ts
counter = signal(0);
derivedCounter = computed(() => this.counter() * 10);

effect = effect(() => {
  const currentCount = this.counter();
  const derived = this.derivedCounter();
  console.log(`values: ${currentCount} ${derived}`);
});
```

**Quy tắc:**
- Effect chạy ít nhất 1 lần khi được khai báo
- Effect chạy **sau** computed
- Nếu computed không chạy → effect không chạy
- Dependencies được xác định động

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
// Manual cleanup
const effectRef = effect(() => {
  console.log(this.counter());
}, { manualCleanup: true });

effectRef.destroy();  // Destroy manually

// onCleanup callback
effect((onCleanup) => {
  const subscription = this.dataService.getData().subscribe();
  onCleanup(() => {
    subscription.unsubscribe();  // Cleanup khi effect destroyed
  });
});
```

## Equality Check

Signal chỉ emit khi giá trị mới **khác** giá trị cũ (=== comparison):

```ts
// Object signal - === luôn khác dù data giống nhau
object = signal({ id: 1, title: "Angular" });

// Click Update nhiều lần → computed chạy lại mỗi lần (wasteful!)
this.object.set({ id: 1, title: "Angular" });  // Same data!

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

## `mutate()` - Deprecated ❌

> `mutate()` **đã bị xóa** từ Angular 16 stable. Nó chỉ tồn tại trong giai đoạn Developer Preview.

```ts
// ❌ DEPRECATED - mutate() - KHÔNG dùng **nữa**
qtyAvailable = signal([1, 2, 3, 4, 5]);

addQuantity() {
  this.qtyAvailable.mutate(v => v.push(v[v.length - 1] + 1));
}
// mutate() cho phép thay đổi array/object bên trong signal
// NHƯNG không trigger change detection đúng cách → bị xóa
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
  counter = inject(CounterService).counter;

  increment() {
    inject(CounterService).incrementCounter();
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
increment() {
  inject(CounterService).incrementCounter();  // ← Done! Tự update
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

## Reference

- https://blog.angular-university.io/angular-signals/