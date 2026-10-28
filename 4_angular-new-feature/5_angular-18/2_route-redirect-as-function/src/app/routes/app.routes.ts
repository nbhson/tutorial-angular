import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { ErrorHandler, inject } from '@angular/core';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
      path: 'product',
      redirectTo: ({ queryParams }) => {
        const errorHandler = inject(ErrorHandler);
        const id = queryParams['id'];
        if (id) return `product-detail`;
        
        errorHandler.handleError(new Error('Please provide the ID of product'));
        return `not-found`;
      },
    },
    {
      path: 'product-detail',
      loadComponent: () => import('../components/product/product.component').then((m) => m.ProductComponent),
    },
    {
      path: 'category/:id',
      loadComponent: () => import('../components/category/category.component').then((m) => m.CategoryComponent),
    },
    { path: 'not-found', component: NotFoundComponent },
    { path: '**', component: NotFoundComponent },
];
