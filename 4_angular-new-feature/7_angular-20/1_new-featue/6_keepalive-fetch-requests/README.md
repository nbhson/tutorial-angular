# 6. Keepalive cho Fetch Requests (Angular 20)

## Tổng quan

Angular 20 giới thiệu **Keepalive cho Fetch Requests** — cho phép `fetch` requests tồn tại qua các navigation, thay vì bị cancel khi user navigate sang trang khác. Đây là feature thuộc `withFetch` API, giải quyết vấn đề "request cancellation" phổ biến trong SPA.

## API mới

```typescript
// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withKeepalive()  // ← API mới
    )
  ]
};
```

**Thay đổi so với trước:**

| Trước (Angular < 20) | Sau (Angular 20) |
|---|---|
| `withFetch()` — request bị cancel khi navigate | `withFetch()` + `withKeepalive()` — request tiếp tục |

## Tại sao cần feature này?

Trước Angular 20, khi dùng `withFetch()`, các HTTP requests bị **cancel tự động** khi user navigate sang trang mới. Đây là behavior cố ý để prevent stale data, nhưng gây ra nhiều vấn đề:

| Vấn đề | Giải thích |
|---|---|
| **Upload bị cancel** | User click upload → navigate → upload bị cancel |
| **Long-running request** | User click submit → navigate → request bị abort |
| **Background sync** | Data sync bị interrupt khi navigate |
| **Poor UX** | User thấy lỗi hoặc data không cập nhật |

`withKeepalive()` giải quyết bằng cách giữ requests tồn tại qua navigation.

## Ví dụ thực tế

### 1. Basic Setup (`app.config.ts`)

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withKeepalive } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withKeepalive()  // Giữ fetch requests qua navigation
    )
  ]
};
```

### 2. File Upload

```typescript
@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  uploadFile(file: File): Observable<HttpEvent<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>('/api/upload', formData, {
      reportProgress: true,
      observe: 'events'
    });
    // Request sẽ TIẾP TỤC ngay cả khi user navigate sang trang khác
    // Thanks to withKeepalive()
  }
}

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" (change)="onFileSelected($event)">
    <div *ngIf="uploadProgress">
      Progress: {{ uploadProgress }}%
    </div>
  `
})
export class UploadComponent {
  private uploadService = inject(UploadService);
  uploadProgress = 0;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadService.uploadFile(file).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(
            (event.loaded / (event.total || 1)) * 100
          );
        }
      });
    }
  }
}
```

### 3. Background Data Sync

```typescript
@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);

  syncData(data: any[]): Observable<any> {
    // Long-running sync request
    return this.http.post('/api/sync', { data });
    // Request tiếp tục chạy dù user navigate
  }
}

@Component({
  selector: 'app-data-editor',
  template: `
    <button (click)="saveAndSync()">Save & Sync</button>
    <a routerLink="/other-page">Go to other page</a>
    <!-- User có thể navigate mà sync vẫn tiếp tục -->
  `
})
export class DataEditorComponent {
  private syncService = inject(SyncService);

  saveAndSync() {
    this.syncService.syncData(this.data).subscribe({
      next: () => console.log('Sync completed'),
      error: (err) => console.error('Sync failed:', err)
    });
    // User có thể navigate sang trang khác
    // Sync request vẫn chạy ngầm
  }
}
```

### 4. Long-running API Call

```typescript
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  generateReport(params: ReportParams): Observable<Blob> {
    // Report generation có thể mất vài phút
    return this.http.post('/api/reports/generate', params, {
      responseType: 'blob'
    });
    // Request tiếp tục dù user navigate
  }
}

@Component({
  selector: 'app-report',
  template: `
    <button (click)="generateReport()">Generate Report</button>
    <a routerLink="/dashboard">Go to Dashboard</a>
    <!-- User có thể đi dashboard trong khi report đang generate -->
  `
})
export class ReportComponent {
  private reportService = inject(ReportService);

  generateReport() {
    this.reportService.generateReport(this.params).subscribe(blob => {
      // Download report
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      a.click();
    });
  }
}
```

## Flow chi tiết

### Không có `withKeepalive()`

```
User click Upload
        │
        ▼
POST /api/upload (fetch request)
        │
        ▼
User click Navigate to /other-page
        │
        ▼
❌ Request bị CANCEL
        │
        ▼
Upload thất bại
```

### Với `withKeepalive()`

```
User click Upload
        │
        ▼
POST /api/upload (fetch request)
        │
        ▼
User click Navigate to /other-page
        │
        ▼
✅ Request TIẾP TỤC
        │
        ▼
Upload hoàn thành (ngầm)
        │
        ▼
User thấy notification thành công
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// withFetch() - request bị cancel
provideHttpClient(withFetch());

// User navigate → fetch request bị abort
// Phải dùng XMLHttpRequest hoặc manual approach để giữ request
```

### Sau Angular 20

```typescript
// withFetch() + withKeepalive() - request giữ nguyên
provideHttpClient(withFetch(), withKeepalive());

// User navigate → fetch request tiếp tục chạy
// Không cần workaround phức tạp
```

**Lợi ích:**
- ✅ Upload không bị cancel
- ✅ Long-running requests giữ nguyên
- ✅ Background sync hoạt động
- ✅ Better UX
- ✅ Simple API

## Các use case phổ biến

### 1. File Downloads

