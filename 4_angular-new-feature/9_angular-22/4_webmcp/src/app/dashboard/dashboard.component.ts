import { Component } from '@angular/core';

/**
 * Route-scoped WebMCP tool: `exportDashboardReports`.
 *
 * Tool được đăng ký ở `providers` của route `/dashboard` (xem app.routes.ts).
 * Nhờ `withExperimentalAutoCleanupInjectors()`, khi rời khỏi route này
 * tool tự được gỡ — AI agent không còn gọi được nó ở các trang khác.
 */
@Component({
  selector: 'app-dashboard',
  template: `
    <h2>📊 Dashboard</h2>
    <p>
      Tool <code>exportDashboardReports</code> chỉ khả dụng khi bạn ở trang này.
      Rời khỏi route, Angular tự gỡ tool (auto-cleanup).
    </p>
    <p class="hint">Bấm "Home" để thấy tool bị gỡ khỏi phiên WebMCP.</p>
  `,
  styles: [
    `
      h2 {
        font-size: 18px;
      }
      code {
        background: #f3f4f6;
        padding: 1px 5px;
        border-radius: 4px;
      }
      .hint {
        color: #6b7280;
        font-size: 13px;
      }
    `,
  ],
})
export class DashboardComponent {}
