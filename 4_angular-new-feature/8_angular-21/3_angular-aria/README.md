# 3. Angular Aria — UI Library Mới (Angular 21)

## Tổng quan

Angular 21 giới thiệu **Angular Aria** — một UI library mới tập trung vào **accessibility** (a11y). Đây là công cụ bổ sung cho Angular Material và CDK, giúp developer xây dựng accessible UI dễ dàng hơn. Hiện tại library đang ở giai đoạn **developer preview**.

## Tại sao cần Angular Aria?

Accessbility không còn là optional — đặc biệt nếu ứng dụng của bạn hoạt động trong EU, nó **phải tuân thủ tiêu chuẩn accessibility** theo luật. Angular Aria giúp việc tạo accessible components trở nên dễ dàng hơn.

## Setup

```bash
npm install @angular/aria
```

## Ví dụ sử dụng (pseudocode minh họa — API đang developer preview, có thể đổi)

> ⚠️ Đoạn code dưới là **pseudocode minh họa ý tưởng**, không phải API final copy-paste chạy được. Tên import như `AriaButton` có thể khác khi stable — theo dõi [Angular 21 Announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b).

```typescript
// PSEUDOCODE — minh họa ý tưởng, chưa phải API stable
import { Component } from '@angular/core';
// import { AriaButton } from '@angular/aria'; // tên package/API có thể đổi

@Component({
  selector: 'app-demo',
  imports: [AriaButton],
  template: `
    <button aria-label="Đóng dialog">
      <span class="icon">×</span>
    </button>

    <nav aria-label="Điều hướng chính">
      <a routerLink="/home">Trang chủ</a>
      <a routerLink="/about">Giới thiệu</a>
    </nav>

    <div role="alert" aria-live="polite">
      @if (notification()) {
        {{ notification() }}
      }
    </div>
  `
})
export class DemoComponent {
  notification = signal('');
}
```

## So sánh trước và sau Angular 21

### Trước Angular 21

```html
<!-- Phải tự thêm accessibility attributes thủ công -->
<button onclick="handleClick()">
  <span class="icon">×</span>
</button>
<!-- Thiếu aria-label → screen reader không đọc được -->
```

### Sau Angular 21 (với Angular Aria)

```html
<!-- Angular Aria cung cấp accessible components -->
<app-button [label]="'Đóng dialog'">
  <span class="icon">×</span>
</app-button>
<!-- Tự động có aria-label, keyboard navigation, focus management -->
```

## Best Practices

1. **Dùng Angular Aria cho accessibility-critical components**
2. **Kết hợp với Angular CDK** cho accessibility utilities
3. **Test với screen readers** — VoiceOver (macOS), NVDA (Windows)
4. **Đợi stable release** — hiện tại đang developer preview

## Tham khảo

- [Angular 21 Announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Digital Accessibility 2025 — angular.love](https://angular.love/digital-accessibility-2025-how-to-avoid-fines-and-win-more-users)