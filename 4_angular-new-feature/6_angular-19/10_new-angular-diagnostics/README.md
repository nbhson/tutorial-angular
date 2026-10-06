# 11. Angular Diagnostics — Unused Standalone Imports

> Ghi chú đánh số: folder đang tên `10_new-angular-diagnostics` trùng số với `10_typescript-isolated-modules` — đúng ra nên là `11_` để tránh trùng thứ tự. Giữ nguyên tên để tránh gãy link.

## Mô tả

Angular 19 giới thiệu **extended diagnostics** mới — phát hiện các standalone imports không được sử dụng trong templates. Tính năng này giúp giảm bundle size và improve compile time bằng cách identify unused declarations.

## Vấn đề giải quyết

```ts
// ❌ Problem — imports array chứa component không dùng
@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, FooterComponent],
  // FooterComponent KHÔNG BAO GIỜ được dùng trong template!
})
export class AppComponent {}
```

Trước Angular 19:
- Không có warning khi import unused components
- Bundle size tăng vô hình
- Compile time chậm hơn

## Cú pháp — Configuration trong tsconfig.json

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "unusedStandaloneImports": "warning"
      }
    }
  }
}
```

## Diagnostic Levels

### `warning` (Default)

```json
"unusedStandaloneImports": "warning"
```

Hiển thị warning nhưng **KHÔNG** fail compilation. Developers có thể thấy message nhưng build vẫn thành công.

### `error`

```json
"unusedStandaloneImports": "error"
```

Fail toàn bộ compilation nếu có unused imports. **Strict mode** — buộc developers phải clean up.

### `suppress`

```json
"unusedStandaloneImports": "suppress"
```

Tắt hoàn toàn diagnostic. Hữu ích khi bạn cố ý giữ unused imports (ví dụ: re-export purposes).

## Files trong project

### `src/app/app.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

> Component này minh họa concept — trong thực tế bạn sẽ có unused imports trigger diagnostic.

### tsconfig.json configuration

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "unusedStandaloneImports": "warning"
      }
    }
  }
}
```

## So sánh với trước Angular 19

| Feature | Trước Angular 19 | Angular 19 |
|---------|------------------|------------|
| Unused import detection | ❌ Không có | ✅ Extended diagnostics |
| Bundle size warning | ❌ Không | ✅ Warning/Error |
| Configurable | ❌ | ✅ warning/error/suppress |
| Compile time impact | ❌ Không detect | ✅ Giảm khi clean imports |

## Các loại extended diagnostics khác

Angular 19 hỗ trợ nhiều diagnostics khác:

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "unusedStandaloneImports": "warning",
        "uninvokedFunction": "warning",
        "invalidBananaInTemplate": "error",
        "missingControlFlowDirective": "warning",
        "missingNgForTrackBy": "warning",
        "missingNullForwardedProjection": "error"
      }
    }
  }
}
```

### `uninvokedFunction` (mới v19)

Phát hiện function được tham chiếu mà không invoke trong template — lỗi hay gặp khi quên `()`:

```html
<!-- ❌ Quên gọi hàm — bind function object thay vì kết quả -->
<p>{{ getName }}</p>

<!-- ✅ Đúng -->
<p>{{ getName() }}</p>
```

```json
"uninvokedFunction": "warning"
```

### `strictStandalone` (mới v19)

Enforce mọi component/directive/pipe đều khai báo `standalone` explicit (hoặc tuân thủ standalone-by-default), bắt lỗi khi còn component non-standalone lẫn vào graph:

```json
{
  "angularCompilerOptions": {
    "strictStandalone": true
  }
}
```

Kết hợp với schematic migration standalone:

```bash
ng generate @angular/core:standalone-migration
```

### Schematic dọn unused imports

Sau khi bật `unusedStandaloneImports: warning/error`, dùng schematic để auto-cleanup:

```bash
ng generate @angular/core:cleanup-unused-imports
```

## Use Cases phổ biến

### CI/CD pipeline
```json
// production build — strict mode
"unusedStandaloneImports": "error"
```

### Development — warning only
```json
// development — soft warnings
"unusedStandaloneImports": "warning"
```

### Legacy project — suppress temporarily
```json
// khi migrate, suppress trước
"unusedStandaloneImports": "suppress"
```

## Khi nào dùng?

- **New projects**: bật `warning` ngay từ đầu
- **Existing projects**: bật `warning` trước, fix dần, rồi chuyển sang `error`
- **CI/CD**: set `error` để enforce code quality
- **Performance critical**: giảm bundle size bằng cách remove unused imports

## Reference

- [Angular Extended Diagnostics](https://angular.dev/reference/configuration/extended-diagnostics)
- [unusedStandaloneImports](https://angular.love/angular-19-whats-new)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [krishnamohan.dev — Angular 19 Diagnostics](https://krishnamohan.dev/blog/angular-19-new-diagnostic/)