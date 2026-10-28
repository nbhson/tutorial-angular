# Day 10: Form — Reactive Forms & Validation

## Muc tieu

- Hieu ro san pham giua Reactive Forms va Template-driven Forms.
- Xay dung form voi `FormGroup`, `FormControl`, `FormArray`.
- Them validation: `required`, `minlength`, `email`, `Validators.compose`.
- Hien thi error message theo trang thai `dirty`, `touched`, `invalid`.
- Xu ly form async: call API khi submit, loading state, error handling.
- So sanh voi React (form library + uncontrolled vs controlled).

## Khoi niem coi loi

### Reactive Forms vs Template-driven Forms

Angular co hai cach xay dung form:

1. **Reactive Forms** (khuyen nghi): khai bao form structure trong TypeScript, dua vao `FormGroup`/`FormControl`. De test, de quan ly state, ho tro typed forms (v14+).

2. **Template-driven Forms**: khai bao form structure ngay trong template voi `ngModel`, phu thuoc vao Two-way binding. Phu hop voi form don gian, nhung khong manh bang Reactive.

Tutorial nay tach phan Reactive Forms lam trong tam.

### FormGroup, FormControl, FormArray

- `FormControl`: quan ly mot field don le.
- `FormGroup`: quan ly mot nhom field (tuong tu nhu object).
- `FormArray`: quan ly danh sach cac field (tuong tu nhu array).

Cu phap co ban:

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Mot field don le
const nameCtrl = new FormControl('', [Validators.required, Validators.minLength(2)]);

// Mot nhom field (form dang nhap)
const loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(6)]),
});
```

Voi standalone component (v14+), khai bao trong `app.config.ts`:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideReactiveForms(),
    // hoac provideForms() neu dung template-driven
  ]
};
```

## Vi du chi tiet

### 1. Login form co validation

```ts
// login.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div>
        <label>Email</label>
        <input formControlName="email" type="email" />
        <!-- Hien thi loi khi email bi loi va user da touched field nay -->
        @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
          <span class="error">
            @if (loginForm.get('email')?.errors?.['required']) { Email bat buoc. }
            @if (loginForm.get('email')?.errors?.['email']) { Email khong dung dinh dang. }
          </span>
        }
      </div>

      <div>
        <label>Mat khau</label>
        <input formControlName="password" type="password" />
        @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
          <span class="error">
            @if (loginForm.get('password')?.errors?.['required']) { Mat khau bat buoc. }
            @if (loginForm.get('password')?.errors?.['minlength']) {
              Mat khau it nhat {{ loginForm.get('password')?.errors?.['minlength'].requiredLength }} ki tu.
            }
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm.invalid || isLoading">
        {{ isLoading ? 'Dang nhap...' : 'Dang nhap' }}
      </button>

      @if (errorMessage) {
        <div class="error-banner">{{ errorMessage }}</div>
      }
    </form>
  `,
  styles: [`
    .error { color: red; font-size: 0.875rem; }
    .error-banner { background: #fee; border: 1px solid red; padding: 8px; margin-top: 8px; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Hien thi tat ca loi
      return;
    }
    // Lay gia tri form
    const { email, password } = this.loginForm.getRawValue();
    console.log('Submit:', email, password);
    // Call API...
  }
}
```

### 2. Form co FormArray — danh sach cong viec

```ts
// todo-form.component.ts
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="todoForm" (ngSubmit)="onSubmit()">
      <div formArrayName="todos">
        @for (todo of todos.controls; track $index; let i = $index) {
          <div [formGroupName]="i">
            <input formControlName="title" placeholder="Ten cong viec" />
            <button type="button" (click)="removeTodo(i)">Xoa</button>
            @if (todo.get('title')?.touched && todo.get('title')?.invalid) {
              <span class="error">Bat buoc nhap ten</span>
            }
          </div>
        }
      </div>
      <button type="button" (click)="addTodo()">Them cong viec</button>
      <button type="submit" [disabled]="todoForm.invalid">Luu tat ca</button>
    </form>
  `
})
export class TodoFormComponent {
  todoForm = new FormGroup({
    todos: new FormArray([
      new FormGroup({
        title: new FormControl('', Validators.required),
        done: new FormControl(false),
      })
    ])
  });

  get todos(): FormArray {
    return this.todoForm.get('todos') as FormArray;
  }

  addTodo() {
    this.todos.push(
      new FormGroup({
        title: new FormControl('', Validators.required),
        done: new FormControl(false),
      })
    );
  }

  removeTodo(index: number) {
    this.todos.removeAt(index);
  }

