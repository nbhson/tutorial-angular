# Angular Animations

> Nguồn: https://angular.dev/guide/animations — repo chỉ có `21-angular-routing-animation`, thiếu Animations API chính

## Tổng quan
Animations API (`@angular/animations`) khai báo `trigger/state/style/transition/animate` ngay trong `@Component({ animations })`. Dùng `provideAnimationsAsync()` (khuyên dùng) thay `BrowserAnimationsModule` cũ.

## Điểm chính
- `trigger('openClose', [state('open', style({...})), transition('open <=> closed', animate('300ms')))])`
- Bind trong template: `[@openClose]="isOpen() ? 'open' : 'closed'"`.
- Route animations: bọc `[@routeAnimations]="o?.activatedRouteData"` + `query(':enter')`.

## Ví dụ Code
```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-box',
  animations: [
    trigger('openClose', [
      state('open', style({ height: '200px', opacity: 1 })),
      state('closed', style({ height: '100px', opacity: 0.5 })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
  template: `<div [@openClose]="isOpen() ? 'open' : 'closed'">...</div>`,
})
export class Box {
  isOpen = signal(true);
}
```

```typescript
// app.config.ts — cách mới
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
export const appConfig: ApplicationConfig = {
  providers: [provideAnimationsAsync()],
};
```

## Tham khảo
- [Animations](https://angular.dev/guide/animations)
- `2_angular-techniques/1_advanced-features/21-angular-routing-animation/`
