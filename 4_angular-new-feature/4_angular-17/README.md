# Angular 17 New Features

Tổng hợp các feature mới trong Angular 17. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### I. Rendering & Control Flow

Angular 17 đại cải thiện rendering và introduces built-in control flow — một bước ngoặt lớn trong cách viết template:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Hydration](1_hyration/) | Incremental hydration cho SSR apps, cải thiện performance đáng kể |
| 2 | [Built-in Control Flow](2_built-in-control-flow/) | `@if`, `@for`, `@switch` thay thế `*ngIf`, `*ngFor`, `*ngSwitch` |
| 3 | [Deferrable Views](3_deferrable-variable/) | `@defer` loading components on-demand với nhiều triggers |

### II. Lifecycle & Performance

| # | Feature | Mô tả |
|---|---------|-------|
| 4 | [`afterRender` / `afterNextRender`](4_afterRender-afterNextRender/) | Lifecycle hooks mới cho DOM access sau render |
| 5 | [Vite & esBuild Default](5_vite-and-esbuild-the-default-for-new-projects/) | Build system mới mặc định, nhanh hơn 67-87% |
| 6 | [Experimental View Transitions](6_experimental-view-transitions-support/) | Page transition animations dùng View Transitions API |

### III. Templates & Styling

| # | Feature | Mô tả |
|---|---------|-------|
| 7 | [Input Value Transforms](7_input-value-transforms/) | Transform input values khi set với `booleanAttribute` |
| 8 | [Style & styleUrls as Strings](8_style-and styleUrls-as-strings/) | `styleUrl` (string) thay vì `styleUrls` (array) |

---

## Chi tiết từng feature

### 1. Hydration

Hydration là cơ chế cho phép Angular tái sử dụng DOM đã render trên server thay vì render lại từ đầu trên client. Angular 17 cải thiện hydration với incremental approach.

```ts
// app.config.ts — Client-side hydration
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()) // Kích hoạt hydration
  ]
};
```

```ts
// app.config.server.ts — Server-side rendering
import { provideServerRendering } from '@angular/platform-server';
import { mergeApplicationConfig } from '@angular/core';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(), // Cung cấp SSR
  ]
};
export const config = mergeApplicationConfig(appConfig, serverConfig);
```

**Lợi ích:**
- Giảm đáng kể thời gian TTI (Time to Interactive)
- `withEventReplay()` — Replay user interactions xảy ra trong quá trình hydration
- Tránh flickering khi client接管

---

### 2. Built-in Control Flow (`@if`, `@for`, `@switch`)

Angular 17 giới thiệu cú pháp control flow mới trong template, gọn hơn và performant hơn so với structural directives cũ.

#### `@if` / `@else if` / `@else`

```html
<!--旧 syntax -->
<!-- <div *ngIf="a > b">{{a}} is greater than {{b}}</div> -->

<!-- New syntax — gọn hơn, không cần import NgIf -->
@if (a > b) {
  <p>{{a}} is greater than {{b}}</p>
} @else if (b > a) {
  <p>{{a}} is less than {{b}}</p>
} @else {
  <p>{{a}} is equal to {{b}}</p>
}
```

**Aliasing — lưu kết quả condition:**

```html
@if (user.profile.settings.startDate; as startDate) {
  <p>Start date: {{ startDate }}</p>
}
```

#### `@for` với `track`

```html
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>No items available.</li>
}
```

**Contextual variables có sẵn trong `@for`:**

| Variable | Meaning |
|----------|---------|
| `$count` | Số lượng items |
| `$index` | Index hiện tại |
| `$first` | Có phải phần tử đầu tiên |
| `$last` | Có phải phần tử cuối |
| `$even` | Index có chẵn không |
| `$odd` | Index có lẻ không |

```html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p [class.even]="e">Item #{{ idx }}: {{ item.name }}</p>
}
```

#### `@switch`

```html
@switch (accessLevel) {
  @case ('admin') { <admin-dashboard /> }
  @case ('moderator') { <moderator-dashboard /> }
  @default { <user-dashboard /> }
}
```

