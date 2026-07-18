# 2. Asynchronous Redirect Function (Angular 20)

## Tổng quan

Angular 20 giới thiệu **Asynchronous Redirect Function** — cho phép `redirectTo` trong route config chấp nhận một **hàm asynchronous** (trả về Observable), thay vì chỉ một string cố định. Đây là một upgrade lớn cho routing system, giúp xử lý **dynamic redirects** dựa trên runtime conditions (auth state, feature flags, user roles...) mà không cần_guard hay extra component.

## API mới

```typescript
{
  path: 'some-path',
  redirectTo: () => {
    const router = inject(Router);
    const someService = inject(SomeService);

    return someService.getData().pipe(
      map(data => router.createUrlTree([`/${data.targetRoute}`]))
    );
  },
}
```

**Thay đổi so với trước:**

| Trước (Angular < 20) | Sau (Angular 20) |
|---|---|
| `redirectTo: 'login'` (string) | `redirectTo: () => Observable<UrlTree>` (function) |

## Tại sao cần feature này?

Trước Angular 20, `redirectTo` chỉ nhận một **string cố định**. Nếu bạn muốn redirect động dựa trên auth state hoặc API response, bạn phải:

1. Tạo **Guard** với `canActivate` → phức tạp, nhiều boilerplate
2. Tạo **Component trung gian** chỉ để redirect → waste

Angular 20 giải quyết vấn đề này bằng cách cho phép `redirectTo` là một **async function** inject dependencies và trả về Observable.

## Ví dụ thực tế

### 1. Route Config (`app.routes.ts`)

```typescript
import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    redirectTo: () => {
      const router = inject(Router);
      const authService = inject(AuthService);

      return authService.isAuthenticated$.pipe(
        map((isAuthorized: boolean) => {
          return router.createUrlTree([`/${isAuthorized ? 'user' : 'login'}`])
        }),
      );
    },
  },
  {
    path: 'user',
    loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

### 2. AuthService (`services/auth.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    this.isAuthenticatedSubject.next(isAuth);
  }

  login(username: string, password: string): Observable<boolean> {
    return of(true).pipe(
      delay(1500),
      tap(() => {
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('isAuthenticated', 'true');
      })
    );
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('isAuthenticated');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
```

### 3. Auth Guard (`guards/auth.guard.ts`)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

## Flow chi tiết

```
User truy cập /dashboard
        │
        ▼
redirectTo function được gọi
        │
        ▼
inject(Router) + inject(AuthService)
        │
        ▼
authService.isAuthenticated$ Observable
        │
        ├── true  → router.createUrlTree(['/user'])
        │
        └── false → router.createUrlTree(['/login'])
        │
        ▼
Router navigate theo UrlTree
```

## So sánh trước và sau Angular 20

### Trước Angular 20: Phải dùng Guard

```typescript
// routes.ts - chỉ redirect cứng
{
  path: 'dashboard',
  redirectTo: 'login',  // Luôn redirect到 login
  pathMatch: 'full'
}

// Hoặc phải tạo guard riêng
{
  path: 'dashboard',
  component: DashboardRedirectComponent,  // Component trung gian
}
```

### Sau Angular 20: Redirect function

```typescript
{
  path: 'dashboard',
  redirectTo: () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    return authService.isAuthenticated$.pipe(
      map(isAuth => router.createUrlTree([isAuth ? '/user' : '/login']))
    );
  },
}
```

**Lợi ích:**
- ✅ Không cần Guard cho simple redirects
- ✅ Không cần Component trung gian
- ✅ Inject được dependencies qua `inject()`
- ✅ Hỗ trợ Observable (reactive)
- ✅ Code gọn hơn, dễ maintain

## Các use case phổ biến

### 1. Auth-based redirect

```typescript
redirectTo: () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.currentUser$.pipe(
    map(user => router.createUrlTree(
      user ? ['/dashboard'] : ['/login']
    ))
  );
}
```

### 2. Feature flag redirect

```typescript
redirectTo: () => {
  const featureService = inject(FeatureService);
  const router = inject(Router);
  return featureService.isEnabled('new-ui').pipe(
    map(enabled => router.createUrlTree(
      enabled ? ['/new-dashboard'] : ['/old-dashboard']
    ))
  );
}
```

### 3. Role-based redirect

```typescript
redirectTo: () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.userRole$.pipe(
    map(role => {
      const routeMap = {
        'admin': '/admin',
        'user': '/user',
        'guest': '/login'
      };
      return router.createUrlTree([routeMap[role] || '/login']);
    })
  );
}
```

### 4. A/B Testing redirect

```typescript
redirectTo: () => {
  const abTestService = inject(ABTestService);
  const router = inject(Router);
  return abTestService.getVariant('homepage').pipe(
    map(variant => router.createUrlTree([`/${variant}`]))
  );
}
```

## So sánh với Guard approach

| Aspect | Guard (trước) | Redirect Function (sau) |
|---|---|---|
| Boilerplate | Nhiều (guard file + config) | Ít (inline function) |
| Maintainability | Phân tán | Tập trung ở routes |
| Reusability | Cao (guard tái sử dụng) | Thấp (inline) |
| Complexity | Phù hợp logic phức tạp | Phù hợp simple redirect |
| Test | Dễ test独立 | Test qua integration |

## Best practices

1. **Dùng redirect function** cho simple redirects (auth, role-based)
2. **Dùng Guard** cho logic phức tạp (validate permissions, audit logging)
3. **Kết hợp cả hai** khi cần: redirect function cho routing decision + guard cho protection

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/2_asynchronous-redirect-function
npm install
ng serve
```

Mở `http://localhost:4200/dashboard` để xem redirect logic hoạt động.