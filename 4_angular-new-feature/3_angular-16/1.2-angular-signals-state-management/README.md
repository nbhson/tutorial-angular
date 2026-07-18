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

| Feature | Signals | RxJS Store (NgRx) |
|---------|---------|-------------------|
| Boilerplate | Ít | Nhiều (Actions, Reducers) |
| Learning curve | Thấp | Cao |
| DevTools | Chưa có | ✅ Redux DevTools |
| Middleware | Chưa có | ✅ Effects |
| Perfect for | Simple-Medium apps | Complex apps |

## Best Practices

1. **Private signal, public readonly** – Encapsulation
2. **Computed cho derived state** – Không store redundant data
3. **Service pattern** – Centralized state management
4. **Immutable updates** – Luôn dùng update/set, không mutate

---

**Summary**: Signals có thể được sử dụng như state management solution đơn giản. Với signal, computed, và service pattern, bạn có thể quản lý state hiệu quả mà không cần RxJS store phức tạp.