# 7. Encapsulation quanh v20 (đã hiệu chỉnh — mới là `IsolatedShadowDom` experimental)

> Đính chính toàn file: `ViewEncapsulation.None/Emulated/ShadowDom` có từ lâu.
> `encapsulation: 'none'` KHÔNG phải native CSS mới.
> Mới quanh v20 là **`IsolatedShadowDom` (experimental)** — Shadow DOM cô lập hơn
> cho style isolation mà vẫn tương thích Angular (xem release notes v20).

## API đúng

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-widget',
  template: `<div class="widget">...</div>`,
  styles: [`.widget { color: red; }`],
  // Có từ lâu — không phải mới v20:
  encapsulation: ViewEncapsulation.Emulated, // default
  // encapsulation: ViewEncapsulation.None,  // global — có từ lâu
  // encapsulation: ViewEncapsulation.ShadowDom, // có từ lâu
  // Mới quanh v20 (experimental): IsolatedShadowDom
})
export class WidgetComponent {}
```

**Encapsulation — trạng thái đúng:**

| Option | Trạng thái |
|---|---|
| `ViewEncapsulation.Emulated` | Default, có từ lâu |
| `ViewEncapsulation.None` | Global styles, có từ lâu — KHÔNG phải mới v20 |
| `ViewEncapsulation.ShadowDom` | Có từ lâu |
| `IsolatedShadowDom` | Mới quanh v20, **experimental** |

## Tại sao cần feature này?

| Vấn đề | Giải thích |
|---|---|
| **Emulated scoped** | Một số CSS features không hoạt động (`:host`, `::part`) |
| **Shadow DOM** | Browser support không đầy đủ |
| **Global styles** | Conflict với styles khác |

Angular 20 cải thiện `encapsulation: 'none'`:
- Better compatibility với CSS libraries
- Support modern CSS features
- Shadow DOM fallback

## Ví dụ thực tế

### 1. Basic None

```typescript
@Component({
  selector: 'app-widget',
  template: `
    <div class="widget">
      <h3>{{ title() }}</h3>
      <ng-content />
    </div>
  `,
  styles: [`
    /* Global styles - áp dụng cho toàn app */
    .widget {
      border: 1px solid #ccc;
      padding: 16px;
      border-radius: 8px;
    }
    .widget h3 {
      color: #333;
      margin: 0 0 8px;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class WidgetComponent {
  title = input<string>('');
}
```

### 2. ShadowDom

```typescript
@Component({
  selector: 'app-shadow-widget',
  template: `
    <div class="shadow-widget">
      <h3>{{ title() }}</h3>
      <ng-content />
    </div>
  `,
  styles: [`
    /* Shadow DOM encapsulation */
    .shadow-widget {
      border: 2px solid #007bff;
      padding: 16px;
      border-radius: 8px;
    }
    :host {
      display: block;
      margin: 8px;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ShadowWidgetComponent {
  title = input<string>('');
}
```

### 3. Mixed Encapsulation

```typescript
// Component với encapsulation khác nhau
@Component({
  selector: 'app-parent',
  template: `
    <app-widget title="Scoped Widget">
      <p>This uses emulated encapsulation</p>
    </app-widget>

    <app-shadow-widget title="Shadow Widget">
      <p>This uses Shadow DOM encapsulation</p>
    </app-shadow-widget>
  `,
  encapsulation: ViewEncapsulation.Emulated
})
export class ParentComponent {}
```

### 4. CSS Variables with ShadowDom

```typescript
@Component({
  selector: 'app-themed',
  template: `
    <div class="themed">
      <h3>{{ title() }}</h3>
      <ng-content />
    </div>
  `,
  styles: [`
    .themed {
      background: var(--widget-bg, #fff);
      color: var(--widget-color, #333);
      border: 1px solid var(--widget-border, #ccc);
      padding: 16px;
      border-radius: 8px;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ThemedComponent {
  title = input<string>('');
}
```

```css
/* Parent styles - CSS variables pass through Shadow DOM */
:host {
  --widget-bg: #f0f0f0;
  --widget-color: #007bff;
  --widget-border: #007bff;
}
```

## Flow chi tiết

```
Component with encapsulation: None
        │
        ▼
Angular không inject style scopes
        │
        ▼
CSS classes applied globally
        │
        ▼
Component styles affect entire app
        │
        ├── Advantages: Full CSS features
        └── Disadvantages: Potential conflicts
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
@Component({
  selector: 'app-widget',
  template: `<div class="widget">...</div>`,
  styles: [`.widget { color: red; }`],
  encapsulation: ViewEncapsulation.None  // Global styles
})
export class WidgetComponent {}

// ❌ Shadow DOM component không hoạt động tốt
@Component({
  selector: 'app-shadow',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ShadowComponent {}
```

### Sau Angular 20

```typescript
@Component({
  selector: 'app-widget',
  template: `<div class="widget">...</div>`,
  styles: [`.widget { color: red; }`],
  encapsulation: ViewEncapsulation.None  // Better global styles
})
export class WidgetComponent {}

// ✅ Shadow DOM hoạt động tốt hơn
@Component({
  selector: 'app-shadow',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ShadowComponent {}
```

**Lợi ích:**
- ✅ Better Shadow DOM support
- ✅ CSS variables pass-through
- ✅ Modern CSS compatibility
- ✅ Mixed encapsulation trong app

## Best practices

1. **Dùng `Emulated`** cho大多数 components
2. **Dùng `None`** khi cần global styles
3. **Dùng `ShadowDom`** cho independent widgets
4. **CSS variables** để customize từ bên ngoài
5. **Test encapsulation** khi dùng Shadow DOM

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/3_api-stability-changes/7_css-native-encapsulation
npm install
ng serve