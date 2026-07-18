# Standalone Components (Angular 14)

> Standalone components là một dạng component được khai báo độc lập, không phụ thuộc việc khai báo trong NgModules. Standalone components gồm components, directives hoặc pipes.

## Trước Angular 14

Mỗi component phải được khai báo trong một NgModule:

```ts
// app.module.ts
@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [BrowserModule, CommonModule],
  bootstrap: [AppComponent]
})
export class AppModule { }

// app.component.ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { }
```

## Sau Angular 14 - Standalone

Component được khai báo độc lập với `standalone: true`:

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AppComponent { }
```

## Bootstrap với Standalone

```ts
// main.ts - Không cần NgModule
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});
```

## Ví dụ thực tế

```ts
// product-card.component.ts
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="product-card">
      <h3>{{ product.name }}</h3>
      <p>{{ product.price | currency:'VND' }}</p>
      <button (click)="addToCart(product)">Thêm vào giỏ</button>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private cartService: CartService) {}

  addToCart(product: Product) {
    this.cartService.add(product);
  }
}
```

## Standalone Directive & Pipe

```ts
// standalone directive
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }

  constructor(private el: ElementRef) {}
}

// standalone pipe
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}
```

## Import từ Module sang Standalone

```ts
// Có thể import standalone components vào NgModule
@NgModule({
  imports: [CommonModule, ProductCardComponent],
  declarations: [LegacyComponent]
})
export class SharedModule { }
```

## Flow Diagram

```
Traditional Angular:
  Component → NgModule → Application

Standalone Angular:
  Component → Application (directly)
```

## Best Practices

1. **Bắt đầu mới với standalone** – Không cần NgModule cho projects mới
2. **Migrate dần** – Có thể import standalone components vào NgModule hiện có
3. **Tránh circular imports** – Standalone components không nên import nhau vòng
4. **Sử dụng `bootstrapApplication`** – Thay vì `platformBrowserDynamic().bootstrapModule()`

## Ref

- https://github.com/angular/angular/discussions/45554

---

**Summary**: Standalone Components loại bỏ sự phụ thuộc vào NgModule, cho phép bootstrap ứng dụng trực tiếp từ component. Đây là bước quan trọng đầu tiên hướng tới architecture đơn giản hơn trong Angular.