# Signal Forms Go Stable

## Overview
Signal Forms shipped as experimental in Angular 21 and become **stable** in Angular 22. The experimental warnings are gone. The API you already know stays the same.

## Key Features

- **Stable API**: No more experimental warnings
- **Typed validation errors**: Built-in errors are properly typed for autocomplete
- **New validators**: `date` and `limit` validators are now public
- **Performance**: `FormField.parseErrors` no longer recomputes without reason
- **Plain-object models**: Clearer support for custom controls

## Code Examples

### Login Form with Signal Forms

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
      <button type="submit" [disabled]="loginForm().invalid()">Log In</button>
    </form>
  `
})
export class LoginComponent {
  loginModel = signal<LoginData>({ email: '', password: '' });
  
  loginForm = form(this.loginModel, (f) => {
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Please enter a valid email' });
    required(f.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      console.log(this.loginModel());
    }
  }
}
```

### Registration Form with Validators

```typescript
@Component({
  selector: 'app-register',
  imports: [FormField],
  template: `
    <form [formGroup]="registerForm">
      <input [formField]="registerForm.firstName" placeholder="First Name" />
      <input [formField]="registerForm.lastName" placeholder="Last Name" />
      <input [formField]="registerForm.email" placeholder="Email" />
      <button type="submit" [disabled]="registerForm().invalid()">Register</button>
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
    required(f.firstName, { message: 'First name is required' });
    required(f.lastName, { message: 'Last name is required' });
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Invalid email' });
  });
}
```

### Custom Validators

```typescript
import { form, required, minLength, maxLength, pattern } from '@angular/forms/signals';

const userForm = form(
  signal({ username: '', password: '' }),
  (f) => {
    required(f.username, { message: 'Username required' });
    minLength(f.username, { min: 3, message: 'Min 3 characters' });
    maxLength(f.username, { max: 20, message: 'Max 20 characters' });
    required(f.password, { message: 'Password required' });
    pattern(f.password, { 
      pattern: /^(?=.*[A-Z])(?=.*[0-9])/, 
      message: 'Must contain uppercase and number' 
    });
  }
);
```

## Improvements in Angular 22

| Feature | Description |
|---------|-------------|
| **Public date/limit validators** | Now part of stable contract |
| **Typed getError** | Real autocomplete instead of `any` |
| **Field metadata guide** | Documents previously unofficial patterns |
| **Performance** | Reduced unnecessary recomputations |
| **Plain-object models** | Better custom control support |

## Migration from v21

If you used Signal Forms in v21, no changes needed - the API is identical:

```typescript
// Angular 21 (experimental) - same code works in Angular 22 (stable)
import { form, required } from '@angular/forms/signals'; // No longer experimental!
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)