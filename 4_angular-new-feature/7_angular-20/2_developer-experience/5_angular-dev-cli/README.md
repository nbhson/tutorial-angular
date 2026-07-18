# 5. angular.dev CLI (Angular 20)

## Tổng quan

Angular 20 giới thiệu **Angular Dev CLI** — CLI tools mới tích hợp sẵn trong `angular.dev`, hỗ trợ generate, migrate, và analyze Angular projects. Đây là cải tiến lớn cho developer workflow.

## Commands mới

```bash
# Generate component mới
ng generate component my-component

# Generate service mới
ng generate service my-service

# Analyze project bundle
ng analyze

# Migrate project lên Angular 20
ng update @angular/core @angular/cli
```

## Tại sao cần feature này?

| Vấn đề | Giải thích |
|---|---|
| **Slow build** | Bundle size lớn, build time dài |
| **Code generation** | Phải viết boilerplate thủ công |
| **Migration** | Phải upgrade thủ công từ version cũ |
| **Bundle analysis** | Không biết bundle lớn do đâu |

Angular Dev CLI giải quyết:
- **Smart code generation** với templates
- **Automated migration** scripts
- **Bundle analysis** tools
- **Performance optimization** suggestions

## Ví dụ thực tế

### 1. Generate Component

```bash
# Generate component với routing
ng generate component dashboard --routing --standalone

# Generate component với test
ng generate component user --spec

# Generate component trong folder
ng generate component features/admin/dashboard
```

**Kết quả:**
```
src/app/features/admin/dashboard/
├── dashboard.component.ts
├── dashboard.component.html
├── dashboard.component.scss
├── dashboard.component.spec.ts
└── dashboard.component.routes.ts
```

### 2. Generate Service

```bash
# Generate service
ng generate service services/user

# Generate service với mock
ng generate service services/user --mock
```

### 3. Analyze Bundle

```bash
# Analyze bundle size
ng analyze

# Kết quả:
# main.js: 250KB (gzip: 85KB)
# vendor.js: 400KB (gzip: 130KB)
# Total: 650KB (gzip: 215KB)

# Chi tiết từng module:
# @angular/core: 120KB
# @angular/router: 45KB
# rxjs: 35KB
```

### 4. Migration

```bash
# Upgrade Angular project
ng update @angular/core @angular/cli

# Dry run trước
ng update @angular/core --dry-run

# Migrate với preview
ng update @angular/core --preview
```

### 5. Performance Analysis

```bash
# Analyze performance
ng performance

# Kết quả:
# - Change detection time: 15ms
# - Render time: 50ms
# - Bundle size: 650KB
# - Suggestions:
#   + Use OnPush change detection
#   + Lazy load routes
#   + Use signals for state management
```

## Flow chi tiết

```
ng generate component dashboard
        │
        ▼
Angular CLI tạo files từ templates
        │
        ▼
dashboard.component.ts
dashboard.component.html
dashboard.component.scss
dashboard.component.spec.ts
        │
        ▼
Auto-update app.routes.ts
        │
        ▼
Component sẵn sàng sử dụng
```

## Best practices

1. **Dùng `ng generate`** thay vì tạo files thủ công
2. **Run `ng analyze`** thường xuyên để monitor bundle size
3. **Use `ng update`** để upgrade an toàn
4. **Test migration** trước với `--dry-run`
5. **Monitor performance** với `ng performance`

## Chạy thử

```bash
# Generate component
ng generate component demo

# Analyze bundle
ng analyze

# Check performance
ng performance