```typescript
downloadFile(fileId: string): Observable<Blob> {
  return this.http.get(`/api/files/${fileId}`, {
    responseType: 'blob'
  });
  // Download tiếp tục dù user navigate
}
```

### 2. Form Submissions

```typescript
submitForm(formData: any): Observable<any> {
  return this.http.post('/api/submit', formData);
  // Form data được gửi dù user navigate
}
```

### 3. Real-time Data Sync

```typescript
syncWithServer(): Observable<any> {
  return this.http.post('/api/sync', this.localData);
  // Sync hoàn thành dù user navigate
}
```

### 4. Payment Processing

```typescript
processPayment(paymentData: PaymentData): Observable<PaymentResult> {
  return this.http.post('/api/payments', paymentData);
  // Payment xử lý xong dù user navigate
}
```

## Best practices

1. **Dùng `withKeepalive()`** cho requests quan trọng (upload, payment, sync)
2. **Không dùng** cho trivial requests (analytics, logging)
3. **Show notification** khi request hoàn thành (vì user có thể đang ở trang khác)
4. **Implement error handling** vì user có thể không thấy error ngay
5. **Monitor request status** bằng service hoặc state management

## Khi nào Observable / Fetch Request bị Destroy?

### Phân biệt Observable Subscription và Fetch Request

```
Component A subscribes → http.post('/api/upload', data)
        │
        │  withKeepalive() active
        ▼
Component A navigate away
        │
        ├──→ [Observable Subscription] → CLEANED UP (ngOnDestroy / takeUntilDestroyed) ✅
        │
        └──→ [Fetch Request (HTTP)] → CONTINUES (thanks to keepalive) 🔄
```

`withKeepalive()` **không giữ Observable subscription sống** — nó chỉ giữ cho **fetch request** không bị abort.

### Chi tiết từng layer

#### Layer 1: Observable Subscription (managed by Subscriber)

```typescript
// Component subscribes
this.http.post('/api/upload', data).subscribe(...)
// ↑ Subscription được tạo

// Component navigate → ngOnDestroy
// → takeUntilDestroyed() / manual unsubscribe
// → Subscription CLEANED UP ✅
```

**Luôn cleanup** — giống như bất kỳ Observable nào khác.

#### Layer 2: Fetch Request (managed by Angular HTTP infrastructure)

```typescript
// fetch('/api/upload', ...) chạy ngầm

// Component navigate →
// KHÔNG có keepalive → AbortController.abort() → Request bị cancel ❌
// CÓ keepalive     → Request TIẾP TỤC chạy ✅
```

### Flow timeline

```
Timeline:
─────────────────────────────────────────────

Component A:     |============| onDestroy
Subscription:    |============| CLEANED UP ← subscription kết thúc ở đây
Fetch Request:   |==========================================| Response arrives
                                                  ↑
                                        Server processing completes

                                        Response arrives nhưng
                                        không có subscriber nào
                                        → Result discarded by Angular
```

Fetch request kết thúc khi:
1. **Server response về** → fetch hoàn thành → request destroyed
2. **Network error** → fetch fail → request destroyed
3. **Client disconnect** (đóng tab/browser) → fetch aborted
4. **Timeout** (nếu có cấu hình) → fetch aborted

### Vấn đề thực tế: Ai nhận response?

```typescript
// Component A
saveAndSync() {
  this.syncService.syncData(data).subscribe({
    next: (res) => console.log('Sync done!', res),  // ← callback này SẼ KHÔNG được gọi
    error: (err) => console.error('Failed!')         // ← nếu navigate trước khi response về
  });
  // Navigate away → subscription cleaned up
  // Fetch request tiếp tục chạy (keepalive)
  // Server xử lý xong → response về → KHÔNG AI nhận
}
```

### Giải pháp: Dùng root-level service

```typescript
// ✅ Service providedIn: 'root' → sống suốt app lifetime
@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);

  // Dùng BehaviorSubject để cache result
  private syncResult$ = new BehaviorSubject<SyncResult | null>(null);

  syncData(data: any[]): Observable<any> {
    return this.http.post('/api/sync', { data }).pipe(
      tap(result => this.syncResult$.next(result))  // ← Cache result
    );
  }

  getSyncResult(): Observable<SyncResult | null> {
    return this.syncResult$.asObservable();
  }
}

// Component ở TRANG KHÁC vẫn nhận được result:
@Component({ ... })
export class OtherPageComponent {
  private syncService = inject(SyncService);

  result$ = this.syncService.getSyncResult(); // ← Nhận cached result
}
```

## Tóm tắt

| Concept | Lifecycle | Destroy khi nào? |
|---------|-----------|-------------------|
| **Observable Subscription** | Managed by subscriber | Component destroy / unsubscribe |
| **Fetch Request (with keepalive)** | Managed by Angular HTTP | Response về / error / timeout |
| **Root-level Service** | App lifetime | App close / manual cleanup |
| **Custom Injector** | Manual control | `injector.destroy()` |

**Kết luận:**

- `withKeepalive()` **không giữ Observable sống** — nó chỉ giữ **fetch request** chạy ngầm
- Observable subscription vẫn được cleanup bình thường qua `takeUntilDestroyed()`, `ngOnDestroy()`, hay `unsubscribe()`
- Nếu cần nhận response sau khi navigate, phải dùng **root-level service** hoặc **state management** để cache kết quả

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/6_keepalive-fetch-requests
npm install
ng serve
```

Mở `http://localhost:4200`, upload file và navigate để xem request vẫn tiếp tục.