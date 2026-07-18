# Fallback Content for ng-content

## Tổng quan

Trong Angular 18, `ng-content` được hỗ trợ **fallback content** — nội dung mặc định sẽ hiển thị khi không có content nào được project vào component. Trước đây, nếu không có content được truyền vào, `ng-content` sẽ render rỗng. Giờ đây, bạn có thể đặt default content trực tiếp trong `<ng-content>` tags.

### Trước Angular 18

```ts
// Không có fallback — hiển thị rỗng nếu không có content
<ng-content select=".header"></ng-content>
```

### Angular 18+

```ts
// Có fallback — hiển thị "Default Header" nếu không có content
<ng-content select=".header">Default Header</ng-content>
```

## Cấu trúc files

```
3_fallback-content-for-ng-content/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component - demo content projection
│   │   ├── config/
│   │   │   └── app.config.ts             # Application config
│   │   ├── components/
│   │   │   └── fallback.component.ts     # Component với ng-content fallback
│   │   └── router/
│   │       └── app.routes.ts             # Routes
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/components/fallback.component.ts` — Fallback Content Component

Đây là file chính demo tính năng ng-content fallback. Component định nghĩa 4 ng-content slots: header, content, footer, và default content.

```ts
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fallback',
  template: `
    <ng-content select=".header"></ng-content>
    <ng-content select="#content"></ng-content>
    <ng-content select="[data='footer']"></ng-content>
    <hr>
    <ng-content>Default Content</ng-content>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FallbackComponent implements OnInit { }
```

**Giải thích:**
- `<ng-content select=".header">` —投影 class `.header`, nếu không có → hiển thị rỗng
- `<ng-content select="#content">` —投影 id `#content`, nếu không có → hiển thị rỗng
- `<ng-content select="[data='footer']">` —投影 attribute `[data='footer']`, nếu không có → hiển thị rỗng
- `<ng-content>Default Content</ng-content>` — **Fallback content**: nếu không có content nào được project → hiển thị "Default Content"

### `src/app/app.component.ts` — Root Component

Demonstrate how content is projected into FallbackComponent with specific selectors.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FallbackComponent } from "./components/fallback.component";

@Component({
  selector: 'app-root',
  template: `
    <app-fallback>
      <span class="header">New Header </span>
      <span id="content">New Content </span>
      <span data="footer">New Footer </span>
    </app-fallback>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FallbackComponent]
})
export class AppComponent { }
```

**Giải thích:**
- `<span class="header">New Header </span>` — được project vào `<ng-content select=".header">`
- `<span id="content">New Content </span>` — được project vào `<ng-content select="#content">`
- `<span data="footer">New Footer </span>` — được project vào `<ng-content select="[data='footer']">`
- Nếu **bỏ trống** `<app-fallback></app-fallback>` → "Default Content" sẽ hiển thị

### Kết quả render khi truyền đầy đủ content

```
New Header
New Content
New Footer
──────────
```

### Kết quả render khi truyền rỗng `<app-fallback></app-fallback>`

```
──────────
Default Content
```

## Content Projection Patterns trong Angular

### 1. Basic Projection (không selector)

```html
<!-- Component template -->
<ng-content>Default text</ng-content>

<!-- Usage -->
<app-card>
  <p>Custom text</p>
</app-card>
```

### 2. Selective Projection (với selector)

```html
<!-- Component template -->
<ng-content select=".header"></ng-content>
<ng-content select=".body"></ng-content>
<ng-content select=".footer"></ng-content>

<!-- Usage -->
<app-card>
  <div class="header">Title</div>
  <div class="body">Content</div>
  <div class="footer">Actions</div>
</app-card>
```

### 3. Fallback Content (Angular 18+)

```html
<!-- Component template — với fallback -->
<ng-content select=".header">Default Header</ng-content>
<ng-content select=".body">No content available</ng-content>
<ng-content select=".footer">Default Footer</ng-content>
```

### 4. Multi-slot với Fallback

```ts
@Component({
  template: `
    <header>
      <ng-content select="[logo]">🏢 Company Logo</ng-content>
      <ng-content select="[nav]">Home | About</ng-content>
    </header>
    <main>
      <ng-content>No articles found</ng-content>
    </main>
    <footer>
      <ng-content select="[copyright]">© 2024 Default Copyright</ng-content>
    </footer>
  `
})
export class LayoutComponent { }
```

## So sánh: Trước vs Sau Angular 18

| Aspect | Trước Angular 18 | Angular 18+ |
|--------|-------------------|-------------|
| Fallback Content | Không hỗ trợ | Hỗ trợ trực tiếp trong `<ng-content>` |
| Empty Projection | Render rỗng | Render fallback content |
| Boilerplate | Cần `*ngIf` hoặc logic thủ công | Không cần extra code |
| Flexibility | Hạn chế | Linh hoạt với conditional content |

## Lợi ích

1. **Giảm boilerplate** — Không cần `*ngIf` để kiểm tra content có tồn tại không
2. **Better UX** — Luôn hiển thị nội dung hợp lý cho user
3. **Declarative** — Fallback content được định nghĩa trực tiếp trong template
4. **Composable** — Kết hợp tốt với multi-slot content projection

## Yêu cầu

- Angular 18+
- Node.js 18+

## Tài liệu tham khảo

- [Angular Content Projection Guide](https://angular.dev/guide/components/content-projection)
- [ng-content API](https://angular.dev/api/core/ng-content)