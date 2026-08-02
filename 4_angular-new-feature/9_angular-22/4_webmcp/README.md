# WebMCP — MCP Chạy Trong Trình Duyệt

## Tổng quan

WebMCP (Web Model Context Protocol) là một **web standard mới nổi (emerging)** cho phép ứng dụng web expose các tools có cấu trúc trực tiếp cho AI agents chạy ngay trong trình duyệt — không cần glue phía server.

Thay vì để AI agent lái một UI phức tạp qua các tương tác DOM (điền form nhiều bước), ứng dụng đăng ký các tools có tên để agent gọi trực tiếp (ví dụ tool `registerUser` thay vì phải điền form từng bước).

> ⚠️ **Lưu ý**: Tính năng này ở tài liệu chính thức là **experimental** — API có thể thay đổi ngoài major versions. Không nên dùng cho production mà chưa nắm rõ ràng buộc.

## WebMCP dùng để làm gì trong Angular web?

### MCP bình thường vs WebMCP

Điểm mấu chốt nằm ở chữ **"Web"** trong **Web**MCP.

**MCP (bạn đã biết):** gắn với **server**. AI agent gọi các tool nằm trên một server — đọc file, truy vấn DB, gọi API... Những thứ này **chỉ có ở phía backend**.

**WebMCP:** gắn với **trình duyệt**. AI agent gọi trực tiếp các thứ **chỉ tồn tại ở phía frontend** — mà một MCP server phía server **không bao giờ chạm tới được**:

| Chỉ có ở phía frontend | MCP server (backend) có được không? |
|---|---|
| State của component/signal (ví dụ `count = signal(0)`) | ❌ Server không biết |
| Form đang mở, giá trị người dùng đang nhập | ❌ Server không biết |
| Hành động cập nhật UI trực tiếp | ❌ Server không làm được |
| Session/login đang diễn ra trong trình duyệt | ❌ Server không biết |

### Ý tưởng tổng quát

WebMCP biến Angular app thành nơi mà một AI trợ lý chạy ngay trong trang web có thể **vừa đọc state thật, vừa thao tác thật trên app** — như thể nó "chui vào" bên trong app vậy.

### Cụ thể, 4 ứng dụng thực tế

#### 1. AI trợ lý trong app biết trạng thái thật của app

App điều khiển nhiệt độ. Người dùng hỏi AI: *"Nhiệt độ đang bao nhiêu?"*

```typescript
declareExperimentalWebMcpTool({
  name: 'get_temperature',
  description: 'Đọc nhiệt độ hiện tại',
  inputSchema: {type: 'object', properties: {}},
  execute: () => ({
    content: [{type: 'text', text: `Hiện tại ${this.temperature()}°C`}]
    // ↑ đọc thẳng signal — AI trả lời ĐÚNG giá trị thật, không đoán
  })
});
```

→ Không có WebMCP, AI trợ lý chỉ là một "cái hộp chat" treo ở góc màn hình, **không biết gì về app**. Có WebMCP, nó đọc được tận bên trong.

#### 2. AI thao tác thật trên app (không cần người dùng click)

Người dùng nói: *"Đặt nhiệt độ lên 25 độ giúp tôi"*

```typescript
declareExperimentalWebMcpTool({
  name: 'set_temperature',
  description: 'Đặt nhiệt độ mục tiêu',
  inputSchema: {
    type: 'object',
    properties: { value: { type: 'number' } },
    required: ['value']
  },
  execute: ({ value }) => {
    this.temperature.set(value);  // ← cập nhật signal THẬT
    return { content: [{type: 'text', text: 'Đã đặt thành công'}] };
  }
});
```

Vì `temperature` là signal, màn hình **tự động cập nhật lên 25°C** ngay lập tức. AI vừa trả lời vừa **làm thật việc** trong app.

#### 3. AI điền & gửi form cho người dùng (Signal Forms)

Đây là ứng dụng "đắt giá" nhất và chỉ có ở Angular. Form Angular khai báo `experimentalWebMcpTool` là tự biến thành một tool:

```typescript
readonly userForm = form(this.model, (f) => {
  required(f.firstName, {message: 'Thiếu tên'});
  required(f.lastName, {message: 'Thiếu họ'});
}, {
  experimentalWebMcpTool: {
    name: 'registerUser',
    description: 'Đăng ký user mới'
  },
  submission: { action: async (v) => { /* gửi lên server */ } }
});
```

Người dùng nói: *"Đăng ký giúp tôi, tên Alice"* → AI gọi `registerUser` → Angular **tự validate** → AI nhận lỗi "thiếu họ" → **tự sửa gọi lại** → hợp lệ → submit. Người dùng **không phải gõ form**.

→ Đây là điểm mà một MCP server bên backend **không thể làm**: validation, state và submission đều là thứ của frontend.

#### 4. Tool gắn với từng route (dashboard/admin)

Admin dashboard có tool riêng chỉ hoạt động khi đang ở route đó:

```typescript
{
  path: 'dashboard',
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'exportDashboardReports',
        description: 'Xuất báo cáo analytics',
        execute: () => { /* gọi service xuất báo cáo */ }
      }
    ])
  ]
}
```

