# 4. `ngComponentOutlet` — Dynamic Components (PRE-EXISTING, không phải mới v20)

> Đính chính: `NgComponentOutlet` có từ **v14–v16**, KHÔNG phải mới v20.
> Mới trong v20 chỉ là polish: input binding (#60137), two-way binding (#60342), outputs.
> `ComponentFactoryResolver` đã remove từ v13+ — ví dụ "trước v20" dùng factory chỉ mang tính lịch sử.

## API mới

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="currentComponent" />
  `
})
export class DashboardComponent {
  currentComponent = AdminPanelComponent;
}
```

**Trạng thái đúng:**

| Trước v20 (v14–v16 đã có) | Polish trong v20 |
|---|---|
| `[ngComponentOutlet]="componentClass"` cơ bản | input binding #60137, two-way #60342, outputs |

## Tại sao cần feature này?

Trước Angular 20, việc render dynamic components cực kỳ phức tạp:

```typescript
// Trước Angular 20 - Phức tạp!
@Component({
  selector: 'app-dashboard',
  template: `<div #container></div>`
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  ngAfterViewInit() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      AdminPanelComponent
    );
    this.container.clear();
    const componentRef = this.container.createComponent(factory);
    componentRef.instance.data = this.data;
  }
}
```

Angular 20 giải quyết bằng template directive đơn giản.

## Ví dụ thực tế

### 1. Basic Usage

```typescript
import { Component } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { AdminPanelComponent } from './admin-panel.component';
import { UserPanelComponent } from './user-panel.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="currentComponent" />
  `
})
export class DashboardComponent {
  currentComponent = AdminPanelComponent;

  switchToUser() {
    this.currentComponent = UserPanelComponent;
  }
}
```

### 2. With Inputs

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="currentComponent"
      [ngComponentOutletInputs]="componentInputs"
    />
  `
})
export class DashboardComponent {
  currentComponent = AdminPanelComponent;
  componentInputs = {
    title: 'Admin Dashboard',
    isAdmin: true,
    data: this.dashboardData
  };
}
```

### 3. With Outputs

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="currentComponent"
      [ngComponentOutletInputs]="componentInputs"
      [ngComponentOutletOutputs]="componentOutputs"
    />
  `
})
export class DashboardComponent {
  currentComponent = UserPanelComponent;

  componentInputs = {
    title: 'User Dashboard'
  };

  componentOutputs = {
    onAction: (event: any) => this.handleAction(event),
    onLogout: () => this.handleLogout()
  };

  handleAction(event: any) {
    console.log('Action received:', event);
  }

  handleLogout() {
    console.log('User logged out');
  }
}
```

### 4. Component Class (`app.ts`)

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'ng-component-outlet';
}
```

### 5. Template (`app.html`)

```html
<!-- Basic dynamic component -->
<ng-container [ngComponentOutlet]="currentComponent" />

<!-- With context -->
<ng-container
  [ngComponentOutlet]="currentComponent"
  [ngComponentOutletInputs]="inputs"
  [ngComponentOutletOutputs]="outputs"
/>
```

## Flow chi tiết

```
currentComponent = AdminPanelComponent
        │
        ▼
[ngComponentOutlet]="currentComponent"
        │
        ▼
Angular tạo AdminPanelComponent instance
        │
        ▼
[ngComponentOutletInputs]="componentInputs"
        │
        ▼
Inject inputs vào component instance
        │
        ▼
[ngComponentOutletOutputs]="componentOutputs"
        │
        ▼
Subscribe outputs từ component instance
        │
        ▼
