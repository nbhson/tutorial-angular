# Signals State Management (Angular 16)

> Ví dụ thực tế về cách sử dụng Signals để quản lý state trong Angular application.

## Tổng quan

Signals có thể được sử dụng như một state management solution đơn giản, thay thế cho RxJS-based stores trong nhiều use cases.

## Signal Service Pattern

```ts
// counter.service.ts
@Injectable({ providedIn: 'root' })
export class CounterService {
  // Private writable signal
  private countSignal = signal(0);

  // Public read-only signal
  readonly count = this.countSignal.asReadonly();

  increment() {
    this.countSignal.update(v => v + 1);
  }

  decrement() {
    this.countSignal.update(v => v - 1);
  }

  reset() {
    this.countSignal.set(0);
  }
}
```

## Component Usage

```ts
@Component({
  selector: 'app-counter',
  template: `
    <h2>Count: {{ count() }}</h2>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
    <button (click)="reset()">Reset</button>
  `
})
export class CounterComponent {
  private counterService = inject(CounterService);
  count = this.counterService.count;

  increment() { this.counterService.increment(); }
  decrement() { this.counterService.decrement(); }
  reset() { this.counterService.reset(); }
}
```

## Complex State with Signals

```ts
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private todosSignal = signal<Todo[]>([]);
  private filterSignal = signal<'all' | 'active' | 'completed'>('all');

  // Public read-only signals
  readonly todos = this.todosSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();

  // Computed - filtered todos
  readonly filteredTodos = computed(() => {
    switch (this.filterSignal()) {
      case 'active':
        return this.todosSignal().filter(t => !t.completed);
      case 'completed':
        return this.todosSignal().filter(t => t.completed);
      default:
        return this.todosSignal();
    }
  });

  // Computed - stats
  readonly totalCount = computed(() => this.todosSignal().length);
  readonly activeCount = computed(() => this.todosSignal().filter(t => !t.completed).length);
  readonly completedCount = computed(() => this.todosSignal().filter(t => t.completed).length);

  addTodo(title: string) {
    this.todosSignal.update(todos => [
      ...todos,
      { id: Date.now(), title, completed: false }
    ]);
  }

  toggleTodo(id: number) {
    this.todosSignal.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.filterSignal.set(filter);
  }
}
```

## Flow Diagram

```
Traditional State Management (RxJS):
  Component → Dispatch Action → Store → Reducer → New State → Observable → Component

Signals State Management:
  Component → Call Service Method → Signal Update → Computed Recalculates → Template Updates
```

## So sánh với RxJS Store

| Tiêu chí | Signals | RxJS Store (NgRx) |
|---------|---------|-------------------|
| Boilerplate | Ít (signal + computed + service) | Nhiều (Actions, Reducers, Selectors, Effects) |
| Learning curve | Thấp | Cao |
| DevTools / time-travel debugging | Hạn chế ở v16 (ecosystem DevTools chưa tương đương Redux DevTools) | Mạnh (Redux DevTools, time-travel) |
| Xử lý async / side-effect phức tạp | Thủ công (kết hợp `effect` + RxJS, xem `rxjs-interop`) | Mạnh (Effects/middleware chuyên dụng) |
| Phù hợp | Simple–Medium apps, UI state cục bộ | Complex apps, nhiều event stream/async đan xen |

> Đây là trade-off, không phải phán đoán "hơn/thua" tuyệt đối: nếu cần DevTools time-travel, middleware xử lý async phức tạp hoặc event sourcing thì NgRx/RxJS vẫn phù hợp hơn; nếu chỉ cần UI state đơn giản thì Signals gọn hơn nhiều.

Nguồn official:
- https://angular.dev/guide/signals
- https://angular.dev/guide/rxjs-interop
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

## Best Practices

1. **Private signal, public readonly** – Encapsulation
2. **Computed cho derived state** – Không store redundant data
3. **Service pattern** – Centralized state management
4. **Immutable updates** – Luôn dùng update/set, không mutate

## Lưu ý về equality với object state

Signal mặc định so sánh bằng `===` (`defaultEquals`). Với object/array, mỗi lần `set`/`update` tạo reference mới (dù data giống nhau) đều bị coi là thay đổi → `computed`/`effect`/template phụ thuộc chạy lại. Cách xử lý:

```ts
// Dùng update + spread để tạo object mới (immutable) khi data thật sự đổi
this.todosSignal.update(todos => todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

// Nếu cần tránh re-compute khi data giống nhau, truyền custom `equal`
state = signal({ id: 1, title: 'Angular' }, {
  equal: (a, b) => a.id === b.id && a.title === b.title,
});
```

## Khi nào không nên dùng signals thay RxJS

- Luồng async phức tạp, event stream đan xen (debounce, switchMap, retry, cancellation...): RxJS/NgRx phù hợp hơn.
- Cần time-travel debugging, middleware/Effects tập trung, DevTools mạnh.
- Interop: dùng `toSignal()` / `toObservable()` / `takeUntilDestroyed()` trong `@angular/core/rxjs-interop` (developer preview ở v16) để kết hợp Observable ↔ Signal thay vì thay thế hoàn toàn.

Nguồn official:
- https://angular.dev/guide/signals
- https://angular.dev/guide/rxjs-interop
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d

---

**Summary**: Signals có thể được sử dụng như state management solution đơn giản. Với signal, computed, và service pattern, bạn có thể quản lý state hiệu quả mà không cần RxJS store phức tạp.