# 2. Model Inputs Stable (Angular 20)

## Tổng quan

Angular 20 chính thức đưa `model()` — Signal-based Two-way Binding API — từ **Developer Preview** sang **Stable**. `model()` cho phép tạo **two-way binding** inputs bằng signals, thay thế `@Input()` + `@Output()` cho các trường hợp cần sync data giữa parent và child.

## API mới

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ count() }}</span>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  count = model<number>(0);

  increment() { this.count.update(c => c + 1); }
  decrement() { this.count.update(c => c - 1); }
}
```

```html
<!-- Parent: two-way binding -->
<app-counter [(count)]="parentCount" />
```

**Thay đổi so với trước:**

| Trước (`@Input` + `@Output`) | Sau (`model()`) |
|---|---|
| `@Input() count: number = 0` | `count = model<number>(0)` |
| `@Output() countChange = new EventEmitter()` | Tự tạo `countChange` signal |
| `[(count)]="value"` | `[(count)]="value"` |

## Tại sao cần feature này?

| Vấn đề với `@Input` + `@Output` | Giải pháp với `model()` |
|---|---|
| Phải tạo 2 properties (input + output) | Chỉ cần 1 `model()` |
| Không reactive | Tự reactive qua signals |
| Template boilerplate | Code gọn hơn 50% |
| Không thể compose | Dùng `linkedSignal()` |

## Ví dụ thực tế

### 1. Basic Two-way Binding

```typescript
@Component({
  selector: 'app-slider',
  template: `
    <input
      type="range"
      [min]="min()"
      [max]="max()"
      [value]="value()"
      (input)="onInput($event)"
    />
    <span>{{ value() }}</span>
  `
})
export class SliderComponent {
  value = model<number>(50);
  min = input<number>(0);
  max = input<number>(100);

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(Number(target.value));
  }
}
```

### 2. Parent Template

```html
<!-- Two-way binding với model() -->
<app-slider [(value)]="volume" />
<app-slider [(value)]="brightness" />

<p>Volume: {{ volume() }}</p>
<p>Brightness: {{ brightness() }}</p>
```

### 3. Custom Name

```typescript
@Component({
  selector: 'app-checkbox',
  template: `
    <label>
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="onToggle($event)"
      />
      {{ label() }}
    </label>
  `
})
export class CheckboxComponent {
  label = input<string>('');
  checked = model<boolean>(false, { alias: 'isEnabled' });

  onToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
```

```html
<!-- Parent dùng alias -->
<app-checkbox [(isEnabled)]="isPremium" label="Premium" />
```

### 4. Form Component

```typescript
@Component({
  selector: 'app-text-input',
  template: `
    <label>{{ label() }}</label>
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="onInput($event)"
    />
  `
})
export class TextInputComponent {
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  value = model<string>('');

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
```

```html
<!-- Parent: easily bind form values -->
<app-text-input [(value)]="firstName" label="First Name" />
<app-text-input [(value)]="lastName" label="Last Name" />
<app-text-input [(value)]="email" label="Email" type="email" />
```

## Flow chi tiết

```
Parent: [(count)]="parentCount"
        │
        ▼
Child: count = model<number>(0)
        │
        ▼
User click increment
        │
        ▼
child.count.update(c => c + 1)
        │
        ▼
Angular emit countChange event
        │
        ▼
Parent: parentCount.set(newValue)
        │
        ▼
Both parent and child synchronized
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// Child component - cần cả input và output
@Component({
  selector: 'app-slider',
  template: `
    <input [value]="value" (input)="onInput($event)" />
  `
})
export class SliderComponent implements OnInit {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).valueAsNumber;
    this.value = val;
    this.valueChange.emit(val);
  }

  ngOnInit() {
    console.log('Value:', this.value);
  }
}
```

### Sau Angular 20

```typescript
// Child component - chỉ cần model()
@Component({
  selector: 'app-slider',
  template: `
    <input [value]="value()" (input)="onInput($event)" />
  `
})
export class SliderComponent {
  value = model<number>(0);

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).valueAsNumber;
    this.value.set(val);
  }

  constructor() {
    effect(() => {
      console.log('Value:', this.value());
    });
  }
}
```

**Lợi ích:**
- ✅ Code gọn hơn 50%
- ✅ Không cần `@Output()` boilerplate
- ✅ Tự reactive qua signals
- ✅ Type-safe
- ✅ Dễ compose với `linkedSignal()`

## Best practices

1. **Dùng `model()`** cho two-way binding components
2. **Dùng `model()` với alias** khi cần backward compatibility
3. **Compose** với `linkedSignal()` cho complex logic
4. **Test** parent-child binding với signal testing utilities
5. **Naming convention**: `[(name)]` binding → `name = model()`

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/2_model-inputs-stable
npm install
ng serve