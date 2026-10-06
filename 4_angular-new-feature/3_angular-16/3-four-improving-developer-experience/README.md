# 4 cải thiện Developer Experience chính + extras (Angular 16)

> Angular 16 mang lại 4 DX improvements chính: Required inputs, Router input binding (`withComponentInputBinding`), esbuild+Vite (developer preview), self-closing tags - cùng các extras: Jest (experimental), CSP nonce, `DestroyRef`/`takeUntilDestroyed`, standalone tooling, TS5 decorators.

## 1. Required Inputs

```ts
// ✅ ĐÚNG - required input không có default value, dùng `!` (definite assignment)
@Component(...)
export class App {
  @Input({ required: true }) title!: string;
}
```

> Không viết `@Input({ required: true }) title: string = ''` vì required + default value là mâu thuẫn: required nghĩa là parent **bắt buộc** truyền, còn `= ''` nghĩa là có fallback khi không truyền.

Nguồn official:
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://angular.dev/guide/components/inputs#required-inputs

## 2. Router Data as Component Inputs

```ts
// Route config
const routes = [
  {
    path: 'about',
    loadComponent: () => import('./about').then(m => m.AboutComponent),
    resolve: { contact: () => getContact() }
  }
];

// BẮT BUỘC: bật binding router data -> component input
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
});

// Component - route data tự động bind vào input
@Component(...)
export class AboutComponent {
  @Input() contact?: string;  // Auto-bound từ resolve/data/params
}
```

**Precedence (theo official, từ cao xuống thấp):**
```
1. Resolved route data (resolve: {...})
2. Static data (data: {...})
3. Path params (/:id)
4. Optional/matrix params (;id=1)
5. Query params (?id=1)
```

Nguồn official:
- https://angular.dev/guide/routing/routing-with-urlmatcher
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## 3. esbuild + Vite Dev Server (Developer Preview)

```json
// angular.json
{
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser-esbuild"
    }
  }
}
```

**Kết quả:** cải thiện đáng kể tốc độ build (con số 72% trong blog official chỉ đo trên cold production builds minh họa, không phải mọi project). Ở v16 `browser-esbuild` vẫn là **developer preview**; dev-server dùng **Vite**.

Nguồn official:
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://v16.angular.io/guide/esbuild

## 4. Flexible ngOnDestroy với DestroyRef

```ts
@Component({ ... })
export class AppComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Đăng ký cleanup - chạy khi component/directive bị destroy
    this.destroyRef.onDestroy(() => {
      // Cleanup logic (unsubscribe, clear timer...)
    });
  }
}
```

```ts
// Hoặc gọn hơn cho Observable: takeUntilDestroyed (rxjs-interop, developer preview ở v16)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class AppComponent {
  constructor() {
    this.dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => console.log(data));
    // takeUntilDestroyed() phải gọi trong injection context,
    // hoặc truyền DestroyRef tường minh: takeUntilDestroyed(this.destroyRef)
  }
}
```

> `DestroyRef.onDestroy()` chỉ dùng trong component/directive/service có injection context, không gọi `service.destroy()` thủ công. Không tạo method `destroy()` riêng rồi gọi tay - framework tự gọi khi destroy.

Nguồn official:
- https://angular.dev/guide/components/lifecycle#ondestroy
- https://angular.dev/guide/rxjs-interop
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## 5. Self-Closing Tags

```html
<!-- Trước: Phải đóng tag -->
<super-duper-long-component-name [prop]="someVar">
</super-duper-long-component-name>

<!-- Sau: Self-closing -->
<super-duper-long-component-name [prop]="someVar"/>
```

## 6. Jest Support (Experimental)

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular-devkit/build-angular:jest",
          "options": {
            "tsConfig": "tsconfig.spec.json",
            "polyfills": ["zone.js", "zone.js/testing"]
          }
        }
      }
    }
  }
}
```

> Jest builder ở v16 vẫn là **experimental**, thay thế thử nghiệm cho Karma/Jasmine. Chưa nên dùng production.

Nguồn official:
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## 7. CSP Support

```html
<!-- HTML attribute -->
<html>
<body>
  <app ngCspNonce="{% nonce %}"></app>
</body>
</html>
```

```ts
// Injection token
bootstrapApplication(AppComponent, {
  providers: [{
    provide: CSP_NONCE,
    useValue: globalThis.myRandomNonceValue
  }]
});
```

## 8. Zone.js Configuration

```ts
bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
});
```

## 9. Extras: takeUntilDestroyed + standalone tooling + TS5 + autocomplete imports

```ts
// takeUntilDestroyed - thay cho takeUntil/ngOnDestroy boilerplate (developer preview ở v16)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class ListComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Cách 1: gọi trong injection context (tự lấy DestroyRef hiện tại)
    this.store.items$.pipe(takeUntilDestroyed()).subscribe();

    // Cách 2: truyền DestroyRef tường minh khi ở ngoài injection context
    // this.store.items$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
```

```bash
# Standalone tooling: tạo app standalone mặc định
ng new my-app --standalone

# Migration NgModule/component/pipe cũ sang standalone
ng generate @angular/core:standalone
```

- **TypeScript 5 + decorators chuẩn mới:** Angular 16 hỗ trợ TS >= 4.9.3 và < 5.2.0 (TS5 decorators không cần `experimentalDecorators`), tương thích tốt hơn với `useDefineForClassFields`.
- **Autocomplete imports trong template:** Language Service tự gợi ý import component/pipe standalone khi dùng trong template, giảm import tay.

Nguồn official:
- https://angular.dev/guide/rxjs-interop
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://v16.angular.io/guide/update-to-version-16

## Summary

| Feature | Mô tả | Impact |
|---------|-------|--------|
| Required Inputs | `@Input({required:true}) title!: string` | Type safety |
| Router Input Binding | `provideRouter(routes, withComponentInputBinding())` | Less boilerplate |
| esbuild + Vite (developer preview) | `browser-esbuild`, 72% chỉ trên cold prod builds minh họa | DX |
| Self-closing tags | `<comp/>` thay vì `<comp></comp>` | Clean code |
| Jest support (experimental) | Alternative to Karma | Testing DX |
| CSP Support | `ngCspNonce` attribute | Security |
| Flexible destroy | `DestroyRef.onDestroy()` / `takeUntilDestroyed()` | Better cleanup |
| Standalone tooling + TS5 | `ng new --standalone`, migration schematic, TS5 decorators | DX |

---

**Summary**: Angular 16 DX improvements giúp code gọn hơn, build nhanh hơn, và testing dễ hơn. Required inputs và router input binding (bật qua `withComponentInputBinding`) giảm boilerplate.