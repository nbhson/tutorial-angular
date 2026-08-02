# Angular 22

## Ngày phát hành
Tháng 6/2025 (RC), ~Tháng 8/2025 (Stable)

## Tổng quan

Angular 22 chuyển một số tính năng thử nghiệm (experimental) từ v21 sang trạng thái ổn định (stable) và siết chặt framework xoay quanh signals, zoneless change detection và các form type-safe. Bản phát hành này ít API hoàn toàn mới, tập trung thay vào việc nâng cấp những gì developers đã áp dụng phía sau các cờ `provideExperimental*`.

## Tính năng chính

### 1. OnPush Là Mặc Định Mới
Các component mới mặc định dùng `ChangeDetectionStrategy.OnPush`. Angular giới thiệu `ChangeDetectionStrategy.Eager` cho hành vi "check always" cũ. Một bộ migration tự động đánh dấu các component hiện có cần chú ý.

📄 [Chi tiết →](1_onpush-default/README.md)

### 2. Signal Forms Trở Nên Stable
Signal Forms phát hành dạng experimental ở v21 và nay trở thành stable. `form()`, `FormField` và các validator có sẵn không còn yêu cầu experimental providers. Lỗi validation có kiểu (typed validation errors), các validator `date`/`limit` công khai và hiệu năng cải thiện hoàn thiện tính năng này.

📄 [Chi tiết →](2_signal-forms-stable/README.md)

### 3. resource() và httpResource() Trở Nên Stable
Cả `resource()` và `httpResource()` chuyển sang stable. Lỗi rò rỉ subscription (subscription leak) của `rxResource` đã được sửa, và việc sanitize URL resource trở nên không phân biệt hoa thường (case-insensitive). Những primitive này giữ dữ liệu bất đồng bộ bên trong signal graph.

📄 [Chi tiết →](3_resource-httpresource-stable/README.md)

### 4. WebMCP — MCP Chạy Trong Trình Duyệt
Angular 22 cung cấp client WebMCP. Bạn có thể expose signals, models hoặc actions cho AI agent trực tiếp trong trình duyệt mà không cần glue phía server.

📄 [Chi tiết →](4_webmcp/README.md)

### 5. Tạo Service: `inject` và `injectAsync`
`inject()` và `injectAsync()` cấp cao nhất (top-level) đơn giản hóa việc tạo service mà không cần constructor, giúp services gọn nhẹ hơn và dễ tree-shaking hơn.

📄 [Chi tiết →](5_service-injectAsync/README.md)

### 6. Router: Kế Thừa Params Theo Mặc Định
Các child routes tự động kế thừa params của parent route mà không cần cấu hình thêm. Không còn cần `paramsInheritanceStrategy: 'always'`.

📄 [Chi tiết →](6_router-params-inheritance/README.md)

### 7. linkedSignal Có Phương Thức `.set()` Trực Tiếp
`linkedSignal` có thêm phương thức `.set()` và `.update()` trực tiếp — không còn cách làm vòng vo qua `.asReadonly()`.

📄 [Chi tiết →](7_linkedsignal-set/README.md)

### 8. Comment Trong Template
Angular 22 hỗ trợ comment theo kiểu HTML (`<!-- -->`) trong templates, hoạt động với tất cả control flow blocks.

📄 [Chi tiết →](8_template-comments/README.md)

### 9. Siết Chặt Bảo Mật (Security Hardening)
Sanitization mặc định chặt chẽ hơn. Dùng `DomSanitizer.bypassSecurityTrust*` giờ kích hoạt cảnh báo dev và xử lý chặt chẽ hơn ở production.

📄 [Chi tiết →](9_security-hardening/README.md)

### 10. Cải Thiện Compiler và Type-Safety
Type checking chặt chẽ hơn, suy luận kiểu (type inference) cho signals tốt hơn, diagnostics template nâng cao và tích hợp TypeScript được cải thiện.

📄 [Chi tiết →](10_compiler-typesafety/README.md)

### 11. Language Service và DevTools
Gỡ lỗi (debugging) nâng cao với trực quan hóa signal graph, profiling hiệu năng, autocomplete tốt hơn, diagnostics và hỗ trợ refactoring.

📄 [Chi tiết →](11_language-service-devtools/README.md)

## Bảng Tổng Kết

| Tính năng | Trạng thái | Thay đổi chính |
|---------|--------|------------|
| OnPush Mặc định | ✅ Stable | Mặc định mới cho component |
| Signal Forms | ✅ Stable | Không còn experimental |
| resource/httpResource | ✅ Stable | Đã sửa rò rỉ subscription |
| WebMCP | ✅ Mới | MCP client chạy trong trình duyệt |
| inject/injectAsync | ✅ Mới | Service không cần constructor |
| Params Inheritance | ✅ Mặc định | Tự động trong router |
| linkedSignal .set() | ✅ Mới | Hỗ trợ ghi trực tiếp |
| Template Comments | ✅ Mới | Hỗ trợ `<!-- -->` |
| Security Hardening | ✅ Chặt hơn | Cảnh báo dev khi bypass |
| Type Safety | ✅ Cải thiện | Mặc định chặt chẽ hơn |
| Language Service | ✅ Cải thiện | Trực quan hóa signal |

## Bài Học Chính

1. **Ổn định hơn là mới lạ** — Angular 22 nâng cấp các tính năng experimental lên stable
2. **Kiến trúc signal-first** — Mọi API mới đều dựa trên signals
3. **Type safety ở khắp nơi** — Mặc định chặt chẽ hơn giúp phát hiện lỗi lúc compile
4. **Trải nghiệm developer** — Template comments, DevTools tốt hơn, mẫu service đơn giản hơn
5. **Bảo mật theo mặc định** — Sanitization chặt chẽ hơn khuyến khích code an toàn

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
