# HttpClient: FetchBackend Thành Default (v22)

## Tổng quan
v22 đổi default `HttpBackend` từ `HttpXhrBackend` sang `FetchBackend`. `withFetch()` nay deprecated (xóa an toàn).

## Điểm chính
- Mặc định mới: `provideHttpClient()` đã dùng Fetch, không cần `withFetch()`.
- Fetch **không hỗ trợ upload progress** → muốn giữ thì dùng `provideHttpClient(withXhr())`.
- `reportProgress` deprecated, tách thành `reportUploadProgress` / `reportDownloadProgress`.

## Ví dụ Code
```typescript
// v22: Fetch đã là default
provideHttpClient();

// Giữ hành vi cũ (cần upload progress):
import { provideHttpClient, withXhr } from '@angular/common/http';
provideHttpClient(withXhr());
```

```typescript
// Mới: tách progress
this.http.post('/upload', fd, { reportUploadProgress: true });
this.http.get('/file', { reportDownloadProgress: true });
```

## Tham khảo
- [Angular v22 changelog](https://github.com/angular/angular/releases/tag/v22.0.0)
