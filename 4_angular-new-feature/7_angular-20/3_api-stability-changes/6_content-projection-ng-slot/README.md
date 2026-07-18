# 6. Content Projection với ng-slot (Angular 20)

## Tổng quan

Angular 20 giới thiệu `ng-slot` — cách mới để **content projection** trong components, thay thế `ng-content`. `ng-slot` hỗ trợ **named slots**, **default content**, và **slot props** — mô hình tương tự Web Components `<slot>`.

## API mới

```html
<!-- Child component template -->
<card>
  <ng-slot>Default content here</ng-slot>
</card>

<!-- Named slots -->
<dialog>
  <ng-slot name="header">Default header</ng-slot>
  <ng-slot>Default body</ng-slot>
  <ng-slot name="footer">Default footer</ng-slot>
</dialog>
```

```html
<!-- Parent template -->
<card>
  <p>Custom content</p>
</card>

<dialog>
  <ng-slot name="header">Custom Header</ng-slot>
  <p>Custom Body</p>
  <ng-slot name="footer">Custom Footer</ng-slot>
</dialog>
```

**Thay đổi so với trước:**

| Trước (`ng-content`) | Sau (`ng-slot`) |
|---|---|
| `<ng-content select="[header]">` | `<ng-slot name="header">` |
| `<ng-content>` | `<ng-slot>` |
| Không có default content | `<ng-slot>Default</ng-slot>` |
| Không có slot props | `<ng-slot [props]="data">` |

## Tại sao cần feature này?

| Vấn đề với `ng-content` | Giải pháp với `ng-slot` |
|---|---|
| Không có default content | Default content trực tiếp |
| Selectors phức tạp | Named slots đơn giản |
| Không có slot props | Props API |
| Không tương thích Web Components | Tương thích `<slot>` |

## Ví dụ thực tế

### 1. Basic Slot

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-slot>Default content</ng-slot>
    </div>
  `
})
export class CardComponent {}
```

```html
<!-- Parent: override default -->
<app-card>
  <p>My custom content</p>
</app-card>
```

### 2. Named Slots

```typescript
@Component({
  selector: 'app-dialog',
  template: `
    <div class="dialog">
      <div class="header">
        <ng-slot name="header">Dialog Title</ng-slot>
      </div>
      <div class="body">
        <ng-slot>Dialog body content</ng-slot>
      </div>
      <div class="footer">
        <ng-slot name="footer">
          <button>Close</button>
        </ng-slot>
      </div>
    </div>
  `
})
export class DialogComponent {}
```

```html
<!-- Parent: fill specific slots -->
<app-dialog>
  <ng-slot name="header">
    <h2>Confirm Delete</h2>
  </ng-slot>

  <p>Are you sure you want to delete this item?</p>

  <ng-slot name="footer">
    <button (click)="cancel()">Cancel</button>
    <button (click)="confirm()">Delete</button>
  </ng-slot>
</app-dialog>
```

### 3. With Slot Props

```typescript
@Component({
  selector: 'app-list',
  template: `
    <ul>
      @for (item of items(); track item.id) {
        <li>
          <ng-slot [props]="{ item, index: $index }">
            {{ item.name }}
          </ng-slot>
        </li>
      }
    </ul>
  `
})
export class ListComponent {
  items = input.required<any[]>();
}
```

```html
<!-- Parent: access slot props -->
<app-list [items]="data">
  <ng-slot let-item let-index="index">
    <span>{{ index + 1 }}. {{ item.name }}</span>
    <button (click)="edit(item)">Edit</button>
  </ng-slot>
</app-list>
```

### 4. Layout Component

```typescript
@Component({
  selector: 'app-layout',
  template: `
    <header>
      <ng-slot name="header">
        <nav>Default Navigation</nav>
      </ng-slot>
    </header>
    <main>
      <ng-slot>Main content</ng-slot>
    </main>
    <footer>
      <ng-slot name="footer">
        <p>© 2024 Default Footer</p>
      </ng-slot>
    </footer>
  `
})
export class LayoutComponent {}
```

```html
<!-- Parent: customize layout -->
<app-layout>
  <ng-slot name="header">
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
    </nav>
  </ng-slot>

  <h1>Welcome</h1>
  <p>Page content here</p>

  <ng-slot name="footer">
    <p>© Custom Footer</p>
  </ng-slot>
</app-layout>
```

## Flow chi tiết

```
Parent: <ng-slot name="header">Custom</ng-slot>
        │
        ▼
Child: <ng-slot name="header">Default</ng-slot>
        │
        ▼
Angular check: Parent có slot "header"?
        │
        ├── YES: Render parent content
        │
        └── NO: Render default content
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```html
<!-- Child -->
<div class="card">
  <ng-content select="[header]"></ng-content>
  <ng-content></ng-content>
  <ng-content select="[footer]"></ng-content>
</div>

<!-- Parent -->
<app-card>
  <div header>Custom Header</div>
  <p>Body content</p>
  <div footer>Custom Footer</div>
</app-card>
```

### Sau Angular 20

```html
<!-- Child -->
<div class="card">
  <ng-slot name="header">Default Header</ng-slot>
  <ng-slot>Default Body</ng-slot>
  <ng-slot name="footer">Default Footer</ng-slot>
</div>

<!-- Parent -->
<app-card>
  <ng-slot name="header">Custom Header</ng-slot>
  <p>Body content</p>
  <ng-slot name="footer">Custom Footer</ng-slot>
</app-card>
```

**Lợi ích:**
- ✅ Default content trực tiếp
- ✅ Named slots đơn giản hơn
- ✅ Tương thích Web Components
- ✅ Code rõ ràng hơn
- ✅ Type-safe slot props

## Best practices

1. **Dùng `ng-slot`** thay `ng-content` cho components mới
2. **Set default content** trong `<ng-slot>`
3. **Dùng named slots** cho layout components
4. **Slot props** để share data parent-child
5. **Keep slots simple** — avoid complex logic

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/6_content-projection-ng-slot
npm install
ng serve