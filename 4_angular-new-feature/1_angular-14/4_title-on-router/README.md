# Title on Router (Angular 14)

> Angular 14 cho phép set page title trực tiếp trong route config, không cần `TitleService` thủ công.

## Trước Angular 14

```ts
// Phải inject TitleService và gọi manual
@Component({ ... })
export class HomeComponent implements OnInit {
  constructor(private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Home Page');
  }
}

// Route config không có title
const routes: Routes = [
  { path: '', component: HomeComponent }
];
```

## Sau Angular 14

```ts
// Route config với title trực tiếp
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About Us'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Products'
  }
];
```

## Dynamic Title với `titleResolver`

```ts
// Resolver function
export const productTitleResolver: ResolveFn<string> = (route) => {
  const productService = inject(ProductService);
  const productId = route.params['id'];

  return productService.getProduct(productId).pipe(
    map(product => `${product.name} - My Shop`)
  );
};

// Route config
const routes: Routes = [
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: productTitleResolver
  }
];
```

## Title Strategy Pattern

```ts
// Custom title strategy
@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  private title = inject(Title);

  override buildTitle(snapshot: ActivatedRouteSnapshot): string {
    let pageTitle = snapshot.data['title'];
    if (pageTitle) {
      pageTitle = `MyApp | ${pageTitle}`;
    } else {
      pageTitle = 'MyApp';
    }
    this.title.setTitle(pageTitle);
    return pageTitle;
  }
}

// Config
@NgModule({
  providers: [
    { provide: TitleStrategy, useClass: CustomTitleStrategy }
  ]
})
export class AppModule { }
```

## Ví dụ thực tế

```ts
//.routes.ts
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Trang chủ - MyApp'
  },
  {
    path: 'products',
    component: ProductListComponent,
    title: 'Sản phẩm - MyApp'
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: productTitleResolver  // Dynamic
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Quản trị',
    canActivate: [authGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Không tìm thấy'
  }
];

// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    withComponentInputBinding()  // Thêm input binding
  ]
});
```

## Flow Diagram

```
Route navigation:
  User click → Router navigate → Route match → Resolve title → Set document title

titleResolver:
  Route params → Fetch data → Return title string → Router set title
```

## Best Practices

1. **Luôn set title cho mọi route** – Tốt cho SEO và UX
2. **Sử dụng `titleResolver`** – Cho title động từ data
3. **Custom TitleStrategy** – Cho format title thống nhất
4. **Avoid `Title.setTitle()` manual** – Dùng route config thay thế

## Ref

- https://dev.to/brandontroberts/setting-page-titles-natively-with-the-angular-router-393j

---

**Summary**: Angular 14 cho phép set page title trực tiếp trong route config với `title` property. Kết hợp `titleResolver` cho dynamic titles, giúp code gọn hơn và SEO-friendly hơn.