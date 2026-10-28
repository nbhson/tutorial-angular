# Day 15: Service — DI + state management voi Signals

## Muc tieu

- Hieu service trong Angular va Dependency Injection (`@Injectable`, `inject()`).
- Phan biet scope: root (singleton toan app) vs component provider.
- Quan ly state chung voi Signals trong service.
- Viet service goi API (ket hop voi `HttpClient` tu Day 11).
- So sanh voi React (Context, Zustand, Redux Toolkit).

## Khoi niem coi loi

### Service la gi?

Service la mot class chua logic dung chung (API call, state, calculation...). Angular quan ly va inject service vao component qua Dependency Injection (DI) thay vi ban phai tu tao instance.

```ts
// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' }) // singleton cho toan app
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}
```

### Cach inject

```ts
// Cach hien dai (v14+): inject() — dung duoc o bat ky dau co injection context
import { inject } from '@angular/core';

export class MyComponent {
  private userService = inject(UserService);
}

// Cach cu (van con dung rat pho bien): constructor injection
export class MyOldComponent {
  constructor(private userService: UserService) {}
}
```

`inject()` uu diem: dung duoc trong service factory, guard, interceptor, field initializer — khong chi trong constructor.

## Vi du chi tiet

### 1. Service quan ly state voi Signals

```ts
// cart.service.ts
import { Injectable, computed, signal } from '@angular/core';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // Private signal — chi sua qua method cua service
  private itemsSignal = signal<CartItem[]>([]);

  // Public read-only signals cho component dung
  items = this.itemsSignal.asReadonly();
  total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  count = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.qty, 0)
  );

  addItem(item: Omit<CartItem, 'qty'>) {
    this.itemsSignal.update(items => {
      const existing = items.find(i => i.productId === item.productId);
      if (existing) {
        // Immutable update — new reference
        return items.map(i =>
          i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...items, { ...item, qty: 1 }];
    });
  }

  removeItem(productId: number) {
    this.itemsSignal.update(items => items.filter(i => i.productId !== productId));
  }

  clear() {
    this.itemsSignal.set([]);
  }
}
```

```ts
// Su dung trong component
import { Component, inject } from '@angular/core';
import { CartService } from './cart.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  template: `
    <h2>Gio hang ({{ cart.count() }} mon)</h2>
    @for (item of cart.items(); track item.productId) {
      <div>
        {{ item.name }} x{{ item.qty }} = {{ item.price * item.qty | number:'1.0-0' }} VND
        <button (click)="cart.removeItem(item.productId)">Xoa</button>
      </div>
    }
    <p>Tong cong: {{ cart.total() | number:'1.0-0' }} VND</p>
    <button (click)="cart.clear()">Xoa tat ca</button>
  `,
})
export class CartComponent {
  cart = inject(CartService);
}
```

### 2. Service goi API + state (mau thuong dung)

```ts
// user-store.service.ts
import { Injectable, inject, computed, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private http = inject(HttpClient);

  // State
  private _users = signal<User[]>([]);
  private _filter = signal('');

  // Derived
  users = this._users.asReadonly();
  filter = this._filter.asReadonly();
  filteredUsers = computed(() => {
    const q = this._filter().toLowerCase();
    if (!q) return this._users();
    return this._users().filter(u => u.name.toLowerCase().includes(q));
  });

  // Actions
  setFilter(q: string) { this._filter.set(q); }

  loadUsers() {
    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe(users => this._users.set(users));
  }

  removeUser(id: number) {
    this._users.update(users => users.filter(u => u.id !== id));
  }
}
```

### 3. Provider scope — service rieng cho mot subtree

```ts
// Moi component provider tao instance rieng (khong phai root singleton)
@Component({
  selector: 'app-checkout',
  standalone: true,
  providers: [CheckoutDraftService], // instance moi cho moi <app-checkout>
  template: `...`,
})
export class CheckoutComponent {
  private draft = inject(CheckoutDraftService);
}
```

Nguoc lai, `providedIn: 'root'` nghia la mot instance duy nhat trong toan bo app (injector root). Neu ban inject service root o nhieu component, chung chia se cung mot state.

### 4. Service voi resource() (v19+) — server state

```ts
// posts.service.ts
import { Injectable, inject, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private page = signal(1);

  // resource: server state co san status + reload
  posts = resource({
    request: () => ({ page: this.page() }),
    loader: ({ request }) =>
      this.http.get<Post[]>(`/api/posts?page=${request.page}`),
  });

  nextPage() { this.page.update(p => p + 1); }
}
```

