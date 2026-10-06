# 5. `Injector.destroy()` (mới v20 — #60054, `DestroyableInjector`)

> Nguồn: https://angular.dev/api/core/Injector — `Injector.create()` với
> `parent: EnvironmentInjector` tạo ra injector có `destroy()`.
> Sau `destroy()`: injector bị disposed, **không reuse**, mọi `get()` sau đó ném lỗi.
> `ngOnDestroy` của các service đã khởi tạo được gọi tự động.

## Tổng quan

Angular 20 giới thiệu `Injector.destroy()` — cho phép **huỷ bỏ injector và tất cả các dependencies** mà nó quản lý một cách chủ động. Đây là API mới trong DI (Dependency Injection) system, giải quyết vấn đề "memory leak" khi cần cleanup resources một cách imperative.

## API mới

```typescript
import { Injector, EnvironmentInjector, inject } from '@angular/core';

const injector = Injector.create({
  providers: [
    { provide: DataService, deps: [] },
  ],
  parent: inject(EnvironmentInjector) // parent phải là EnvironmentInjector
});

const dataService = injector.get(DataService);

// Huỷ bỏ — sau dòng này KHÔNG reuse injector:
injector.destroy(); // Tự động gọi ngOnDestroy cho tất cả services đã tạo
// injector.get(DataService); // ❌ Error: injector đã disposed
```

## Tại sao cần feature này?

Trước Angular 20, việc cleanup injector cực kỳ khó khăn:

| Vấn đề | Giải thích |
|---|---|
| **Memory leak** | Injector cũ không có cách destroy tự động |
| **Manual cleanup** | Phải gọi `ngOnDestroy` thủ công cho từng service |
| **Nested injectors** | Không có cách cleanup subtree dependencies |
| **Component-scoped DI** | Injector tự destroy khi component unmount, nhưng imperative injector không có |

`Injector.destroy()` giải quyết tất cả vấn đề này bằng một API đơn giản.

## Ví dụ thực tế

### 1. Basic Usage

```typescript
import { Injector, inject } from '@angular/core';

// Tạo injector
const injector = Injector.create({
  providers: [
    { provide: LoggerService, deps: [] },
    { provide: DataService, deps: [LoggerService] },
  ]
});

// Sử dụng services
const logger = injector.get(LoggerService);
const dataService = injector.get(DataService);

logger.log('Hello!');

// Khi không cần nữa - cleanup tất cả
injector.destroy();
// LoggerService.ngOnDestroy() được gọi tự động
// DataService.ngOnDestroy() được gọi tự động
```

### 2. Component with Custom Injector

```typescript
@Component({
  selector: 'app-dashboard',
  template: `<div>Dashboard</div>`
})
export class DashboardComponent implements OnDestroy {
  private customInjector: Injector;
  private logger: LoggerService;

  constructor() {
    // Tạo custom injector với scoped services
    this.customInjector = Injector.create({
      providers: [
        { provide: LoggerService, deps: [] },
        { provide: DataService, deps: [LoggerService] },
        { provide: CacheService, deps: [] },
      ],
      parent: inject(EnvironmentInjector)
    });

    this.logger = this.customInjector.get(LoggerService);
  }

  ngOnDestroy() {
    // Cleanup tất cả services trong custom injector
    this.customInjector.destroy();
  }
}
```

### 3. Dynamic Component Lifecycle

```typescript
@Component({
  selector: 'app-plugin-host',
  template: `
    @for (plugin of activePlugins; track plugin.id) {
      <div [id]="'plugin-' + plugin.id">
        <!-- Dynamic plugin content -->
      </div>
    }
  `
})
export class PluginHostComponent {
  private injectors = new Map<string, Injector>();
  activePlugins: PluginConfig[] = [];

  loadPlugin(config: PluginConfig) {
    // Tạo injector riêng cho mỗi plugin
    const injector = Injector.create({
      providers: [
        { provide: PLUGIN_CONFIG, useValue: config },
        { provide: PluginDataService, deps: [PLUGIN_CONFIG] },
      ],
      parent: inject(EnvironmentInjector)
    });

    this.injectors.set(config.id, injector);
    this.activePlugins.push(config);
  }

  unloadPlugin(pluginId: string) {
    const injector = this.injectors.get(pluginId);
    if (injector) {
      injector.destroy(); // Cleanup plugin resources
      this.injectors.delete(pluginId);
      this.activePlugins = this.activePlugins.filter(p => p.id !== pluginId);
    }
  }

  ngOnDestroy() {
    // Cleanup tất cả plugins
    this.injectors.forEach(injector => injector.destroy());
    this.injectors.clear();
  }
}
```

