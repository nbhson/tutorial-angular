# NgOptimizedImage - Advanced (Angular 15)

> Deep dive vào `NgOptimizedImage` với advanced configurations và performance testing.

## CDN Loaders

Angular 15 hỗ trợ built-in loaders cho popular CDNs:

```ts
// Imgix
import { provideImgixLoader } from '@angular/common';

bootstrapApplication(AppComponent, {
  providers: [
    provideImgixLoader('https://my-site.imgix.net')
  ]
});

// Usage - URL tự động optimize
<img ngSrc="hero.jpg" width="800" height="600">
// → https://my-site.imgix.net/hero.jpg?w=800&h=600
```

```ts
// Cloudinary
import { provideCloudinaryLoader } from '@angular/common';

provideCloudinaryLoader('https://res.cloudinary.com/my-site')

// Custom loader
function customLoader(config: ImageLoaderConfig) {
  const width = config.width;
  return `https://my-cdn.com/${config.src}?w=${width}`;
}

provideImageLoader(customLoader)
```

## Responsive Images

```html
<!-- srcset với sizes -->
<img
  ngSrc="hero.jpg"
  width="1200"
  height="600"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  srcset="
    hero-400.jpg 400w,
    hero-800.jpg 800w,
    hero-1200.jpg 1200w
  ">
```

## Placeholder Blur

```html
<!-- Blur placeholder while loading -->
<img
  ngSrc="hero.jpg"
  width="800"
  height="600"
  placeholder
  [placeholder]="blurHash">
```

## Preload Configuration

```ts
// Preload above-the-fold images
import { provideImgixLoader } from '@angular/common';

bootstrapApplication(AppComponent, {
  providers: [
    provideImgixLoader('https://my-site.imgix.net', {
      preloadHintTags: true,
      imageLinkTags: true
    })
  ]
});
```

## Performance Metrics

| Metric | Traditional | NgOptimizedImage |
|--------|-------------|-----------------|
| First Contentful Paint | 3.2s | 1.8s |
| Largest Contentful Paint | 4.1s | 2.4s |
| Cumulative Layout Shift | 0.15 | 0.02 |
| Total Blocking Time | 800ms | 200ms |

## Best Practices

1. **Identify above-the-fold images** – Dùng `priority`
2. **Use CDN loaders** – Tự động optimize URLs
3. **Set exact dimensions** – Tránh CLS
4. **Monitor LCP** – Đảm bảo hero image load nhanh

---

**Summary**: NgOptimizedImage Advanced với CDN loaders, responsive images, và preloading config giúp tối ưu performance cho image-heavy applications.