**Tại sao tốt hơn?**
- Không cần import `NgIf`, `NgFor`, `NgSwitch`
- Angular compiler optimizes better với built-in syntax
- `track` trong `@for` giúp Angular maintain DOM-node relationship efficiently

---

### 3. Deferrable Views (`@defer`)

`@defer` cho phép lazy loading các components ngay trong template — một bước tiến lớn so với router-based lazy loading.

#### Cơ bản

```html
<h2>Main content always displayed</h2>

@defer {
  <app-large />
}
```

Angular sẽ tự động tách `<app-large />` thành bundle riêng và tải khi browser idle (mặc định).

#### Triggers (Built-in)

```html
<!-- idle: mặc định, tải khi browser idle -->
@defer (on idle) { <app-large /> }

<!-- viewport: tải khi element scroll vào viewport -->
@defer (on viewport) {
  <app-large />
} @placeholder {
  <p>Scroll down to load...</p>
}

<!-- interaction: tải khi user click/interact -->
@defer (on interaction) {
  <app-large />
} @placeholder {
  <button>Click to load chart</button>
}

<!-- hover: tải khi user hover -->
@defer (on hover) {
  <app-large />
} @placeholder {
  <span>Hover to preview</span>
}

<!-- timer: tải sau khoảng thời gian -->
@defer (on timer(5s)) { <app-large /> }

<!-- immediate: tải ngay lập tức -->
@defer (on immediate) { <app-large /> }
```

#### Prefetching & Custom Triggers

```html
<!-- Prefetch on viewport, display on interaction -->
@defer (on interaction; prefetch on viewport) {
  <app-large />
} @placeholder {
  <input type="text" />
}
```

```ts
// Custom triggers với when
export class AppComponent {
  showChart = signal(false);
  shouldPreload = signal(false);
}
```

```html
@defer (when showChart; prefetch when shouldPreload) {
  <app-large />
}
```

#### Sub-blocks: `@placeholder`, `@loading`, `@error`

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

**Lưu ý:**
- `@defer` chỉ hỗ trợ **standalone components**
- Components trong `@placeholder` và `@loading` vẫn được **eager loaded**
- `@defer` ≠ `@if`: một khi đã render, không thể ẩn lại bằng `@defer`

---

### 4. `afterRender` / `afterNextRender`

Hai lifecycle hooks mới giúp truy cập DOM sau khi render — thay thế `ngAfterViewInit` cho nhiều use cases.

```ts
import { afterRender, afterNextRender, Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-chart',
  template: `<div #chartContainer></div>`,
})
export class ChartComponent {
  chartContainer = viewChild.required<ElementRef>('chartContainer');

  constructor() {
    // Chạy MỘT LẦN sau render đầu tiên — lý tưởng cho library init
    afterNextRender(() => {
      const el = this.chartContainer().nativeElement;
      new Chart(el, { /* config */ });
    });

    // Chạy sau MỖI render cycle
    afterRender({
      write: () => {
        // Ghi vào DOM — avoid reads trong phase này
      },
      read: (data) => {
        // Đọc DOM sau khi ghi
      },
    });
  }
}
```

#### Phases trong `afterRender`

**Thứ tự thực thi:** `earlyRead` → `write` → `mixedReadWrite` → `read`

| Phase | Mô tả | Lưu ý |
|-------|-------|-------|
| `earlyRead` | Đọc DOM trước khi ghi | Dùng để lấy measurements |
| `write` | Ghi vào DOM | Không đọc DOM trong phase này |
| `mixedReadWrite` | Đọc và ghi xen kẽ | Sử dụng thận trọng |
| `read` | Đọc DOM sau khi ghi | Không ghi trong phase này |

**Lưu ý quan trọng:**
- Chỉ dùng trong **injection context**
- **Không hoạt động trên SSR** hoặc pre-rendering
- `afterNextRender`: chạy **1 lần** — lý tưởng cho third-party library init
- `afterRender`: chạy **mỗi render cycle** — dùng thận trọng vì performance

---

### 5. Vite & esBuild mặc định

Angular 17 đưa Vite + esBuild trở thành build system mặc định cho tất cả projects mới.

**Cải thiện performance:**
- `ng build`: **lên đến 87% nhanh hơn** (với SSR/SSG)
- `ng serve`: **80% edit-refresh loop nhanh hơn**
- Các enterprise partners báo cáo **67% build time improvement**

```bash
# Tạo project mới — mặc định dùng Vite + esBuild
ng new my-app

