# Security Hardening

## Overview
Angular 22 makes sanitization stricter by default. If you use ` DomSanitizer.bypassSecurityTrust*`, you now get a warning in dev and stricter handling in prod.

## Key Features

- **Stricter sanitization**: ` DomSanitizer.bypassSecurityTrust*` triggers warnings
- **Dev warnings**: Clear console warnings when bypassing security
- **Prod enforcement**: Stricter handling in production builds
- **Safe value promotion**: Safe values are promoted to DomSanitizer.bypassSecurityTrustUrl
- **Best practices enforced**: Encourages secure coding patterns

## Code Examples

### Bypassing Security (Now with Warnings)

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-unsafe-demo',
  template: `
    <div [innerHTML]="trustedHtml"></div>
    <a [href]="trustedUrl">Link</a>
  `
})
export class UnsafeDemoComponent {
  trustedHtml: SafeHtml;
  trustedUrl: SafeUrl;

  constructor(private sanitizer: DomSanitizer) {
    // ⚠️ Angular 22: This now produces a dev warning!
    this.trustedHtml = sanitizer.bypassSecurityTrustHtml(
      '<script>alert("xss")</script>'
    );
    
    // ⚠️ Angular 22: This also warns in dev
    this.trustedUrl = sanitizer.bypassSecurityTrustUrl(
      'javascript:alert("xss")'
    );
  }
}
```

### Secure Alternative Patterns

```typescript
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-safe-demo',
  template: `
    <!-- Safe: Use component interpolation instead of innerHTML -->
    @for (item of safeItems(); track item.id) {
      <div class="item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    }
    
    <!-- Safe: Use routerLink instead of href -->
    <a [routerLink]="['/page', pageId()]">Navigate</a>
    
    <!-- Safe: Whitelist URLs explicitly -->
    @if (isSafeUrl(inputUrl())) {
      <a [href]="inputUrl()">External Link</a>
    }
  `
})
export class SafeDemoComponent {
  inputUrl = signal('');
  pageId = signal(1);
  
  safeItems = signal([
    { id: 1, title: 'Item 1', description: 'Description 1' },
    { id: 2, title: 'Item 2', description: 'Description 2' }
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

### Safe HTML Rendering

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rich-content',
  template: `
    <!-- If you MUST render HTML, sanitize it properly -->
    @if (sanitizedContent()) {
      <div [innerHTML]="sanitizedContent()"></div>
    }
  `
})
export class RichContentComponent {
  private sanitizer = inject(DomSanitizer);
  
  // Process content through a whitelist
  sanitizedContent = computed(() => {
    const raw = this.rawHtml();
    return this.sanitizer.bypassSecurityTrustHtml(
      this.stripDangerousTags(raw)
    );
  });
  
  rawHtml = signal('<p>Hello <b>World</b></p>');
  
  private stripDangerousTags(html: string): string {
    // Remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }
}
```

### Security Best Practices Checklist

```typescript
// ✅ DO: Use Angular's built-in sanitization
@Component({
  template: `
    <!-- Auto-sanitized by Angular -->
    <div [innerHTML]="userContent"></div>
    <img [src]="imageUrl" />
    <a [href]="linkUrl"></a>
  `
})

// ❌ DON'T: Bypass security without good reason
@Component({
  template: `
    <!-- Only use bypassSecurity when absolutely necessary -->
    <div [innerHTML]="bypassedHtml"></div>
  `
})
```

## Security Matrix

| Property | Auto-Sanitized | Bypass Warning |
|----------|---------------|----------------|
| `[innerHTML]` | ✅ XSS cleaned | ⚠️ Yes |
| `[src]` | ✅ URL validated | ⚠️ Yes |
| `[href]` | ✅ URL validated | ⚠️ Yes |
| `[style]` | ✅ CSS cleaned | ⚠️ Yes |
| `[attr]` | ✅ Attribute cleaned | ⚠️ Yes |

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)