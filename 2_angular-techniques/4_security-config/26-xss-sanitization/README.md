# XSS và Sanitization trong Angular

> Nguồn: https://angular.dev/best-practices/security#xss — https://angular.dev/api/platform-browser/DomSanitizer

## XSS là gì?

Cross-Site Scripting (XSS) xảy ra khi bạn **đưa dữ liệu không tin cậy vào DOM** và trình duyệt thực thi nó như code:

```html
<!-- dữ liệu người dùng: <img src=x onerror="alert(document.cookie)"> -->
<p>Chào <span [innerHTML]="userComment"></span></p>
```

Nếu `userComment` chưa được làm sạch, script của kẻ tấn công chạy với danh nghĩa domain của bạn: đánh cắp session, đọc localStorage, gửi request giả mạo... Ba dạng XSS kinh điển:

- **Stored**: payload lưu ở DB (comment, profile), render cho mọi người.
- **Reflected**: payload nằm trong URL/query, server/template trả lại.
- **DOM-based**: JS client tự chèn payload vào DOM.

## Angular tự escape mặc định

Angular coi mọi dữ liệu binding là **không tin cậy** và làm sạch theo **ngữ cảnh (context)** trước khi render:

```typescript
@Component({
  template: `
    <p>{{ userComment }}</p>          <!-- TEXT: escape toàn bộ, an toàn -->
    <div [innerHTML]="userComment"></div>  <!-- HTML: sanitize, chỉ giữ tag an toàn -->
    <a [href]="userUrl">Link</a>      <!-- URL: chặn javascript:, giữ http(s)/mailto -->
    <div [style]="userStyle"></div>   <!-- CSS: loại expression()/url() nguy hiểm -->
  `,
})
export class CommentComponent {
  userComment = '<img src=x onerror="alert(1)">Xin chào';
  userUrl = 'javascript:alert(1)';
}
```

Kết quả:

- `{{ userComment }}` hiển thị **văn bản** thô của tag, không render ảnh, không chạy `onerror`.
- `[innerHTML]` sanitize: tag `<img onerror>` bị loại/strip thuộc tính nguy hiểm, chỉ giữ tag được phép.
- `[href]` với `javascript:alert(1)` → Angular cảnh báo và render thành `unsafe:javascript:alert(1)`.

> Quan trọng: Angular **không cho phép** thẻ `<script>` đi qua `[innerHTML]` dù bạn dùng `bypassSecurityTrustHtml` — script trong innerHTML cũng không được thực thi theo chuẩn HTML, nhưng Angular vẫn chặn từ khâu sanitize.

## DomSanitizer — API chính

```typescript
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({ /* ... */ })
export class VideoComponent {
  private sanitizer = inject(DomSanitizer);

  // URL của video YouTube — cần đánh dấu là ResourceUrl an toàn
  embedUrl(input: string): SafeResourceUrl {
    const allowed = /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//;
    if (!allowed.test(input)) {
      throw new Error('URL không hợp lệ');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(input);
  }
}
```

```html
<iframe width="560" height="315" [src]="embedUrl(videoUrl)"></iframe>
```

Các phương thức theo ngữ cảnh — **mỗi ngữ cảnh một phương thức, không dùng lẫn**:

| API | Ngữ cảnh | Rủi ro khi lạm dụng |
|---|---|---|
| `bypassSecurityTrustHtml` | `innerHTML` | Chèn `<img onerror>`, event handler |
| `bypassSecurityTrustStyle` | `[style]` | CSS exfiltration |
| `bypassSecurityTrustScript` | `<script>` | Thực thi JS tùy ý — gần như luôn cấm |
| `bypassSecurityTrustUrl` | `href`, `src` | `javascript:` URL |
| `bypassSecurityTrustResourceUrl` | `iframe`, `embed` | Tải code lạ vào iframe |

Đúng như tên gọi: `bypass` = **bỏ qua** sanitization, rủi ro hoàn toàn thuộc về bạn. Nguyên tắc:

1. **Không dùng khi chưa cần**. Nếu chỉ hiển thị text — dùng interpolation.
2. **Tự whitelist** trước khi bypass: kiểm tra input khớp domain/format cho phép (như ví dụ YouTube ở trên).
3. **Cân nhắc render trong sandbox**: iframe khép kín, hoặc dùng thư viện sanitize chuẩn (DOMPurify) thay vì bypass.

## Lỗi thường gặp

### 1. Bypass quá tay để "cho chạy được"

```typescript
// ❌ SAI — vô hiệu hóa toàn bộ bảo mật của Angular
this.html = this.sanitizer.bypassSecurityTrustHtml(rawServerHtml);
```

Dữ liệu từ chính server của bạn cũng có thể bị nhiễm XSS stored. Nếu buộc phải render HTML từ backend, sanitize lại phía client:

```typescript
// ✅ dùng DOMPurify với cấu hình chặt thay vì bypass thẳng
import DOMPurify from 'dompurify';
this.html = DOMPurify.sanitize(rawServerHtml, { ALLOWED_TAGS: ['b', 'i', 'a', 'p'] });
```

### 2. Template không cho chuỗi động — và đừng cố "xạo" nó

```html
<!-- ❌ Angular chặn cứng: property của template không được là chuỗi động -->
<iframe [src]="iframeUrl" ...>
```

Đừng dùng `element.nativeElement.innerHTML = ...` trong code để "vòng qua" template — bạn vừa tự mở cửa XSS.

### 3. XSS không qua binding

- `routerLink` với URL lạ — kiểm tra dữ liệu route.
- Code tự render qua `Renderer2`/native API.
- Dependency frontend bị nhiễm (supply-chain) — `npm audit`, lock file, dùng `--ignore-scripts` cẩn trọng.

### 4. Quên rằng XSS server-side cũng liên quan Angular

Với SSR (`@angular/ssr`), dữ liệu render trước ở server — nếu bạn bypass sanitization, payload có thể nằm thẳng trong HTML đầu tiên gửi về browser. Đây là lý do càng phải tránh `bypassSecurityTrust*` khi bật SSR.

## Lưu ý version

- `sanitizer.sanitize(...)` với `SecurityContext` — API thấp, chỉ dùng khi viết thư viện; trong component nên dùng các phương thức `Safe*`.
- Từ Angular v16+ có **extended diagnostics** cảnh báo template không an toàn lúc compile; giữ `"typeCheckHostBindings"`/diagnostics bật trong `angular.json` để nhận cảnh báo sớm.

## Checklist

- [ ] Text hiển thị bằng `{{ }}`, không `[innerHTML]`.
- [ ] Mọi `bypassSecurityTrust*` đều đi kèm whitelist input.
- [ ] Không có `eval`/`new Function`/`innerHTML` trực tiếp trong code.
- [ ] `[href]`/`[src]` luôn là binding (không phải chuỗi động do người dùng kiểm soát).
- [ ] `npm audit` sạch, dependency được cập nhật định kỳ.

## Tham khảo

- [Angular — XSS Prevention](https://angular.dev/best-practices/security#xss)
- [DomSanitizer API](https://angular.dev/api/platform-browser/DomSanitizer)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify](https://github.com/cure53/DOMPurify)
