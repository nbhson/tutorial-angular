# NgRx v22 — SignalStore là lựa chọn mặc định

> Nguồn: https://ngrx.io/guide/signals/signal-store — https://ngrx.io/guide/signals/signal-store/entity-management — InfoQ "NgRx 22: Resource Extensions"

## NgRx hôm nay: hai thế hệ

NgRx từ lâu gắn với pattern Redux (`Store` + `Actions` + `Reducers` + `Effects` + `Selectors` — bây giờ gọi là **NgRx Store "cổ điển"**). Từ v19+, NgRx mở rộng với **SignalStore** (`@ngrx/signals`) — store hiện đại xây trên Angular signals, nhẹ hơn và loại bỏ phần lớn boilerplate.

> Khuyến nghị cho Angular v22: **project mới dùng SignalStore**. Store cổ điển (Store/Action/Reducer/Effect) vẫn được hỗ trợ nhưng phù hợp khi cần Redux DevTools strict-time-travel hoặc đang có sẵn codebase lớn dùng nó.

| | NgRx Store (cổ điển) | **SignalStore (`@ngrx/signals`)** |
|---|---|---|
| Nền tảng | RxJS + pattern Redux | Angular Signals |
| Boilerplate | Nhiều (action/reducer/effect/selector) | Tối giản: `withState/withComputed/withMethods` |
| DevTools | Redux DevTools | ✅ (store-devtools với `actionCreators`) |
| Typing | Đòi hỏi setup kỹ | Type-safe mặc định, DeepSignal |
| Học | Phải nắm RxJS + Redux | Chỉ cần signals |

## Cài đặt

```bash
# Chỉ SignalStore — khuyến nghị cho app mới
ng add @ngrx/signals@latest

# Full suite (Store, Effects, Entity, DevTools...)
ng add @ngrx/store@latest
```

Phiên bản hiện tại: `@ngrx/signals` 22.0.x (cập nhật 10/2026), yêu cầu Angular 22, TypeScript 6.0, RxJS ^6.5 || ^7.5.

## SignalStore — mô hình cơ bản

SignalStore là một class được sinh ra từ danh sách **features** — mỗi feature thêm một phần khả năng vào store. Kết quả là một service injectable bình thường:

| Feature | Thêm vào store |
|---|---|
| `withState(initial)` | State gốc — mỗi property thành một signal (nested object → deep signal) |
| `withComputed(fn)` | Derived state (giống `computed`) |
| `withMethods(fn)` | Methods, kể cả update state |
| `withProps(fn)` | Inject service, hằng số, helper |
| `withHooks({ onInit, onDestroy })` | Lifecycle: load data lúc init |
| `withEntities(entity)` | Quản lý danh sách entity chuẩn hoá |

```typescript
// flights.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { FlightService } from './flight.service';

export interface Flight {
  id: number;
  from: string;
  to: string;
  price: number;
}

interface FlightsState {
  flights: Flight[];
  filter: string;
  loading: boolean;
}

export const FlightsStore = signalStore(
  { providedIn: 'root' },

  // 1. State
  withState<FlightsState>({ flights: [], filter: '', loading: false }),

  // 2. Derived state
  withComputed(({ flights, filter }) => ({
    visible: computed(() =>
      flights().filter((f) => f.to.includes(filter()))
    ),
    totalPrice: computed(() =>
      flights().reduce((sum, f) => sum + f.price, 0)
    ),
  })),

  // 3. Methods — cách DUY NHẬT thay đổi state
  withMethods((store, flightService = inject(FlightService)) => ({
    setFilter(filter: string) {
      patchState(store, { filter });
    },
    async load() {
      patchState(store, { loading: true });
      const flights = await flightService.getAll();
      patchState(store, { flights, loading: false });
    },
  })),

  // 4. Hooks — lifecycle
  withHooks({
    onInit: async ({ load }) => {
      await load();
    },
  }),
);
```

```typescript
// Component — inject như service thường
@Component({
  template: `
    @for (f of store.visible(); track f.id) {
      <app-flight-card [flight]="f" />
    } @empty {
      <p>Không có chuyến bay nào.</p>
    }
  `,
})
export class FlightListComponent {
  store = inject(FlightsStore);
}
```

## withEntities — quản lý danh sách chuẩn hoá

`@ngrx/signals/entities` cung cấp collection chuẩn hoá (`ids` + `entityMap`) — tra cứu theo id là O(1), update một entity không làm re-render các entity khác:

