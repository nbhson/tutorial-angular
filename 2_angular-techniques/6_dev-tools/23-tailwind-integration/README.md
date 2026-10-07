# Tailwind CSS + Angular

> Nguồn: https://angular.dev/guide/tailwind

## Tổng quan
Tailwind v4 tích hợp qua `@tailwindcss/vite` (Vite pipeline là default từ v17). Không cần config cồng kềnh như v2/v3.

## Điểm chính
- Cài `@tailwindcss/vite` + `@tailwindcss/postcss` (tùy setup), import `"tailwindcss"` trong CSS global.
- Class tiện ích dùng trực tiếp trong template `@if/@for`.

## Ví dụ Code
```bash
npm install tailwindcss @tailwindcss/vite
```

```css
/* src/styles.css */
@import "tailwindcss";
```

```typescript
// vite.config? Không cần — Angular CLI tự wire @tailwindcss/vite
// angular.json giữ builder application (Vite+esbuild)
```

```html
<div class="p-4 rounded-xl bg-slate-900 text-white">Hello Tailwind v4</div>
```

## Tham khảo
- [Tailwind](https://angular.dev/guide/tailwind)
