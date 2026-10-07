# Angular 22

## Ngày phát hành
v21: 19/11/2025 (Stable) · v22: 03/06/2026 (Stable)

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

### 4. WebMCP — MCP Chạy Trong Trình Duyệt (Experimental)
Angular 22 cung cấp client WebMCP dạng **experimental** (không phải stable). Bạn có thể expose signals, models hoặc actions cho AI agent trực tiếp trong trình duyệt mà không cần glue phía server.

📄 [Chi tiết →](4_webmcp/README.md)

### 5. Tạo Service: `@Service` và `injectAsync`
Mới trong v22 là decorator `@Service` (gọn hơn `@Injectable`) và helper `injectAsync()` (trả về `() => Promise<T>`, gọi `await this.exporter()`). `inject()` có từ v14, không phải mới.

📄 [Chi tiết →](5_service-injectAsync/README.md)

### 6. Router: Kế Thừa Params Theo Mặc Định
Các child routes tự động kế thừa params của parent route mà không cần cấu hình thêm. Không còn cần `paramsInheritanceStrategy: 'always'`.

📄 [Chi tiết →](6_router-params-inheritance/README.md)

### 7. linkedSignal: Option `set` Tùy Biến
`linkedSignal` đã writable (`.set()`/`.update()`) từ trước. Mới trong v22 là option `set(value, rawSet)` để viết ngược về source of truth.

📄 [Chi tiết →](7_linkedsignal-set/README.md)

### 8. Comment Trong HTML Element
`<!-- -->` luôn hợp lệ từ trước. Mới trong v22 là comment `//` và `/* */` ngay trong thẻ mở của element để document properties/bindings.

📄 [Chi tiết →](8_template-comments/README.md)

### 9. Siết Chặt Bảo Mật (Security Hardening)
Theo changelog thật: sanitize `href` động trên SVG `<a>`, đồng bộ sanitization schema, chặn SSRF backslash URL, sửa rò credentials qua lệch URL resolution và sửa transfer-cache cache-key ambiguity.

📄 [Chi tiết →](9_security-hardening/README.md)

### 10. Cải Thiện Compiler và Type-Safety
Nổi bật: safe-navigation narrowing nullables và optional-chaining trả `undefined`, kèm diagnostics `nullishCoalescingNotNullable`/`optionalChainNotNullable` và NG8023.

📄 [Chi tiết →](10_compiler-typesafety/README.md)

### 11. Language Service và DevTools
Theo changelog thật: inlay hints trong template, Document Symbols cho templates và idle timeout cho `@defer` blocks.

📄 [Chi tiết →](11_language-service-devtools/README.md)

### 12. HttpClient: `FetchBackend` Thành Default
`FetchBackend` thay `HttpXhrBackend` làm default `HttpBackend`. `withFetch()` nay deprecated (xóa an toàn). Muốn giữ upload progress thì dùng `provideHttpClient(withXhr())` vì Fetch không hỗ trợ upload progress. Option `reportProgress` deprecated, tách thành `reportUploadProgress` / `reportDownloadProgress`.

```typescript
// v22: không cần withFetch() nữa — Fetch đã là default
provideHttpClient();

// Muốn giữ hành vi cũ (upload progress):
provideHttpClient(withXhr());
```

📄 [Chi tiết →](12_fetch-backend-default/README.md)

### 13. Router: Navigation API + `withComponentInputBinding` Options
`withComponentInputBinding()` nhận thêm param `options`: `{ queryParams, unmatchedInputBehavior }`. Tắt bind queryParams khi tự quản lý query riêng; `unmatchedInputBehavior: 'undefinedIfStale'` tránh set `undefined` cho inputs chưa từng có trong router data.

```typescript
provideRouter(routes,
  withComponentInputBinding({ queryParams: false }),
);
provideRouter(routes,
  withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
);
```

📄 [Chi tiết →](13_router-input-binding-options/README.md) · [Params inheritance →](6_router-params-inheritance/README.md)

## Bảng Tổng Kết

| Tính năng | Trạng thái | Thay đổi chính |
|---------|--------|------------|
| OnPush Mặc định | ✅ Stable | Mặc định mới cho component |
| Signal Forms | ✅ Stable | Không còn experimental |
| resource/httpResource | ✅ Stable | `params` (đổi từ `request`), đã sửa rò rỉ subscription |
| WebMCP | ⚠️ Experimental | MCP client chạy trong trình duyệt |
| @Service/injectAsync | ✅ Mới (v22) | `@Service` + `injectAsync() => Promise`; `inject()` có từ v14 |
| Params Inheritance | ✅ Mặc định | Tự động trong router (`emptyOnly` → `always`) |
| linkedSignal `set` option | ✅ Mới (v22) | Custom `set(value, rawSet)`; `.set()` có từ trước |
| Template Comments | ✅ Mới (v22) | `//` và `/* */` trong thẻ mở (`<!-- -->` có từ trước) |
| Security Hardening | ✅ Chặt hơn | SVG href, SSRF backslash, transfer-cache, host bindings |
| Type Safety | ✅ Cải thiện | Safe-navigation narrowing, optional-chaining `undefined` |
| Language Service | ✅ Cải thiện | Inlay hints, Document Symbols, idle timeout defer |
| FetchBackend | ✅ Default (v22) | `withFetch` deprecated; `reportUpload/DownloadProgress` |
| Router input binding | ✅ Mới options | `queryParams`, `unmatchedInputBehavior` |

## Bài Học Chính

1. **Ổn định hơn là mới lạ** — Angular 22 nâng cấp các tính năng experimental lên stable
2. **Kiến trúc signal-first** — Mọi API mới đều dựa trên signals
3. **Type safety ở khắp nơi** — Mặc định chặt chẽ hơn giúp phát hiện lỗi lúc compile
4. **Trải nghiệm developer** — Template comments, DevTools tốt hơn, mẫu service đơn giản hơn
5. **Bảo mật theo mặc định** — Sanitization chặt chẽ hơn khuyến khích code an toàn

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