```typescript
import { signalStore, withEntities, withMethods, patchState } from '@ngrx/signals';
import {
  addEntity, removeEntity, setAllEntities, updateEntity, withEntities,
} from '@ngrx/signals/entities';

export const TasksStore = signalStore(
  withEntities<Task>(),                 // thêm ids, entityMap, entities
  withMethods((store) => ({
    loaded(tasks: Task[]) { patchState(store, setAllEntities(tasks)); },
    add(task: Task)         { patchState(store, addEntity(task)); },
    remove(id: string)      { patchState(store, removeEntity(id)); },
    toggle(id: string) {
      patchState(store, updateEntity({ id, changes: (t) => ({ done: !t.done }) }));
    },
  })),
);

// Đọc ra
store.entities();          // computed — array chuẩn hoá
store.entityMap();         // Record<id, Task>
```

Các updater có sẵn: `addEntity` / `setEntity` / `setAllEntities` / `upsertEntity` / `updateEntity` / `removeEntity` / `removeAllEntities` — tương đương `@ngrx/entity` adapter của thế hệ cũ, nhưng không cần reducer.

### Nhiều collection trong một store

```typescript
withEntities({ entity: type<Task>(), collection: 'task' }),   // → taskEntities()
withEntities({ entity: type<User>(), collection: 'user' }),   // → userEntities()
```

## So sánh SignalStore với Store cổ điển

```typescript
// CỔ ĐIỂN (Redux-style) — ~4 file, nhiều boilerplate
// actions.ts / reducer.ts / effects.ts / selectors.ts
export const loadFlights = createAction('[Flights] Load');
export const loadFlightsSuccess = createAction(
  '[Flights API] Load Success',
  props<{ flights: Flight[] }>(),
);

// SIGNALSTORE — 1 file, type-safe tự động
export const FlightsStore = signalStore(
  withState({ flights: [], loading: false }),
  withMethods((store, api = inject(FlightService)) => ({
    async load() {
      patchState(store, { loading: true });
      patchState(store, { flights: await api.getAll(), loading: false });
    },
  })),
);
```

## SignalStore với RxJS: `rxMethod`

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

withMethods((store, api = inject(FlightService)) => ({
  // RxJS flow — xử lý cancel, error, loading
  search: rxMethod<string>(
    pipe(
      debounceTime(300),
      switchMap((query) => api.search(query).pipe(
        tapResponse({
          next: (flights) => patchState(store, { flights, loading: false }),
          error: () => patchState(store, { loading: false }),
        }),
      )),
    ),
  ),
}))
```

## Root / route / component — chọn phạm vi

```typescript
// Toàn app
export const SessionStore = signalStore({ providedIn: 'root' }, ...);

// Theo route
providers: [FlightsStore] // trong route config

// Theo component — mỗi instance một store riêng
@Component({ providers: [EditorStore] })
export class EditorComponent {}
```

> Quy tắc chọn phạm vi: **một store cho mỗi khái niệm nghiệp vụ**, không phải mỗi component hay toàn app. Store component-level rất hợp cho màn hình phức tạp: `withHooks` load data, tự huỷ khi navigate đi.

## NgRx v22 — gì mới

- **Resource extensions** (`@ngrx/signals/resource`, experimental): customise hành vi `resource`/`httpResource` — giữ `value()` khi reload thay vì reset về `undefined`.
- **Dynamic deep signals**: state slice dạng union (`{ user: User } | null`) — mỗi member của literal được expose như một `DeepSignal` riêng, narrowing bằng `in`.
- **`SignalStoreFeatureType`** — helper typing để viết custom feature có type inference đầy đủ.
- `@ngrx/eslint-plugin` hỗ trợ ESLint v10, bỏ ESLint v8/eslintrc.
- Breaking changes đáng chú ý: `tapResponse` chỉ còn cú pháp object (`tapResponse({ next, error, complete })`); entity `selectId` infer type từ config.

```bash
ng update @ngrx/signals@22   # migrations tự động cho phần lớn breaking changes
```

## Khi nào dùng gì

| Kịch bản | Giải pháp |
|---|---|
| State local vài biến | `signal()` trong component |
| State chia sẻ giữa vài component | SignalStore (component-level hoặc route-level) |
| State global đơn giản | SignalStore `providedIn: 'root'` hoặc `signalState()` |
| Entity list lớn | SignalStore + `withEntities` |
| Complex side effects, Redux DevTools, time-travel | NgRx Store cổ điển |

## Lỗi thường gặp

- **Mutate state trực tiếp** (`store.flights().push(...)`) — SignalStore state là immutable; mọi thay đổi qua `patchState`.
- **Quên `withMethods`** — không thể gán trực tiếp `store.filter = 'x'`, phải qua method.
- **Đặt store component-level nhưng inject ở root** — kiểm tra `providedIn` và nơi `providers` được khai báo.
- **RxJS trong `withComputed`** — `computed` là sync; dùng `rxMethod` hoặc `toSignal` thay thế.

## Tham khảo

- [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store)
- [Entity management](https://ngrx.io/guide/signals/signal-store/entity-management)
- [NgRx 22 changelog](https://github.com/ngrx/platform/blob/main/CHANGELOG.md)
- [Signals-based performance](../3_performance-optimization/26-signals-performance/README.md)
