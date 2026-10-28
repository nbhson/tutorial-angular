# Day 12: Module — NgModule vs Standalone

## Muc tieu

- Hieu NgModule la gi va tai sao Angular chuyen sang standalone components.
- Doc hieu `@NgModule` co dien: `declarations`, `imports`, `providers`, `exports`, `bootstrap`.
- Xay dung app voi standalone components (v17+ mac dinh, khong can NgModule).
- Cau hinh `app.config.ts` voi `provideRouter`, `provideHttpClient`.
- Biet cach migrate NgModule -> standalone.
- So sanh voi React (khong co khai niem module tuyet doi, chi import/export JS).

## Khoi niem coi loi

### NgModule la gi?

`NgModule` (`@NgModule`) la co che to chuc code tu Angular 2 den v14. Moi NgModule la mot "container" khai bao:

- `declarations`: cac component/directive/pipe thuoc module nay.
- `imports`: cac module khac (hoac standalone components tu v14) ma template can dung.
- `providers`: cac service chi scope cho module nay.
- `exports`: nhung gi trong `declarations` duoc cho phep module khac dung.
- `bootstrap`: component root (chi co o AppModule).

```ts
// app.module.ts — kieu cu (v2..v14)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Standalone components — cach hien dai

Tu v14 (preview) va v17 (mac dinh), moi component tao boi CLI la standalone. Standalone component tu khai bao dependencies cua minh trong `imports`, khong can NgModule trung gian.

```ts
// app.component.ts — standalone (v17+)
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // tu v19 khong can viet nua — la mac dinh
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

```ts
// app.config.ts — thay the AppModule
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

## Vi du chi tiet

### 1. Doi chieu NgModule <-> standalone

Giao dien NgModule kinh dien:

```ts
// shared.module.ts — kieu cu
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from './user-card.component';
import { HighlightDirective } from './highlight.directive';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  declarations: [UserCardComponent, HighlightDirective, TruncatePipe],
  imports: [CommonModule],
  exports: [UserCardComponent, HighlightDirective, TruncatePipe],
})
export class SharedModule {}
```

Tuong duong standalone: moi item tu import nhung gi no can.

```ts
// user-card.component.ts — standalone, tu khai bao dependencies
import { Component } from '@angular/core';
import { TruncatePipe } from './truncate.pipe';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [TruncatePipe], // pipe duoc khai bao truc tiep
  template: `<p [appHighlight]>{{ user.bio | truncate:80 }}</p>`,
})
export class UserCardComponent {}
```

Nhu vay, thay vi mot "SharedModule" lon, ban co tap cac standalone piece va import chinh xac cai nao can.

### 2. Lazy loading trong 2 the gioi

```ts
// Kieu NgModule cu — loadChildren tra ve module
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
];
```

```ts
// Standalone — loadChildren tra ve file routes
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];

// admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboard } from './admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboard },
];
```

### 3. Providers va InjectionScope

Trong the gioi NgModule, `providers` tren module tao instance rieng cho lazy module. Trong the gioi standalone, cung co che voi `provideRouter(...)` trong `loadChildren` route:

```ts
// admin.routes.ts — provider chi ton tai trong lazy subtree
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    providers: [AdminCacheService], // envInjector rieng cho subtree nay
    children: [
      { path: '', component: AdminDashboard },
    ],
  },
];
```

### 4. Migrate NgModule -> standalone

Angular CLI co schematic ho tro:

```bash
# Buoc 1: convert components sang standalone
ng generate @angular/core:standalone

# Cac lua chon trong schematic:
# 1. Convert all components, directives, pipes to standalone
# 2. Remove unnecessary NgModules
# 3. Bootstrap the application using standalone APIs
```

Quy trinh dien hinh:

1. Chay schematic lan 1 -> components thanh `standalone: true`, NgModule imports duoc chuyen vao tung component.
2. Chay lan 2 -> xoa NgModule khong con dung.
3. Chay lan 3 -> `main.ts` dung `bootstrapApplication(AppComponent, appConfig)`.
4. Chay test + build de verify.

```ts
// main.ts truoc
platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));

// main.ts sau
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

### 5. Khi nao van con can NgModule?

- Project cu chua migrate (rat nhieu codebase san co).
- Mot so API legacy nhu `entryComponents` (da loai bo) hoac thu vien chi phat hanh dang NgModule.
- `pipe`/`directive` legacy trong thu vien ben thu ba.

