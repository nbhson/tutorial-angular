# 1. linkedSignal

## Mô tả

`linkedSignal` là một Signal mới trong Angular 19 — kết hợp giữa `signal` (có thể ghi) và `computed` (reactive). Nó cho phép tạo một **writable signal** tự động reset giá trị khi source signal thay đổi, nhưng vẫn có thể set thủ công.

## Vấn đề giải quyết

Trước Angular 19, nếu bạn muốn một derived value có thể override:
- `computed()` → **read-only**, không thể set thủ công
- `signal()` → **không tự động recompute** khi source thay đổi

`linkedSignal()` là cầu nối hoàn hảo giữa hai khái niệm này.

## Cú pháp

```ts
// Dạng options đầy đủ
linkedSignal<S, D>({
  source: () => S,
  computation: (source: S, previous?: { source: S; value: D }) => D,
  equal?: ValueEqualityFn<D>,
  debugName?: string,
}): WritableSignal<D>

// Dạng shorthand — computation trực tiếp (không cần source tách riêng)
linkedSignal<D>(computation: () => D, options?: {
  equal?: ValueEqualityFn<D>,
  debugName?: string,
}): WritableSignal<D>
```

> `linkedSignal` ra mắt ở v19 dưới dạng **experimental**, trở thành **stable từ v20**.
> `equal` dùng để custom so sánh (tránh re-emit khi giá trị tương đương), `debugName` dùng cho debugging trong DevTools.

## Files trong project

### `src/app/app.component.ts` — Component chính

```ts
import { Component, linkedSignal, signal } from '@angular/core';

interface Color {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Source signal — danh sách màu sắc
  readonly colorOptions = signal<Color[]>([
    { id: 1, name: 'Red' },
    { id: 2, name: 'Green' },
    { id: 3, name: 'Blue' },
  ]);

  // linkedSignal — ID màu yêu thích
  favoriteColorId = linkedSignal<Color[], number | null>({
    source: this.colorOptions,
    computation: (source, previous) => {
      // previous có shape { source: S; value: D } — KHÔNG phải previous?.value optional-chain sai kiểu
      // nên đọc previous.value (kiểm tra previous tồn tại trước)
      if (previous && previous.value !== null) {
        return source.some(color => color.id === previous.value)
          ? previous.value
          : null;
      }
      return null;
    },
    equal: (a, b) => a === b, // optional — custom equality
  });

  // Dạng shorthand — không cần source tách riêng:
  // greeting = linkedSignal(() => `Hello ${this.colorOptions().length} colors`);

  // Set thủ công — WritableSignal
  onFavoriteColorChange(colorId: number): void {
    this.favoriteColorId.set(colorId);
  }

  // Thay đổi source → linkedSignal tự động recompute
  changeColorOptions(): void {
    this.colorOptions.set([
      { id: 1, name: 'Red' },
      { id: 4, name: 'Yellow' },
      { id: 5, name: 'Orange' },
    ]);
  }
}
```

### `src/app/app.component.html` — Template

```html
<div>
  <h3>Color Options:</h3>
  @for (color of colorOptions(); track color.id) {
    <button (click)="onFavoriteColorChange(color.id)">
      {{ color.name }}
    </button>
  }
</div>

<p>Selected: {{ favoriteColorId() }}</p>
<button (click)="changeColorOptions()">Change Options</button>
```

## Cách hoạt động chi tiết

```
Bước 1: colorOptions = [Red(1), Green(2), Blue(3)]
         → favoriteColorId = null (chưa chọn)

Bước 2: onFavoriteColorChange(3) → set Blue
         → favoriteColorId = 3

Bước 3: changeColorOptions() → [Red(1), Yellow(4), Orange(5)]
         → Blue(3) không còn trong source
         → computation() → return null (auto reset!)
```

## So sánh với các API khác

| Feature | signal() | computed() | linkedSignal() |
|---------|----------|------------|----------------|
| Có thể ghi | ✅ | ❌ | ✅ |
| Tự động recompute | ❌ | ✅ | ✅ |
| Track dependency | ❌ | ✅ | ✅ |
| Override thủ công | ✅ | ❌ | ✅ |

## Khi nào dùng linkedSignal?

- **Form state** cần reset khi source thay đổi (ví dụ: danh sách item thay đổi → reset selection)
- **Derived state** cần override thủ công
- **UI state** phụ thuộc data nhưng user có thể customize

> Lưu ý version: `linkedSignal` là **experimental trong v19**, **stable từ v20**. API `previous` luôn có dạng `{ source, value }` — đọc `previous.value` (sau khi check `previous` tồn tại), không dùng `previous?.value` như truthy-check cho `0`/`''` vì sẽ bỏ qua giá trị falsy hợp lệ.

## Reference

- [Angular 19 Release — linkedSignal](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [What's New in Angular 19](https://angular.love/angular-19-whats-new)
- [linkedSignal API Docs](https://angular.dev/api/core/linkedSignal)