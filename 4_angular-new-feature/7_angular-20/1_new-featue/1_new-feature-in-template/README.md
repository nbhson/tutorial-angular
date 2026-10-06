# 1. `@let` — Local Variables in Templates (ra mắt v18.1, KHÔNG phải v20)

> Đính chính: `@let` ra mắt **v18.1**, KHÔNG phải v20. File này giữ lại để dùng đúng,
> không liệt kê như "mới v20".
> Nguồn: https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301,
> https://github.com/angular/angular/releases/tag/20.0.0

## Tổng quan

`@let` cho phép khai báo **biến cục bộ ngay trong template** mà **không cần thêm logic vào Component class**.

## API mới

```
@let <tên> = <biểu thức>;
```

`@let` khai báo một biến cục bộ trong template, giá trị được tính toán và **tự động cập nhật** khi binding thay đổi. Biến chỉ có hiệu lực trong phạm vi block mà nó được khai báo (`@if`, `@for`, `@switch`, hoặc root template).

## Tại sao cần `@let`?

Trước Angular 20, nếu bạn muốn tái sử dụng một giá trị computed trong template, bạn có hai lựa chọn đều có nhược điểm:

| Cách làm | Nhược điểm |
|---|---|
| Tính lại expression nhiều lần trong template | Code trùng lặp, kém maintainable |
| Tạo thêm property/method trong Component class | Component tăng thêm code, tăng coupling |

`@let` giải quyết vấn đề này bằng cách cho phép bạn khai báo biến cục bộ trực tiếp trong template.

## Ví dụ thực tế

### Component (`app.ts`)

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly attacks = [
    { magicDamage: 10 },
    { physicalDamage: 10 },
    { magicDamage: 10, physicalDamage: 10 },
  ];
}
```

### Template (`app.html`)

```html
@for (attack of attacks; track attack) {
  @let hasMagicDamage = 'magicDamage' in attack;
  @if (hasMagicDamage) {
    <p>{{ `Dealt ${attack.magicDamage} points of magic damage.` }}</p>
  }
  @let hasPhysicalDamage = 'physicalDamage' in attack;
  @if (hasPhysicalDamage) {
    <p>{{ `Dealt ${attack.physicalDamage} points of physical damage.` }}</p>
  }
}
```

### Kết quả xuất ra

```
Dealt 10 points of magic damage.
Dealt 10 points of physical damage.
Dealt 10 points of magic damage.
Dealt 10 points of physical damage.
```

## Phân tích chi tiết

### 1. `@let` khai báo biến cục bộ

```html
@let hasMagicDamage = 'magicDamage' in attack;
```

- `'magicDamage' in attack` là một **JavaScript expression** kiểm tra key `magicDamage` có tồn tại trong object `attack`
- `hasMagicDamage` là biến cục bộ, **tự động cập nhật** khi `attack` thay đổi
- Biến **chỉ sống trong scope** của `@for` block

### 2. Kết hợp với `@if`

```html
@if (hasMagicDamage) {
  <p>{{ `Dealt ${attack.magicDamage} points of magic damage.` }}</p>
}
```

- `@if` sử dụng biến `hasMagicDamage` để quyết định render hay không
- Template string `` {{ `Dealt ${attack.magicDamage} points of magic damage.` }} `` hiển thị giá trị damage

### 3. Pattern "check key existence"

```typescript
// JavaScript 'in' operator kiểm tra key existence
'magicDamage' in attack  // → true nếu attack có key magicDamage
'physicalDamage' in attack // → true nếu attack có key physicalDamage
```

Đây là pattern phổ biến khi xử lý **union types** hoặc **optional properties** trong template.

## So sánh trước và sau v18.1

### Trước v18.1

```typescript
// Component class - phải thêm logic
export class App {
  readonly attacks = [
    { magicDamage: 10 },
    { physicalDamage: 10 },
    { magicDamage: 10, physicalDamage: 10 },
  ];

  // Phải tạo method trong class
  hasMagicDamage(attack: any): boolean {
    return 'magicDamage' in attack;
  }

