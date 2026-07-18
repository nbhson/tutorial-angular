# Standalone APIs Stable (Angular 15)

> Standalone APIs officially stable - không còn developer preview. Đủ tự tin dùng production.

## Tổng quan

Standalone Components giới thiệu ở Angular 14 nay đã stable trong Angular 15. Đủ tự tin để dùng production và tích hợp với toàn bộ hệ sinh thái Angular.

## Bootstrap Application

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

// Không cần NgModule
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});
```

## Router với Standalone

```ts
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component')
      .then(m => m.ProductsComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.adminRoutes)
  }
];

// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
});
```

## Router Configuration

```ts
// Routes với title, guard, và lazy loading
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Trang chủ',
    canActivate: [authGuard]
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () => import('./product-list/product-list.component')
          .then(m => m.ProductListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./product-detail/product-detail.component')
          .then(m => m.ProductDetailComponent)
      }
    ]
  }
];
```

## Lazy Loading với `loadComponent`

```ts
// Thay vì loadChildren cho module
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent)
  }
];

// Tree-shakable - chỉ load code cần thiết
```

## Integration với HttpClient

```ts
// provideHttpClient tree-shakable
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loggingInterceptor]),
      withFetch()  // Sử dụng Fetch API
    )
  ]
});
```

## Flow Diagram

```
Angular 14 (Experimental):
  bootstrapApplication() → standalone component → ⚠️ Experimental

Angular 15 (Stable):
  bootstrapApplication() → standalone component → ✅ Production ready
  + provideRouter() → tree-shakable (-11% router bundle)
  + provideHttpClient() → tree-shakable
  + loadComponent() → lazy loading components
```

## So sánh Bundle Size

```ts
// Trước: Import toàn bộ RouterModule
import { RouterModule } from '@angular/router';

// Sau: Tree-shakable provideRouter
provideRouter(routes)  // -11% router bundle size
```

## Best Practices

1. **Dùng `provideRouter()`** – Tree-shakable, smaller bundle
2. **`loadComponent()` cho lazy loading** – Thay vì loadChildren modules
3. **Mix với legacy modules** – Có thể import standalone vào NgModule
4. **Test tất cả integration** – Router, HTTP, Elements đều hoạt động

---

**Summary**: Standalone APIs officially stable trong Angular 15. `provideRouter()` và `provideHttpClient()` tree-shakable giúp giảm bundle size. Đủ tự tin để migrate production applications.