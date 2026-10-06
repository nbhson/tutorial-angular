# 1. Signal Forms (Angular 21 — Experimental)

## Tổng quan

Angular 21 giới thiệu **Signal Forms** — một cách mới để xây dựng reactive forms sử dụng Signals thay vì `FormBuilder` truyền thống. Đây là API experimental, cho phép forms tương tác trực tiếp với Signal system, giúp forms tự động reactive mà không cần `OnInit` hay `FormBuilder`.

> ⚠️ **Lưu ý**: Signal Forms vẫn đang ở giai đoạn experimental. API và behavior có thể thay đổi trước khi release stable.

## API mới

```typescript
import { form, required, minLength, maxLength } from '@angular/forms/signals';

// Tạo signal model
const person = signal<PersonForm>({
  name: '',
  surname: '',
  telephoneNumber: null
});

// Tạo signal form từ model
const personForm = form(person, (path) => {
  required(path.name);
  required(path.surname);
  minLength(path.name, 3);
  maxLength(path.surname, 40);
});
```

## Tại sao cần Signal Forms?

Trước Angular 21, reactive forms yêu cầu `FormBuilder`, `OnInit`, và boilerplate khá nhiều:

| Cách làm | Nhược điểm |
|---|---|
| `FormBuilder.group()` | Phải inject `FormBuilder`, implement `OnInit` |
| `formControlName` directive | Template coupling, không typesafe cho validation |
| Validation với `Validators.*` | Validation logic tách rời khỏi model definition |

Signal Forms giải quyết bằng cách kết hợp forms với Signal system — form state tự động reactive.

## Ví dụ thực tế

### Component Class — Trước Angular 21

```typescript
export class App implements OnInit {
  private readonly _fb = inject(FormBuilder);
  protected form!: PersonForm;

  ngOnInit() {
    this.initForm();
  }

  protected onSubmit() {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    }
  }

  private initForm() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      surname: this._fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(10)
      ]),
      telephoneNumber: this._fb.control(null, Validators.required),
    });
  }
}
```

### Template — Trước Angular 21

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div>
    <label>
      Name:
      <input type="text" formControlName="name" />
    </label>
    @if(form.controls.name.invalid && form.controls.name.touched) {
      <p>Name is required</p>
    }
  </div>
  <div>
    <label>
      Surname:
      <input type="text" formControlName="surname" />
    </label>
    @if(form.controls.surname.invalid && form.controls.surname.touched) {
      <p>Surname is required</p>
    }
  </div>
  <div>
    <label>
      Telephone Number:
      <input type="number" formControlName="telephoneNumber"/>
    </label>
    @if(form.controls.telephoneNumber.invalid &&
        form.controls.telephoneNumber.touched
    ) {
      <p>Telephone number is required</p>
    }
  </div>
  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
<pre>{{ form.value | json }}</pre>
```

### Component Class — Sau Angular 21 (Signal Forms)

```typescript
import { form, required, minLength, maxLength } from '@angular/forms/signals';

export class App {
  // Tạo signal model — không cần OnInit
  protected readonly person = signal<PersonForm>({
    name: '',
    surname: '',
    telephoneNumber: null
  });

  // Tạo signal form với schema validation
  protected readonly personForm = form(this.person, (path) => {
    required(path.name);
    required(path.surname);
    minLength(path.name, 3);
    maxLength(path.surname, 40);
  });

  protected onSubmit() {
    if (this.personForm().valid()) {
      console.log('Form submitted:', this.person());
    }
  }

  // Cập nhật giá trị tự động sync với model
  changePersonName(value: string) {
    this.personForm.name().value.set(value);
    console.log(this.person());
    // → {name: 'John', surname: '', telephoneNumber: null}
  }
}
```

### Template — Sau Angular 21 (Signal Forms)

```html
<form (ngSubmit)="onSubmit()">
  <div>
    <label>
      Name:
      <input [field]="personForm.name" type="text" />
    </label>
    @for(err of personForm.name().errors(); track $index) {
      @if(err.kind === 'required') {
        <p>Name is required</p>
      }
    }
  </div>
  <div>
    <label>
      Surname:
      <input [field]="personForm.surname" type="text" />
    </label>
    @for(err of personForm.surname().errors(); track $index) {
      @if(err.kind === 'required') {
        <p>Surname is required</p>
      }
    }
  </div>
  <div>
    <label>
      Telephone Number:
      <input [field]="personForm.telephoneNumber" type="number" />
    </label>
  </div>
  <button type="submit" [disabled]="personForm().invalid()">Submit</button>
