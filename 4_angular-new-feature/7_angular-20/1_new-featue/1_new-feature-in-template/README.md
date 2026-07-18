# 1. `@let` — Local Variables in Templates (Angular 20)

## Tổng quan

Angular 20 giới thiệu `@let` — cho phép khai báo **biến cục bộ ngay trong template** mà **không cần thêm logic vào Component class**. Đây là một phần của initiative "New Features in Templates" nhằm mang更多 power vào template layer.

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

## So sánh trước và sau Angular 20

### Trước Angular 20

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

### Sau Angular 20 (với `@let`)

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

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/1_new-feature-in-template
npm install
ng serve
```

Mở `http://localhost:4200` để xem kết quả.