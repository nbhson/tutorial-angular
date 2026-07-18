# IV. API Stability Changes (Angular 20)

Tổng hợp các API đã chuyển từ **Developer Preview** sang **Stable** trong Angular 20, cùng với các API mới được giới thiệu.

## Danh sách Features

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Signal Inputs Stable](1_signal-inputs-stable/README.md) | `input()` signals API chính thức stable |
| 2 | [Model Inputs Stable](2_model-inputs-stable/README.md) | `model()` two-way binding stable |
| 3 | [Linked Signals Stable](3_linked-signals-stable/README.md) | `linkedSignal()` chính thức stable |
| 4 | [Resource API](4_resource-api/README.md) | `resource()` async data loading mới |
| 5 | [HttpResource](5_http-resource/README.md) | `httpResource()` tích hợp HTTP client |
| 6 | [Content Projection với ng-slot](6_content-projection-ng-slot/README.md) | `ng-slot` thay thế `ng-content` |
| 7 | [CSS Native Encapsulation](7_css-native-encapsulation/README.md) | `encapsulation: 'none'` dùng native CSS |

## Tổng quan

### Signal APIs — Stable

Các Signal APIs đã chính thức stable:

| API | Trước (Preview) | Sau (Stable) |
|---|---|---|
| `input()` | Experimental | ✅ Stable |
| `model()` | Experimental | ✅ Stable |
| `linkedSignal()` | Experimental | ✅ Stable |

### New APIs

| API | Mô tả |
|---|---|
| `resource()` | Async data loading với signal-based API |
| `httpResource()` | HTTP client tích hợp với signals |

### Template Changes

| API | Mô tả |
|---|---|
| `ng-slot` | Content projection mới thay thế `ng-content` |
| `encapsulation: 'none'` | Native CSS encapsulation |

## Mục đích

Việc chuyển từ **Developer Preview** sang **Stable** có nghĩa là:
- **Không có breaking changes** trong tương lai gần
- **Safe to use** trong production
- **Được guarantee** bởi Angular team
- **Full documentation** và support

## Yêu cầu

- Angular 20+
- Node.js 18+

## Chạy thử

```bash
cd 1_signal-inputs-stable  # Hoặc project khác
npm install
ng serve