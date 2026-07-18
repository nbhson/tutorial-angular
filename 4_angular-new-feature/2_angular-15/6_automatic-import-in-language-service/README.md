# Automatic Import in Language Service (Angular 15)

> Angular Language Service tự động thêm imports khi bạn sử dụng components/directives/pipes trong template.

## Tổng quan

Trước Angular 15, khi thêm component mới vào template, bạn phải tự import manually. Giờ đây, Language Service tự động detect và suggest imports.

## Ví dụ

```ts
// product-list.component.ts - Chưa import ProductCardComponent
@Component({
  selector: 'app-product-list',
  template: `
    <!-- Gợi ý import tự động -->
    <app-product-card [product]="product"></app-product-card>
  `
})
export class ProductListComponent {
  product = { name: 'Laptop', price: 1500 };
}
```

```ts
// Sau khi accept suggestion từ Language Service
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent],
  template: `
    <app-product-card [product]="product"></app-product-card>
  `
})
export class ProductListComponent { }
```

## Features

### 1. Component Auto-import

```html
<!-- Template sử dụng component chưa import -->
<app-header></app-header>
<app-footer></app-footer>

<!-- Language Service suggest imports -->
```

### 2. Directive Auto-import

```html
<!-- Sử dụng directive mới -->
<div *ngIf="show" appHighlight>Content</div>

<!-- Auto-import CommonModule, HighlightDirective -->
```

### 3. Pipe Auto-import

```html
<!-- Sử dụng pipe mới -->
<p>{{ price | currency:'VND' }}</p>

<!-- Auto-import CurrencyPipe, CommonModule -->
```

## IDE Support

```
VS Code với Angular Language Service:
  1. Viết template code
  2. Language Service detect missing import
  3. Hiển thị lightbulb suggestion
  4. Click → Auto-import added
```

## Best Practices

1. **Enable Angular Language Service** – Trong VS Code
2. **Accept suggestions** – Để auto-import hoạt động
3. **Review imports** – Kiểm tra sau khi auto-import

---

**Summary**: Automatic Import trong Angular Language Service giúp tiết kiệm thời gian khi viết template. Components, directives, và pipes được auto-import khi sử dụng trong template.