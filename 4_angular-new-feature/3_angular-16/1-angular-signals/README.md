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

// ❌ SAI - đột mutate trực tiếp (không trigger signal update)
this.list().push("Again");
this.object().title = "New Title";

// ✅ ĐÚNG - luôn dùng set() hoặc update()
this.list.update(prev => [...prev, "Again"]);
this.object.update(prev => ({ ...prev, title: "New Title" }));
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

## Best Practices

1. **Luôn dùng `set()` hoặc `update()`** – Không mutate trực tiếp
2. **Computed dependencies phải stable** – Luôn gọi signal trong mọi nhánh
3. **Effect cho side effects** – Không dùng computed cho side effects
4. **Signals + OnPush** – Kết hợp để tối ưu performance

## Reference

- https://blog.angular-university.io/angular-signals/