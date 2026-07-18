# Hydration

## Tổng quan

Hydration là cơ chế cho phép Angular tái sử dụng DOM đã render trên server (Server-Side Rendering) thay vì render lại từ đầu trên client. Angular 17 cải thiện hydration với incremental approach, giúp cải thiện hiệu suất SSR đáng kể.

Khi không có hydration, Angular sẽ xóa toàn bộ DOM đã render trên server và render lại từ đầu trên client — gây ra `flickering` và lãng phí tài nguyên. Hydration giúp Angular "gắn lại" (reattach) event listeners và trạng thái vào DOM đã có sẵn.

## Cấu trúc files

```
1_hyration/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # Root component
│   │   ├── app.component.html        # Root template
│   │   ├── app.config.ts             # Client config - cung cấp provideClientHydration
│   │   ├── app.config.server.ts      # Server config - cung cấp provideServerRendering
│   │   └── app.routes.ts             # Routes
│   ├── main.ts                       # Client bootstrap
│   ├── main.server.ts                # Server bootstrap
│   └── server.ts                     # Express server
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.config.ts` — Client Configuration

Đây là file cấu hình quan trọng nhất cho hydration trên client-side. Provider `provideClientHydration` kích hoạt cơ chế hydration, và `withEventReplay()` đảm bảo các event interactions xảy ra trước khi hydration hoàn thành sẽ được replay.

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()) // Kích hoạt hydration với event replay
  ]
};
```

**Giải thích:**
- `provideClientHydration()` — kích hoạt hydration cho Angular app
- `withEventReplay()` — đảm bảo các user interactions (click, input...) xảy ra trong quá trình hydration được replay sau khi hydration hoàn thành, tránh mất event

### `src/app/app.config.server.ts` — Server Configuration

Cấu hình cho server-side rendering, sử dụng `mergeApplicationConfig` để kết hợp client config với server config.

```ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(), // Cung cấp server-side rendering
  ]
};

// Kết hợp client config + server config
export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### `src/main.server.ts` — Server Bootstrap

Entry point cho server-side rendering, sử dụng `bootstrapApplication` với server config.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
```

### `src/app/app.component.ts` — Root Component

Root component đơn giản sử dụng `RouterOutlet`.

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '1_hyration';
}
```

## So sánh: Có vs Không Hydration

| Aspect | Không Hydration | Có Hydration |
|--------|----------------|--------------|
| DOM Handling | Xóa DOM server, render lại từ đầu | Tái sử dụng DOM server |
| Time to Interactive (TTI) | Chậm hơn | Nhanh hơn đáng kể |
| Flickering | Có thể xảy ra | Không xảy ra |
| Event Listeners | Render lại sau khi DOM mới | Reattach vào DOM có sẵn |
| Performance | Lãng phì tài nguyên | Tối ưu tài nguyên |

## Lợi ích

1. **Giảm Time to Interactive (TTI)** — Không cần render lại toàn bộ DOM trên client
2. **Giữ nguyên event listeners** — Các event listeners từ server-rendered content được giữ nguyên
3. **Tránh flickering** — Không có hiện tượng nhấp nháy khi client接管
4. **Event Replay** — User interactions xảy ra trong quá trình hydration được replay

## Cách sử dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development server
ng serve

# Build production
ng build
```

## Yêu cầu

- Angular 17+
- Node.js 18+

## Tài liệu tham khảo

- [Angular Hydration Guide](https://angular.dev/guide/hydration)
- [ProvideClientHydration API](https://angular.dev/api/platform-browser/provideClientHydration)
- [withEventReplay API](https://angular.dev/api/platform-browser/withEventReplay)