→ Kết hợp `withExperimentalAutoCleanupInjectors()`, khi rời khỏi dashboard, tools tự gỡ — AI không còn quyền gọi `exportDashboardReports` nữa.

### Tóm lại một câu

> **WebMCP trong Angular web = cho một AI agent chạy trong trình duyệt "mượn tay" app của bạn** — đọc được signals, điền được form, gọi được services — bằng cách gọi trực tiếp các tool bạn khai báo, thay vì phải giả làm người dùng click/gõ trên UI.

Cái mà Angular mang lại so với MCP server thông thường: **DI + signals + Signal Forms** — tức là AI không chỉ "gọi API" mà còn thao tác đúng vào reactive state thật của giao diện.

## API Chính (đều experimental)

| API | Import từ | Mô tả |
|-----|-----------|-------|
| `provideExperimentalWebMcpTools(tools)` | `@angular/core` | Đăng ký tools cho toàn bộ vòng đời app (đăng ký khi init, gỡ khi destroy). Dùng được ở root app providers hoặc route providers |
| `declareExperimentalWebMcpTool(tool)` | `@angular/core` | Đăng ký một tool trong bất kỳ injection context nào (ví dụ trong constructor của service), tự động gỡ khi context bị destroy |
| `provideExperimentalWebMcpForms()` | `@angular/forms/signals` | Root provider bật tính năng implicit Signal Forms tools |
| `withExperimentalAutoCleanupInjectors()` | `@angular/router` | Router feature cho route-scoped tools: tự động gỡ tools khi người dùng điều hướng khỏi route |

### Cấu trúc của một tool

Mỗi tool là một **object** gồm 4 field:

```typescript
{
  name: 'greet',                        // tên tool duy nhất (bắt buộc unique)
  description: 'Greets the agent.',     // mô tả cho AI agent biết khi nào nên gọi
  inputSchema: {                        // JSON Schema mô tả tham số đầu vào
    type: 'object',
    properties: {}
  },
  execute: (args) => ({                 // callback xử lý khi agent gọi
    content: [{ type: 'text', text: '...' }]
  })
}
```

Điểm đáng chú ý:
- `execute` được gọi **trong injection context** của Injector liên kết, nên bạn có thể gọi `inject(...)` bên trong nó
- Angular suy luận (infer) kiểu TypeScript của tham số `execute` từ `inputSchema`
- `required: ['query']` loại bỏ `undefined` khỏi các tham số đó; `additionalProperties: false` giới hạn args object chỉ gồm các thuộc tính đã liệt kê
- Angular **không tự xác thực** input của agent khớp schema — bạn phải validate ở runtime bên trong `execute`

## Ví dụ Code

### Đăng ký tool ở App Level — `main.ts`

```typescript
import {Service, inject, provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

@Service()
class Greeter {
  sayHello(): string {
    return 'Hello agent!';
  }
}

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'greet',
        description: 'Greets the agent.',
        inputSchema: {type: 'object', properties: {}},
        execute: () => {
          // Có thể inject dependencies bên trong execute
          const greeter = inject(Greeter);

          return {content: [{type: 'text', text: greeter.sayHello()}]};
        },
      },
    ]),
  ],
});
```

### Tool trong Route — `routes.ts`

Tool được khai báo trên route sẽ có mặt trong phạm vi của route đó. Kết hợp `withExperimentalAutoCleanupInjectors()` để tools tự gỡ khi điều hướng khỏi route:

```typescript
import {provideExperimentalWebMcpTools} from '@angular/core';
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then((m) => m.Dashboard),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'exportDashboardReports',
          description: 'Exports the current dashboard analytics.',
          inputSchema: {type: 'object', properties: {}},
          execute: () => ({
            content: [{type: 'text', text: 'Dashboard export successfully triggered.'}],
          }),
        },
      ]),
    ],
  },
];
```

```typescript
// app.config.ts — bật auto-cleanup cho route tools
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    // ...
  ]
};
```

### Tool trong Service — `counter.ts`

Dùng `declareExperimentalWebMcpTool` trong constructor để tool gắn với vòng đời của service:

```typescript
import {Service, declareExperimentalWebMcpTool, signal, inject} from '@angular/core';

@Service()
export class Counter {
  readonly count = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the global counter.',
      inputSchema: {type: 'object', properties: {}},
      execute: () => ({
        content: [{type: 'text', text: `The count is: ${this.count()}.`}],
      }),
    });
  }
}
```

### Tool có tham số + validate runtime

Với tool nhận input, khai báo `inputSchema` bằng JSON Schema và tự validate bên trong `execute`:

```typescript
provideExperimentalWebMcpTools([
  {
    name: 'searchCatalog',
    description: 'Searches the product catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {type: 'string', description: 'Search keywords'},
        maxResults: {type: 'number', description: 'Max number of results'},
      },
      required: ['query'],
      additionalProperties: false,
    },
    execute: (args) => {
      // Angular KHÔNG tự validate input — phải kiểm tra ở runtime
      const {query, maxResults} = args as {query: string; maxResults?: number};

      const results = searchProducts(query, maxResults ?? 10);
      return {content: [{type: 'text', text: JSON.stringify(results)}]};
    },
  },
]);
```