Trong truong hop do, standalone component van co the import NgModule:

```ts
@Component({
  standalone: true,
  imports: [LegacyButtonModule], // import NgModule vao standalone component
  template: `<legacy-button>Click</legacy-button>`,
})
export class MyComponent {}
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Module | NgModule (da lui) / standalone | Khong co module framework — chi ES modules |
| Khai bao dependencies | `imports: [...]` trong `@Component` | Import truc tiep trong JSX file |
| Global config | `app.config.ts` providers | Provider component (`<QueryClientProvider>`) |
| Lazy loading | `loadChildren` / `loadComponent` | `React.lazy` + `Suspense` |
| Scope service | DI injector + `providers` | Context API / store library |
| Entry point | `main.ts` + `bootstrapApplication` | `main.tsx` + `createRoot` |

**React equivalent cho "module"**:

```tsx
// React: khong co NgModule — moi file la mot ES module
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

Diem khac biet lon nhat: React khong co buoc "khai bao" (declare) — mot component duoc dung vi no duoc import. Angular standalone da tien gan ve huong nay: `imports: [RouterOutlet]` gan nhu "import de dung", nhung van co type-check ngay trong decorator.

## Loi thuong gap

### 1. Truon standalon va NgModule cung luc

Loi "Component X is standalone, and cannot be declared in any NgModule". Fix: xoa component khoi `declarations` cua NgModule, thay vao do `import` no vao nhung noi can dung.

### 2. Quen import CommonModule hoac dung sai

Tu v17, `@Component.imports` thay the `CommonModule`:

```ts
// Cu: can import CommonModule de dung @if/@for (hoac *ngIf)
imports: [CommonModule]

// Nhung neu chi can DatePipe, chi import dung thu can:
imports: [DatePipe]
```

### 3. bootstrapApplication va AppModule ton tai cung luc

Neu `main.ts` van goi `bootstrapModule(AppModule)` thi `app.config.ts` bi bo qua. Chi chon 1 entry point. Khi migrate, gan `app.config.ts` vao `bootstrapApplication`.

### 4. Router khong hoat dong sau khi migrate

Nguyen nhan pho bien: `provideRouter(routes)` chua duoc them vao `app.config.ts`, hoac template thieu `<router-outlet />`.

### 5. `standalone: true` khong can viet tu v19

Tu Angular 19, moi component moi la standalone mac dinh (khong viet `standalone: true` cung duoc). Neu ban viet `standalone: false` thi do la legacy NgModule-based component. Luu y khi doc code tu version cu.

## Best practices

1. **App moi: dung standalone ngay tu dau** — `ng new` tu v17 da tao standalone app, khong co AppModule.
2. **Khong tao "SharedModule" gia** trong the gioi standalone — chi import dung thu can vao tung component.
3. **App cu: migrate dan** — dung schematic `@angular/core:standalone`, chay tung buoc va test moi buoc.
4. **Global providers chi de o `app.config.ts`** — interceptor, router, http. Provider cuc bo de o route/component khi can scope rieng.
5. **`loadComponent` cho 1 component, `loadChildren` cho 1 nhom route**:

```ts
export const routes: Routes = [
  { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
];
```

## Bai tap

1. **Bai 1**: Tao mot app moi voi `ng new`, xac nhan khong co `app.module.ts`. Tim `app.config.ts` va doc tung provider.

2. **Bai 2**: Tao component `ProductCard` standalone voi imports chi dung nhung thu can (vi du: `DatePipe`). Dung no trong `App` va trong 1 lazy route.

3. **Bai 3**: Tao lazy route `admin` voi `loadChildren` va 1 provider rieng (`AdminCacheService`) trong route config. Log ra `inject(Injector)` de thay injector khac voi root.

4. **Bai 4 (nang cao)**: Clone mot nhanh codebase NgModule (vi du tu repo cu), chay schematic standalone theo 3 buoc, commit tung buoc.

## Reference

- [Standalone components — Angular.dev](https://angular.dev/guide/components/importing)
- [Standalone migration](https://angular.dev/reference/migrations/standalone)
- [NgModule API (legacy)](https://angular.dev/api/core/NgModule)
- [AppConfig](https://angular.dev/api/core/ApplicationConfig)
- [Angular Style Guide](https://angular.dev/style-guide)
