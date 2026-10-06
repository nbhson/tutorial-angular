# Directive Composition API (Angular 15)

> Directive Composition API cho phép combine multiple directives trên host element, tương tự multiple inheritance trong OOP.

## Tổng quan

Angular vốn đã cho phép nhiều directives trên 1 element (vd `<div *ngIf appHighlight>`).
Cái mới của v15 là **composition qua `hostDirectives`**: component/directive có thể "mang theo"
behavior của các `standalone` directives khác, kèm khả năng chọn lọc/rename `inputs`/`outputs`,
compiler kiểm tra conflict. Không tạo DOM mới, khác với inheritance.

> Điều kiện official: chỉ `standalone: true` directives mới dùng được trong `hostDirectives`.
> Động lực official: top GitHub feature request, dùng nhiều cho CDK/Material reuse.

## Ví dụ 1: Basic Composition

```ts
// Lưu ý: HasColor, CdkMenu phải là standalone: true mới dùng được trong hostDirectives
@Directive({ selector: '[hasColor]', standalone: true })
export class HasColor { }

@Component({
  selector: 'mat-menu',
  hostDirectives: [HasColor, {
    directive: CdkMenu,
    inputs: ['cdkMenuDisabled: disabled'],
    outputs: ['cdkMenuClosed: closed']
  }]
})
class MatMenu {}
```

Component `MatMenu` kế thừa behavior từ:
- `HasColor` – color management
- `CdkMenu` – menu behavior

## Ví dụ 2: Selective Inputs/Outputs

```ts
@Directive({ selector: '[menuBehavior]', standalone: true })
export class MenuBehavior { }

@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId'],
    outputs: ['menuClosed'],
  }],
})
export class AdminMenu { }
```

```html
<!-- Usage -->
<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()">
```

## Ví dụ 3: Rename Inputs/Outputs

```ts
// MenuBehavior là standalone directive (xem Ví dụ 2)
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId: id'],        // Rename menuId → id
    outputs: ['menuClosed: closed'], // Rename menuClosed → closed
  }],
})
export class AdminMenu { }
```

```html
<!-- Using renamed inputs/outputs -->
<admin-menu id="top-menu" (closed)="logMenuClosed()">
```

## Ví dụ 4: Compose Directives với Directives

```ts
// Base directives
@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective { }

@Directive({ selector: '[appMenu]', standalone: true })
export class MenuDirective { }

// Compose
@Directive({
  selector: '[appMenuWithTooltip]',
  hostDirectives: [TooltipDirective, MenuDirective],
  standalone: true
})
export class MenuWithTooltipDirective { }

// Re-compose
@Directive({
  selector: '[appSpecialMenu]',
  hostDirectives: [MenuWithTooltipDirective],
  standalone: true
})
export class SpecialMenuDirective { }
```

## Ví dụ 5: Selective Inputs Exposing

```ts
@Component({
  selector: 'app-tooltip-wrapper',
  hostDirectives: [{
    directive: TooltipDirective,
    inputs: ['tooltipText: text'],  // Chỉ expose text input
    outputs: ['tooltipShown: shown']
  }],
  template: `<ng-content></ng-content>`
})
export class TooltipWrapperComponent { }
```

```html
<!-- Chỉ có thể set text, không set position từ ngoài -->
<app-tooltip-wrapper text="Hello!">
  <span>Hover me</span>
</app-tooltip-wrapper>
```

## Flow Diagram

```
Traditional (single directive):
  Component → Directive A → Host Element

Composition (multiple directives):
  Component → Directive A ─┐
                          ├→ Host Element
                Directive B ─┘
```

## So sánh với Inheritance

| Feature | Class Inheritance | Directive Composition |
|---------|-------------------|----------------------|
| Coupling | Tight | Loose |
| Reuse | Single parent | Multiple sources |
| Input conflict | Cần rename/expose rõ, nếu không lỗi compile | Compiler báo lỗi nếu trùng mà không xử lý |
| Flexibility | Limited | High |

## Best Practices

1. **Chỉ expose needed inputs** – Không expose tất cả
2. **Rename để tránh conflict** – `menuId: id`
3. **Compose theo behavior** – Mỗi directive = 1 concern
4. **Sử dụng standalone directives** – Bắt buộc cho hostDirectives

---

**Summary**: Directive Composition API là paradigm mới cho code reuse trong Angular. Cho phép combine multiple behaviors trên host element, tương tự multiple inheritance nhưng với conflict resolution từ compiler.