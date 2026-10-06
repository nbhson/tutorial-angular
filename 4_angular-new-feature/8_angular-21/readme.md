# Angular 21 New Features

Tổng hợp các feature mới trong Angular 21. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### I. Forms & Reactivity

Angular 21 cải thiện lớn cho forms system và reactive programming:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Signal Forms](1_signal-forms/) | Forms API mới — developer có thể implement validation logic cho form controls |
| 2 | [SimpleChanges là Generic Type](4_simple-changes-generic/) | `SimpleChanges` có generic type — type-safe cho `@Input()` properties |

### II. Performance & Default Configurations

Cải thiện performance và thay đổi defaults để phù hợp hơn với hiện tại:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless là Default](2_zoneless-default/) | Zoneless change detection trở thành default cho ứng dụng mới |
| 2 | [HttpClient Provided by Default](5_httpclient-default/) | Không cần gọi `provideHttpClient()` trong appConfig nữa |
| 3 | [Vitest là Default Test Framework](10_vitest-default/) | Vitest thay thế Jasmine/Karma — blazing fast test execution |

### III. Angular Aria & Accessibility

Focus mạnh vào accessibility:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Angular Aria](3_angular-aria/) | UI library mới tập trung vào accessibility — developer preview |

### IV. Migration Schematics

Tự động migrate từ deprecated patterns sang modern ones:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [NgClass to Class Binding](6_ngclass-to-class/) | Migration schematic: `[ngClass]` → `[class]` |
| 2 | [NgStyle to Style Binding](7_ngstyle-to-style/) | Migration schematic: `[ngStyle]` → `[style]` |

### V. API Improvements

Cải thiện nhỏ nhưng ý nghĩa cho daily coding:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [KeyValue Pipe — Optional Keys](8_keyvalue-optional-keys/) | `KeyValuePipe` cải thiện typing cho object có optional keys (`Partial<T>`) |
| 2 | [HTTP Response Type Safety](9_http-response-type/) | `HttpResponse`/`HttpErrorResponse` thêm `responseType` (`basic`/`cors`/`opaque`...) để debug CORS |

### VI. Bổ Sung Đáng Chú Ý (v21)

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | MCP Server stable | Angular MCP Server lên stable — AI agent tra cứu API, docs, best practices trực tiếp từ IDE |
| 2 | `FetchBackend` (chưa default) | `withFetch()` cho HttpClient đã có, nhưng **chưa phải default** — sang v22 mới thành default (xem `9_angular-22`) |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Signal Forms chính thức có mặt** – Sau nhiều version chờ đợi, forms API mới đã có thể dùng được
2. **Zoneless là default** – Angular tiếp tục push signal-based architecture, zone.js ngày càng mờ nhạt
3. **Vitest blazing fast** – Test execution nhanh hơn đáng kể so với Jasmine/Karma
4. **Migration schematics mạnh mẽ** – Tự động migrate deprecated patterns, giảm manual work
5. **Accessibility focus** – Angular Aria cho thấy Angular team nghiêm túc về a11y

### Điểm cần lưu ý:

1. **Angular Aria chưa stable** – Đang ở developer preview, có thể thay đổi API
2. **Migration từ Jasmine/Karma** – Project lớn cần plan kỹ khi migrate test framework
3. **Signal Forms vẫn đang phát triển** – Có thể có breaking changes trong tương lai gần
4. **Zoneless mặc định** – Project hiện có cần check compatibility khi upgrade

### Lời khuyên:

- Upgrade sớm để tận dụng Vitest và zoneless defaults
- Chạy migration schematics (`ngclass-to-class`, `ngstyle-to-style`, `vitest`) trên project hiện có
- Thử Signal Forms cho forms mới — nhưng giữ complex forms với Reactive Forms approach hiện tại
- Đợi Angular Aria stable trước khi dùng trong production
- Kiểm tra compatibility nếu dùng custom providers hoặc interceptors (vì HttpClient giờ provide mặc định)

## Yêu cầu

- Angular 21+
- Node.js 20+

## Chạy thử

```bash
cd 1_signal-forms  # Hoặc project khác
npm install
ng serve