# Input Value Transforms

## Tổng quan

Angular **Input Value Transforms** — tính năng cho phép transform input values khi chúng được set thông qua `booleanAttribute`/`numberAttribute` hoặc custom transform functions. Giải quyết bài toán common type mismatch khi sử dụng attribute syntax trong templates.

> Attribution đúng: `@Input({transform})` có từ v16.1. Trong v17 vẫn là decorator-based. Signal `input()` với `transform` option mới là v17.2 developer preview.

Trước đây, nếu component có `@Input() expanded: boolean`, việc sử dụng `<my-expander expanded/>` sẽ lỗi vì Angular truyền string `"expanded"` thay vì boolean `true`.

## Cấu trúc files

```
7_input-value-transforms/
├── src/
│   ├── app/
│   │   ├── app.component.html          # Root template — sử dụng boolean attribute
│   │   ├── app.component.ts            # Root component
│   │   ├── app.component.scss          # Styles
│   │   ├── components/
│   │   │   └── child/
│   │   │       ├── child.component.html    # Child template — hiển thị expanded value
│   │   │       ├── child.component.ts      # Child component — @Input với transform
│   │   │       └── child.component.scss    # Styles
│   │   ├── config/
│   │   │   └── app.config.ts           # App configuration
│   │   └── routes/
│   │       └── app.routes.ts           # Routes
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/components/child/child.component.ts` — Component với Input Transform

Đây là file chính demo tính năng Input Value Transforms:

```ts
import { booleanAttribute, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss']
})
export class ChildComponent implements OnChanges {
  // Cũ syntax — sẽ lỗi khi dùng <app-child expanded/>
  // @Input() expanded = false;

  // New syntax — transform string → boolean tự động
  @Input({ transform: booleanAttribute }) expanded: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.expanded);
  }
}
```

**Giải thích:**
- `booleanAttribute` — Transform tự động: có attribute → `true`, không có → `false`
- `<app-child expanded/>` → `expanded = true` (thay vì lỗi type mismatch)
- `<app-child [expanded]="true"/>` → `expanded = true` (vẫn hoạt động như cũ)
- `<app-child/>` → `expanded = false` (mặc định)

### `src/app/components/child/child.component.html` — Child Template

Hiển thị giá trị expanded:

```html
<p>
  child works! {{expanded}}
</p>
```

### `src/app/app.component.html` — Root Template

Sử dụng boolean attribute syntax — giờ đã hoạt động đúng:

```html
<app-child expanded/>
```

**Kết quả:** `expanded = true` (string "expanded" được transform thành boolean `true`)

## How it works

```
Cũ syntax:
  <app-child expanded/>  →  expanded = "expanded" (string)  →  LỖI type mismatch

New syntax với transform:
  <app-child expanded/>  →  expanded = true (boolean)  →  Hoạt động đúng!
  <app-child/>           →  expanded = false (boolean) →  Mặc định
  <app-child [expanded]="true"/> → expanded = true       →  Vẫn OK
```

## Built-in Transforms

### `booleanAttribute`

```ts
@Input({ transform: booleanAttribute }) required: boolean = false;
```

```html
<!-- Cú pháp attribute -->
<my-input required />      <!-- required = true -->
<my-input />               <!-- required = false -->
<my-input [required]="false"/>  <!-- required = false -->
```

### `numberAttribute`

```ts
@Input({ transform: numberAttribute }) count: number = 0;
```

```html
<my-counter count="5" />   <!-- count = 5 (number) -->
<my-counter />             <!-- count = 0 (default) -->
```

> Note: chỉ có `booleanAttribute` / `numberAttribute` built-in — không có `stringAttribute`.

## Custom Transform Functions

```ts
// Custom transform: uppercase string
function uppercaseTransform(value: string): string {
  return value?.toUpperCase() ?? '';
}

@Component({...})
export class MyComponent {
  @Input({ transform: uppercaseTransform }) name: string = '';
}
```

```html
<my-component name="hello" />  <!-- name = "HELLO" -->
```

## Signal Input với Transform (v17.2+ preview)

```ts
import { booleanAttribute, Component, input } from '@angular/core';

@Component({ selector: 'my-expander', template: `...` })
export class Expander {
  readonly expanded = input(false, { transform: booleanAttribute });
}
```

## So sánh Cũ vs Mới

| Cũ Syntax | New Syntax với Transform |
|-----------|--------------------------|
| `@Input() expanded = false;` | `@Input({ transform: booleanAttribute }) expanded = false;` |
| `<expander expanded/>` — LỖI | `<expander expanded/>` — Hoạt động |
| `<expander [expanded]="true"/>` | `<expander [expanded]="true"/>` — Vẫn OK |
| Không thể dùng attribute syntax | Dùng được attribute syntax |

## Lưu ý quan trọng

1. **`booleanAttribute`** — Attribute có mặt = `true`, không có = `false`
2. **`numberAttribute`** — Convert string sang number, invalid = default value
3. **Custom transforms** — Nhận value, trả về transformed value
4. **Vẫn tương thích Cũ syntax** — `[expanded]="true"` vẫn hoạt động
5. **Signal input style (v17.2+ preview):** `readonly expanded = input(false, { transform: booleanAttribute });`

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular Input Transforms](https://angular.dev/guide/components/inputs#transforming-input-values)
- [GitHub Issue #14761](https://github.com/angular/angular/issues/14761)