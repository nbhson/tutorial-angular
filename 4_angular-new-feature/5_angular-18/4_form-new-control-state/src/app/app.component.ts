import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  StatusChangeEvent,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="submit()">
      <label for="first-name">First Name: </label>
      <input id="first-name" type="text" formControlName="firstName" />
      <label for="last-name">Last Name: </label>
      <input id="last-name" type="text" formControlName="lastName" />
      <button type="submit">Submit</button>
    </form>
  `,
  styles: [``],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class AppComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();
  readonly EMPTY_STRING = '';
  
  profileForm = new FormGroup({
    firstName: new FormControl<string>(this.EMPTY_STRING, [
      Validators.required,
      Validators.minLength(4),
    ]),
    lastName: new FormControl<string>(this.EMPTY_STRING),
  });

  ngOnInit(): void {
    this.fromChange()
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe()
  }

  submit() {
    console.log(this.profileForm);
  }

  private fromChange() {
    // Lọc đúng class event bằng instanceof — không check string event.type,
    // lấy giá trị mới qua event.value (không có event.previousValue)
    const firstNameValue$ = this.f['firstName'].events.pipe(
      filter((e): e is ValueChangeEvent<string | null> => e instanceof ValueChangeEvent),
    ).subscribe((event) => {
      console.log('Value changed to:', event.value);
      console.log('Source value:', event.source.value);
    });

    const firstNameStatus$ = this.f['firstName'].events.pipe(
      filter((e): e is StatusChangeEvent => e instanceof StatusChangeEvent),
    ).subscribe((event) => {
      const value = event.source.value as string;
      const status = event.source.status;

      console.log('Control status changed to:', status);

      if (status === 'INVALID' && value.includes('1')) {
        // step 1 - override
        this.f['firstName'].setValidators([
          Validators.required,
          Validators.minLength(1)
        ]);

        // step 2 - update the validation state of the control
        this.f['firstName'].updateValueAndValidity();
      }
    });

    this._subscription.add(firstNameValue$);
    this._subscription.add(firstNameStatus$);
  }

  get f() {
    return this.profileForm.controls;
  }
}
