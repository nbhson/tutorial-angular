# Router: Kế Thừa Params Theo Mặc Định

## Tổng quan
Router Angular 22 đặt kế thừa params làm mặc định. Child routes tự động nhận params của parent route mà không cần cấu hình thêm.

## Tính năng chính

- **Hành vi mặc định**: Child routes tự động kế thừa params của parent
- **Cấu hình đơn giản hơn**: Không cần đặt `paramsInheritanceStrategy` thủ công
- **Tương thích ngược**: Các app hiện có với cấu hình tường minh vẫn hoạt động
- **Code gọn hơn**: Ít boilerplate trong route definitions

## Ví dụ Code

### Cấu Hình Route (Mặc Định Angular 22)

```typescript
import { Routes } from '@angular/router';

// Angular 22: kế thừa params là mặc định
const routes: Routes = [
  {
    path: 'users/:userId',
    component: UserLayoutComponent,
    children: [
      {
        path: 'posts/:postId',
        component: PostDetailComponent
        // postId có sẵn tự động
        // userId CŨNG có sẵn (kế thừa từ parent)
      },
      {
        path: 'settings',
        component: UserSettingsComponent
        // userId cũng có sẵn ở đây
      }
    ]
  }
];
```

### Truy Cập Params Kế Thừa

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-post-detail',
  template: `
    <h2>Bài viết {{ postId() }} của User {{ userId() }}</h2>
  `
})
export class PostDetailComponent {
  private route = inject(ActivatedRoute);
  
  // Cả hai params đều có sẵn mà không cần cấu hình thêm
  postId = toSignal(this.route.paramMap.pipe(
    map(params => params.get('postId'))
  ));
  
  userId = toSignal(this.route.paramMap.pipe(
    map(params => params.get('userId'))
  ));
}
```

### Trước Angular 22 (Bắt Buộc Cấu Hình Thủ Công)

```typescript
// Angular 21 và trước đó - phải cấu hình tường minh
const routes: Routes = [
  {
    path: 'users/:userId',
    component: UserLayoutComponent,
    paramsInheritanceStrategy: 'always', // Thủ công!
    children: [
      {
        path: 'posts/:postId',
        component: PostDetailComponent
      }
    ]
  }
];
```

### Với Route Guards

```typescript
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';

// Guard có thể truy cập cả params của parent lẫn child
const postGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userId = route.parent?.paramMap.get('userId');
  const postId = route.paramMap.get('postId');
  
  return canAccessPost(userId, postId);
};

const routes: Routes = [
  {
    path: 'users/:userId',
    component: UserLayoutComponent,
    children: [
      {
        path: 'posts/:postId',
        component: PostDetailComponent,
        canActivate: [postGuard]
        // Cả userId và postId đều có sẵn trong guard
      }
    ]
  }
];
```

## Migration

Không cần thay đổi gì cho các app hiện có. Nếu trước đây bạn đặt `paramsInheritanceStrategy: 'always'`, giờ bạn có thể bỏ nó:
```typescript
// Trước Angular 22
{
  path: 'users/:userId',
  paramsInheritanceStrategy: 'always', // ← Giờ có thể bỏ
  children: [...]
}

// Angular 22 - cùng hành vi, ít cấu hình hơn
{
  path: 'users/:userId',
  children: [...] // Params kế thừa theo mặc định
}
```

## Mới v22: `withComponentInputBinding({ queryParams, unmatchedInputBehavior })`

`withComponentInputBinding()` nay nhận thêm param `options`:

```typescript
import { provideRouter, withComponentInputBinding } from '@angular/router';

// Tắt bind queryParams khi tự quản lý query riêng
provideRouter(routes, withComponentInputBinding({ queryParams: false }));

// Tránh set undefined cho inputs chưa từng có trong router data
provideRouter(routes,
  withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
);

// Kết hợp cả hai
provideRouter(routes,
  withComponentInputBinding({
    queryParams: false,
    unmatchedInputBehavior: 'undefinedIfStale',
  }),
);
```

| Option | Giá trị | Mô tả |
|--------|---------|-------|
| `queryParams` | `true` (default) / `false` | Có bind query params vào component inputs không |
| `unmatchedInputBehavior` | `'alwaysUndefined'` (default) / `'undefinedIfStale'` | `'alwaysUndefined'` set `undefined` khi không match để tránh stale; `'undefinedIfStale'` chỉ set `undefined` nếu input đó từng có trong router data |

## Tham khảo
- [Angular v22 changelog — Add `options` for `withComponentInputBinding`, `unmatchedInputBehavior`, default `paramsInheritanceStrategy: 'always'`](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
