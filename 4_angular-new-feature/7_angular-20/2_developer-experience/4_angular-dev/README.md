# 4. angular.dev — Documentation Site Mới (Angular 20)

## Tổng quan

Angular 20 giới thiệu **angular.dev** — documentation site mới thay thế `angular.io`, với giao diện hiện đại, tutorial interactive, code playground, và tích hợp AI assistant. Đây là bước nâng cấp lớn cho developer experience.

## URL mới

| Trước | Sau |
|---|---|
| `angular.io` | `angular.dev` |
| `angular.io/guide` | `angular.dev/guide` |
| `angular.io/tutorial` | `angular.dev/tutorials` |

## Tại sao cần feature này?

| Vấn đề với angular.io | Giải pháp angular.dev |
|---|---|
| Giao diện cũ, lỗi thời | Modern design, dark mode support |
| Tutorial text-based | Interactive tutorials với code playground |
| Không có search | Full-text search với AI assist |
| Docs không update | Always up-to-date với latest Angular |
| Không có examples | Code playground chạy trực tiếp |

## Tính năng chính

### 1. Interactive Tutorials

```html
<!-- Code playground chạy trực tiếp trong browser -->
<code-example language="typescript">
  // Viết và chạy Angular code
  // Không cần setup local environment
</code-example>
```

### 2. Code Playground

```typescript
// Chỉnh sửa code và thấy kết quả ngay
@Component({
  template: `
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  `
})
export class PlaygroundComponent {
  title = 'Hello Angular 20!';
  message = 'Edit this code to see changes';
}
```

### 3. API Reference

```html
<!-- API docs với example code -->
<div class="api-reference">
  <h2>signal()</h2>
  <pre><code>
    function signal<T>(initialValue: T): WritableSignal<T>;
  </code></pre>
  <div class="example">Interactive example...</div>
</div>
```

### 4. Dark Mode

```css
/* Support dark mode */
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
  }
}
```

## So sánh trước và sau

### Trước: angular.io

```
angular.io
├── Guide docs (text-heavy)
├── Tutorial docs (static)
├── API reference (basic)
├── No code playground
├── No search
└── Old design
```

### Sau: angular.dev

```
angular.dev
├── Guide docs (interactive)
├── Tutorials (with playground)
├── API reference (rich examples)
├── Code playground
├── Full-text search + AI
└── Modern design + dark mode
```

**Lợi ích:**
- ✅ Learning curve giảm đáng kể
- ✅ Không cần setup environment để học
- ✅ Always up-to-date docs
- ✅ Better search và navigation
- ✅ Dark mode support

## Best practices

1. **Bookmark angular.dev** thay vì angular.io
2. **Dùng interactive tutorials** để học nhanh hơn
3. **Use code playground** để test code snippets
4. **Contribute docs** nếu thấy thiếu thông tin
5. **Follow Angular blog** trên angular.dev

## Truy cập

Mở `https://angular.dev` để bắt đầu.