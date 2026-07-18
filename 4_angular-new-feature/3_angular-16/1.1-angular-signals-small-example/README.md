# Signals Small Example (Angular 16)

> Ví dụ thực tế về cách sử dụng Signals trong Angular 16 - Writable Signals, Computed, Effects.

## Helpful CLI Commands

```bash
# Tạo các file environments
ng generate environments

# Migrate project to standalone
ng generate @angular/core:standalone
```

## Signals là gì?

> `Signals` là lớp bao bọc xung quanh một giá trị có thể thông báo cho người dùng quan tâm khi giá trị đó thay đổi.

## Writable Signals

```ts
// Tạo signal với giá trị ban đầu
const count = signal(0);

// Đọc giá trị - gọi signal như function
console.log('The count is: ' + count());
```

### Cách thay đổi giá trị

```ts
// 1. set() - đặt giá trị mới trực tiếp (phải tuân thủ type ban đầu)
this.count.set(3);

// 2. update() - tính từ giá trị trước đó
this.count.update(value => value + 1);

// 3. update() với object
this.object.update(pre => {
  return { name: 'Son', age: 18 };
});
```

## Computed Signals

Khi signal thay đổi, computed variable tự động cập nhật theo:

```ts
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);

// count = 1 → doubleCount = 2
// count = 5 → doubleCount = 10
```

## Effects

Effect theo dõi signal và tự động chạy lại khi signal thay đổi:

```ts
// Theo dõi đồng thời nhiều signals
effect(() => {
  console.log(Date.now(), this.signalInput(), this.signalCount());
});

// Hoặc theo dõi riêng lẻ
effect(() => {
  console.log(Date.now(), this.signalInput());
});

effect(() => {
  console.log(Date.now(), this.signalCount());
});
```

## Signals & OnPush Change Detection

### Without Signals (cũ)

```ts
@Component({
  selector: 'app-simple-signals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ signalBoolean }}</p>`
})
export class SimpleSignalsComponent {
  signalBoolean = true;

  // ❌ UI không render đúng sau 500ms!
  updateBoolean() {
    setTimeout(() => {
      this.signalBoolean = !this.signalBoolean;
    }, 500);
  }

  // ✅ Phải dùng markForCheck thủ công
  constructor(private cdr: ChangeDetectorRef) {}

  updateBooleanFixed() {
    setTimeout(() => {
      this.signalBoolean = !this.signalBoolean;
      this.cdr.markForCheck();  // Manual!
    }, 500);
  }
}
```

### With Signals (mới)

```ts
@Component({
  selector: 'app-simple-signals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ signalBoolean() }}</p>`
})
export class SimpleSignalsComponent {
  signalBoolean = signal<boolean>(false);

  // ✅ Tự động update UI - không cần markForCheck!
  updateBoolean() {
    this.signalBoolean.update(previousValue => !previousValue);
  }
}
```

**Kết luận:** Với Signals + OnPush, không cần `ChangeDetectorRef.markForCheck()` nữa. Angular tự động biết khi nào cần re-render.

---

**Summary**: Signals giúp loại bỏ boilerplate `markForCheck()` trong OnPush components. Kết hợp với computed và effect, Signals tạo nên reactive data flow đơn giản và hiệu quả hơn RxJS cho UI state.