import { ApplicationConfig, provideExperimentalWebMcpTools } from '@angular/core';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';

import { routes } from './app.routes';

/**
 * App config bật:
 *  1. Router có `withExperimentalAutoCleanupInjectors()` — tool gắn với route
 *     sẽ tự gỡ khi người dùng điều hướng khỏi route đó.
 *  2. `provideExperimentalWebMcpForms()` — cho phép Signal Forms tự sinh
 *     implicit WebMCP tools từ model của form.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    provideExperimentalWebMcpForms(),
  ],
};
