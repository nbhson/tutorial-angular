# Typed Forms (Angular 14)

> Typed Forms giúp đảm bảo type safety cho Reactive Forms, loại bỏ runtime type errors.

## Trước Angular 14

```ts
// Bất kỳ giá trị nào cũng có thể set vào form
const form = new FormGroup({
  name: new FormControl(''),
  age: new FormControl(0)
});

form.get('age')?.setValue('abc'); // Không có lỗi compile!
console.log(form.value.age); // any
```

## Sau Angular 14

```ts
// FormControl với type safety
const form = new FormGroup({
  name: new FormControl(''),
  age: new FormControl(0)
});

form.get('age')?.setValue('abc'); // ❌ Compile error!
console.log(form.value.age); // number | null
```

## Typed FormControl

```ts
// FormControl<TValue> - generic type parameter
const nameControl = new FormControl<string>('');
const ageControl = new FormControl<number>(0);

// Các method đều type-safe
nameControl.setValue('John');      // ✅
nameControl.setValue(123);         // ❌ Compile error
nameControl.value;                 // string | null
```

## Typed FormGroup

```ts
interface SignUpForm {
  name: string;
  email: string;
  subscribe?: string;
}

const signUpFormGroup = new FormGroup<SignUpForm>({
  name: new FormControl(''),
  email: new FormControl('')
});

// Type-safe value access
const form = signUpFormGroup.value;
console.log(form.email);  // string | null | undefined
console.log(form.name);   // string | null | undefined

// Typed setValue
signUpFormGroup.setValue({
  name: 'John',
  email: 'john@example.com',
  subscribe: 'yes'  // optional field
});
```

## Typed FormArray

```ts
// FormArray yêu cầu type đồng nhất
lineItems = new FormArray([
  new FormControl('')
]);

lineItems.push(new FormControl(''));     // ✅ SUCCESS
lineItems.push(new FormControl(0));      // ❌ ERROR - wrong type

// FormArray trống - chỉ định generic type
lineItems = new FormArray<AbstractControl<string>>([]);
```

## FormRecord

```ts
// FormGroup với TValue không biết khi tạo
const addressForm = new FormRecord<AbstractControl<string>>({});

// Thêm controls động
addressForm.addControl('street', new FormControl(''));
addressForm.addControl('city', new FormControl(''));

// Type-safe khi add
addressForm.addControl('no', new FormControl(0)); // ❌ ERROR
```

## Mixed Typed & Untyped

```ts
export class AppComponent implements OnInit {
  formGroup = new FormGroup({
    street: new FormControl(''),
    no: new FormControl(0),
    postalCode: new UntypedFormControl() // Bất kỳ type nào
  });

  ngOnInit(): void {
    const street = this.formGroup.value.street;  // string | null
    const no = this.formGroup.get('no')?.value;   // number | null
    this.formGroup.get('postalCode')?.setValue(12345);  // ✅
    this.formGroup.get('postalCode')?.setValue('ABC123'); // ✅ UntypedFormControl
  }
}
```

## Non-nullable Controls

```ts
// FormControl không trả về null khi reset
export class AppComponent implements OnInit {
  formGroup = new FormGroup({
    street: new FormControl('', { nonNullable: true })
  });

  ngOnInit(): void {
    this.formGroup.get('street')?.reset();
    const street = this.formGroup.value.street;
    console.log(street); // '' (empty string, NOT null)
  }
}
```

## NonNullableFormBuilder

```ts
@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Tất cả fields đều non-nullable
  form = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email]
    }],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(private fb: NonNullableFormBuilder) {}
}

// Reset trả về initial value, không phải null
this.form.get('email')?.reset();
console.log(this.form.value.email); // '' (not null)
```

## Type Summary

| Component | Type | Description |
|-----------|------|-------------|
| `FormControl<T>` | `T \| null` | Single control value |
| `FormGroup<T>` | `Partial<{ [K in keyof T]: T[K] \| null }>` | Group values |
| `FormArray<T>` | `T[]` | Array of controls |
| `FormRecord<T>` | `{ [key: string]: T }` | Dynamic controls |

## Best Practices

1. **Luôn dùng typed forms** – Tránh runtime errors
2. **Sử dụng interfaces** – Định nghĩa shape của form
3. **NonNullableFormBuilder** – Cho forms có nhiều required fields
4. **UntypedFormControl** – Chỉ dùng khi cần backward compatibility

---

**Summary**: Typed Forms loại bỏ runtime type errors trong Reactive Forms bằng cách sử dụng generics. FormGroup, FormControl, FormArray đều hỗ trợ type-safe, giúp phát hiện lỗi tại compile time thay vì runtime.