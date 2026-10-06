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

> Dùng `ngSrcset` + `sizes`, không viết `srcset` thủ công. Xem bài cơ bản `3-image-directive`.

```html
<img
  ngSrc="hero.jpg"
  width="1200"
  height="600"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  ngSrcset="400w, 800w, 1200w">
```

## Fill mode + auto-srcset (mới đúng của v15) + SSR preload

- `fill` [experimental trong v15]: `<img ngSrc="hero.jpg" fill priority>`
- Auto-`srcset` từ loader khi có `sizes`
- `priority` + SSR tự sinh `<link rel="preload">` trong `<head>` (không cần config loader options)

> `placeholder` (blur) KHÔNG phải v15 – có từ v17+ (PR #53783). Đừng dùng `[placeholder]="blurHash"` trong project v15.
> Muốn tìm hiểu placeholder, xem docs bản mới: https://angular.dev/guide/image-optimization

## Preload Configuration

```ts
// Preload cho priority images là tự động khi SSR, không có options
// preloadHintTags/imageLinkTags trong provideImgixLoader là KHÔNG tồn tại – đã xóa ví dụ sai.
import { provideImgixLoader } from '@angular/common';

bootstrapApplication(AppComponent, {
  providers: [
    provideImgixLoader('https://my-site.imgix.net')
  ]
});
```

## Performance Metrics

> Official chỉ công bố 1 con số: Land's End cải thiện 75% LCP (lab). Bảng dưới là minh họa local, không phải benchmark official.
> Nguồn: https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8

| Metric | Traditional (minh họa) | NgOptimizedImage (minh họa) |
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