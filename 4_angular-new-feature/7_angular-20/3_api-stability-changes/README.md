# IV. API Stability Changes (Angular 20 — đã hiệu chỉnh)

Tổng hợp trạng thái API **đúng với release v20**: batch stable trong v20 là
`effect`, `linkedSignal` (#60741/#60865), `toSignal` (#60442), `toObservable` (#60449).
`input()` / `signal()` / `computed()` / `model()` đã stable **trước v20**.

## Danh sách Features

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Signal Inputs Stable](1_signal-inputs-stable/README.md) | `input()` đã stable **trước v20** — nhắc lại |
| 2 | [Model Inputs Stable](2_model-inputs-stable/README.md) | `model()` đã stable **trước v20** — nhắc lại |
| 3 | [Linked Signals Stable](3_linked-signals-stable/README.md) | `linkedSignal()` stable **trong v20** |
| 4 | [Resource API](4_resource-api/README.md) | `resource()` **experimental trong v20** (stable v22) |
| 5 | [HttpResource](5_http-resource/README.md) | `httpResource()` **experimental trong v20** (stable v22) |
| 6 | [Content Projection với ng-slot](6_content-projection-ng-slot/README.md) | ⚠️ **INVENTED**: không có `ng-slot`, docs vẫn `ng-content` + fallback |
| 7 | [CSS Native Encapsulation](7_css-native-encapsulation/README.md) | Mới quanh v20 là `IsolatedShadowDom` (experimental), không phải `encapsulation: 'none'` |

## Tổng quan

### Signal APIs — trạng thái đúng

| API | Trạng thái trong v20 |
|---|---|
| `input()` / `signal()` / `computed()` / `model()` | Đã stable **trước v20** (v17–v19) |
| `effect` / `linkedSignal` / `toSignal` / `toObservable` | ✅ Stable **trong v20** |

### Experimental trong v20 (stable v22)

| API | Mô tả |
|---|---|
| `resource()` | Async data loading — `params` + `loader` (không phải `request`/`query`) |
| `httpResource()` | `request` bắt buộc là reactive function, `parse` (không phải `map`) |

### Template Changes — đính chính

| API | Trạng thái thật |
|---|---|
| `ng-slot` | ⚠️ KHÔNG tồn tại — vẫn dùng `ng-content` + fallback |
| `encapsulation: 'none'` | Có từ lâu — mới quanh v20 là `IsolatedShadowDom` (experimental) |

## Mục đích

Việc chuyển từ **Developer Preview** sang **Stable** có nghĩa là:
- **Không có breaking changes** trong tương lai gần
- **Safe to use** trong production
- **Được guarantee** bởi Angular team
- **Full documentation** và support

## Yêu cầu

- Angular 20+
- Node.js >=20.11.1 (drop Node 18)

## Chạy thử

```bash
cd 1_signal-inputs-stable  # Hoặc project khác
npm install
ng serve