# Day 11: HTTP Client — fetch data & resource API

## Muc tieu

- Su dung `HttpClient` (tu `@angular/common/http`) de goi API.
- Cau hinh `provideHttpClient` trong `app.config.ts`.
- Xu ly response: typed response, error handling, loading state.
- Su dung `resource()` / `httpResource()` (Angular v19+) thay cho HttpClient trong mot so truong hop.
- Interceptors: them header, retry logic.
- So sanh voi React (TanStack Query / fetch thuan tuy).

## Khoi niem coi loi

### HttpClient

`HttpClient` la mot service cua Angular cho phep goi HTTP request. No ho tro typed response, interceptor, request cancellation.

```ts
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),          // Dung fetch backend (v21+ default)
      withInterceptors([]), // Interceptors
    )
  ]
};
```

```ts
// Trong component/service
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  // GET, POST, PUT, DELETE
  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: Partial<User>) {
    return this.http.post<User>(this.apiUrl, user);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## Vi du chi tiet

### 1. Component goi API, xu ly loading/error

```ts
// user-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  standalone: true,
  selector: 'app-user-list',
  template: `
    <h2>Danh sach nguoi dung</h2>

    @if (isLoading()) {
      <p>Dang tai...</p>
    } @else if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    } @else {
      <ul>
        @for (user of users(); track user.id) {
          <li>{{ user.name }} - {{ user.email }}</li>
        }
      </ul>
    }
  `
})
export class UserListComponent {
  private http = inject(HttpClient);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Khong tai duoc danh sach. Thu lai sau.');
          this.isLoading.set(false);
          console.error(err);
        }
      });
  }
}
```

### 2. resource() — API moi cho signals (v19+)

Ngoai cach su dung Observable, con co the dung cach moi — async pipe voi Observable (tu dong subscribe/unsubscribe):

```ts
users$: Observable<User[]> = this.http.get<User[]>('/api/users');
// template: @for (u of users$ | async; track u.id)
```

Con `resource()` la API moi giup tai du lieu async va luu vao signal, ho tro status (idle / loading / resolved / error) san co.

`resource()` la API moi giup tai du lieu async va luu vao signal, ho tro status (idle / loading / resolved / error) san co.

```ts
// user-list-resource.component.ts
import { Component, resource, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-user-list-resource',
  template: `
    <h2>Danh sach nguoi dung (resource)</h2>

    @switch (usersResource.status()) {
      @case ('loading') { <p>Dang tai...</p> }
      @case ('error') { <p>Loi: {{ usersResource.error() }}</p> }
      @default {
        <ul>
          @for (user of usersResource.value() ?? []; track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }
    }
  `
})
export class UserListResourceComponent {
  private http = inject(HttpClient);

  usersResource = resource({
    loader: () => this.http.get<User[]>('https://jsonplaceholder.typicode.com/users'),
  });
  // usersResource.value() -> du lieu | .status() -> 'loading'|'resolved'|'error'
  // usersResource.error() -> loi | .reload() -> tai lai
}
```

### 3. httpResource() — shortcut cho GET request (v22)

```ts
// http-resource.component.ts
import { Component, inject, httpResource } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  template: `
    @if (users.isLoading()) { <p>Dang tai...</p> }
    @else {
      <ul>
        @for (user of users.value() ?? []; track user.id) {
          <li>{{ user.name }}</li>
        }
      </ul>
    }
  `
})
export class HttpResourceComponent {
  private http = inject(HttpClient);

  // httpResource tu wrap HttpClient.get + resource
  users = httpResource<User[]>(() => ({
    url: 'https://jsonplaceholder.typicode.com/users',
  }));
}
```

### 4. Interceptor — them Authorization header + retry

```ts
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Clone request va them header
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry(2), // thu lai 2 lan khi loi mang
    catchError((err) => {
      if (err.status === 401) {
        console.log('Unauthorized, redirect to login');
      }
      return throwError(() => err);
    })
  );
};