</form>
<pre>{{ personForm().value() | json }}</pre>
```

## Phân tích chi tiết

### 1. `signal()` — Tạo Form Model

```typescript
protected readonly person = signal<PersonForm>({
  name: '',
  surname: '',
  telephoneNumber: null
});
```

- Thay thế `FormBuilder.group()` bằng một `signal()` đơn giản
- Model là một signal reactive — thay đổi tự động trigger update
- Không cần `OnInit` để init form

### 2. `form()` — Tạo Signal Form

```typescript
protected readonly personForm = form(this.person, (path) => {
  required(path.name);
  required(path.surname);
  minLength(path.name, 3);
  maxLength(path.surname, 40);
});
```

- `form()` nhận signal model và schema callback làm tham số
- Schema callback receives `path` object — đại diện cho từng field
- Validation functions (`required`, `minLength`, `maxLength`) nhận path để bind validation rules
- Kết quả: form object có method `.value()`, `.invalid()`, `.errors()` cho từng field

### 3. `[field]` Directive — Binding trong Template

```html
<input [field]="personForm.name" type="text" />
```

- Thay thế `formControlName` bằng `[field]` directive
- `[field]` chịu trách nhiệm bind form field đến UI component
- Cần import `field` directive trước khi sử dụng

### 4. Error Handling Mới

```html
@for(err of personForm.name().errors(); track $index) {
  @if(err.kind === 'required') {
    <p>Name is required</p>
  }
}
```

- Validation errors được trả về dưới dạng array
- Mỗi error object có property `kind` (ví dụ: `'required'`, `'minLength'`)
- Dễ iterate và hiển thị lỗi cụ thể cho từng field

### 5. Two-Way Binding với Signal Model

```typescript
changePersonName(value: string) {
  this.personForm.name().value.set(value);
  console.log(this.person()); // Tự động cập nhật!
}
```

- Khi update giá trị qua `personForm`, model `person` **tự động sync** ngược lại
- Đây là ưu điểm lớn — không cần手動 sync giữa form và model

## So sánh trước và sau Angular 21

### Trước Angular 21

```typescript
// Component class — nhiều boilerplate
export class App implements OnInit {
  private readonly _fb = inject(FormBuilder);
  protected form!: PersonForm;

  ngOnInit() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      surname: this._fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(10)
      ]),
      telephoneNumber: this._fb.control(null, Validators.required),
    });
  }
}
```

```html
<!-- Template — cần formGroup, formControlName -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="name" />
  @if(form.controls.name.invalid && form.controls.name.touched) {
    <p>Name is required</p>
  }
</form>
```

### Sau Angular 21 (Signal Forms)

```typescript
// Component class — gọn gàng, không cần OnInit
export class App {
  protected readonly person = signal<PersonForm>({
    name: '',
    surname: '',
    telephoneNumber: null
  });

  protected readonly personForm = form(this.person, (path) => {
    required(path.name);
    required(path.surname);
    minLength(path.name, 3);
    maxLength(path.surname, 40);
  });
}
```

```html
<!-- Template — dùng [field] và errors() -->
<form (ngSubmit)="onSubmit()">
  <input [field]="personForm.name" type="text" />
  @for(err of personForm.name().errors(); track $index) {
    @if(err.kind === 'required') {
      <p>Name is required</p>
    }
  }
</form>
```

## Các use case phổ biến

### 1. Form Đơn Giản Không Validation

```typescript
const user = signal({ name: '', email: '' });
const userForm = form(user);

// Template
// <input [field]="userForm.name" type="text" />
```

### 2. Form Với Nhiều Validation Rules

```typescript
const product = signal({
  name: '',
  price: 0,
  description: ''
});

const productForm = form(product, (path) => {
  required(path.name);
  minLength(path.name, 5);
  required(path.price);
  minLength(path.description, 20);
});
```

### 3. Programmatic Value Update

```typescript
// Cập nhật form field programmatically
this.productForm.name().value.set('Updated Product Name');

// Đọc giá trị hiện tại
console.log(this.productForm.name().value());

// Kiểm tra validation
console.log(this.productForm.name().errors());

// Kiểm tra整个 form
console.log(this.productForm().invalid());
```

## Best Practices

1. **Hiểu rõ Signals trước khi dùng Signal Forms** — Signal Forms dựa hoàn toàn trên Signal system
2. **Schema validation nên được define ở component class** — Giữ template sạch, validation logic集中 ở class
3. **Dùng `@for` với `errors()` để display errors** — Cleaner so với `@if` conditions
4. **Đợi stable release trước khi dùng production** — API hiện tại là experimental

## Tham khảo

- [Angular Signals — angular.love](https://angular.love/angular-signals-a-new-feature-in-angular-16)
- [Angular Typed Forms — angular.love](https://angular.love/typed-forms-2)
- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)