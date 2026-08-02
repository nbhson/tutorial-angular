# Tạo Service: `inject` và `injectAsync`

## Tổng quan
Angular 22 giới thiệu `inject()` và `injectAsync()` cấp cao nhất (top-level) cho services — không cần constructor. Điều này giúp services gọn nhẹ hơn và dễ tree-shaking hơn.

## Tính năng chính

- **Không cần constructor**: Dùng `inject()` ở cấp độ class
- **Thân thiện với tree-shaking**: Không có constructor đồng nghĩa với loại bỏ dead code tốt hơn
- **Type-safe**: Hỗ trợ TypeScript đầy đủ
- **Hoạt động với signals**: Tích hợp với signal graph

## Ví dụ Code

### Constructor Injection Truyền Thống

```typescript
// Cách cũ - bắt buộc constructor
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

### `inject()` Cấp Cao Nhất (Angular 22)

```typescript
// Cách mới - không cần constructor
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

### `injectAsync()` cho Dependencies Lazy

```typescript
import { Injectable, injectAsync } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  // Khởi tạo lazily khi được truy cập lần đầu
  private tracker = injectAsync(() => import('./analytics-tracker').then(m => m.Tracker));
  
  trackEvent(event: string) {
    this.tracker.then(t => t.track(event));
  }
}
```

### Service với Nhiều Dependencies

```typescript
import { Injectable, inject, injectAsync } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  
  // Dependency nặng, lazy-loaded
  private chartEngine = injectAsync(() => 
    import('./chart-engine').then(m => m.ChartEngine)
  );

  async getDashboardData(): Promise<DashboardData> {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      throw new Error('Chưa được xác thực');
    }
    
    return this.http.get<DashboardData>('/api/dashboard').toPromise();
  }

  async renderChart(data: DataPoint[]) {
    const engine = await this.chartEngine;
    return engine.render(data);
  }
}
```

### So Sánh: Trước vs Sau

```typescript
// Angular 21 và trước đó
@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private router: Router
  ) {}
  
  log(message: string) {
    this.http.post('/api/logs', { message, level: 'info' }).subscribe();
  }
}

// Angular 22 - gọn gàng hơn, hành vi tương tự
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private http = inject(HttpClient);
  private config = inject(AppConfig);
  private router = inject(Router);
  
  log(message: string) {
    this.http.post('/api/logs', { message, level: 'info' }).subscribe();
  }
}
```

## Lợi Ích

| Khía cạnh | Constructor | `inject()` |
|--------|------------|-----------|
| **Boilerplate** | Dài dòng hơn | Ít code hơn |
| **Tree-shaking** | Khó tối ưu hơn | Tối ưu tốt hơn |
| **Khả năng đọc** | Constructor trộn deps với logic | Dependencies ở đầu |
| **Type safety** | Hỗ trợ đầy đủ | Hỗ trợ đầy đủ |
| **Lazy loading** | Thủ công | `injectAsync()` tích hợp sẵn |

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
