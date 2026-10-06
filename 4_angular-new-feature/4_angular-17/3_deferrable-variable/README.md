# Deferrable Views (`@defer`)

## Tổng quan

> Note: folder `3_deferrable-variable` đúng ra nên là `deferrable-views` (theo tên `@defer` / deferrable views) — giữ nguyên tên để tránh break link.

`@defer` là một cú pháp template mới trong Angular 17 cho phép lazy loading các components ngay trong template — một bước tiến lớn so với router-based lazy loading. Thay vì phải lazy load cả một route, bạn có thể defer load từng component cụ thể dựa trên triggers như viewport, interaction, hover, timer...

## Cấu trúc files

```
3_deferrable-variable/
├── src/
│   ├── app/
│   │   ├── app.component.html        # Template demo @defer với custom triggers
│   │   ├── app.component.ts          # Component logic với custom trigger conditions
│   │   ├── app.component.scss        # Styles
│   │   ├── components/
│   │   │   ├── large/
│   │   │   │   ├── large.component.html    # Large component template
│   │   │   │   ├── large.component.ts      # Standalone component
│   │   │   │   └── large.component.scss    # Styles
│   │   │   └── large-2/
│   │   │       ├── large-2.component.html  # Large component 2 template
│   │   │       ├── large-2.component.ts    # Standalone component
│   │   │       └── large-2.component.scss  # Styles
│   │   ├── config/
│   │   │   └── app.config.ts         # App configuration
│   │   └── routes/
│   │       └── app.routes.ts         # Routes
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.component.ts` — Component Logic

Demonstrates custom trigger cho `@defer` với hai biến boolean kiểm soát prefetch và display:

```ts
import { Component } from '@angular/core';
import { LargeComponent } from './components/large/large.component';
import { Large2Component } from "./components/large-2/large-2.component";

@Component({
  selector: 'app-root',
  imports: [LargeComponent, Large2Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  load: boolean = false;   // Kiểm soát khi nào prefetch bundle
  show: boolean = false;   // Kiểm soát khi nào hiển thị component

  onLoad() {
    this.load = true;      // Trigger prefetch — bắt đầu tải bundle
  }

  onDisplay() {
    this.show = true;      // Trigger display — hiển thị component
  }
}
```

**Giải thích:**
- `load` — Khi `true`, Angular bắt đầu prefetch bundle (tải về nhưng chưa render)
- `show` — Khi `true`, component được render vào DOM
- Tách biệt prefetch và display cho phép tải bundle trước khi user cần xem

### `src/app/app.component.html` — Template với Custom Triggers

Sử dụng `@defer` với custom triggers (`when`/`prefetch when`):

```html
<!-- Button trigger prefetch — tải bundle trước -->
<button (click)="onLoad()">Trigger Prefetch</button>

<!-- Button trigger display — hiển thị component -->
<button (click)="onDisplay()">Trigger Display</button>

<!-- @defer với custom triggers -->
@defer(when show; prefetch when load) {
    <app-large />
}
```

**Cách hoạt động:**
1. Click "Trigger Prefetch" → `load = true` → Bundle bắt đầu tải về background
2. Click "Trigger Display" → `show = true` → Component được render
3. Nếu click "Display" trước → prefetch sẽ được trigger ngay lập tức

### `src/app/components/large/large.component.ts` — Lazy Loaded Component

Component được lazy load — chỉ tải khi `@defer` trigger:

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-large',
  templateUrl: './large.component.html',
  styleUrls: ['./large.component.scss'],
  standalone: true
})
export class LargeComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    console.log('On Init LargeComponent');
  }
}
```

## Built-in Triggers

### `idle` (mặc định)

```html
<!-- Tương đương với: @defer (on idle; prefetch on idle) -->
@defer {
  <app-large />
}
```
Tải khi browser chuyển sang trạng thái idle (đã tải xong tất cả resources).

### `viewport`

```html
@defer (on viewport) {
  <app-large />
} @placeholder {
  <p>Scroll down to load...</p>
}
```
Tải khi element scroll vào viewport.

### `interaction`

```html
@defer (on interaction) {
  <app-large />
} @placeholder {
  <button>Click to load chart</button>
}
```
Tải khi user click/interact với placeholder element.

### `hover`

```html
@defer (on hover) {
  <app-large />
} @placeholder {
  <span>Hover to preview</span>
}
```
Tải khi user hover lên element.

### `timer`

```html
@defer (on timer(5s)) {
  <app-large />
}
```
Tải sau khoảng thời gian chỉ định (ms hoặc s).

### `immediate`

```html
@defer (on immediate) {
  <app-large />
}
```
Tải ngay lập tức, không chờ bất kỳ event nào.

## Prefetching

Tách biệt tải bundle và hiển thị component:

```html
<!-- Prefetch on viewport (tải khi scroll vào), display on interaction (hiển thị khi click) -->
@defer (on interaction; prefetch on viewport) {
  <app-large />
} @placeholder {
  <input type="text" />
}
```

## Custom Triggers với `when`

```html
@defer (when showChart; prefetch when shouldPreload) {
  <app-large />
}
```

```ts
export class AppComponent {
  showChart = signal(false);
  shouldPreload = signal(false);
}
```

## Sub-blocks: `@placeholder`, `@loading`, `@error`

```html
@defer (on interaction) {
  <app-large />
} @placeholder (minimum 2s) {
  <div>Click to load chart</div>
} @loading (after 500ms; minimum 1s) {
  <spinner />
} @error {
  <p>Failed to load. Please try again.</p>
}
```

| Sub-block | Mô tả |
|-----------|-------|
| `@placeholder` | Nội dung hiển thị trước khi bundle load (eager loaded) |
| `@loading` | Hiển thị trong khi bundle đang tải (eager loaded) |
| `@error` | Hiển thị khi bundle load thất bại |

## `@defer` vs `@if`

| Aspect | `@defer` | `@if` |
|--------|----------|-------|
| Mục đích | Lazy load components | Conditional rendering |
| Bundle | Tách thành bundle riêng | Không tách bundle |
| Quay lại | Không thể ẩn sau khi render | Có thể toggle |
| Component type | Chỉ standalone components | Bất kỳ component nào |

## Lưu ý quan trọng

- `@defer` chỉ hỗ trợ **standalone components**
- Components trong `@placeholder` và `@loading` vẫn được **eager loaded**
- `@defer` ≠ `@if`: một khi đã render, không thể ẩn lại bằng `@defer`
- Nếu cần ẩn/hiện, kết hợp cả hai (sibling đúng — không lồng `@placeholder` vào trong `@if`):

```html
@defer (on interaction) {
  @if (someCondition) {
    <large-component />
  }
} @placeholder {
  <placeholder-component />
}
```

- `on viewport` cần `@placeholder` hoặc template ref (`#ref` + `on viewport(ref)`) để làm target quan sát
- `prefetch` chỉ tải bundle (fetch), còn trigger chính mới render — tách biệt fetch/render để tối ưu UX
- Testing: dùng `withDeferBlockBehavior(DeferBlockBehavior.Manual)` trong TestBed để control thủ công

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular @defer Guide](https://angular.dev/guide/templates/defer)
- [Angular @defer Deep Dive](https://blog.angular-university.io/angular-defer/)