# Experimental View Transitions Support

## Tổng quan

Angular 17 tích hợp **View Transitions API** của browser vào Angular Router thông qua `withViewTransitions()`. Tính năng này cho phép tạo animated transitions mượt mà giữa các routes khi navigating, sử dụng native browser capabilities.

> Note version: trong v17 là experimental, từ v19/v20 là developer preview.

View Transitions API là một Web Platform API mới, cho phép developers tạo smooth transitions khi thay đổi DOM — bao gồm cả SPA navigation.

## Cấu trúc files

```
6_experimental-view-transitions-support/
├── src/
│   ├── app/
│   │   ├── app.component.html        # Root template
│   │   ├── app.component.ts          # Root component
│   │   ├── app.component.scss        # Styles
│   │   ├── app.config.ts             # App config — withViewTransitions()
│   │   ├── app.routes.ts             # Routes — PhotoList, PhotoDetail
│   │   ├── components/
│   │   │   ├── photolist/
│   │   │   │   ├── photolist.component.html    # Photo list template
│   │   │   │   ├── photolist.component.ts      # Photo list logic
│   │   │   │   └── photolist.component.scss    # Styles
│   │   │   └── photodetail/
│   │   │       ├── photodetail.component.html  # Photo detail template
│   │   │       ├── photodetail.component.ts    # Photo detail logic
│   │   │       └── photodetail.component.scss  # Styles
│   │   └── constant/
│   │       └── photo.constant.ts     # Photo data constant
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.config.ts` — Router Configuration

Kích hoạt View Transitions API trong router:

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()) // Kích hoạt view transitions (gộp 1 lần duy nhất)
  ]
};
```

> Alternative cho NgModule: `RouterModule.forRoot(routes, { enableViewTransitions: true })`.

**Giải thích:**
- `withViewTransitions()` — kích hoạt View Transitions API cho Angular Router
- Khi navigating giữa routes, browser sẽ tự động tạo smooth transition animation

### `src/app/app.routes.ts` — Route Definitions

Hai routes demo: Photo List (trang chủ) và Photo Detail (chi tiết ảnh):

```ts
import { Routes } from '@angular/router';
import { PhotoListComponent } from './components/photolist/photolist.component';
import { PhotoDetailComponent } from './components/photodetail/photodetail.component';

export const routes: Routes = [
    {
        path: '',
        component: PhotoListComponent,
        title: 'Photo list',
    },
    {
        path: 'photos/:id',
        component: PhotoDetailComponent,
        title: 'Photo detail',
    },
];
```

### `src/app/components/photolist/photolist.component.ts` — Photo List

Component hiển thị danh sách ảnh thumbnail, mỗi ảnh có `viewTransitionName` để tạo transition effect:

```ts
import { Component, OnInit } from '@angular/core';
import { PHOTO_LIST } from '../../constant/photo.constant';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-photolist',
  templateUrl: './photolist.component.html',
  styleUrls: ['./photolist.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class PhotoListComponent implements OnInit {
  photoList = PHOTO_LIST;
}
```

### `src/app/components/photolist/photolist.component.html` — Photo List Template

Sử dụng `viewTransitionName` CSS property để đánh dấu element cần transition:

```html
<h2>Photo list</h2>
@for (photo of photoList; track photo.id) {
  <div>
    <a [routerLink]="['/photos/', photo.id]">
      <img
        width="300"
        height="200"
        [src]="photo.thumbnail"
        [style.viewTransitionName]="'photo-id-' + photo.id"
      />
    </a>
  </div>
}
```

**Giải thích:**
- `[style.viewTransitionName]` — Gán unique name cho mỗi image để browser biết cần transition element nào
- Khi navigate sang detail page, image sẽ animate mượt mà từ thumbnail sang full-size

### `src/app/components/photodetail/photodetail.component.ts` — Photo Detail

Component hiển thị chi tiết ảnh, sử dụng cùng `viewTransitionName` để tạo transition:

```ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PHOTO_LIST } from '../../constant/photo.constant';

@Component({
  selector: 'app-photodetail',
  templateUrl: './photodetail.component.html',
  styleUrls: ['./photodetail.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class PhotoDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  photoId = this.route.snapshot.params['id'];
  imageUrl = PHOTO_LIST.find((p) => p.id === Number(this.photoId))?.large;
}
```

### `src/app/components/photodetail/photodetail.component.html` — Photo Detail Template

```html
<h2>Photo detail</h2>

<img
  width="600"
  height="400"
  [src]="imageUrl"
  [style.viewTransitionName]="'photo-id-' + photoId"
/>

<footer>
  Angular View Transition API demo -
  <a routerLink="/">Home</a>
</footer>
```

**Key point:** Cùng `viewTransitionName` value (`photo-id-100`) xuất hiện ở cả list và detail — browser tự động animate giữa hai element này.

### `src/app/constant/photo.constant.ts` — Photo Data

```ts
export const PHOTO_LIST = [
    {
      id: 100,
      thumbnail: 'https://fastly.picsum.photos/id/100/300/200.jpg?...',
      large: 'https://fastly.picsum.photos/id/100/600/400.jpg?...',
    },
    {
      id: 101,
      thumbnail: 'https://fastly.picsum.photos/id/101/300/200.jpg?...',
      large: 'https://fastly.picsum.photos/id/101/600/400.jpg?...',
    },
    {
      id: 102,
      thumbnail: 'https://fastly.picsum.photos/id/102/300/200.jpg?...',
      large: 'https://fastly.picsum.photos/id/102/600/400.jpg?...',
    },
];
```

## Cách View Transitions hoạt động

```
1. User click link trong Photo List
2. Angular navigates sang Photo Detail route
3. Browser detect viewTransitionName conflict
4. Browser tự động animate:
   - Thumbnail image (300x200) → Full-size image (600x400)
   - Smooth scaling + positioning transition
5. Transition hoàn tất
```

## Custom View Transitions

```ts
provideRouter(routes, withViewTransitions({
  onViewTransitionCreated: ({ transition, from, to }) => {
    // Chạy trong injection context
    console.log('Transition:', from, '->', to, transition);
    // Có thể dùng skipTransition() cho fragment navigation / reduced-motion,
    // hoặc document.startViewTransition tùy browser
  },
}))
```

## CSS Custom Transitions

```css
/* Custom transition animations */
::view-transition-old(photo-detail) {
  animation: fade-out 300ms ease-in;
}

::view-transition-new(photo-detail) {
  animation: fade-in 300ms ease-out;
}
```

## Lưu ý quan trọng

1. **Experimental trong v17** — API có thể thay đổi (developer preview từ v19/v20)
2. **Browser support** — Chromium-based là chính, các browser khác progressive enhancement (không có transition nhưng vẫn navigate bình thường)
3. **`viewTransitionName` phải unique** — Mỗi element cần unique name để transition đúng
4. **Fallback behavior** — Browser không hỗ trợ sẽ ignore transitions, vẫn hoạt động bình thường
5. **Có `skipTransition()`** cho fragment navigation / reduced-motion

## Cách sử dụng

```bash
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular View Transitions](https://angular.dev/guide/animations/view-transitions)
- [Introducing Angular v17](https://blog.angular.dev/introducing-angular-v17-4d7033312e4b)
- [View Transitions API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)