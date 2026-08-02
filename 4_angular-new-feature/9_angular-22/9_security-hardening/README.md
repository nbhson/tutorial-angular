# Siết Chặt Bảo Mật (Security Hardening)

## Tổng quan
Angular 22 làm sanitization chặt chẽ hơn theo mặc định. Nếu bạn dùng ` DomSanitizer.bypassSecurityTrust*`, giờ bạn sẽ nhận được cảnh báo trong dev và xử lý chặt chẽ hơn trong prod.

## Tính năng chính

- **Sanitization chặt chẽ hơn**: ` DomSanitizer.bypassSecurityTrust*` kích hoạt cảnh báo
- **Cảnh báo dev**: Cảnh báo console rõ ràng khi bypass bảo mật
- **Thực thi trong prod**: Xử lý chặt chẽ hơn trong production builds
- **Thăng hạng safe value**: Safe values được thăng hạng thành DomSanitizer.bypassSecurityTrustUrl
- **Thực thi best practices**: Khuyến khích các mẫu code an toàn

## Ví dụ Code

### Bypass Bảo Mật (Giờ Có Cảnh Báo)

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-unsafe-demo',
  template: `
    <div [innerHTML]="trustedHtml"></div>
    <a [href]="trustedUrl">Liên kết</a>
  `
})
export class UnsafeDemoComponent {
  trustedHtml: SafeHtml;
  trustedUrl: SafeUrl;

  constructor(private sanitizer: DomSanitizer) {
    // ⚠️ Angular 22: Điều này giờ tạo ra cảnh báo dev!
    this.trustedHtml = sanitizer.bypassSecurityTrustHtml(
      '<script>alert("xss")</script>'
    );
    
    // ⚠️ Angular 22: Cái này cũng cảnh báo trong dev
    this.trustedUrl = sanitizer.bypassSecurityTrustUrl(
      'javascript:alert("xss")'
    );
  }
}
```

### Các Pattern An Toàn Thay Thế

```typescript
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-safe-demo',
  template: `
    <!-- An toàn: Dùng component interpolation thay vì innerHTML -->
    @for (item of safeItems(); track item.id) {
      <div class="item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    }
    
    <!-- An toàn: Dùng routerLink thay vì href -->
    <a [routerLink]="['/page', pageId()]">Điều hướng</a>
    
    <!-- An toàn: Whitelist các URL một cách tường minh -->
    @if (isSafeUrl(inputUrl())) {
      <a [href]="inputUrl()">Liên kết ngoài</a>
    }
  `
})
export class SafeDemoComponent {
  inputUrl = signal('');
  pageId = signal(1);
  
  safeItems = signal([
    { id: 1, title: 'Mục 1', description: 'Mô tả 1' },
    { id: 2, title: 'Mục 2', description: 'Mô tả 2' }
  ]);
  
  isSafeUrl(url: string): boolean {
    const allowedDomains = ['example.com', 'docs.angular.io'];
    try {
      const parsed = new URL(url);
      return allowedDomains.includes(parsed.hostname);
    } catch {
      return false;
    }
  }
}
```

### Render HTML An Toàn

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rich-content',
  template: `
    <!-- Nếu BẮT BUỘC phải render HTML, hãy sanitize nó đúng cách -->
    @if (sanitizedContent()) {
      <div [innerHTML]="sanitizedContent()"></div>
    }
  `
})
export class RichContentComponent {
  private sanitizer = inject(DomSanitizer);
  
  // Xử lý nội dung qua một whitelist
  sanitizedContent = computed(() => {
    const raw = this.rawHtml();
    return this.sanitizer.bypassSecurityTrustHtml(
      this.stripDangerousTags(raw)
    );
  });
  
  rawHtml = signal('<p>Hello <b>World</b></p>');
  
  private stripDangerousTags(html: string): string {
    // Loại bỏ script tags và event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }
}
```

### Checklist Best Practices Bảo Mật

```typescript
// ✅ NÊN LÀM: Dùng sanitization tích hợp sẵn của Angular
@Component({
  template: `
    <!-- Được Angular tự động sanitize -->
    <div [innerHTML]="userContent"></div>
    <img [src]="imageUrl" />
    <a [href]="linkUrl"></a>
  `
})

// ❌ KHÔNG NÊN: Bypass bảo mật mà không có lý do chính đáng
@Component({
  template: `
    <!-- Chỉ dùng bypassSecurity khi thật sự cần thiết -->
    <div [innerHTML]="bypassedHtml"></div>
  `
})
```

## Ma Trận Bảo Mật

| Thuộc tính | Tự động sanitize | Cảnh báo bypass |
|----------|---------------|----------------|
| `[innerHTML]` | ✅ Làm sạch XSS | ⚠️ Có |
| `[src]` | ✅ Xác thực URL | ⚠️ Có |
| `[href]` | ✅ Xác thực URL | ⚠️ Có |
| `[style]` | ✅ Làm sạch CSS | ⚠️ Có |
| `[attr]` | ✅ Làm sạch attribute | ⚠️ Có |

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
