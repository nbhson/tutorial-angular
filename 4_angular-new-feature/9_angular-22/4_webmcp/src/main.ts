import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalWebMcpTools, Service, inject } from '@angular/core';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Ví dụ 1: Đăng ký WebMCP tool ở APP LEVEL.
 *
 * Tool được đăng ký trong `bootstrapApplication` sẽ tồn tại suốt vòng đời app
 * (đăng ký khi app init, tự gỡ khi app destroy).
 *
 * Một AI agent chạy trong trình duyệt có thể gọi tool `greet`
 * mà không cần server nào đứng giữa.
 */
@Service()
class Greeter {
  sayHello(name: string): string {
    return `Hello ${name}, I'm an AI running inside your browser!`;
  }
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideExperimentalWebMcpTools([
      {
        name: 'greet',
        description: 'Greets the agent with the given name.',
        // JSON Schema mô tả tham số đầu vào của tool
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name to greet' },
          },
          required: ['name'],
          additionalProperties: false,
        },
        execute: ({ name }) => {
          // execute chạy trong injection context của Injector liên kết
          const greeter = inject(Greeter);
          return { content: [{ type: 'text', text: greeter.sayHello(name) }] };
        },
      },
    ]),
  ],
}).catch((err) => console.error(err));
