# Signal Forms Trở Nên Stable

## Tổng quan
Signal Forms phát hành dạng experimental ở Angular 21 và trở thành **stable** trong Angular 22. Các cảnh báo experimental đã biến mất. API bạn đã biết vẫn giữ nguyên.

## Tính năng chính

- **API stable**: Không còn cảnh báo experimental
- **Lỗi validation có kiểu**: Các lỗi có sẵn được định kiểu đúng để hỗ trợ autocomplete
- **Validator mới**: Validator `date` và `limit` giờ là public
- **Hiệu năng**: `FormField.parseErrors` không còn tính toán lại vô lý
- **Model dạng plain-object**: Hỗ trợ rõ ràng hơn cho custom controls

## Ví dụ Code

### Login Form với Signal Forms

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <input type="email" [formField]="loginForm.email" />
      @if (loginForm.email().touched() && loginForm.email().invalid()) {
        @for (error of loginForm.email().errors(); track error) {
          <p class="error">{{ error.message }}</p>
        }
      }
      <input type="password" [formField]="loginForm.password" />
      <button type="submit" [disabled]="loginForm().invalid()">Đăng nhập</button>
    </form>
  `
})
export class LoginComponent {
  loginModel = signal<LoginData>({ email: '', password: '' });
  
  loginForm = form(this.loginModel, (f) => {
    required(f.email, { message: 'Email là bắt buộc' });
    email(f.email, { message: 'Vui lòng nhập email hợp lệ' });
    required(f.password, { message: 'Mật khẩu là bắt buộc' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      console.log(this.loginModel());
    }
  }
}
```

### Registration Form với Validators

```typescript
@Component({
  selector: 'app-register',
  imports: [FormField],
  template: `
    <form [formGroup]="registerForm">
      <input [formField]="registerForm.firstName" placeholder="Tên" />
      <input [formField]="registerForm.lastName" placeholder="Họ" />
      <input [formField]="registerForm.email" placeholder="Email" />
      <button type="submit" [disabled]="registerForm().invalid()">Đăng ký</button>
    </form>
  `
})
export class RegisterComponent {
  model = signal({
    firstName: '',
    lastName: '',
    email: '',
    age: 0
  });

  registerForm = form(this.model, (f) => {
    required(f.firstName, { message: 'Tên là bắt buộc' });
    required(f.lastName, { message: 'Họ là bắt buộc' });
    required(f.email, { message: 'Email là bắt buộc' });
    email(f.email, { message: 'Email không hợp lệ' });
  });
}
```

### Custom Validators

```typescript
import { form, required, minLength, maxLength, pattern } from '@angular/forms/signals';

const userForm = form(
  signal({ username: '', password: '' }),
  (f) => {
    required(f.username, { message: 'Username là bắt buộc' });
    minLength(f.username, { min: 3, message: 'Tối thiểu 3 ký tự' });
    maxLength(f.username, { max: 20, message: 'Tối đa 20 ký tự' });
    required(f.password, { message: 'Mật khẩu là bắt buộc' });
    pattern(f.password, { 
      pattern: /^(?=.*[A-Z])(?=.*[0-9])/, 
      message: 'Phải chứa chữ hoa và số' 
    });
  }
);
```

## Cải Tiến trong Angular 22

| Tính năng | Mô tả |
|---------|-------------|
| **Validator date/limit public** | Giờ thuộc hợp đồng (contract) stable |
| **getError có kiểu** | Autocomplete thật thay vì `any` |
| **Hướng dẫn field metadata** | Ghi lại các pattern trước đây không chính thức |
| **Hiệu năng** | Giảm các lần tính toán lại không cần thiết |
| **Model dạng plain-object** | Hỗ trợ custom control tốt hơn |

## Migration từ v21

Nếu bạn đã dùng Signal Forms ở v21, không cần thay đổi gì - API giống hệt:

```typescript
// Angular 21 (experimental) - cùng code vẫn chạy ở Angular 22 (stable)
import { form, required } from '@angular/forms/signals'; // Không còn experimental!
```

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