// Dang ky trong app.config.ts
// provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Goi API | `HttpClient` (service inject) | `fetch()` / axios |
| Typed response | `http.get<User[]>()` | `fetch().then(r => r.json()) as Promise<User[]>` |
| Cancellation | RxJS `unsubscribe` / `takeUntilDestroyed` | `AbortController` |
| Loading/error state | `signal` hoac `resource().status()` | `useState` manual / TanStack Query |
| Cache + revalidate | Interceptor + service | TanStack Query / SWR |
| Interceptor | `HttpInterceptorFn` | axios interceptor / fetch wrapper |

**React voi TanStack Query**:

```tsx
// React equivalent voi TanStack Query
import { useQuery } from '@tanstack/react-query';

function UserListReact() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  if (isLoading) return <p>Dang tai...</p>;
  if (error) return <p>Loi: {String(error)}</p>;

  return <ul>{data.map((u: any) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

`resource()` cua Angular gan y tuong voi TanStack Query: dung key de identify query, ho tro reload, status, error. Diem khac biet la `resource()` dua tren signal nen ket hop tu nhien voi change detection cua Angular.

## Loi thuong gap

### 1. Khong unsubscribe khi component destroy (dung Observable)

Neu ban subscribe Observable cua `HttpClient` trong component ma khong quan ly unsubscribe, request van tiep tuc chay va co the set state sau khi component da destroy.

```ts
// Cach sai — khong unsubscribe
ngOnInit() {
  this.http.get('/api/users').subscribe(data => this.users.set(data));
}

// Cach dung: takeUntilDestroyed hoac async pipe
ngOnInit() {
  this.http.get<User[]>('/api/users')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.users.set(data));
}
// hoac: @for (u of users$ | async; track u.id)
```

### 2. `HttpClient` khong duoc provide

Loi thuong gap: `NullInjectorError: No provider for HttpClient!`. Nguyen nhan: chua goi `provideHttpClient()` trong `app.config.ts`.

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()], // khong duoc quen dong nay
};
```

### 3. SSR: dung absolute URL

Khi chay SSR, request tu server khong co origin, nen URL tuong doi `/api/users` se bao loi. Can dung absolute URL hoac tu them `baseUrl` trong interceptor.

### 4. Error chi la `err.error` trong server response

Khi server tra ve 4xx/5xx, `HttpClient` throw `HttpErrorResponse`. Response body nam trong `err.error`, khong phai `err` truc tiep.

```ts
error: (err: HttpErrorResponse) => {
  console.error(err.message);  // Http failure response
  console.error(err.error);    // body do server tra ve
  console.error(err.status);   // 404, 500...
}
```

### 5. Quen voi CORS

Khi goi API o domain khac trong dev, can cau hinh CORS o server hoac dung proxy:

```json
// proxy.conf.json — khai bao trong angular.json (serve.options.proxyConfig)
{
  "/api": { "target": "http://localhost:3000", "secure": false }
}
```

## Best practices

1. **Tap trung API call vao service** (khong goi HTTP truc tiep trong component) de de test va reuse.
2. **Dung `resource()` / `httpResource()` cho app moi (v19+)** thay vi Observable, nhat la khi chi can GET va hien thi.
3. **Dung interceptor cho logic chung**: auth header, error handling, loading indicator.
4. **Typed response**: luon khai bao interface cho response de TypeScript giup bat loi.
5. **Dung `withFetch()`** (v21+ mac dinh): fetch backend ho tro SSR tot hon va nho hon XHR.

## Bai tap

1. **Bai 1**: Xay dung component danh sach bai viet voi JSONPlaceholder `/posts`. Co nut reload, hien thi loading va error. Dung ca 2 cach: HttpClient + signal, va `resource()`.

2. **Bai 2**: Them interceptor ghi log thoi gian moi request, va interceptor tu dong them header `X-Client: angular-tutorial`.

3. **Bai 3**: Xay dung form tao bai viet moi (POST /posts), thanh cong thi reset form va reload danh sach.

## Reference

- [HttpClient — Angular.dev](https://angular.dev/guide/http)
- [Interceptors](https://angular.dev/guide/http/interceptors)
- [resource() API](https://angular.dev/guide/signals/resource)
- [httpResource()](https://angular.dev/guide/http/http-resource)
- [Testing HTTP requests](https://angular.dev/guide/http/testing)
