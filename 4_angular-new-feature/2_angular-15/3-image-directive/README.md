# NgOptimizedImage (Angular 15)

> `NgOptimizedImage` directive mới giúp tối ưu image loading tự động - lazy loading, preconnect, CDN support.

## Vấn đề

Hầu hết images trên web đều không được optimize đúng cách - thiếu lazy loading, không preload, render blocking.

## Giải pháp với `NgOptimizedImage`

```ts
// app.component.ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <img ngSrc="/assets/hero.jpg" width="800" height="600" priority>
    <img ngSrc="/assets/product-1.jpg" width="400" height="300">
    <img ngSrc="/assets/product-2.jpg" width="400" height="300">
  `
})
export class AppComponent { }
```

## Tính năng chính

### 1. Lazy Loading tự động

```html
<!-- Chỉ load khi gần viewport -->
<img ngSrc="/assets/lazy-image.jpg" width="400" height="300">
```

### 2. Priority (Eager loading)

```html
<!-- Load ngay lập tức - cho above-the-fold images -->
<img ngSrc="/assets/hero.jpg" width="800" height="600" priority>
```

### 3. Preconnect

```ts
// Tự động thêm preconnect cho CDN
import { provideImgixLoader } from '@angular/common';

bootstrapApplication(AppComponent, {
  providers: [
    provideImgixLoader('https://my-site.imgix.net')
  ]
});
```

### 4. Responsive Images

```html
<img
  ngSrc="/assets/hero.jpg"
  width="800"
  height="600"
  sizes="(max-width: 768px) 100vw, 50vw"
  srcset="
    /assets/hero-400.jpg 400w,
    /assets/hero-800.jpg 800w,
    /assets/hero-1200.jpg 1200w
  ">
```

### 5. CDN Loader

```ts
// Imgix
provideImgixLoader('https://my-site.imgix.net')

// Cloudinary
provideCloudinaryLoader('https://res.cloudinary.com/my-site')

// Custom CDN
provideImageKitLoader('https://ik.imagekit.io/my-site')
```

## Flow Diagram

```
Traditional:
  <img src="..."> → Load immediately → Blocking

NgOptimizedImage:
  <img ngSrc="..." width="..." height="...">
  → Auto lazy loading (default)
  → Preconnect (if CDN)
  → Width/height → No layout shift
  → priority → Above-fold images
```

## Best Practices

1. **Luôn set width/height** – Tránh layout shift
2. **Priority cho hero images** – Above-the-fold
3. **CDN loader** – Tự động optimize URLs
4. **Sử dụng `sizes` attribute** – Cho responsive images

---

**Summary**: `NgOptimizedImage` giúp tối ưu image loading tự động với lazy loading, preconnect, CDN support. Chỉ cần thêm `ngSrc` và set dimensions là có optimized images.