# Kiểm tra build config
cat angular.json | grep builder
# "builder": "@angular-devkit/build-angular:application"
```

**So sánh với旧 builder:**

| Feature |旧 Builder (webpack) | New Builder (Vite + esBuild) |
|---------|---------------------|------------------------------|
| Build time | Baseline | ~67-87% faster |
| Dev server | HMR chậm hơn | HMR gần như instant |
| SSR | Có thể phức tạp | Built-in support |
| Bundle | Không tối ưu | Tree-shaking tốt hơn |

---

### 6. Experimental View Transitions

Tích hợp View Transitions API của browser vào Angular Router.

```ts
// app.config.ts
import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions({
      onViewTransitionCreated: (transitionInfo) => {
        console.log('Transition:', transitionInfo);
      },
    })),
  ]
};
```

```html
<!-- Template — gán viewTransitionName cho element cần transition -->
<img
  [src]="photo.thumbnail"
  [style.viewTransitionName]="'photo-id-' + photo.id"
/>
```

```css
/* CSS custom transitions */
::view-transition-old(photo-detail) {
  animation: fade-out 300ms ease-in;
}
::view-transition-new(photo-detail) {
  animation: fade-in 300ms ease-out;
}
```

---

### 7. Input Value Transforms

Cho phép transform input values khi chúng được set — giải quyết bài toán common type mismatches.

```ts
@Component({
  selector: 'my-expander',
  template: `...`
})
export class Expander {
  //旧: <my-expander expanded/> sẽ lỗi vì "string is not assignable to boolean"
  // New: transform tự động convert string → boolean
  @Input({ transform: booleanAttribute }) expanded: boolean = false;
}
```

```html
<!-- Bây giờ có thể dùng boolean attribute syntax -->
<my-expander expanded />
<my-expander [expanded]="true" />
```

---

### 8. `styleUrl` & `styles` as Strings

Đơn giản hóa cách khai báo styles trong component decorator.

```ts
//旧 syntax (vẫn support)
@Component({
  styleUrls: ['styles.css'],
  styles: [`h1 { color: red; }`]
})

// New syntax — gọn hơn
@Component({
  styleUrl: 'styles.css',       // string thay vì array
  styles: `h1 { color: red; }`  // string thay vì array
})
```

---

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Built-in Control Flow** – `@if`, `@for`, `@switch` gọn hơn, performant hơn, không cần import directives
2. **`@defer`** – Lazy loading components cực kỳ dễ dàng, hỗ trợ nhiều triggers và prefetching
3. **Vite & esBuild** – Build nhanh hơn đáng kể (67-87%), HMR gần như instant
4. **Hydration improved** – SSR performance tốt hơn với incremental hydration
5. **View Transitions** – Page transitions mượt mà dùng native browser API
6. **`afterRender`/`afterNextRender`** – DOM lifecycle hooks mạnh mẽ với phases

### Điểm cần lưu ý:

1. **View Transitions vẫn experimental** – API có thể thay đổi trong tương lai
2. **Breaking changes từ旧 control flow** – Cần migrate `*ngIf`, `*ngFor`, `*ngSwitch`
3. **`@defer` chỉ hoạt động với standalone components** – Cần migrate trước
4. **esBuild có thể có edge cases** – Kiểm tra compatibility với một số libraries

### Lời khuyên:

- Bắt đầu migrate sang `@if`/`@for`/`@switch` cho các template mới
- Sử dụng `@defer` cho lazy loading thay vì dynamic imports thủ công
- Thử Vite cho projects mới, esBuild cho development
- Sử dụng `afterRender`/`afterNextRender` thay vì `ngAfterViewInit` cho DOM logic
- Áp dụng View Transitions cho simple page transitions trước khi dùng complex animations

## Yêu cầu

- Angular 17+
- Node.js 18+

## Chạy thử

```bash
cd 1_hyration  # Hoặc project khác
npm install
ng serve