  hasPhysicalDamage(attack: any): boolean {
    return 'physicalDamage' in attack;
  }
}
```

```html
<!-- Template - gọi method -->
@for (attack of attacks; track attack) {
  @if (hasMagicDamage(attack)) {
    <p>{{ `Dealt ${attack.magicDamage} points of magic damage.` }}</p>
  }
  @if (hasPhysicalDamage(attack)) {
    <p>{{ `Dealt ${attack.physicalDamage} points of physical damage.` }}</p>
  }
}
```

### Sau v18.1 (với `@let`)

```typescript
// Component class - giữ nguyên, gọn gàng
export class App {
  readonly attacks = [
    { magicDamage: 10 },
    { physicalDamage: 10 },
    { magicDamage: 10, physicalDamage: 10 },
  ];
}
```

```html
<!-- Template - khai báo biến cục bộ -->
@for (attack of attacks; track attack) {
  @let hasMagicDamage = 'magicDamage' in attack;
  @if (hasMagicDamage) {
    <p>{{ `Dealt ${attack.magicDamage} points of magic damage.` }}</p>
  }
  @let hasPhysicalDamage = 'physicalDamage' in attack;
  @if (hasPhysicalDamage) {
    <p>{{ `Dealt ${attack.physicalDamage} points of physical damage.` }}</p>
  }
}
```

## Các use case phổ biến

### 1. Tái sử dụng giá trị computed

```html
@let total = items.length;
@if (total > 0) {
  <p>Có {{ total }} sản phẩm</p>
} @else {
  <p>Không có sản phẩm</p>
}
```

### 2. Cache giá trị expensive computation

```html
@let formattedPrice = (product.price * (1 - product.discount / 100)) | currency:'VND';
<span>{{ formattedPrice }}</span>
<span>{{ formattedPrice }}</span>
```

### 3. Kiểm tra điều kiện phức tạp

```html
@let isLoggedIn = user !== null && user.isActive;
@let isAdmin = isLoggedIn && user.role === 'admin';
@if (isAdmin) {
  <admin-panel />
}
```

### 4. Local variable trong `@for`

```html
@for (item of items; track item.id) {
  @let isEven = $index % 2 === 0;
  <div [class.even]="isEven">
    {{ item.name }}
  </div>
}
```

## Scope rules

- `@let` chỉ có hiệu lực trong **block** mà nó được khai báo
- Không thể truy cập `@let` ở **ngoài block** khai báo nó
- Tên biến phải **duy nhất** trong scope

```html
@if (condition) {
  @let value = 1;
  <p>{{ value }}</p>  <!-- ✅ OK -->
}
<p>{{ value }}</p>  <!-- ❌ Error: value không tồn tại -->
```

## `@let` có vi phạm nguyên tắc "HTML chỉ view, logic nằm trong TS" không?

### Nguyên tắc Separation of Concerns (SoC)

Nguyên tắc gốc: **View chỉ render, logic nằm trong TypeScript**. Đây là nguyên tắc đúng, nhưng cần hiểu **đúng bản chất** của "logic" trong template.

### Template ĐÃ LUÔN chứa logic — từ trước khi có `@let`

```html
<!-- @if / @else — logic điều kiện -->
@if (isLoggedIn()) {
  <p>Xin chào</p>
} @else {
  <p>Vui lòng đăng nhập</p>
}

<!-- @for — logic lặp -->
@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
}

<!-- Pipe — logic transform -->
<p>{{ price | currency:'VND' }}</p>

<!-- Ternary — logic điều kiện inline -->
<p>{{ isLoggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập' }}</p>

<!-- Method call — logic trong template -->
<p>{{ formatName(user) }}</p>
```

`@let` **không tạo paradigm mới** — nó chỉ chính thức hóa pattern mà developers đã dùng từ lâu.

### Phân biệt 2 loại "logic"

| Loại | Ví dụ | Nên ở đâu? |
|------|-------|------------|
| **Presentation logic** | `fullName = first + ' ' + last`, conditional display, computed display values | ✅ Template (view) |
| **Business logic** | API calls, state management, validation rules, data transformation phức tạp | ✅ TypeScript / Services |

`@let` thuộc về **presentation logic** — nó chỉ tính toán giá trị để **hiển thị**, không thay đổi trạng thái hay thực hiện side-effect.

```html
<!-- ✅ Presentation logic: tính toán để hiển thị -->
@let fullName = firstName() + ' ' + lastName();
@let total = items().reduce((sum, item) => sum + item.price, 0);
<p>{{ fullName }} — Tổng: {{ total }}</p>

<!-- ❌ Business logic: KHÔNG nên ở template (và cũng không được phép) -->
@let result = http.post('/api/save', data);  // ❌ Không thực hiện được
```

### `@let` thực ra CẢI THIỆN SoC

**Cách cũ** (trước khi có `@let`) — Component bị "bẩn" bởi presentation logic:

```typescript
// Component class - bị buộc phải thêm property chỉ vì template cần
export class AppComponent {
  // Business logic
  user = signal<User | null>(null);

  // ❌ Presentation logic bị "lạc" vào class
  get fullName(): string {
    return this.user()?.firstName + ' ' + this.user()?.lastName;
  }
  get isLoggedIn(): boolean {
    return this.user() !== null;
  }
  get displayItems(): string {
    return this.items().length + ' sản phẩm';
  }
}
```

**Cách mới** với `@let` — Component class sạch hơn:

```typescript
// Component class - chỉ chứa business logic
export class AppComponent {
  user = signal<User | null>(null);
  items = signal<Item[]>([]);
}
```

```html
<!-- Template - presentation logic nằm đúng chỗ -->
@let fullName = user()?.firstName + ' ' + user()?.lastName;
@let isLoggedIn = user() !== null;
@let displayItems = items().length + ' sản phẩm';
```

### `@let` KHÔNG THỂ thay thế business logic

`@let` bị ràng buộc bởi các giới hạn cố hữu của template:
- **Không thể** gọi HTTP request
- **Không thể** thay đổi state / mutation
- **Không thể** thực hiện side-effect
- **Chỉ có thể** tạo alias / computed value cho display

→ Về bản chất, **Angular template system đã giới hạn** `@let` chỉ dùng được cho presentation logic.

### Kết luận

```
@let KHÔNG vi phạm nguyên tắc SoC vì:

1. Presentation logic THUỘC VỀ view
   → @let chỉ xử lý presentation logic (computed display values)

2. @let CẢI THIỆN SoC
   → Giữ presentation logic trong template thay vì pollute component class
   → Component class chỉ chứa business logic thực sự

3. Angular template ĐÃ LUÔN chứa logic:
   @if, @for, pipes, ternary operators, method calls...
   @let chỉ là cách hợp lệ để xử lý presentation logic

4. @let KHÔNG THỂ replace business logic
   → Template system đã giới hạn: không side-effect, không state mutation
```

> **Quy tắc thực tế**: Nếu logic đó **chỉ phục vụ việc hiển thị** và **không có side-effect**, nó **thuộc về view** — dù bạn đặt trong `@let`, binding expression, hay template method.

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/1_new-feature-in-template
npm install
ng serve
```

Mở `http://localhost:4200` để xem kết quả.