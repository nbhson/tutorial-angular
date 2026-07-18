# Route Redirect as Function

## Tổng quan

Trong Angular 18, `redirectTo` trong route configuration được mở rộng để **hỗ trợ function** thay vì chỉ nhận string cố định. Điều này cho phép redirect logic linh hoạt hơn dựa trên runtime conditions như query params, route params, hoặc inject services.

Trước Angular 18, `redirectTo` chỉ chấp nhận một string:
```ts
{ path: 'old-path', redirectTo: '/new-path' }
```

Angular 18 cho phép sử dụng function:
```ts
{
  path: 'dashboard',
  redirectTo: ({ queryParams }) => {
    // Logic phức tạp dựa trên runtime conditions
    return queryParams['admin'] ? '/admin/dashboard' : '/user/dashboard';
  },
}
```

## Cấu trúc files

```
2_route-redirect-as-fucntion/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component - navigation links
│   │   ├── config/
│   │   │   └── app.config.ts             # Application config
│   │   ├── components/
│   │   │   ├── home/
│   │   │   │   └── home.component.ts     # Home page
│   │   │   ├── product/
│   │   │   │   └── product.component.ts  # Product detail (lazy loaded)
│   │   │   ├── category/
│   │   │   │   └── category.component.ts # Category (lazy loaded)
│   │   │   └── not-found/
│   │   │       └── not-found.component.ts# 404 page
│   │   └── routes/
│   │       └── app.routes.ts             # Routes với redirect function
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/routes/app.routes.ts` — Routes với Redirect Function

Đây là file cốt lõi, demo cách sử dụng `redirectTo` với function để redirect linh hoạt dựa trên query params.

```ts
import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { ErrorHandler, inject } from '@angular/core';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
      path: 'product',
      redirectTo: ({ queryParams }) => {
        const errorHandler = inject(ErrorHandler);
        const id = queryParams['id'];
        if (id) return `product-detail`;

        errorHandler.handleError(new Error('Please provide the ID of product'));
        return `not-found`;
      },
    },
    {
      path: 'product-detail',
      loadComponent: () => import('../components/product/product.component')
        .then((m) => m.ProductComponent),
    },
    {
      path: 'category/:id',
      loadComponent: () => import('../components/category/category.component')
        .then((m) => m.CategoryComponent),
    },
    { path: 'not-found', component: NotFoundComponent },
    { path: '**', component: NotFoundComponent },
];
```

**Giải thích:**
- `redirectTo` nhận một function với parameter `{ queryParams }` (cũng hỗ trợ `params`, `fragment`, v.v.)
- Function return một string là đường dẫn redirect đến
- `inject(ErrorHandler)` — có thể inject any service trong redirect function
- Nếu `queryParams['id']` tồn tại → redirect đến `product-detail`
- Nếu không có `id` → log error và redirect đến `not-found`

### `src/app/app.component.ts` — Root Component

Component gốc hiển thị navigation links và current URL.

```ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, JsonPipe],
  template: `
    <div class="container">
      <section id="navigation">
        <a [routerLink]="['']">Home</a>
        <a [routerLink]="['/product']">Product</a>
        <a [routerLink]="['/category']">Category</a>
        <a [routerLink]="['/not-mapped-in-router-ts']">404</a>
      </section>

      <div id="router">
        <router-outlet />
      </div>

      <section id="app-info">
        <p>Current URL: {{router.url | json}}</p>
        <p>Current build: {{angularVersion.full}}</p>
      </section>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  router = inject(Router);
  angularVersion = VERSION;
}
```

**Giải thích:**
- Hiển thị navigation menu với các links: Home, Product, Category, 404
- `router-outlet` — placeholder cho routed components
- Hiển thị current URL và Angular version

### `src/app/components/home/home.component.ts` — Home Component

```ts
@Component({
  selector: 'app-home',
  template: `<h2>Home Component</h2>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit { }
```

### `src/app/components/product/product.component.ts` — Product Component

```ts
@Component({
  selector: 'app-product',
  template: `<h2>Product Component</h2>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit { }
```

### `src/app/components/category/category.component.ts` — Category Component

```ts
@Component({
  selector: 'app-category',
  template: `<h2>Category Component</h2>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent implements OnInit { }
```

### `src/app/components/not-found/not-found.component.ts` — Not Found Component

```ts
@Component({
  selector: 'app-not-found',
  template: `<h2>404 Not Found</h2>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit { }
```

## Flow navigation

```
/product?id=1        → redirectTo function → /product-detail (có id)
/product             → redirectTo function → /not-found (thiếu id, log error)
/category/123        → loadComponent → CategoryComponent
/                    → HomeComponent
/not-mapped-in-router → ** wildcard → NotFoundComponent
```

## Ví dụ khác — Redirect theo Roles

```ts
{
  path: 'dashboard',
  redirectTo: ({ queryParams, route }) => {
    const userService = inject(UserService);
    const user = userService.currentUser();

    if (user?.isAdmin) {
      return '/admin/dashboard';
    } else if (user?.isEditor) {
      return '/editor/dashboard';
    } else {
      return '/unauthorized';
    }
  },
},
```

## So sánh: String vs Function Redirect

| Aspect | String (Trước v18) | Function (v18+) |
|--------|-------------------|-----------------|
| Syntax | `redirectTo: '/path'` | `redirectTo: ({ queryParams }) => ...` |
| Dynamic | Không | Có, dựa trên runtime conditions |
| Service Injection | Không thể | Có thể `inject()` any service |
| Error Handling | Không có | Có thể handle errors trong function |
| Flexibility | Cố định | Linh hoạt theo business logic |

## Lợi ích

1. **Dynamic routing** — Redirect logic dựa trên runtime conditions thay vì hard-coded
2. **Service injection** — Có thể inject any service trong redirect function
3. **Better UX** — Graceful error handling và conditional redirects
4. **Cleaner code** — Loại bỏ conditional logic trong Guards,集中 vào redirect function

## Yêu cầu

- Angular 18+
- Node.js 18+

## Tài liệu tham khảo

- [Angular Router Official Guide](https://angular.dev/guide/routing)
- [Syncfusion - What's New in Angular 18](https://www.syncfusion.com/blogs/post/whats-new-in-angular-18)