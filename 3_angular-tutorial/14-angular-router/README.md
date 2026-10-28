# Day 13: Router — navigation, guards, lazy loading

## Muc tieu

- Cau hinh router voi `provideRouter` va `Routes`.
- Hieu route params, query params, `ActivatedRoute`, `routerLink`.
- Dung lazy loading voi `loadChildren` / `loadComponent`.
- Bao ve route voi functional guards (`CanActivateFn`, `CanMatchFn`).
- Xu ly redirects, wildcard 404, title per-route.
- So sanh voi React Router v7.

## Khoi niem coi loi

### Cau hinh co ban

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ],
};
```

```ts
// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { NotFoundComponent } from './pages/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Trang chu' },
  { path: 'users', component: HomeComponent, title: 'Nguoi dung' },
  { path: 'users/:id', component: HomeComponent, title: 'Chi tiet' },
  { path: '**', component: NotFoundComponent, title: '404' }, // wildcard phai nam cuoi
];
```

```html
<!-- Template: dieu huong -->
<a routerLink="/users">Danh sach</a>
<a [routerLink]="['/users', userId]">Chi tiet user {{ userId }}</a>
<a routerLink="/users" [queryParams]="{ page: 2 }">Trang 2</a>

<!-- Noi render component cua route hien tai -->
<router-outlet />
```

## Vi du chi tiet

### 1. Route params — doc id tu URL

```ts
// user-detail.component.ts
import { Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-user-detail',
  template: `<h2>User {{ userId() }}</h2>`,
})
export class UserDetailComponent {
  // Cach 1 (v16+, khuyen nghi): withComponentInputBinding -> params thanh input signal
  userId = input.required<string>();

  // Cach 2: ActivatedRoute
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id');
}
```

**Snapshot vs observable**: `snapshot` chi doc 1 lan — khong cap nhat khi navigate tu `/users/1` sang `/users/2` (component bi reuse). Neu can phan ung thay doi, dung observable:

```ts
private route = inject(ActivatedRoute);

ngOnInit() {
  this.route.paramMap.subscribe(params => {
    this.loadUser(params.get('id')!); // chay lai khi doi id
  });
}
```

### 2. Query params

```ts
// doc query params: /search?q=angular&page=2
searchComponent = {
  q: this.route.snapshot.queryParamMap.get('q'),
};

// navigate tu code
import { Router } from '@angular/router';
private router = inject(Router);

goSearch() {
  this.router.navigate(['/search'], { queryParams: { q: 'angular', page: 2 } });
}
```

### 3. Lazy loading

```ts
export const routes: Routes = [
  // Lazy 1 component
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent),
  },
  // Lazy 1 nhom route
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];
```

```ts
// admin/admin.routes.ts
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
  { path: 'users', loadComponent: () => import('./users.component').then(m => m.UsersComponent) },
];
```

### 4. Functional guards (v15+)

```ts
// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('token');

  if (!isLoggedIn) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }, // nho URL de quay lai sau login
    });
  }
  return true;
};
```

```ts
// ap dung guard
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];
```

Guard khac thuong dung:

- `CanActivateFn`: cho phep/denied truy cap.
- `CanMatchFn`: quyet dinh route co duoc match khong (dung cho feature flag).
- `CanDeactivateFn`: canh bao khi roi trang co du lieu chua luu.
- `ResolveFn`: tai du lieu truoc khi vao route.

```ts
// resolve: tai user truoc khi vao trang chi tiet
export const userResolver: ResolveFn<User> = (route) => {
  const api = inject(UserApiService);
  return api.getUser(route.paramMap.get('id')!);
};

// routes
{ path: 'users/:id', component: UserDetailComponent, resolve: { user: userResolver } }
```

### 5. Redirect + title

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'Trang chu' },
  // redirect tham so: /old/:id -> /new/:id
  { path: 'old/:id', redirectTo: 'new/:id', pathMatch: 'full' },
  { path: 'new/:id', component: DetailComponent },
  { path: '**', component: NotFoundComponent },
];
```

Tu v14, `title` la thuoc tinh route san co — khong can TitleService + resolver nua.

### 6. Nested routes + auxiliary outlet

```html
<!-- app.component.html: hai outlet -->
<router-outlet />
<router-outlet name="popup" />
```

```ts
export const routes: Routes = [
  {
    path: 'product',
    component: ProductLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: ':id', component: ProductDetailComponent, outlet: 'popup' },
    ],
  },
];
```

