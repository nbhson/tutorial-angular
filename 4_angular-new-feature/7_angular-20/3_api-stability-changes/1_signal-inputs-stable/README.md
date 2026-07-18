# 1. Signal Inputs Stable (Angular 20)

## Tổng quan

Angular 20 chính thức đưa `input()` — Signal-based Input API — từ **Developer Preview** sang **Stable**. Đây là cách mới để khai báo inputs trong components, thay thế `@Input()` decorator.

## API mới

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <p>{{ name() }}</p>
    <p>{{ age() }}</p>
  `
})
export class UserComponent {
  name = input<string>();         // Optional
  age = input.required<number>(); // Required
}
```

**Thay đổi so với trước:**

| Trước (`@Input`) | Sau (`input()`) |
|---|---|
| `@Input() name: string = ''` | `name = input<string>('')` |
| `@Input({ required: true })` | `name = input.required<string>()` |
| `@Input({ alias: 'userName' })` | `name = input<string>({ alias: 'userName' })` |
| Property binding | Signal binding |

## Tại sao cần feature này?

| Vấn đề với `@Input` | Giải pháp với `input()` |
|---|---|
| Không có type safety | Full TypeScript type inference |
| Không reactive | Tự reactive qua signals |
| Cần `ngOnChanges` | Dùng `computed()` hoặc `effect()` |
| Không thể compose | Dùng `linkedSignal()` |
| `@Input` decorator | Functional API gọn hơn |

## Ví dụ thực tế

### 1. Basic Input

```typescript
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `
    <div class="card">
      <h3>{{ name() }}</h3>
      <p>Age: {{ age() }}</p>
      <p>Adult: {{ isAdult() ? 'Yes' : 'No' }}</p>
    </div>
  `
})
export class UserCardComponent {
  name = input<string>('Unknown');
  age = input<number>(0);

  // Computed từ input
  isAdult = computed(() => this.age() >= 18);
}
```

### 2. Required Input

```typescript
@Component({
  selector: 'app-product',
  template: `
    <h2>{{ title() }}</h2>
    <p>{{ formatPrice() }}</p>
  `
})
export class ProductComponent {
  title = input.required<string>();
  price = input.required<number>();

  formatPrice = computed(() => `$${this.price().toFixed(2)}`);
}
```

### 3. Input với Transform

```typescript
@Component({
  selector: 'app-avatar',
  template: `<img [src]="avatarUrl()" [alt]="name()" />`
})
export class AvatarComponent {
  name = input.required<string>();

  // Transform input
  avatarUrl = computed(() =>
    `/api/avatar/${encodeURIComponent(this.name())}`
  );
}
```

### 4. Input Alias

```typescript
@Component({
  selector: 'app-dialog',
  template: `
    <div class="dialog" [class.open]="isOpen()">
      <ng-content />
    </div>
  `
})
export class DialogComponent {
  // Alias để backward compatibility
  isOpen = input<boolean>(false, { alias: 'open' });
}
```

### 5. Parent Component

```html
<!-- Template binding với signal inputs -->
<app-user-card [name]="'John'" [age]="25" />
<app-product [title]="'Laptop'" [price]="999" />
<app-dialog [open]="isDialogVisible">
  <p>Content here</p>
</app-dialog>
```

```typescript
@Component({
  selector: 'app-parent',
  imports: [UserCardComponent, ProductComponent, DialogComponent],
  template: `
    <app-user-card [name]="userName()" [age]="userAge()" />
    <app-dialog [open]="showDialog()">
      <p>Hello!</p>
    </app-dialog>
  `
})
export class ParentComponent {
  userName = signal('Alice');
  userAge = signal(30);
  showDialog = signal(false);
}
```

## Flow chi tiết

```
Parent: [name]="'John'"
        │
        ▼
Child: name = input<string>()
        │
        ▼
Angular set signal value: name.set('John')
        │
        ▼
Template update: {{ name() }}
        │
        ▼
Computed signals recalculate
        │
        ▼
DOM update
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
@Component({
  selector: 'app-user',
  template: `<p>{{ name }}</p>`
})
export class UserComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() age: number = 0;

  ngOnInit() {
    console.log('Name:', this.name);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      console.log('Name changed to:', this.name);
    }
  }
}
```

### Sau Angular 20

```typescript
@Component({
  selector: 'app-user',
  template: `<p>{{ name() }}</p>`
})
export class UserComponent {
  name = input<string>('');
  age = input<number>(0);

  constructor() {
    effect(() => {
      console.log('Name:', this.name());
    });
  }
}
```

**Lợi ích:**
- ✅ Không cần `OnChanges` interface
- ✅ Không cần `SimpleChanges`
- ✅ Tự reactive qua signals
- ✅ Type-safe hơn
- ✅ Code gọn hơn

## Best practices

1. **Dùng `input()` thay `@Input()`** cho components mới
2. **Dùng `input.required()`** cho required inputs
3. **Dùng `computed()`** thay vì getters
4. **Dùng `effect()`** thay vì `ngOnChanges`
5. **Giữ backward compatibility** với alias khi cần

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/1_signal-inputs-stable
npm install
ng serve