### 5. Facade pattern — service goi service

Thay vi component goi nhieu service, goi 1 facade:

```ts
@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private cart = inject(CartService);
  private orders = inject(OrderService);

  submitOrder() {
    const items = this.cart.items();
    return this.orders.create({ items }).pipe(
      tap(() => this.cart.clear()),
    );
  }
}
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Service/DI | `@Injectable` + `inject()` | Khong co DI — tu import/tao instance |
| Singleton state | `providedIn: 'root'` service | Module-level variable / Zustand store |
| Scoped state | `providers: [Service]` trong component | Context.Provider + value |
| Derived state | `computed()` | `useMemo` |
| Server state | `resource()` / HttpClient + service | TanStack Query |
| Side effect | `effect()` | `useEffect` |

```tsx
// React equivalent: Zustand store
import { create } from 'zustand';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (productId: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(i => i.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, qty: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter(i => i.productId !== productId) })),
}));

// Su dung trong component: const items = useCartStore(s => s.items);
```

Giong nhau: deu khuyen ghi immutable update. Khac nhau: Angular DI la framework-managed (auto inject, de mock trong test); React la thu vien ben ngoai (Zustand/Redux/Context).

## Loi thuong gap

### 1. Nham scope — state khong dung chung

Component A va B inject cung service nhung thay 2 state khac nhau -> service khac instance. Nguyen nhan: service bi khai bao trong `providers` cua component (tao instance moi cho moi component). Kiem tra: neu muon chia se, xoa khoi `providers` component va de `providedIn: 'root'`.

### 2. Service khong duoc provide

Loi: `NullInjectorError: No provider for XService!`. Nguyen nhan: thu vien legacy dang NgModule; hoac ban de service trong `providers` cua lazy route ma inject o root. Fix: them `providedIn: 'root'`.

### 3. Signal trong service bi mutate truc tiep

```ts
// Sai: component sua state cua service tu do
const items = this.cart.items(); // read-only signal tra ve array
items.push(newItem);             // mutate array ben trong signal!

// Dung: phai qua method cua service
this.cart.addItem(newItem);
```

Vi vay hay tra ve `.asReadonly()` va cung cap method de thay doi state.

### 4. inject() dung sai noi

`inject()` chi dung trong injection context: constructor, field initializer, factory, guard, interceptor. Dung trong callback (vi du trong `setTimeout`, trong `subscribe`) se bao loi. Neu can, truyen `DestroyRef` / service vao callback truoc.

### 5. Service giu logic DOM

Service nen la logic + state. DOM thao tac (querySelector, addEventListener) nam trong component hoac directive. Ngoai le: service quan ly `Overlay` cua CDK, nhung cung phai inject qua API.

### 6. Testable — service phai lam kho mock

Service khong inject interface/abstract class thi kho override trong unit test. Dung `InjectionToken` cho interface khi can replace implementation:

```ts
export const USER_API = new InjectionToken<UserApi>('USER_API');
// provider: { provide: USER_API, useClass: HttpUserApi }
```

## Best practices

1. **`providedIn: 'root'` la mac dich** — chi dung component/route provider khi thuc su can scope rieng.
2. **Service la single source of truth** — component doc signal, goi action; khong tu copy state vao component.
3. **Immutable update** voi `update()` / spread — tranh mutate.
4. **Tach service theo domain** (`CartService`, `AuthService`, `UserService`), khong viet 1 "AppService" lon.
5. **Dung `inject()` thay constructor injection** cho code moi — ngan gon va linh hoat.
6. **Server state dung `resource()` (v19+)** — co san status, reload, request reactive.

## Bai tap

1. **Bai 1**: Xay dung `TodoService` voi signals: list todos, filter (all/active/done), computed cho so con lai. Component chi goi service.

2. **Bai 2**: Nang cap TodoService them `loadFromApi()` voi HttpClient + jsonplaceholder `/todos`. Xu ly loading va error.

3. **Bai 3**: Tao 2 component anh em (header + list) chia se cung 1 service. Sau do tao them 1 instance co provider rieng trong 1 component khac de thay su khac biet.

4. **Bai 4**: Viet unit test cho CartService: mock HttpClient, kiem tra addItem/removeItem/total.

## Reference

- [Dependency Injection — Angular.dev](https://angular.dev/guide/di)
- [Creating services](https://angular.dev/guide/di/creating-injectable-service)
- [Signals — state management](https://angular.dev/guide/signals)
- [resource() API](https://angular.dev/guide/signals/resource)
- [Testing services](https://angular.dev/guide/testing/services)
