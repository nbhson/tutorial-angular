# `styleUrl` & `styles` as Strings

## Tổng quan

Angular 17 đơn giản hóa cách khai báo styles trong `@Component` decorator — cho phép sử dụng **string thay vì array** khi chỉ có một stylesheet. Đây là cải thiện ergonomics nhỏ nhưng cực kỳ hữu ích trong daily development.

Trước đây, dù chỉ dùng 1 file CSS, bạn vẫn phải khai báo trong array (`styleUrls: ['styles.css']`). Bây giờ có thể dùng `styleUrl: 'styles.css'` trực tiếp.

## Cấu trúc files

```
8_style-and styleUrls-as-strings/
├── src/
│   ├── app/
│   │   ├── app.component.html          # Root template
│   │   ├── app.component.ts            # Root component — demo styleUrl & styles
│   │   ├── app.component.scss          # External stylesheet
│   │   ├── config/
│   │   │   └── app.config.ts           # App configuration
│   │   └── routes/
│   │       └── app.routes.ts           # Routes
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.component.ts` — Component với String Styles

Demonstrates cả hai cải tiến: `styles` (inline) và `styleUrl` (external) đều dùng string:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: `
    h2 {
      color: red;
      font-size: 24px;
    }
  `,
  styleUrl: './app.component.scss',  // string thay vì array!
})
export class AppComponent {
}
```

**Giải thích:**
- `styles` — String thay vì array: `` styles: `h2 { color: red; }` `` thay vì `` styles: [`h2 { color: red; }`] ``
- `styleUrl` — String thay vì array: `styleUrl: './app.component.scss'` thay vì `styleUrls: ['./app.component.scss']`

## So sánh旧 vs New

### Inline Styles

```ts
//旧 syntax — array (vẫn support)
@Component({
  styles: [`
    h2 {
      color: red;
      font-size: 24px;
    }
  `]
})

// New syntax — string gọn hơn
@Component({
  styles: `
    h2 {
      color: red;
      font-size: 24px;
    }
  `
})
```

### External Stylesheets

```ts
//旧 syntax — array (vẫn support)
@Component({
  styleUrls: ['styles.css']
})

// New syntax — string gọn hơn
@Component({
  styleUrl: 'styles.css'    // styleUrl (không có s) + string
})
```

### Multiple Stylesheets — Vẫn dùng array

```ts
// Nếu cần nhiều files, vẫn dùng array như cũ
@Component({
  styleUrls: ['styles.css', 'theme.css']
})
```

## Bảng so sánh

|旧 Syntax | New Syntax | Khi nào dùng |
|-----------|------------|---------------|
| `` styles: [`...`] `` | `` styles: `...` `` | Chỉ 1 inline style block |
| `styleUrls: ['file.css']` | `styleUrl: 'file.css'` | Chỉ 1 external stylesheet |
| `styleUrls: ['a.css', 'b.css']` | `styleUrls: ['a.css', 'b.css']` | Nhiều files → vẫn array |

## Ưu điểm

1. **Gọn hơn** — Bỏ square brackets không cần thiết
2. **Intuitive hơn** — String cho single value, array cho multiple values
3. **Better formatting** — Automated formatting tools hoạt động tốt hơn với string
4. **Backward compatible** —旧 syntax vẫn hoạt động

## Lưu ý quan trọng

1. **`styleUrl`** (không có s) — Chỉ 1 file, dùng string
2. **`styleUrls`** (có s) — Nhiều files, dùng array
3. **`styles`** (không có s ở cuối) — Inline styles, có thể dùng string hoặc array
4. **Vẫn tương thích** —旧 array syntax vẫn hoạt động bình thường
5. **Angular 17+** — Tính năng này chỉ có từ Angular 17 trở đi

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular Component Styles](https://angular.dev/guide/components/styles)
- [Introducing Angular v17](https://blog.angular.dev/introducing-angular-v17-4d7033312e4b)