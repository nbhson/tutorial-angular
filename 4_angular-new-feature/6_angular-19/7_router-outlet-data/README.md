# 7. RouterOutletData

## Mô tả

`RouterOutletData` là input mới trên `RouterOutlet` trong Angular 19, cho phép parent component **truyền data reactive (Signal)** xuống child components thông qua router outlet. Child component inject `ROUTER_OUTLET_DATA` token để nhận data.

## Vấn đề giải quyết

Trước Angular 19, truyền data từ parent → child qua router outlet rất hạn chế:
- Phải dùng shared service + signals/subjects
- Phased parameters không linh hoạt
- Không có cách direct từ outlet → child

```ts
// ❌ Cách cũ — phải dùng shared service
@Injectable({ providedIn: 'root' })
export class SharedDataService {
  data = signal<FighterList>({ ids: [], isSith: false });
}

// Parent set data
this.shared.data.set(fighterIds);

// Child inject service
constructor(private shared: SharedDataService) {}
```

```ts
// ✅ Cách mới — RouterOutletData
// Parent
<router-outlet [routerOutletData]="fighterIds()" />

// Child
readonly data = inject(ROUTER_OUTLET_DATA);
```

## Cú pháp

### Parent Component

```html
<router-outlet [routerOutletData]="dataSignal()" />
```

```ts
@Component({...})
export class ParentComponent {
  data = signal<MyType>({ ... });
}
```

### Child Component (routed through outlet)

```ts
import { Component, inject, Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

@Component({...})
export class ChildComponent {
  readonly routerOutletData: Signal<MyType> = inject(ROUTER_OUTLET_DATA);
}
```

## Files trong project

### `src/app/app.component.ts` — Parent component

```ts
import { Component, computed, signal } from '@angular/core';
import { FighterList } from './interfaces/fighter-list.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, FormsModule]
})
export class AppComponent {
  allegiance = signal('jedi');

  fighterIds = computed<FighterList>(() => {
    if (this.allegiance() === 'jedi') {
      return { ids: [1, 10, 20, 51, 52, 53, 32], isSith: false };
    }
    return { ids: [4, 44, 21, 67], isSith: true };
  });
}
```

### `src/app/app.component.html` — Template

```html
<div>
  Select your allegiance:<br/>
  <input type="radio" id="jedi" value="jedi" [(ngModel)]="allegiance">
  <label for="jedi">Jedi</label><br/>
  <input type="radio" id="sith" value="sith" [(ngModel)]="allegiance">
  <label for="sith">Sith</label><br/>
</div>

<hr>
Selected allegiance: {{ allegiance() }}
<hr>

<!-- Data truyền xuống child qua outlet -->
<router-outlet [routerOutletData]="fighterIds()" />
```

### `src/app/interfaces/fighter-list.interface.ts`

```ts
export interface FighterList {
  ids: number[];
  isSith: boolean;
}
```

## Flow diagram

```
User chọn allegiance (Jedi/Sith)
        │
        ▼
fighterIds computed signal cập nhật
        │
        ▼
[routerOutletData]="fighterIds()"
        │
        ▼
ROUTER_OUTLET_DATA token available
        │
        ▼
Child component inject() → nhận Signal data
```

## Đặc điểm quan trọng

| Đặc điểm | Mô tả |
|-----------|-------|
| **Signal-based** | Data truyền qua là reactive Signal |
| **Type-safe** | TypeScript generic support |
| **Dynamic** | Data tự động update khi signal thay đổi |
| **Decoupled** | Child không cần biết parent là ai |
| **No shared service** | Không cần Injectable service để share data |

## So sánh với approaches khác

| Feature | Shared Service | @Input | RouterOutletData |
|---------|---------------|--------|-----------------|
| Type-safe | ✅ | ✅ | ✅ |
| Reactive | ✅ (signal) | ✅ | ✅ |
| Coupling | Tight (service) | Tight (parent-child) | Loose |
| Boilerplate | Service + inject | @Input binding | 1 line |
| Across routes | ✅ | ❌ | ✅ |

## Khi nào dùng RouterOutletData?

- **Layout data** cần truyền xuống routed components
- **Dashboard** với sidebar selections affects main content
- **Wizard/stepper** — parent control thay đổi data cho steps
- **Multi-view** components cần shared context

## Reference

- [Angular RouterOutletData API](https://angular.dev/api/router/RouterOutlet)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [Router Guide](https://angular.dev/guide/routing)