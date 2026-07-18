# 7. ScrollOptions trong ViewportScroller (Angular 20)

## Tổng quan

Angular 20 giới thiệu **ScrollOptions** cho `ViewportScroller` — cho phép tùy chỉnh hành vi scroll khi navigate giữa các route, bao gồm `scrollPositionRestoration`, `anchorScrolling`, và `scrollOffset`. Đây là feature thuộc routing system, giải quyết vấn đề "scroll position" phổ biến trong SPA.

## API mới

```typescript
// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewPortScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
        scrollOffset: [0, 80]  // Offset từ top
      })
    )
  ]
};
```

**Thay đổi so với trước:**

| Trước (Angular < 20) | Sau (Angular 20) |
|---|---|
| `withViewPortScroller('top-only')` | `withViewPortScroller({ scrollPositionRestoration: 'enabled' })` |
| `scrollPositionRestoration: 'enabled'` | Object config với nhiều options hơn |
| Không có `scrollOffset` | Có `scrollOffset: [x, y]` |

## Tại sao cần feature này?

Vấn đề scroll position trong SPA:

| Vấn đề | Giải thích |
|---|---|
| **Scroll về top** | User scroll xuống → click link → quay lại trang cũ → scroll về top |
| **Anchor scrolling** | Click link có `#section-id` → không scroll đến section đó |
| **Scroll offset** | Header fixed → scroll đến anchor bị che bởi header |
| **Restore position** | User quay lại trang → không nhớ vị trí scroll trước đó |

Angular 20 giải quyết tất cả bằng `ScrollOptions`.

## Ví dụ thực tế

### 1. Basic Setup (`app.config.ts`)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewPortScroller } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewPortScroller({
        scrollPositionRestoration: 'enabled',  // Restore scroll position
        anchorScrolling: 'enabled',            // Anchor scrolling
        scrollOffset: [0, 80]                  // Offset 80px từ top (cho header)
      })
    )
  ]
};
```

### 2. Routes với Anchor

```typescript
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'features', component: FeaturesComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'faq', component: FaqComponent },
    ]
  },
  {
    path: 'docs',
    component: DocsComponent,
    data: { scrollOffset: [0, 100] }  // Custom offset per route
  }
];
```

### 3. Template với Anchor Links

```html
<!-- Navigation -->
<nav>
  <a routerLink="/" fragment="hero">Home</a>
  <a routerLink="/" fragment="features">Features</a>
  <a routerLink="/" fragment="pricing">Pricing</a>
  <a routerLink="/" fragment="faq">FAQ</a>
</nav>

<!-- Content sections -->
<section id="hero">
  <h1>Hero Section</h1>
</section>

<section id="features">
  <h2>Features</h2>
</section>

<section id="pricing">
  <h2>Pricing</h2>
</section>

<section id="faq">
  <h2>FAQ</h2>
</section>
```

### 4. Manual Scroll Control

```typescript
@Component({
  selector: 'app-article',
  template: `
    <div id="article-content">
      <h1>{{ article.title }}</h1>
      <p>{{ article.content }}</p>
    </div>

    <button (click)="scrollToTop()">Scroll to Top</button>
    <button (click)="scrollToContent()">Scroll to Content</button>
  `
})
export class ArticleComponent {
  private viewportScroller = inject(ViewportScroller);

  scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  scrollToContent() {
    this.viewportScroller.scrollToAnchor('article-content');
  }

  scrollToPosition(x: number, y: number) {
    this.viewportScroller.scrollToPosition([x, y]);
  }
}
```

## Flow chi tiết

### Scroll Position Restoration

```
User tại trang /home (scroll position: 500px)
        │
        ▼
User click link → /features
        │
        ▼
Scroll position được LƯU (500px)
        │
        ▼
/features render (scroll position: 0px)
        │
        ▼
User click Back → /home
        │
        ▼
Scroll position được RESTORE (500px) ✅
```

### Anchor Scrolling

```
User tại trang /home (scroll position: 0px)
        │
        ▼
User click link "Pricing" → /home#pricing
        │
        ▼
Scroll position: 0px
        │
        ▼
Angular tìm element #pricing
        │
        ▼
Scroll đến #pricing (0px - 80px header offset = section top)
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// Config đơn giản, ít options
provideRouter(routes, withViewPortScroller('top-only'));

// Hoặc
provideRouter(routes, withViewPortScroller('enabled'));

// Không có scrollOffset
// Không có custom config per route
```

### Sau Angular 20

```typescript
// Config linh hoạt hơn
provideRouter(routes, withViewPortScroller({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 80]
}));

// Scroll offset per route
{
  path: 'docs',
  component: DocsComponent,
  data: { scrollOffset: [0, 100] }
}
```

**Lợi ích:**
- ✅ Scroll position restoration chính xác
- ✅ Anchor scrolling hoạt động
- ✅ Scroll offset linh hoạt
- ✅ Custom config per route
- ✅ Better UX

## Scroll Options chi tiết

### 1. `scrollPositionRestoration`

```typescript
{
  scrollPositionRestoration: 'enabled' | 'disabled' | 'top'
}
```

| Value | Mô tả |
|---|---|
| `'enabled'` | Restore scroll position khi quay lại trang |
| `'disabled'` | Không restore (default behavior) |
| `'top'` | Luôn scroll về top khi navigate |

### 2. `anchorScrolling`

```typescript
{
  anchorScrolling: 'enabled' | 'disabled'
}
```

| Value | Mô tả |
|---|---|
| `'enabled'` | Scroll đến element có `id` khớp với `fragment` |
| `'disabled'` | Không scroll đến anchor (default behavior) |

### 3. `scrollOffset`

```typescript
{
  scrollOffset: [x, y] | ((anchor: string, offset: number) => [x, y])
}
```

| Value | Mô tả |
|---|---|
| `[x, y]` | Offset cố định từ top-left |
| `(anchor, offset) => [x, y]` | Dynamic offset theo anchor |

## Use cases phổ biến

### 1. Landing Page

```typescript
// Landing page với nhiều sections
provideRouter(routes, withViewPortScroller({
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 80]  // Header height
}))
```

### 2. Documentation Site

```typescript
// Docs site cần restore scroll position
provideRouter(routes, withViewPortScroller({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 100]  // Sidebar height
}))
```

### 3. E-commerce

```typescript
// Product list cần restore scroll position
provideRouter(routes, withViewPortScroller({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'disabled'
}))
```

### 4. Dashboard

```typescript
// Dashboard luôn scroll về top
provideRouter(routes, withViewPortScroller({
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled'
}))
```

## Best practices

1. **Dùng `scrollPositionRestoration: 'enabled'`** cho大多数 pages
2. **Set `scrollOffset`** phù hợp với header/sidebar height
3. **Dùng `anchorScrolling: 'enabled'`** cho landing pages
4. **Test scroll behavior** trên nhiều devices
5. **Handle dynamic content** (lazy loaded sections)

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/7_viewportscroller-scrolloptions
npm install
ng serve
```

Mở `http://localhost:4200`, scroll và navigate để xem scroll position restoration hoạt động.