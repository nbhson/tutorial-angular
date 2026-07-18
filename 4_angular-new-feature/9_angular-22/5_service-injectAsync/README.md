# Service Creation: `inject` and `injectAsync`

## Overview
Angular 22 introduces top-level `inject()` and `injectAsync()` for services — no constructors required. This makes services leaner and tree-shaking easier.

## Key Features

- **No constructor needed**: Use `inject()` at the class level
- **Tree-shaking friendly**: No constructor means better dead code elimination
- **Type-safe**: Full TypeScript support
- **Works with signals**: Integrates with the signal graph

## Code Examples

### Traditional Constructor Injection

```typescript
// Old way - constructor required
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

### Top-level `inject()` (Angular 22)

```typescript
// New way - no constructor needed
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

### `injectAsync()` for Lazy Dependencies

```typescript
import { Injectable, injectAsync } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  // Lazily initializes when first accessed
  private tracker = injectAsync(() => import('./analytics-tracker').then(m => m.Tracker));
  
  trackEvent(event: string) {
    this.tracker.then(t => t.track(event));
  }
}
```

### Service with Multiple Dependencies

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
  
  // Lazy-loaded heavy dependency
  private chartEngine = injectAsync(() => 
    import('./chart-engine').then(m => m.ChartEngine)
  );

  async getDashboardData(): Promise<DashboardData> {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      throw new Error('Not authenticated');
    }
    
    return this.http.get<DashboardData>('/api/dashboard').toPromise();
  }

  async renderChart(data: DataPoint[]) {
    const engine = await this.chartEngine;
    return engine.render(data);
  }
}
```

### Comparison: Before vs After

```typescript
// Angular 21 and earlier
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

// Angular 22 - cleaner, same behavior
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

## Benefits

| Aspect | Constructor | `inject()` |
|--------|------------|-----------|
| **Boilerplate** | More verbose | Less code |
| **Tree-shaking** | Harder to optimize | Better optimization |
| **Readability** | Constructor mixes deps with logic | Dependencies at top |
| **Type safety** | Full support | Full support |
| **Lazy loading** | Manual | `injectAsync()` built-in |

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)