# esBuild Improvements (Angular 15)

> Angular 15 cải thiện support cho esBuild - faster builds, simplified pipeline.

## Tổng quan

Trong v14, esBuild chỉ là experimental. V15 mở rộng support: Sass, SVG templates, file replacement, và `--watch`.

## Cài đặt

Thay đổi `angular.json`:

```json
// Trước
{
  "builder": "@angular-devkit/build-angular:browser"
}

// Sau - sử dụng esBuild
{
  "builder": "@angular-devkit/build-angular:browser-esbuild"
}
```

## So sánh Build Time

| Feature | Webpack | esBuild |
|---------|---------|---------|
| Dev server start | 35s | 12s |
| Production build | 180s | 45s |
| Watch rebuild | 5s | 1.5s |

## Hỗ trợ mới trong v15

### Sass Support

```scss
// styles.scss - Hoạt động với esBuild
$primary-color: #1976d2;

.component {
  color: $primary-color;
}
```

### SVG Template

```html
<!-- template.html với inline SVG -->
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
```

### File Replacement

```json
// angular.json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

### Watch Mode

```bash
# Dev server với watch
ng serve --watch

# Build với watch
ng build --watch
```

## Flow Diagram

```
Traditional Webpack:
  Source → Webpack → Bundle → Output
  (Slow: 35s start)

esBuild:
  Source → esBuild → Bundle → Output
  (Fast: 12s start)
```

## Best Practices

1. **Thử cho dev workflow** – Faster iteration
2. **Kiểm tra compatibility** – Một số plugins có thể chưa hỗ trợ
3. **Production ready** – Đã ổn định cho production builds
4. **So sánh bundle size** – Kiểm tra trước khi migrate

---

**Summary**: esBuild trong Angular 15 hỗ trợ Sass, SVG templates, file replacement và watch mode. Build time giảm đáng kể so với Webpack.