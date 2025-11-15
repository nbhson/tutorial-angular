# Asynchronous Redirect Function

Angular now supports `asynchronous redirect` functions. Thuộc tính `redirectTo` có thể trả về một `Promise`, một `Observable` của chuỗi | UrlTree. Thay đổi này cho phép bạn xây dựng logic chuyển hướng chờ dữ liệu trước khi quyết định gửi người dùng đến đâu.

For Example: 

```ts
export const ROUTES: Routes = [
 …,
 {
   path: '**',
   redirectTo: () => {
     const router = inject(Router);
     const authService = inject(AuthService);


     return authService.isAuthorized$.pipe(
       map((isAuthorized) =>
         router.createUrlTree([`/${isAuthorized ? 'home' : 'login'}`]),
       ),
     );
   },
 },
];
```