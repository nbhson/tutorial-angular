# 6. `@let` Template Variable Syntax

## Mô tả

`@let` là syntax mới trong Angular templates để **khai báo biến cục bộ** trực tiếp trong template. Tính năng này được giới thiệu ở Angular 18.1 và trở nên **stable** từ Angular 19.

## Vấn đề giải quyết

Trước đây, để tái sử dụng giá trị trong template, developers phải:
- Dùng `*ngIf="expr as variable"` (verbose)
- Tạo getter property trong component class
- Dùng `ng-container` phức tạp

```ts
// ❌ Cách cũ — verbose, khó maintain
// Component class
get userName() { return this.user$ | async; }
```

```html
<!-- Template -->
<div *ngIf="user$ | async as user">
  <h1>{{ user.name }}</h1>
  <p>{{ user.email }}</p>
</div>
```

```html
<!-- ✅ Cách mới với @let -->
@let user = user$ | async;
<h1>{{ user.name }}</h1>
<p>{{ user.email }}</p>
```

## Cú pháp

```html
@let <variable_name> = <expression>;
@let userName = 'Jane Doe';
@let greeting = 'Hello, ' + userInput.value;
@let userData = userObservable$ | async;
@let itemCount = items().length;
@let fullName = firstName() + ' ' + lastName();
```

## Files trong project

### `src/app/app.component.ts` — Component minh họa

```ts
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <!-- Variable đơn giản — string literal -->
    @let userName = 'Jane Doe';
    <h1>Welcome, {{ userName }}</h1>

    <!-- Variable từ Observable + async pipe -->
    @let user = user$ | async;
    @if (user) {
      <h1>Hello, {{ user.name }}</h1>
      <ul>
        @for (snack of user.favoriteSnacks; track snack.id) {
          <li>{{ snack.name }}</li>
        }
      </ul>
    }
  `,
  imports: [AsyncPipe],
  standalone: true,
})
export class AppComponent {
  user$ = of({
    name: 'John Doe',
    photo: 'https://example.com/photo.jpg',
    favoriteSnacks: [
      { id: 1, name: 'Chips' },
      { id: 2, name: 'Chocolate' },
      { id: 3, name: 'Cookies' },
    ],
  });
}
```

## Đặc điểm quan trọng

| Đặc điểm | Mô tả |
|-----------|-------|
| **Read-only** | Không thể gán lại giá trị sau khi khai báo |
| **Scoped** | Chỉ accessible trong template hiện tại và descendants |
| **Immutable** | Không thay đổi được giá trị |
| **Lazy evaluation** | Chỉ evaluate khi needed |
| **Type inference** | Angular tự infer type từ expression |

## So sánh với approaches khác

```html
<!-- 1. @let — Đơn giản nhất ✅ -->
@let user = user$ | async;
<div>{{ user.name }}</div>

<!-- 2. *ngIf as — Verbose -->
<div *ngIf="user$ | async as user">
  <div>{{ user.name }}</div>
</div>

<!-- 3. Component getter — Phức tạp -->
<!-- Component class: get user() { return this.user$ | async; } -->
<div>{{ user.name }}</div>
```

## Use Cases phổ biến

### Async data trong loop
```html
@let products = products$ | async;
@if (products) {
  @for (product of products; track product.id) {
    <app-product-card [product]="product" />
  }
} @else {
  <app-spinner />
}
```

### Derived values
```html
@let total = items().reduce((sum, item) => sum + item.price, 0);
<p>Total: {{ total | currency }}</p>
```

### Template reference variables
```html
<input #searchInput type="text">
@let searchTerm = searchInput.value;
<p>You typed: {{ searchTerm }}</p>
```

## Khi nào dùng @let?

- **Async pipe** — tái sử dụng giá trị async mà không cần subscribe
- **Complex expressions** — tránh repeat expression nhiều lần
- **Conditional templates** — kết hợp `@if` / `@for`
- **Performance** — tránh evaluate expression nhiều lần

## Reference

- [Angular @let Template Syntax](https://angular.dev/guide/templates/variables)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [Template Syntax Guide](https://angular.dev/guide/templates)