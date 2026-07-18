# Router: Params Inheritance by Default

## Overview
Angular 22 router makes params inheritance the default. Child routes automatically receive parent route params without extra configuration.

## Key Features

- **Default behavior**: Child routes inherit parent params automatically
- **Simpler configuration**: No need to set `paramsInheritanceStrategy` manually
- **Backward compatible**: Existing apps with explicit config keep working
- **Cleaner code**: Less boilerplate in route definitions

## Code Examples

### Route Configuration (Angular 22 Default)

```typescript
import { Routes } from '@angular/router';

// Angular 22: params inheritance is the default
const routes: Routes = [
  {
    path: 'users/:userId',
    component: UserLayoutComponent,
    children: [
      {
        path: 'posts/:postId',
        component: PostDetailComponent
        // postId is available automatically
        // userId is ALSO available (inherited from parent)
      },
      {
        path: 'settings',
        component: UserSettingsComponent
        // userId available here too
      }
    ]
  }
];
```

### Accessing Inherited Params

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-post-detail',
  template: `
    <h2>Post {{ postId() }} by User {{ userId() }}</h2>
  `
})
export class PostDetailComponent {
  private route = inject(ActivatedRoute);
  
  // Both params available without extra config
  postId = toSignal(this.route.paramMap.pipe(
    map(params => params.get('postId'))
  ));
  
  userId = toSignal(this.route.paramMap.pipe(
    map(params => params.get('userId'))
  ));
}
```

### Before Angular 22 (Manual Config Required)

```typescript
// Angular 21 and earlier - had to explicitly configure
const routes: Routes = [
  {
    path: 'users/:userId',
    component: UserLayoutComponent,
    paramsInheritanceStrategy: 'always', // Manual!
    children: [
      {
        path: 'posts/:postId',
        component: PostDetailComponent
      }
    ]
  }
];
```

### With Route Guards

```typescript
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';

// Guard can access both parent and child params
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
        // Both userId and postId available in guard
      }
    ]
  }
];
```

## Migration

No changes needed for existing apps. If you previously set `paramsInheritanceStrategy: 'always'`, you can now remove it:

```typescript
// Before Angular 22
{
  path: 'users/:userId',
  paramsInheritanceStrategy: 'always', // ← Can remove this now
  children: [...]
}

// Angular 22 - same behavior, less config
{
  path: 'users/:userId',
  children: [...] // Params inherited by default
}
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)