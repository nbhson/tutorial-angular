# Improving Developer Experience (Angular 16)

> Angular 16 mang lại nhiều DX improvements: Required inputs, Router input binding, esBuild, self-closing tags, Jest support.

## 1. Required Inputs

```ts
// Cách 1: @Input decorator
@Component(...)
export class App {
  @Input({ required: true }) title: string = '';
}

// Cách 2: Component inputs array
@Component({
  inputs: [
    { name: 'title', required: true }
  ]
})
export class App {
  title: string = '';
}
```

## 2. Router Data as Component Inputs

```ts
// Route config
const routes = [
  {
    path: 'about',
    loadComponent: import('./about'),
    resolve: { contact: () => getContact() }
  }
];

// Component - route data tự động bind vào input
@Component(...)
export class AboutComponent {
  @Input() contact?: string;  // Auto-bound from resolve
}
```

**Precedence (resolved route data > static data > params > query params):**
```
1. Resolved route data
2. Static data
3. Optional/matrix params
4. Path params
5. Query params
```

## 3. esBuild Dev Server

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

**Kết quả:** 72% improvement trong cold production builds!

## 4. Flexible ngOnDestroy

```ts
@Injectable(...)
export class AppService {
  private destroyRef = inject(DestroyRef);

  destroy() {
    this.destroyRef.onDestroy(() => {
      // Cleanup logic
    });
  }
}
```

## 5. Self-Closing Tags

```html
<!-- Trước: Phải đóng tag -->
<super-duper-long-component-name [prop]="someVar">
</super-duper-long-component-name>

<!-- Sau: Self-closing -->
<super-duper-long-component-name [prop]="someVar"/>
```

## 6. Jest Support

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

## Summary

| Feature | Mô tả | Impact |
|---------|-------|--------|
| Required Inputs | `@Input({ required: true })` | Type safety |
| Router Input Binding | Route data → Component inputs | Less boilerplate |
| esBuild | 72% faster builds | DX |
| Self-closing tags | `<comp/>` thay vì `<comp></comp>` | Clean code |
| Jest support | Alternative to Karma | Testing DX |
| CSP Support | `ngCspNonce` attribute | Security |
| Flexible destroy | `DestroyRef.onDestroy()` | Better cleanup |

---

**Summary**: Angular 16 DX improvements giúp code gọn hơn, build nhanh hơn, và testing dễ hơn. Required inputs và router input binding giảm boilerplate显著.