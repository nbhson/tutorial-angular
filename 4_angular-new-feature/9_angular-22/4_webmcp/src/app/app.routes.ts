import { provideExperimentalWebMcpTools } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * Ví dụ 3: Đăng ký WebMCP tool gắn với ROUTE.
 *
 * Tool `exportDashboardReports` chỉ tồn tại khi người dùng đang ở route `/dashboard`.
 * Kết hợp với `withExperimentalAutoCleanupInjectors()` (đã bật ở app.config.ts),
 * Angular tự gỡ tool khi điều hướng khỏi route — AI agent không còn gọi được nó nữa.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'exportDashboardReports',
          description: 'Exports the current dashboard analytics as a CSV summary.',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['csv', 'json'],
                description: 'Export format (csv or json).',
              },
            },
            required: ['format'],
            additionalProperties: false,
          },
          execute: ({ format }) => {
            // execute chạy trong injection context của route injector
            const report = summarizeMetrics();
            return {
              content: [{ type: 'text', text: `[${format.toUpperCase()}] ${report}` }],
            };
          },
        },
      ]),
    ],
  },
];

/** Giả lập dữ liệu analytics cho demo. */
function summarizeMetrics(): string {
  return JSON.stringify({
    sessions: 1240,
    conversions: 87,
    bounceRate: '42.3%',
    generatedAt: new Date().toISOString(),
  });
}