Component render trong DOM
```

## So sánh: ViewContainerRef imperative vs directive (cả hai đều pre-v20)

### Trước (imperative, lịch sử — ComponentFactoryResolver đã remove từ v13+)

```typescript
@Component({
  selector: 'app-dashboard',
  template: `<div #container></div>`
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  private componentRef: ComponentRef<any>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngAfterViewInit() {
    this.loadComponent(AdminPanelComponent);
  }

  loadComponent(component: Type<any>) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    this.container.clear();
    this.componentRef = this.container.createComponent(factory);

    // Manual input/output binding
    this.componentRef.instance.data = this.data;
    this.componentRef.instance.onAction.subscribe((event: any) => {
      this.handleAction(event);
    });
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
```

### Directive (có từ v14–v16, polish thêm trong v20)

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="currentComponent"
      [ngComponentOutletInputs]="inputs"
      [ngComponentOutletOutputs]="outputs"
    />
  `
})
export class DashboardComponent {
  currentComponent = AdminPanelComponent;
  inputs = { data: this.data };
  outputs = {
    onAction: (event: any) => this.handleAction(event)
  };
}
```

**Lợi ích:**
- ✅ Code gọn hơn 80%
- ✅ Không cần `ViewContainerRef`
- ✅ Không cần `ComponentFactoryResolver`
- ✅ Auto lifecycle management
- ✅ Type-safe với TypeScript

## Use cases phổ biến

### 1. Widget Dashboard

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    @for (widget of widgets; track widget.id) {
      <ng-container
        [ngComponentOutlet]="widget.component"
        [ngComponentOutletInputs]="widget.inputs"
      />
    }
  `
})
export class DashboardComponent {
  widgets = [
    { id: 1, component: ChartComponent, inputs: { data: chartData } },
    { id: 2, component: TableComponent, inputs: { data: tableData } },
    { id: 3, component: MapComponent, inputs: { data: mapData } },
  ];
}
```

### 2. Plugin System

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    @for (plugin of activePlugins; track plugin.name) {
      <ng-container
        [ngComponentOutlet]="plugin.component"
        [ngComponentOutletInputs]="plugin.config"
        [ngComponentOutletOutputs]="plugin.handlers"
      />
    }
  `
})
export class PluginHostComponent {
  activePlugins = this.pluginService.getActivePlugins();
}
```

### 3. Form Builder

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    @for (field of formFields; track field.name) {
      <div class="form-field">
        <label>{{ field.label }}</label>
        <ng-container
          [ngComponentOutlet]="field.component"
          [ngComponentOutletInputs]="field.config"
          [ngComponentOutletOutputs]="field.handlers"
        />
      </div>
    }
  `
})
export class DynamicFormComponent {
  formFields = [
    {
      name: 'username',
      label: 'Username',
      component: TextInputComponent,
      config: { placeholder: 'Enter username', required: true }
    },
    {
      name: 'role',
      label: 'Role',
      component: SelectComponent,
      config: { options: ['Admin', 'User', 'Guest'] }
    }
  ];
}
```

### 4. Content Management

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    @for (block of contentBlocks; track block.id) {
      <ng-container
        [ngComponentOutlet]="getBlockComponent(block.type)"
        [ngComponentOutletInputs]="block.data"
      />
    }
  `
})
export class CmsComponent {
  contentBlocks = [
    { id: 1, type: 'hero', data: { title: 'Welcome' } },
    { id: 2, type: 'text', data: { content: '...' } },
    { id: 3, type: 'gallery', data: { images: [...] } },
  ];

  getBlockComponent(type: string): Type<any> {
    const map = {
      'hero': HeroComponent,
      'text': TextComponent,
      'gallery': GalleryComponent
    };
    return map[type] || TextComponent;
  }
}
```

## Best practices

1. **Lazy load components** khi có thể để giảm bundle size
2. **Dùng `track` trong `@for`** để optimize rendering
3. **Validate component inputs** trước khi truyền
4. **Cleanup subscriptions** trong dynamic components
5. **Test components riêng biệt** trước khi dùng dynamic

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/4_ng-component-outlet-DYNAMIC-COMPONENT
npm install
ng serve
```

Mở `http://localhost:4200` để xem dynamic component rendering.