# Built-in Control Flow

## Tổng quan

Angular 17 giới thiệu built-in control flow (`@if`, `@for`, `@switch`) — một cú pháp mới trong template giúp thay thế các structural directives cũ (`*ngIf`, `*ngFor`, `*ngSwitch`). Cú pháp mới gọn hơn, performant hơn, và không cần import thêm directives.

## Cấu trúc files

```
2_built-in-control-flow/
├── src/
│   ├── app/
│   │   ├── app.component.html                    # Root template
│   │   ├── app.component.ts                      # Root component
│   │   ├── app.component.scss                    # Root styles
│   │   ├── components/
│   │   │   └── condition-statements/
│   │   │       ├── condition-statements.component.html   # Template demo @if, @for
│   │   │       ├── condition-statements.component.ts     # Component logic
│   │   │       └── condition-statements.component.scss   # Styles
│   │   ├── config/
│   │   │   └── app.config.ts                     # App configuration
│   │   └── routes/
│   │       └── app.routes.ts                     # Routes
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/components/condition-statements/condition-statements.component.ts` — Component Logic

Component demo minh họa cách sử dụng `@if`, `@for` với dữ liệu mẫu:

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-condition-statements',
  templateUrl: './condition-statements.component.html',
  styleUrls: ['./condition-statements.component.scss'],
  standalone: true
})
export class ConditionStatementsComponent implements OnInit {
  a = 1;
  b = 2;

  user = {
    name: 'Son',
    age: 17,
    more: {
      height: 169,
      weight: 52
    }
  }

  items = [
    { name: 1 },
    { name: 2 },
    { name: 3 },
    { name: 4 },
    { name: 5 },
  ]

  constructor() { }

  ngOnInit() { }
}
```

### `src/app/components/condition-statements/condition-statements.component.html` — Template Demo

Minh họa `@if/@else if/@else`, `@if` với alias (`as`), và `@for/@empty`:

```html
<!-- @if / @else if / @else -->
@if (a > b) {
  {{a}} is greater than {{b}}
} @else if (b > a) {
  {{a}} is less than {{b}}
} @else {
  {{a}} is equal to {{b}}
}

<!-- @if với alias (as) — lưu kết quả condition vào biến -->
@if (user.more.height; as height) {
  {{ height }}
}

<!-- @for với track và @empty block -->
@for (item of items; track item.name) {
  <li> {{ item.name }}</li>
} @empty {
  <li aria-hidden="true"> There are no items. </li>
}
```

## Chi tiết từng control flow

### `@if` / `@else if` / `@else`

Thay thế cho `*ngIf`, hỗ trợ điều kiện phức tạp và inline `@else`:

```html
<!--旧 syntax -->
<!-- <div *ngIf="a > b">{{a}} is greater than {{b}}</div> -->

<!-- New syntax — gọn hơn, không cần import NgIf -->
@if (a > b) {
  <p>{{a}} is greater than {{b}}</p>
} @else if (b > a) {
  <p>{{a}} is less than {{b}}</p>
} @else {
  <p>{{a}} is equal to {{b}}</p>
}
```

**Aliasing — lưu kết quả condition:**

```html
@if (user.profile.settings.startDate; as startDate) {
  <p>Start date: {{ startDate }}</p>
}
```

### `@for` với `track`

Thay thế cho `*ngFor`, bắt buộc phải có `track` expression:

```html
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>No items available.</li>
}
```

**Contextual variables có sẵn trong `@for`:**

| Variable | Meaning |
|----------|---------|
| `$count` | Số lượng items |
| `$index` | Index hiện tại |
| `$first` | Có phải phần tử đầu tiên |
| `$last` | Có phải phần tử cuối |
| `$even` | Index có chẵn không |
| `$odd` | Index có lẻ không |

```html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p [class.even]="e">Item #{{ idx }}: {{ item.name }}</p>
}
```

### `@switch`

Thay thế cho `ngSwitch`, gọn hơn nhiều:

```html
<!--旧 syntax phức tạp -->
<!-- <div [ngSwitch]="accessLevel">
  <admin-dashboard *ngSwitchCase="admin"/>
  <moderator-dashboard *ngSwitchCase="moderator"/>
  <user-dashboard *ngSwitchDefault/>
</div> -->

<!-- New syntax gọn hơn -->
@switch (accessLevel) {
  @case ('admin') { <admin-dashboard /> }
  @case ('moderator') { <moderator-dashboard /> }
  @default { <user-dashboard /> }
}
```

## So sánh旧 vs New Syntax

|旧 Syntax | New Syntax | Ưu điểm |
|-----------|------------|----------|
| `*ngIf="condition"` | `@if (condition) { }` | Không cần import NgIf |
| `*ngFor="let item of items"` | `@for (item of items; track item.id) { }` | Track được yêu cầu, contextual variables |
| `[ngSwitch]` + `*ngSwitchCase` | `@switch` + `@case` | Không cần import NgSwitch |
| `*ngIf; else elseBlock` | `@else { }` | Không cần `<ng-template>` |

## Tại sao tốt hơn?

1. **Không cần import directives** — `@if`, `@for`, `@switch` là built-in syntax
2. **Angular compiler optimizes better** — Built-in syntax cho phép Angular tối ưu hóa tốt hơn
3. **`track` trong `@for`** — Giúp Angular maintain DOM-node relationship efficiently
4. **Contextual variables** — `$index`, `$first`, `$last`, `$even`, `$odd`, `$count` có sẵn
5. **`@empty` block** — Xử lý empty state trực tiếp trong template

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular Control Flow Guide](https://angular.dev/guide/templates/control-flow)
- [Introducing Angular v17](https://blog.angular.dev/introducing-angular-v17-4d7033312e4b)