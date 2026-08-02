import { Component, signal } from '@angular/core';
import { FormField, form, required, minLength, submit } from '@angular/forms/signals';

import { ThermostatService } from '../thermostat.service';

/**
 * Ví dụ 4: IMPLICIT WebMCP tool từ Signal Forms.
 *
 * Khi `provideExperimentalWebMcpForms()` được bật (xem app.config.ts),
 * một form khai báo option `experimentalWebMcpTool` sẽ TỰ SINH một tool:
 *  - JSON schema suy luận từ giá trị khởi tạo của model
 *  - Các field bắt buộc được đánh dấu dựa trên validators (required, ...)
 *  - Kết nối với validation + submission của form, để AI agent
 *    tự điền, thấy lỗi, tự sửa rồi submit.
 */
interface UserModel {
  firstName: string;
  lastName: string;
  age: number;
  hobbies: string[];
}

@Component({
  selector: 'app-home',
  imports: [FormField],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly thermostat = new ThermostatService();

  private readonly model = signal<UserModel>({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly userForm = form(
    this.model,
    (f) => {
      required(f.firstName, { message: 'First name is mandatory.' });
      required(f.lastName, { message: 'Last name is mandatory.' });
      minLength(f.hobbies, 1, { message: 'Pick at least one hobby.' });
    },
    {
      // Đăng ký implicit một WebMCP tool tên `registerUser`
      experimentalWebMcpTool: {
        name: 'registerUser',
        description: 'Registers a new user with the provided details.',
      },
      submission: {
        action: async () => {
          console.log('Submitting user:', this.model());
          // Trả về void (ValidationSuccess) khi submit thành công
        },
      },
    },
  );

  readonly temperature = this.thermostat.temperature;
  readonly adjustments = this.thermostat.adjustments;

  /** Gọi thủ công từ UI để mô phỏng hành động mà AI agent có thể làm. */
  submitForm(): void {
    void submit(this.userForm);
  }

  increaseTemp(): void {
    this.thermostat.temperature.update((t) => Math.min(30, t + 1));
    this.thermostat.adjustments.update((n) => n + 1);
  }

  decreaseTemp(): void {
    this.thermostat.temperature.update((t) => Math.max(15, t - 1));
    this.thermostat.adjustments.update((n) => n + 1);
  }
}