### Implicit Tool từ Signal Forms — `user-registration.ts`

Signal Forms có thể **tự sinh một WebMCP tool** từ model của form qua option `experimentalWebMcpTool`:

```typescript
import {Component, signal} from '@angular/core';
import {form, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
})
export class UserRegistration {
  private readonly model = signal({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly userForm = form(
    this.model,
    (f) => {
      required(f.firstName, {message: 'First name is mandatory.'});
      required(f.lastName, {message: 'Last name is mandatory.'});
    },
    {
      // Đăng ký implicit một WebMCP tool tên `registerUser`,
      // các tham số được sinh ra từ `model`
      experimentalWebMcpTool: {
        name: 'registerUser',
        description: 'Registers a new user.',
      },
      submission: {
        action: async (formValue) => {
          console.log('Submitting user:', formValue);
          // ...
        },
      },
    },
  );
}
```

Khi bật implicit tool này, Angular sẽ:

1. Sinh JSON schema từ **giá trị khởi tạo** của model — `firstName: ''`, `age: 0`, `hobbies: ['Web Development']` thành các tham số string/number/string-array
2. Đánh dấu các field là bắt buộc (required) dựa trên validators như `required(...)`
3. Kết nối tool với logic validation của form và `submission.action`, để agent nhìn thấy lỗi validation/submission và có thể tự sửa rồi thử lại

> ⚠️ Ràng buộc: giá trị khởi tạo phải cụ thể (`''`, `0`, `false` — không phải `null`/`undefined`), mảng phải không rỗng, và async validators không được kích hoạt (xử lý trong submission action).

## Lưu Ý Quan Trọng (Best Practices)

1. **Tránh trùng tên tool**: WebMCP yêu cầu tên tool duy nhất — "sẽ ném lỗi nếu cùng một tên tool được đăng ký nhiều lần". Ưu tiên đăng ký ở app providers, route providers hoặc root services; chỉ đặt tools trên component (kể cả implicit form tools) nếu component đó render nhiều nhất một lần
2. **Validate input**: Angular không ngầm xác thực input theo schema — hãy validate ở runtime bên trong `execute`
3. **Testing**: dùng mock như `@mcp-b/webmcp-polyfill` cho unit tests

## Chạy Demo Project

Thư mục này là một **Angular 22 app hoàn chỉnh** (`4_webmcp/`) demo tất cả các trường hợp trên.

```bash
npm install
npm start        # mở http://localhost:4200
```

App demo "Smart Thermostat" gồm:

| Màn hình | Tool được đăng ký | Cách hoạt động |
|---|---|---|
| Home — thermostat | `get_temperature`, `set_temperature` | Đăng ký trong `ThermostatService` qua `declareExperimentalWebMcpTool`; đọc/ghi signal `temperature` thật |
| Home — form | `registerUser` | Implicit tool tự sinh từ Signal Forms qua `experimentalWebMcpTool`; JSON schema suy luận từ model, kết nối validation + submission |
| Dashboard | `exportDashboardReports` | Route-scoped tool trong `providers` của route; tự gỡ khi rời route nhờ `withExperimentalAutoCleanupInjectors()` |
| App level | `greet` | Đăng ký trong `main.ts` qua `provideExperimentalWebMcpTools` |

**Cấu trúc file:**

```text
src/
├── main.ts                         # provideExperimentalWebMcpTools (app level)
├── app/
│   ├── app.config.ts               # provideRouter + withExperimentalAutoCleanupInjectors + provideExperimentalWebMcpForms
│   ├── app.routes.ts               # route-scoped provideExperimentalWebMcpTools cho /dashboard
│   ├── thermostat.service.ts       # declareExperimentalWebMcpTool (get/set_temperature)
│   ├── home/home.component.ts      # Signal Forms + experimentalWebMcpTool (registerUser)
│   └── dashboard/dashboard.component.ts
```

**Test với mock WebMCP client**: Trình duyệt thường chưa có `navigator.modelContext`, nên tools sẽ không đăng ký trong dev. Để kiểm chứng vòng đời tool (register → auto-cleanup), inject một mock vào `navigator.modelContext` trước khi app boot:

```javascript
// Dán vào DevTools console TRƯỚC khi load app (hoặc qua init script)
const tools = [];
navigator.modelContext = {
  registerTool: (tool, { signal }) => {
    tools.push(tool.name);
    console.log('WebMCP registered:', tool.name);
    signal.addEventListener('abort', () => {
      const i = tools.indexOf(tool.name);
      if (i !== -1) tools.splice(i, 1);
      console.log('WebMCP unregistered (auto-cleanup):', tool.name);
    });
    return Promise.resolve();
  },
};
```

Rồi mở `http://localhost:4200/` — console sẽ liệt kê `greet`, `get_temperature`, `set_temperature`, `registerUser`. Vào `/dashboard` thấy thêm `exportDashboardReports`; quay lại Home thấy nó bị gỡ (auto-cleanup).

## Tham khảo
- [Angular WebMCP — Official Docs](https://angular.dev/ai/webmcp)
