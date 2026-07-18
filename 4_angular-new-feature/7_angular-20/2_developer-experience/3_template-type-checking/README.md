# 3. Template Type Checking (Angular 20)

## Tổng quan

Angular 20 cải thiện **Template Type Checking** — cho phép kiểm tra types trong template chính xác hơn, bắt lỗi sớm hơn khi build. Đây là improvement lớn cho developer experience, giúp tránh runtime errors.

## API mới

```typescript
// tsconfig.json - stricter template checking
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInputAccessModifiers": true,
    "strictInjectionParameters": true
  }
}
```

## Tại sao cần feature này?

| Vấn đề | Giải thích |
|---|---|
| **Runtime errors** | Template errors chỉ xuất hiện khi chạy app |
| **Loose typing** | Template không check types nghiêm ngặt |
| **IDE support** | Không có autocomplete trong template |
| **Refactoring** | Rename property trong class không update template |

Angular 20 cải thiện:
- Stricter template type checking
- Better error messages
- Improved IDE integration
- Safe refactoring

## Ví dụ thực tế

### 1. Strict Input Type Checking

```typescript
// component.ts
@Component({
  selector: 'app-user',
  template: `
    <p>{{ user.name }}</p>
    <p>{{ user.age }}</p>
  `
})
export class UserComponent {
  @Input({ required: true }) user!: { name: string; age: number };
}
```

```html
<!-- Template - Angular check types -->
<app-user [user]="{ name: 'John', age: 30 }"></app-user>

<!-- ❌ Error: Property 'email' does not exist -->
<app-user [user]="{ name: 'John', email: 'test' }"></app-user>

<!-- ❌ Error: Type 'string' is not assignable to type 'number' -->
<app-user [user]="{ name: 'John', age: '30' }"></app-user>
```

### 2. Safe Method Calls

```typescript
// component.ts
@Component({
  selector: 'app-list',
  template: `
    <p>{{ items.length }}</p>
    <p>{{ getFirstItem().name }}</p>
  `
})
export class ListComponent {
  items: Item[] = [];

  getFirstItem(): Item | undefined {
    return this.items[0];
  }
}
```

```html
<!-- ✅ Angular 20 safe null checks -->
<p>{{ getFirstItem()?.name }}</p>

<!-- ❌ Error: Object is possibly 'undefined' -->
<p>{{ getFirstItem().name }}</p>
```

### 3. Directive Type Checking

```typescript
// directive.ts
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() highlightColor = 'yellow';
}
```

```html
<!-- ✅ Correct usage -->
<div appHighlight [highlightColor]="'red'"></div>

<!-- ❌ Error: Type 'number' is not assignable to type 'string' -->
<div appHighlight [highlightColor]="123"></div>
```

### 4. Two-way Binding Safety

```typescript
// component.ts
@Component({
  selector: 'app-form',
  template: `
    <input [(ngModel)]="name" />
    <p>{{ name }}</p>
  `
})
export class FormComponent {
  name = '';
}
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// tsconfig.json - loose checking
{
  "angularCompilerOptions": {
    "strictTemplates": false  // Ít error checking
  }
}

// Template errors chỉ xuất hiện khi chạy
@Component({
  template: `<p>{{ nonExistentProperty }}</p>` // ❌ Runtime error!
})
export class MyComponent {}
```

### Sau Angular 20

```typescript
// tsconfig.json - strict checking
{
  "angularCompilerOptions": {
    "strictTemplates": true  // Build-time error checking
  }
}

// Template errors xuất hiện khi build
@Component({
  template: `<p>{{ nonExistentProperty }}</p>` // ❌ Build error!
})
export class MyComponent {}
```

**Lợi ích:**
- ✅ Catch errors khi build, không phải runtime
- ✅ Better IDE support (autocomplete, errors)
- ✅ Safe refactoring
- ✅ Better code quality

## Best practices

1. **Bật `strictTemplates: true`** trong tsconfig.json
2. **Dùng `@Input({ required: true })`** cho required inputs
3. **Handle null values** trong template
4. **Update templates** khi refactor component
5. **Use strict TypeScript config**

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/2_developer-experience/3_template-type-checking
npm install
ng serve