```html
<!-- Template: hien thi popup -->
<button [routerLink]="[{ outlets: { popup: ['product', productId] } }]">Xem nhanh</button>
<router-outlet name="popup"></router-outlet>
```

## So sanh Angular vs React

| Khai niem | Angular | React Router v7 |
|---|---|---|
| Khai bao route | `Routes` array + `provideRouter` | `<Routes>` + `<Route path>` hoac `createBrowserRouter` |
| Link | `<a routerLink="/path">` | `<Link to="/path">` |
| Params | `ActivatedRoute` / route input binding | `useParams()` hook |
| Query params | `useQueryParams` cua ActivatedRoute / `router.navigate` | `useSearchParams()` |
| Guards | `CanActivateFn` | Navigate trong `loader` / `<ProtectedRoute>` wrapper |
| Lazy loading | `loadComponent` / `loadChildren` | `lazy(() => import('./x'))` + `Suspense` |
| 404 | `path: '**'` | `path="*"` |
| Nested routes | `children` + `<router-outlet>` | `<Route children>` + `<Outlet>` |

```tsx
// React Router v7 equivalent
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/users">Danh sach</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function UserDetail() {
  const { id } = useParams(); // doc param
  return <h2>User {id}</h2>;
}
```

Diem giong: ca 2 deu dung route config dang cay (array hoac JSX). Diem khac: Angular guards la first-class, React phai tu viet wrapper/loader; Angular lazy loading dua tren `loadComponent` gan giong React lazy.

## Loi thuong gap

### 1. Component bi reuse khi chi doi params

Di tu `/users/1` sang `/users/2`, component khong bi destroy/recreate. Bo qua `ngOnInit` thu 2. Fix: dung input binding (v16+) hoac subscribe `paramMap`.

### 2. Wildcard route khong nam cuoi

Router match theo thu tu khai bao. Neu `path: '**'` dung truoc cac route khac, no an het moi request. Luon dat wildcard cuoi cung.

### 3. Quen `<router-outlet />`

Route da match nhung man hinh trang -> template cua root component thieu `<router-outlet />`.

### 4. `href` thay vi `routerLink`

```html
<!-- Sai: reload toan bo app -->
<a href="/users">Users</a>

<!-- Dung: SPA navigation -->
<a routerLink="/users">Users</a>
```

### 5. Guard return sai kieu

`CanActivateFn` co the return `boolean`, `UrlTree`, hoac `Observable/ Promise` cua chung. Return `false` chi la chan khong redirect — user bi tre o trang cu. Dung `router.createUrlTree(...)` de redirect co kiem soat.

### 6. Lazy route hong khi build production

Nguyen nhan thuong gap: trong `loadComponent` return sai export name hoac file khong compile. Kiem tra log cua `ng build` va chac chan export la class component.

## Best practices

1. **Dung `withComponentInputBinding()`** de params thanh input, tranh snapshot stale.
2. **Lazy loading theo feature**, khong lazy tung component nho (thieu qua it code thi khong loi ich).
3. **Title moi route** dung thuoc tinh `title`, ket hop `TitleStrategy` neu can format chung.
4. **Guard la pure function inject dependencies** qua `inject()` — de test.
5. **404 route cuoi cung** va co nut quay ve trang chu.
6. **Doi tu `snapshot` sang observable** khi params/query co the doi trong vong doi component.

## Bai tap

1. **Bai 1**: Xay dung 3 trang: Home, Users (list tu JSONPlaceholder), User Detail. Navigation giua cac trang, params id qua URL.

2. **Bai 2**: Them `authGuard` cho trang Settings. Chua login thi redirect ve `/login?returnUrl=...`; sau login quay lai dung trang truoc.

3. **Bai 3**: Lazy load toan bo route Settings + Admin. Verify chunk rieng trong tab Network (build prod: `ng build`).

4. **Bai 4**: Dung `CanDeactivateFn` canh bao khi roi trang form co du lieu chua luu (confirm dialog).

## Reference

- [Routing — Angular.dev](https://angular.dev/guide/routing)
- [Router API](https://angular.dev/api/router/Router)
- [Guards & resolvers](https://angular.dev/guide/routing/route-guards)
- [Lazy loading](https://angular.dev/guide/routing/lazy-loading)
- [Router title](https://angular.dev/guide/routing/setting-title)