  onSubmit() {
    console.log(this.todoForm.getRawValue());
  }
}
```

### 3. Typed Forms (v14+) — type-safe form

```ts
// typed-form.component.ts
import { Component } from '@angular/core';
import { FormControl, FormRecord, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="emailCtrl" />`
})
export class TypedFormComponent {
  // Typed: TypeScript bat loi ngay luc compile
  emailCtrl = new FormControl<string>('', { nonNullable: true });
  // FormRecord: luc nao cung co the add/remove key
  extras = new FormRecord<FormControl<string>>({});

  // FormGroup voi interface
  profileForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true }),
    lastName: new FormControl('', { nonNullable: true }),
    age: new FormControl<number | null>(null),
  });
}
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Form khai bao | `FormGroup`/`FormControl` trong TS | `useState` + controlled input |
| Validation | `Validators.*` trong FormControl | Custom hook hoac `react-hook-form` |
| Error hien thi | `formControl.touched && formControl.invalid` | `touched && error` trong state |
| Async submit | Observable/async handler | `async function` + `await` |
| Form library | Built-in ReactiveFormsModule | `react-hook-form`, Formik |
| Array field | `FormArray` | Array state + `.map()` |
| Typed forms | v14+ typed `FormControl<T>` | `react-hook-form` zod resolver |

**React voi react-hook-form**:

```tsx
// React equivalent
import { useForm } from 'react-hook-form';

function LoginReact() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(data: any) {
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(data) });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} />
      {errors.email && <span>Email bat buoc</span>}
      <button type="submit" disabled={isSubmitting}>Dang nhap</button>
    </form>
  );
}
```

Angular Reactive Forms co loi ich la khai bao rong rai, de test (co the mock `FormControl` khong can DOM), va ho tro `nonNullable: true` de tranh null-check lien tuc.

## Loi thuong gap

### 1. Form va Change Detection

Angular Reactive Forms tu dong chay tren khi gia tri thay doi. Neu ban dung `OnPush` change detection, form van hoat dong binh thuong vi Reactive Forms trigger change detection tu dong.

### 2. FormControl voi gia tri null

```ts
// Sai: gia tri mac dinh la null
const ctrl = new FormControl(null); // typeof null

// Dung: dung nonNullable hoac gia tri mac dinh la string rong
const ctrl1 = new FormControl('', { nonNullable: true });
const ctrl2 = new FormControl<string | null>(null);
// Lay gia tri: ctrl.value ?? 'default'
```

Tu v14, dung `nonNullable: true` de TypeScript yeu cau gia tri khong bao gio null.

### 3. markAllAsTouched() de hien thi tat ca loi

Khi user click Submit ma form chua touched, cac loi khong hien thi. Dung `markAllAsTouched()` truoc khi kiem tra `invalid`.

### 4. formControlName khong hoat dong

`formControlName` chi hoat dong trong `<form [formGroup]="myForm">`. Neu ban dung ngoai form, dung `[formControl]="myControl"` thay vi `formControlName`.

### 5. Validator chay khi nao

Validators chay moi khi gia tri thay doi (on change), KHONG phai khi touched. Vi the check `formControl.invalid` luon hien thi loi sau khi user da nhap (dung).

## Best practices

1. **Dung Reactive Forms cho moi form moi**: de test, de quan ly state, ho tro typed forms.
2. **Tach validation ra service**: neu nhieu form cung validation logic, tao mot `ValidationService`.
3. **Dung `nonNullable: true`** (v14+): tra ve gia tri luon la typed, khong can null check.
4. **Dung custom validator khi can thiet**:

```ts
// Custom validator: mat khau phai chua ky tu dac biet
function passwordValidator(control: AbstractControl) {
  const value = control.value as string;
  if (!/[!@#$%^&*]/.test(value)) {
    return { passwordStrength: true };
  }
  return null;
}

const passwordCtrl = new FormControl('', [Validators.required, passwordValidator]);
```

5. **Hien thi loi thong minh**: chi hien thi loi sau khi field da duoc `touched`, tranh tat ca loi hien thi ngay khi form load.

## Bai tap

1. **Bai 1**: Xay dung form dang ky gom: firstName, lastName, email, password, confirmPassword. Hien thi loi rieng le cho tung field. Kiem tra password va confirmPassword trung nhau.

2. **Bai 2**: Xay dung form cho phep them/xoa/sua mot danh sach san pham (FormArray). Moi san pham co: name, price, quantity.

3. **Bai 3**: Viet custom validator `phoneValidator` kiem tra so dien thoai VN (10 chu so, bat dau bang 0).

## Reference

- [Reactive Forms — Angular.dev](https://angular.dev/guide/forms/reactive-forms)
- [Form validation](https://angular.dev/guide/form-validation)
- [Typed Forms](https://angular.dev/guide/typed-forms)
- [FormControl API](https://angular.dev/api/forms/FormControl)
- [Validators](https://angular.dev/api/forms/Validators)
