# 3. Linked Signals Stable (Angular 20)

## Tổng quan

Angular 20 chính thức đưa `linkedSignal()` từ **Developer Preview** sang **Stable**. `linkedSignal()` tạo signal có giá trị phụ thuộc vào signal khác, nhưng có thể **ghi đè độc lập** — kết hợp giữa `computed()` (reactive) và `signal()` (writable).

## API mới

```typescript
import { linkedSignal, signal } from '@angular/core';

const source = signal('hello');
const derived = linkedSignal(() => source().toUpperCase());

derived(); // "HELLO"
source.set('world');
derived(); // "WORLD"

// Có thể ghi đè độc lập!
derived.set('CUSTOM'); // source vẫn là 'world'
```

**So với các Signal APIs khác:**

| API | Reactive | Writable | Use case |
|---|---|---|---|
| `signal()` | ❌ | ✅ | State cơ bản |
| `computed()` | ✅ | ❌ | Derived state read-only |
| `linkedSignal()` | ✅ | ✅ | Derived state nhưng có thể override |

## Tại sao cần feature này?

| Vấn đề | Giải thích |
|---|---|
| `computed()` không writable | Không thể override giá trị derived |
| `signal()` không reactive | Không tự cập nhật khi source thay đổi |
| Form state | Cần reactive nhưng cũng cần user override |
| Selection state | Reset selection khi list thay đổi, nhưng giữ selection hiện tại |

## Ví dụ thực tế

### 1. Basic Usage

```typescript
import { linkedSignal, signal } from '@angular/core';

const items = signal(['Angular', 'React', 'Vue']);
const selectedIndex = signal(0);

// linkedSignal: reset khi items thay đổi
const currentItem = linkedSignal(() => {
  // Reset index khi items thay đổi
  if (selectedIndex() >= items().length) {
    selectedIndex.set(0);
  }
  return items()[selectedIndex()];
});

console.log(currentItem()); // "Angular"
```

### 2. Form Auto-reset

```typescript
@Component({
  selector: 'app-form',
  template: `
    <select [value]="selectedCategory()" (change)="onCategoryChange($event)">
      @for (cat of categories(); track cat) {
        <option [value]="cat">{{ cat }}</option>
      }
    </select>
    <input [value]="filter()" (input)="filter.set($any($event.target).value)" />
  `
})
export class FormComponent {
  categories = signal(['All', 'Electronics', 'Clothing', 'Food']);

  selectedCategory = signal('All');
  filter = linkedSignal(() => this.selectedCategory());

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    // filter tự reset về category name
  }
}
```

### 3. Selection State

```typescript
@Component({
  selector: 'app-list',
  template: `
    <ul>
      @for (item of items(); track item.id) {
        <li
          [class.selected]="selectedItem()?.id === item.id"
          (click)="selectItem(item)"
        >
          {{ item.name }}
        </li>
      }
    </ul>
  `
})
export class ListComponent {
  items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]);

  // Auto-reset selection khi items thay đổi
  selectedItem = linkedSignal(() => {
    const current = this.selectedItem();
    if (current && this.items().some(i => i.id === current.id)) {
      return current; // Giữ selection hiện tại
    }
    return null; // Reset nếu item không còn tồn tại
  });

  selectItem(item: any) {
    this.selectedItem.set(item);
  }
}
```

### 4. Computed Override

```typescript
const source = signal(10);
const derived = linkedSignal(() => source() * 2);

console.log(derived()); // 20

source.set(15);
console.log(derived()); // 30

derived.set(100); // Override!
console.log(derived()); // 100

source.set(5);
console.log(derived()); // 10 (quay lại reactive mode)
```

## Flow chi tiết

```
source = signal('hello')
        │
        ▼
derived = linkedSignal(() => source().toUpperCase())
        │
        ▼
derived() === "HELLO" ✅
        │
        ▼
source.set('world')
        │
        ▼
derived() === "WORLD" ✅ (auto-update)
        │
        ▼
derived.set('CUSTOM')
        │
        ▼
derived() === "CUSTOM" ✅ (override)
source() === 'world' (không đổi)
```

## Best practices

1. **Dùng `linkedSignal()`** khi cần derived state có thể override
2. **Dùng `computed()`** khi chỉ cần derived state read-only
3. **Dùng `signal()`** khi cần standalone state
4. **Reset logic** trong linkedSignal callback
5. **Test override behavior** khi viết tests

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/3_linked-signals-stable
npm install
ng serve