### 4. Scoped Service Cleanup

```typescript
@Injectable()
export class ScopedCacheService implements OnDestroy {
  private cache = new Map<string, any>();

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  ngOnDestroy() {
    // Cleanup cache khi injector bị destroy
    console.log('Cache cleared:', this.cache.size, 'items');
    this.cache.clear();
  }
}

// Sử dụng
const injector = Injector.create({
  providers: [
    { provide: ScopedCacheService, deps: [] },
  ]
});

const cache = injector.get(ScopedCacheService);
cache.set('key1', 'value1');

// Cleanup tự động
injector.destroy(); // → "Cache cleared: 1 items"
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// Không có cách destroy injector
// Phải manually gọi cleanup
const injector = Injector.create({ providers: [...] });

// Không có cleanup API
// Memory leak khi injector không còn sử dụng
// Phải đợi garbage collection (không đáng tin cậy)
```

### Sau Angular 20

```typescript
const injector = Injector.create({ providers: [...] });

// Cleanup tất cả services
injector.destroy(); // ← API mới, đơn giản

// Tự động gọi ngOnDestroy cho tất cả services
// Không còn memory leak
```

**Lợi ích:**
- ✅ API đơn giản: `injector.destroy()`
- ✅ Tự động cleanup tất cả dependencies
- ✅ Gọi `ngOnDestroy` cho tất cả services
- ✅ Prevent memory leak
- ✅ Works với nested injectors

## Flow chi tiết

```
Injector.create({ providers: [...] })
        │
        ▼
Tạo dependency graph
        │
        ▼
injector.get(ServiceA) → Khởi tạo ServiceA
injector.get(ServiceB) → Khởi tạo ServiceB
        │
        ▼
injector.destroy()
        │
        ▼
ServiceB.ngOnDestroy() → Cleanup resources
ServiceA.ngOnDestroy() → Cleanup resources
        │
        ▼
Injector bị dispose, không thể reuse
```

## Các use case phổ biến

### 1. Plugin System

```typescript
// Load plugin với scoped injector
loadPlugin(config: PluginConfig): Injector {
  return Injector.create({
    providers: [
      { provide: PLUGIN_CONFIG, useValue: config },
      { provide: PluginService, deps: [PLUGIN_CONFIG] },
    ],
    parent: this.rootInjector
  });
}

// Unload plugin - cleanup tự động
unloadPlugin(injector: Injector) {
  injector.destroy(); // Cleanup tất cả plugin services
}
```

### 2. Test Isolation

```typescript
describe('DataService', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: DataService, deps: [] },
        { provide: MockApiService, deps: [] },
      ]
    });
  });

  afterEach(() => {
    injector.destroy(); // Cleanup sau mỗi test
  });

  it('should fetch data', () => {
    const service = injector.get(DataService);
    expect(service).toBeTruthy();
  });
});
```

### 3. Dynamic Form Fields

```typescript
// Mỗi form field có scope riêng
createFieldInjector(field: FormField): Injector {
  return Injector.create({
    providers: [
      { provide: FIELD_CONFIG, useValue: field },
      { provide: FieldValidator, deps: [FIELD_CONFIG] },
      { provide: FieldFormatter, deps: [FIELD_CONFIG] },
    ],
    parent: this.formInjector
  });
}

// Khi xóa field - cleanup resources
removeField(fieldId: string) {
  const injector = this.fieldInjectors.get(fieldId);
  injector?.destroy();
  this.fieldInjectors.delete(fieldId);
}
```

### 4. Lazy-loaded Feature Modules

```typescript
// Feature module với scoped services
loadFeature(featureName: string): Injector {
  return Injector.create({
    providers: [
      { provide: FEATURE_NAME, useValue: featureName },
      { provide: FeatureApiService, deps: [FEATURE_NAME] },
      { provide: FeatureCacheService, deps: [] },
    ],
    parent: this.appInjector
  });
}

// Unload feature
unloadFeature(injector: Injector) {
  injector.destroy(); // Cleanup feature-specific services
}
```

## Best practices

1. **Luôn gọi `destroy()`** khi không cần injector nữa
2. **Store injectors** trong Map hoặc array để dễ manage
3. **Implement `ngOnDestroy`** trong tất cả services có resources
4. **Dùng custom injector** cho scoped dependencies
5. **Test cleanup** bằng cách verify `ngOnDestroy` được gọi

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/5_injector-destroy
npm install
ng serve
```

Mở `http://localhost:4200` để xem injector lifecycle hoạt động.