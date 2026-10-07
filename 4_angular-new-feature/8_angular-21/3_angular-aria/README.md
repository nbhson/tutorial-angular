# 3. Angular Aria — UI Library Mới (Angular 21+, Developer Preview)

## Tổng quan

Angular 21 giới thiệu **Angular Aria** — headless UI primitives tập trung vào **accessibility** (a11y), bổ sung cho Angular Material và CDK. Tới v22 vẫn ở **developer preview**: API có thể đổi, chưa nên dùng production diện rộng.

> Thực tế: package `@angular/aria` chưa có API stable để copy-paste. Phần dưới cho code **dùng được ngay hôm nay** (semantic HTML + ARIA đúng chuẩn) + cách chuẩn bị đón Aria stable.

## Tại sao cần?
EU yêu cầu tuân thủ a11y theo luật. Sai a11y = phạt + mất users dùng screen reader. Xem thêm `2_angular-techniques/8_best-practices/2_accessibility/`.

## Setup (khi stable)
```bash
npm install @angular/aria
# hiện tại: theo dõi https://blog.angular.dev/announcing-angular-v21-57946c34f14b để cập nhật tên import
```

## Ví dụ dùng được ngay (không phụ thuộc API preview)
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-demo',
  template: `
    <button aria-label="Đóng dialog" (click)="close()">×</button>

    <nav aria-label="Điều hướng chính">
      <a routerLink="/home">Trang chủ</a>
      <a routerLink="/about">Giới thiệu</a>
    </nav>

    <div role="alert" aria-live="polite">
      @if (notification()) { {{ notification() }} }
    </div>
  `,
})
export class DemoComponent {
  notification = signal('');
  close() { this.notification.set('Đã đóng'); }
}
```

## Định hướng khi Aria stable
- Thay button/nav/alert thủ công bằng primitives của Aria (tự có keyboard nav, focus management, ARIA wiring).
- Kết hợp CDK (`a11y` utilities) + test bằng VoiceOver/NVDA.

## Tham khảo
- [Angular 21 Announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Accessibility — angular.dev](https://angular.dev/best-practices/a11y)
- `2_angular-techniques/8_best-practices/2_accessibility/README.md`
