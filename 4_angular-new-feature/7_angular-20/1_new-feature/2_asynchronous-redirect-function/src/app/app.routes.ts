import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    redirectTo: () => {
      const router = inject(Router);
      const authService = inject(AuthService);
 
      return authService.isAuthenticated$.pipe(
        map((isAuthorized: boolean) => {
          return router.createUrlTree([`/${isAuthorized ? 'user' : 'login'}`])
        }),
      );
    },
  },
  {
    path: 'user',
    loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
