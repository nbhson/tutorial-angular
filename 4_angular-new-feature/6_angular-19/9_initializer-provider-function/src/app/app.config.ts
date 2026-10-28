import { ApplicationConfig, provideAppInitializer, provideEnvironmentInitializer, providePlatformInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideEnvironmentInitializer(() => {
      console.log('Environment initializer running...');
    }),
    provideAppInitializer(() => {
      console.log('App initializer running...');
    }),
    providePlatformInitializer(() => {
      console.log('Platform initializer running...');
    }),
  ]
};
