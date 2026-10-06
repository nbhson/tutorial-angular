# Siết Chặt Bảo Mật (Security Hardening)

## Tổng quan
Angular 22 không thêm cảnh báo dev mới cho `DomSanitizer.bypassSecurityTrust*` — nội dung cũ về "dev warning khi bypass" là **chưa verify, đã xóa**. Những thay đổi bảo mật thật trong changelog v22 đều nằm ở tầng sanitization schema, SVG, SSR/SSRF và transfer-cache.

## Tính năng chính (theo changelog thật)

- **Sanitize `href`/`xlink:href` động trên SVG `<a>`**: `sanitize dynamic href and xlink:href bindings on SVG a elements`
- **Đồng bộ sanitization schema**: `synchronize core sanitization schema with compiler`, `support prefix-insensitive DOM schema lookups`, `normalize tag names with custom namespaces`, compile-time i18n attribute validation
- **Chặn SSRF backslash/protocol-relative URL (platform-server)**: `parseUrl`/`ServerPlatformLocation` không còn để `//evil.com` hay `/\evil.com` override hostname khi SSR
- **Chặn rò credentials qua lệch URL resolution (SSR)**: Sửa khác biệt `trim()` vs WHATWG URL (Unicode whitespace như `U+00A0`) khiến `relativeUrlsTransformerInterceptorFn` gửi nhầm `Authorization` ra origin attacker
- **Sửa transfer-cache cache-key ambiguity**: `HttpParams` lặp (`append('role','user').append('role','admin')` vs `set('role','user,admin')`) trước đây serialize trùng `role=user,admin` gây reuse nhầm response / state poisoning — nay tách key đúng
- **Validate chặt `Host`/`Forwarded` headers**: `Host`, `X-Forwarded-Host`, `Forwarded(host)`, `X-Forwarded-Port/Proto/Prefix` bị validate strict, mặc định strip proxy headers trừ khi bật `trustProxyHeaders`

## Ví dụ Code

### SVG `<a>` với `href` động — nay bị sanitize

```typescript
@Component({
  selector: 'app-svg-link',
  template: `
    <!-- v22: href/xlink:href động trên SVG <a> được sanitize như HTML <a> -->
    <svg>
      <a [href]="externalUrl()" [attr.xlink:href]="externalUrl()">Mở</a>
    </svg>
  `
})
export class SvgLinkComponent {
  externalUrl = signal('https://docs.angular.io');
}
```

### SSR: Đừng truyền `req.url` thô vào render

```typescript
// server.ts — pattern dễ dính SSRF backslash URL trước v22
// Attacker GET //evil.com/ hoặc /\evil.com/ khiến HttpClient relative + PlatformLocation.hostname trỏ nhầm origin
import { renderApplication } from '@angular/platform-server';

app.get('*', async (req, res) => {
  // Nên sanitize leading slashes trước khi đưa vào Angular
  let url = req.url;
  if (url.startsWith('//') || url.startsWith('/\\') || url.startsWith('\\')) {
    url = '/' + url.replace(/^[/\\]+/, '');
  }
  const html = await renderApplication(bootstrap, { document: template, url });
  res.send(html);
});
```

### Transfer-cache: Tránh reuse nhầm response

```typescript
// Hai request này trước v22 serialize trùng key `role=user,admin` — nay đã tách đúng
this.http.get('/api/resource', {
  params: new HttpParams().set('role', 'user,admin')
});

this.http.get('/api/resource', {
  params: new HttpParams().append('role', 'user').append('role', 'admin')
});

// Endpoint nhạy cảm: có thể tắt cache riêng lẻ
this.http.get('/api/resource', { transferCache: false });
```

### Validate URL trước khi gắn credentials (SSR)

```typescript
// Kẻ tấn công chèn leading Unicode whitespace (U+00A0) để qua mặt new URL() check
// nhưng platform-server trim khác WHATWG → thành //attacker.example/collect
const target = new URL(input, trustedOrigin);
if (target.origin !== trustedOrigin.origin) {
  throw new Error('Cross-origin request blocked');
}
// Nên strip leading unicode whitespace + validate input trước khi clone headers Authorization
```

## Ma Trận Bảo Mật (v22)

| Khu vực | Thay đổi v22 |
|----------|-------------|
| SVG `<a>` `[href]`/`xlink:href` động | ✅ Sanitize như HTML `<a>` |
| Sanitization schema (core ↔ compiler) | ✅ Đồng bộ, lookup không phân biệt prefix/case, validate i18n attr lúc compile |
| SSR `parseUrl` backslash URL | ✅ Chặn `//evil.com`, `/\evil.com` override hostname |
| SSR URL resolution + credentials | ✅ Không còn trim lệch gây rò `Authorization` ra attacker origin |
| `HttpTransferCache` key | ✅ Phân biệt scalar-comma vs repeated-params |
| `Host`/`Forwarded` headers | ✅ Validate strict, strip mặc định trừ khi `trustProxyHeaders` |

## Tham khảo
- [Angular v22 changelog — sanitize dynamic href on SVG a, synchronize sanitization schema, prefix-insensitive lookups](https://github.com/angular/angular/releases/tag/v22.0.0)
- [GHSA SSRF via backslash URLs (platform-server)](https://github.com/angular/angular/security/advisories/GHSA-45q2-gjvg-7973)
- [GHSA SSRF + credential disclosure via URL resolution discrepancy](https://github.com/angular/angular/security/advisories/GHSA-f6mr-pjwc-34m4)
- [GHSA HttpTransferCache cache-key ambiguity](https://github.com/angular/angular/security/advisories/GHSA-jhpw-976m-542j)
