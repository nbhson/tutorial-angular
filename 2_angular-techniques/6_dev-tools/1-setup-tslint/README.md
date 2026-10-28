# ESLint + @angular-eslint — Flat Config (v22)

> Nguồn: https://github.com/angular-eslint/angular-eslint — https://angular.dev/cli/lint — https://eslint.org/docs/latest/use/migrate-to-9.0

## TSLint đã khai tử

TSLint chính thức discontinued từ 2021 (Palantir dừng phát triển), codebase Angular đã xóa hoàn toàn. Mọi project Angular hiện đại dùng **ESLint** — và từ Angular v22 / `@angular-eslint` v22, chỉ hỗ trợ **ESLint v9/v10 flat config** (`eslint.config.js`). eslintrc (`.eslintrc.json`) đã không còn được hỗ trợ.

## Cài đặt từ đầu (project mới)

```bash
# Tạo project mới đã có sẵn eslint (Angular v15+)
ng new my-app

# Thêm vào project cũ
ng add @angular-eslint/schematics
# schematic này:
# - cài @angular-eslint/*, typescript-eslint
# - tạo eslint.config.js (flat config)
# - xóa tslint.json nếu có
# - thêm "ng lint" vào angular.json
```

## eslint.config.js — cấu hình flat config

File gốc của mỗi Angular project (sinh tự động, hoặc bạn viết tay):

```javascript
// eslint.config.js — root workspace config
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  // === Config 1: TypeScript files (component, service, directive, pipe...) ===
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    // Lấy inline template (template: ``) trong TS và lint bằng rules HTML
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // Ví dụ: prefer standalone component
      '@angular-eslint/prefer-standalone': 'error',
    },
  },

  // === Config 2: HTML template files ===
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
```

### Giải thích các khối

**`@eslint/js`** — core rules của ESLint (no-undefined, no-eval...).  
**`typescript-eslint`** — parser và rules cho TypeScript (no-unused-vars, no-explicit-any...).  
**`angular.configs.tsRecommended`** — rules áp dụng cho `.ts` files: lifecycle interface implement, no-input-rename, no-output-rename, prefer-control-flow, `inject()` at top of class.  
**`angular.configs.templateRecommended/templateAccessibility`** — rules cho `.html`: no-negated-true, alt-text, click-events-have-key-events (WCAG).  
**`processor: angular.processInlineTemplates`** — magic của angular-eslint: trích inline template từ file TS và lint bằng rules HTML, báo lỗi đúng vị trí dòng trong TS. Không cần cấu hình thêm.

## Chạy lint

```bash
ng lint                        # chạy lint
ng lint --fix                  # auto-fix những gì fixable được
ng lint --format stylish        # output chi tiết
```

```json
// angular.json — ng lint config
{
  "projects": {
    "my-app": {
      "architect": {
        "lint": {
          "builder": "@angular-devkit/build-angular:eslint",
          "options": {
            "eslintConfig": "eslint.config.js",
            "fix": true,
            "lintFilePatterns": ["src/**/*.ts", "src/**/*.html"]
          }
        }
      }
    }
  }
}
```

## Override cho thư viện/library

```javascript
// projects/my-lib/eslint.config.js
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // Thư viện có prefix khác, tên selector khác
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'lib', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'lib', style: 'kebab-case' }],
    },
  },
);
```

## Các rule quan trọng của @angular-eslint

```json
// Ví dụ thêm rule tuỳ chỉnh (mở rộng trong eslint.config.js)
{
  "rules": {
    "@angular-eslint/component-class-suffix": ["error", { "suffixes": ["Component"] }],
    "@angular-eslint/directive-class-suffix": ["error", { "suffixes": ["Directive", "Guard"] }],
    "@angular-eslint/no-input-rename": "error",
    "@angular-eslint/no-output-on-prefix": "error",
    "@angular-eslint/prefer-standalone": "warn",
    "@angular-eslint/relative-url-prefix": "error",
    "@angular-eslint/template/alt-text": "error",
    "@angular-eslint/template/click-events-have-key-events": "error",
    "@angular-eslint/template/mouse-events-have-key-events": "error",
    "@angular-eslint/template/no-negated-true": "error",
    "@angular-eslint/template/no-autofocus": "error",
    "@angular-eslint/template/table-scope": "error",
  }
}
```

## Di chuyển từ tslint.json cũ

```bash
# 1. Cài angular-eslint
npm i -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template \
    @angular-eslint/schematics eslint typescript-eslint

# 2. Chạy schematic (tự sinh eslint.config.js thông minh)
ng g @angular-eslint/schematics:convert-tslint-to-eslint
```

Schematic cố gắng map rule TSLint sang rule ESLint tương đương (không hoàn hảo — cần review lại sau đó).

## Cấu hình trong CI/CD

```yaml
# .github/workflows/lint.yml
- name: ESLint
  run: npm run lint -- --max-warnings 0
  env:
    CI: true
```

## Lỗi thường gặp

- **"Could not find 'processInlineTemplates'"** — thiếu `processor: angular.processInlineTemplates` trong block `*.ts`.
- **"No files matching '**/*.ts'"** — thiếu `files: ['**/*.ts']` trong config block.
- **"plugin:@angular-eslint/* not found"** — cố dùng `extends: ['plugin:@angular-eslint/recommended']` kiểu eslintrc trong flat config. Flat config dùng `...angular.configs.tsRecommended`.
- **Conflicting rules giữa typescript-eslint và angular-eslint** — bỏ `@typescript-eslint/no-unused-vars` và dùng `@angular-eslint/component-class-suffix` thay vì cấu hình trùng lặp.

## Checklist

- [ ] Đã gỡ `tslint.json` (nếu có).
- [ ] File `eslint.config.js` có `files: ['**/*.ts']` + `processor: angular.processInlineTemplates`.
- [ ] Có block `files: ['**/*.html']` cho template rules.
- [ ] Chạy `ng lint --fix` không lỗi.

## Tham khảo

- [angular-eslint README](https://github.com/angular-eslint/angular-eslint)
- [Configuring ESLint for Angular](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINT.md)
- [eslint.org — Migrate to flat config](https://eslint.org/docs/latest/use/migrate-to-9.0)
