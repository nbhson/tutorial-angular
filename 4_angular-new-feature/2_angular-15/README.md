# Angular 15 New Features

Tổng hợp các feature mới trong Angular 15. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### Standalone & Components

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Standalone APIs Stable](1_standalone-stable/README.md) | Standalone components official stable |
| 2 | [Directive Composition API](2_directive-composition-api/README.md) | Kết hợp multiple directives trên một component |
| 3 | [Image Directive](3-image-directive/README.md) | `NgOptimizedImage` directive mới |

### Build & Performance

| # | Feature | Mô tả |
|---|---------|-------|
| 4 | [Image Directive - Advanced](3.1-image-directive/README.md) | Deep dive image optimization |
| 5 | [esBuild Improvements](4-improvements_esbuild/README.md) | Cải thiện build với esBuild |

### Router & DX

| # | Feature | Mô tả |
|---|---------|-------|
| 6 | [Functional Router Guards](5_functional-router-guards/README.md) | Guards bằng functions thay vì classes |
| 7 | [Auto Import in Language Service](6_automatic-import-in-language-service/README.md) | Auto import khi viết code |
| 8 | [Better Stack Traces](7-better_stack_traces/README.md) | Stack traces rõ ràng hơn |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Standalone APIs stable** – Đủ tự tin dùng production
2. **Directive Composition API** – Cách mới để reuse logic (chỉ với `standalone` directives)
3. **Functional Router Guards** – Code gọn hơn, modern hơn (`CanActivateFn`, `CanMatchFn`, `ResolveFn`...)
4. **NgOptimizedImage** – Tối ưu image loading dễ dàng (stable từ v15, `fill` + auto-`srcset` là mới của v15)
5. **Better DX** – Auto import (components), better stack traces (Chrome async stack tagging)
6. **MDC-based Material stable + CDK Listbox** – Xem mục bổ sung bên dưới
7. **`provideHttpClient` + functional interceptors** – Xem mục bổ sung bên dưới

### Điểm cần lưu ý:

1. **esBuild vẫn experimental trong v15** – Chưa default, thiếu i18n/workers... Chỉ thử cho dev, xem `4-improvements_esbuild`
2. **Breaking changes cần check khi upgrade** – MDC Material (`legacy-*`), `RouterOutlet` instantiate sau CD, `Keyframes` prefix scope, xóa `relativeLinkResolution`, `providedIn: NgModule/'any'` deprecated, `RouterLink` gộp `RouterLinkWithHref`
3. **Yêu cầu platform đã bump** – Xem mục Yêu cầu bên dưới

### Lời khuyên:

- Chuyển sang functional router guards cho các project mới (trả về `UrlTree` thay vì `navigate()` + `return false`)
- Sử dụng NgOptimizedImage cho tất cả images (`ngSrc` + `width/height`, `priority` cho LCP, `ngSrcset` thay vì `srcset` thủ công)
- Bắt đầu migrate sang standalone components (`ng g component --standalone`)
- Nếu dùng Material: test kỹ migration MDC (DOM/CSS đổi)

## Các feature lớn của v15 bị thiếu trong bộ demo (bổ sung để đủ scope official)

> Nguồn: https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8 , https://github.com/angular/angular/releases/tag/15.0.0 , https://github.com/angular/components/releases/tag/15.0.0

1. **MDC-based Material stable (breaking)** – ~20 components viết lại (`mat-button`, `mat-card`, `mat-dialog`, `mat-menu`, `mat-table`...), DOM/CSS đổi, bản cũ thành `legacy-*`.
2. **CDK Listbox (`@angular/cdk/listbox`)** – Headless listbox primitive mới.
3. **Router: auto-unwrap default exports khi lazy-load** (`loadComponent: () => import('./x').then(m => m.default)`), hỗ trợ `title` trong route (kết hợp `TitleStrategy`), `RouterLink` gộp `RouterLinkWithHref` (deprecated bản cũ), `NgFor` alias cho `NgForOf`.
4. **`provideHttpClient` + functional interceptors** – `provideHttpClient(withInterceptors([...]), withInterceptorsFromDi())`, `provideHttpClientTesting()`. Lưu ý: `withFetch()/withXhr()` KHÔNG có trong v15 (có từ bản sau, default `fetch` từ ~v18).
5. **CLI tinh gọn** – `ng g component --standalone`, `ng new` bỏ `test.ts`, `polyfills.ts`, `environments/`, `karma.conf.js`, `.browserslistrc`; polyfills qua `angular.json`, target `es2022`.
6. **Nhỏ nhưng official** – `DATE_PIPE_DEFAULT_OPTIONS`, forms utils `isFormControl/isFormGroup/...`, class/`InjectionToken` guards deprecated (xem bài functional guards).

## Yêu cầu

- Angular 15+
- Node.js `14.20.x | 16.13.x | 18.10.x` (drop `14.[15-19].x`, `16.[10-12].x`), TypeScript `>=4.8.2`
- Nguồn: https://github.com/angular/angular/releases/tag/15.0.0

## Chạy thử

```bash
cd 1_standalone-stable  # Hoặc project khác
npm install
ng serve