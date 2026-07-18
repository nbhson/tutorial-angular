# Functional Router Guards (Angular 15)

> Functional router guards giúp giảm boilerplate code, thay thế class-based guards bằng functions đơn giản.

## Trước Angular 15

```ts
// Class-based guard - rất nhiều boilerplate
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

// Route config
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  }
];
```

## Sau Angular 15

```ts
// Functional guard - gọn hơn nhiều
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

// Route config
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  }
];
```

## Ví dụ thực tế

### 1. Auth Guard

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
      return true;
    })
  );
};
```

### 2. Role Guard

```ts
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  const userRole = authService.currentUser?.role;

  if (userRole === requiredRole) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

// Route config
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard],
    data: { role: 'admin' }
  }
];
```

### 3. Deactivate Guard

```ts
export const unsavedChangesGuard: CanDeactivateFn<any> = (component) => {
  if (component.hasUnsavedChanges) {
    return confirm('Bạn có thay đổi chưa lưu. Bạn có muốn rời đi?');
  }
  return true;
};

// Route config
const routes: Routes = [
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canDeactivate: [unsavedChangesGuard]
  }
];
```

## So sánh

| Feature | Class Guard | Functional Guard |
|---------|-------------|------------------|
| Boilerplate | Nhiều (class, decorator, constructor) | Ít (function) |
| Tree-shakable | ❌ Không | ✅ Có |
| Readability | Trung bình | Cao |
| Test | Dễ (class instance) | Dễ (function call) |
| DI | Constructor injection | `inject()` function |

## Flow Diagram

```
Class Guard:
  Class → Injectable → Constructor → canActivate()

Functional Guard:
  Function → inject() → return boolean
```

## Best Practices

1. **Ưu tiên functional guards** – Code gọn hơn
2. **Sử dụng `inject()`** – Trong functional guards
3. **Extract logic** – Tách business logic ra services
4. **Test cả hai** – Functional guards vẫn test được

---

**Summary**: Functional router guards giúp giảm boilerplate code trong routing guards. Sử dụng `inject()` function thay vì constructor injection, code gọn hơn và tree-shakable hơn.