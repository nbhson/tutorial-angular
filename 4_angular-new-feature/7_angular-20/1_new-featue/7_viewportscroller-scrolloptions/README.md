# 7. ScrollOptions trong ViewportScroller (đã hiệu chỉnh — #61002)

> Đính chính: **KHÔNG có `withViewPortScroller({...scrollOffset})`**.
> API đúng là `withInMemoryScrolling(options: InMemoryScrollingOptions)` +
> `ViewportScroller.scrollToPosition/scrollToAnchor(pos, ScrollOptions)` (#61002).

## API đúng

```typescript
import { provideRouter, withInMemoryScrolling } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    )
  ]
};

// Scroll thủ công với ScrollOptions (ScrollBehavior):
inject(ViewportScroller).scrollToPosition([0, 0], { behavior: 'smooth' });
inject(ViewportScroller).scrollToAnchor('pricing', { behavior: 'smooth' });
```

**Thay đổi đúng:**

| Trước | v20 (#61002) |
|---|---|
| `withInMemoryScrolling({ scrollPositionRestoration, anchorScrolling })` đã có | `ViewportScroller` methods nhận thêm `ScrollOptions` (`behavior`) |

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

### 1. Basic Setup (`app.config.ts`) — đúng

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
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
    this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' }); // ← ScrollOptions mới #61002
  }

  scrollToContent() {
    this.viewportScroller.scrollToAnchor('article-content', { behavior: 'smooth' });
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

### Trước (đã có `withInMemoryScrolling`)

```typescript
provideRouter(routes, withInMemoryScrolling({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
}));
```

### Mới v20 (#61002): `ScrollOptions`

```typescript
// scrollToPosition / scrollToAnchor nhận thêm ScrollOptions:
scroller.scrollToPosition([0, 0], { behavior: 'smooth' });
scroller.scrollToAnchor('pricing', { behavior: 'smooth' });
```

**Lợi ích:**
- ✅ Scroll position restoration chính xác
- ✅ Anchor scrolling hoạt động
- ✅ Scroll offset linh hoạt
- ✅ Custom config per route
- ✅ Better UX

## Scroll Options đúng (`ScrollBehavior`)

```typescript
scroller.scrollToPosition([x, y], { behavior: 'smooth' | 'instant' | 'auto' });
scroller.scrollToAnchor(anchor, { behavior: 'smooth' | 'instant' | 'auto' });
```

## Use cases phổ biến

### 1. Landing Page (đúng API)

```typescript
provideRouter(routes, withInMemoryScrolling({
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
}))
// + scroll smooth per-call: scroller.scrollToAnchor(id, { behavior: 'smooth' })
```

### 2. Documentation Site

```typescript
provideRouter(routes, withInMemoryScrolling({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
}))
```

### 3. E-commerce

```typescript
provideRouter(routes, withInMemoryScrolling({
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'disabled'
}))
```

### 4. Dashboard

```typescript
provideRouter(routes, withInMemoryScrolling({
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled'
}))
```

## Best practices

1. **Dùng `withInMemoryScrolling()`** (không phải `withViewPortScroller`)
2. Truyền `ScrollOptions` (`{ behavior }`) per-call cho smooth scroll
3. **Test scroll behavior** trên nhiều devices

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/7_viewportscroller-scrolloptions
npm install
ng serve
```

Mở `http://localhost:4200`, scroll và navigate để xem scroll position restoration hoạt động.