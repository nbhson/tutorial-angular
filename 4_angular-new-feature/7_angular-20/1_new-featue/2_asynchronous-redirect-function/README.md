# 2. Asynchronous Redirect Function (mới v20 — #60863)

> Đính chính: `redirectTo` dạng **sync function đã có từ trước**.
> Mới trong v20 chỉ là **async** (`Promise<UrlTree|string>` | `Observable<UrlTree|string>`) — #60863.
> `inject()` chỉ dùng được **bên trong injection context** của redirect function.
> Nguồn: https://github.com/angular/angular/releases/tag/20.0.0

## Tổng quan

Angular 20 cho phép `redirectTo`/`RedirectFn` trả về **async** (`Promise`|`Observable`), giúp xử lý **dynamic redirects** dựa trên runtime conditions (auth state, feature flags, user roles...) mà không cần_guard hay extra component.

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

```typescript
// v20: sync (đã có từ trước) + async (mới #60863)
type RedirectFn = () =>
  | string | UrlTree
  | Promise<string | UrlTree>       // ← mới v20
  | Observable<string | UrlTree>;   // ← mới v20
```

> Caveat: `inject(Router)` / `inject(Service)` chỉ hợp lệ vì redirect function
> được gọi trong injection context của Router. Không gọi `inject()` ngoài function
> hoặc sau `await` tách context.

**Thay đổi so với trước:**

| Trước (đã có sync fn) | Mới v20 (#60863) |
|---|---|
| `redirectTo: 'login'` (string) + sync `() => string \| UrlTree` | `redirectTo: () => Promise \| Observable<string \| UrlTree>` |

## Tại sao cần feature này?

Trước v20, `redirectTo` đã nhận **string cố định + sync function**. Nếu bạn muốn redirect động dựa trên auth state hoặc API response, bạn phải:

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

### Trước v20: chỉ redirect cứng + sync fn

```typescript
// routes.ts - redirect cứng / sync fn (đã có từ trước)
{
  path: 'dashboard',
  redirectTo: 'login',
  pathMatch: 'full'
}

// Hoặc phải tạo guard riêng
{
  path: 'dashboard',
  component: DashboardRedirectComponent,  // Component trung gian
}
```

### Mới v20 (#60863): async redirect + Promise ví dụ

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
- ✅ `inject()` được (trong injection context — không gọi sau `await` tách context)
- ✅ Hỗ trợ `Promise` và `Observable` (mới v20 #60863)
- ✅ Code gọn hơn, dễ maintain

### Ví dụ Promise (mới v20)

```typescript
{
  path: 'dashboard',
  redirectTo: async () => {
    const router = inject(Router); // OK: sync đầu function
    const allowed = await isAllowed(); // Promise
    return allowed ? router.createUrlTree(['/user']) : router.createUrlTree(['/login']);
  },
}
```

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