# Accessibility (a11y) + Angular Aria

> Nguồn: https://angular.dev/best-practices/a11y — bổ trợ `8_angular-21/3_angular-aria/`

## Tổng quan
EU yêu cầu tuân thủ a11y theo luật. Angular Aria (`@angular/aria`, developer preview từ v21) cung cấp headless primitives accessible; code thường vẫn phải đúng semantic HTML + ARIA.

## Điểm chính
- Luôn có `aria-label`, `role="alert" aria-live="polite"` cho notification, `nav aria-label` cho điều hướng.
- Focus management: `cdkTrapFocus`, visible focus ring; màu sắc đủ contrast.
- Form errors liên kết `aria-describedby`.

## Ví dụ Code
```html
<button aria-label="Đóng dialog" (click)="close()">×</button>
<nav aria-label="Điều hướng chính">
  <a routerLink="/home">Trang chủ</a>
</nav>
<div role="alert" aria-live="polite">
  @if (error()) { <p id="err">{{ error() }}</p> }
</div>
<input aria-describedby="err" [formControl]="name" />
```

```bash
npm install @angular/aria   # developer preview, API có thể đổi — theo dõi blog v21/v22
```

## Tham khảo
- [Accessibility](https://angular.dev/best-practices/a11y)
- `4_angular-new-feature/8_angular-21/3_angular-aria/`
