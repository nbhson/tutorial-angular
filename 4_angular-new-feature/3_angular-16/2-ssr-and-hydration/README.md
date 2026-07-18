# SSR and Non-Destructive Hydration (Angular 16)

> Angular 16 thêm support cho non-destructive hydration - SSR hiệu quả hơn, không flickering, cải thiện Core Web Vitals lên đến 45%.

## Cài đặt

```bash
# Thêm SSR
ng add @nguniversal/express-engine

# Hoặc Angular 19+
ng generate @angular/ssr:ng-add
```

## SSR Setup

```ts
// app.config.ts
import { provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideRouter(routes)
  ]
};
```

## Tại sao dùng SSR?

```
Client-Side Rendering (CSR):
  Browser → Download JS → Execute → Render HTML → Display
  (Slow: user sees blank screen)

Server-Side Rendering (SSR):
  Browser → Request → Server render HTML → Display → Download JS → Hydrate
  (Fast: user sees content immediately)
```

| Metric | CSR | SSR |
|--------|-----|-----|
| First Contentful Paint | 3.5s | 1.2s |
| Largest Contentful Paint | 5.0s | 2.1s |
| Cumulative Layout Shift | 0.25 | 0.05 |
| SEO | Poor | Excellent |

## Non-Destructive Hydration

Trước Angular 16, SSR có vấn đề: screen flickering và poor Core Web Vitals. Angular 16 solves this:

```ts
// Bật hydration
bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(),
    provideRouter(routes)
  ]
});
```

**Cơ chế hoạt động:**
```
Server Render → Browser receives HTML → Display immediately
                ↓
Client JS downloads → Bootstrap → Match existing DOM nodes
                                  ↓
                         Add event listeners
                         Enrich with client capabilities
                         (NOT re-create DOM!)
```

## Skip Hydration

Một số components dùng direct DOM manipulation cần skip hydration:

```html
<!-- Component skip hydration -->
<test-component ngSkipHydration />
```

```ts
@Component({
  template: `...`,
  host: { ngSkipHydration: 'true' }
})
export class TestComponent {
  // Direct DOM manipulation
  constructor(private el: ElementRef) {}

  updateDOM() {
    this.el.nativeElement.innerHTML = '<p>Updated</p>';
  }
}
```

## Flow Diagram

```
Traditional SSR (pre-16):
  Server render → Client display → Client JS load → Destroy DOM → Recreate DOM
  (Flickering + poor performance)

Non-Destructive Hydration (16+):
  Server render → Client display → Client JS load → Reuse DOM → Add event listeners
  (No flickering + 45% better LCP)
```

## Best Practices

1. **Enable hydration** – Luôn dùng `provideClientHydration()` với SSR
2. **Skip hydration** – Cho components dùng direct DOM manipulation
3. **Test hydration errors** – Check browser console
4. **Monitor Core Web Vitals** – Đảm bảo performance improvement

## Reference

- https://angular.dev/guide/ssr
- https://angular.dev/guide/hydration
- https://www.angulararchitects.io/en/blog/guide-for-ssr/
- https://mobisoftinfotech.com/resources/blog/angular-19-ssr-guide-angular-universal-setup

---

**Summary**: Non-destructive hydration trong Angular 16 giúp SSR hiệu quả hơn bằng cách reuse existing DOM thay vì destroy và recreate. Kết quả: không flickering, LCP cải thiện 45%, và better SEO.