import { Service, declareExperimentalWebMcpTool, signal } from '@angular/core';

/**
 * Ví dụ 2: Đăng ký WebMCP tools bên trong một SERVICE.
 *
 * `declareExperimentalWebMcpTool` đăng ký tool trong injection context hiện tại
 * (ở đây là constructor của service) và TỰ ĐỘNG gỡ khi service bị destroy.
 *
 * Hai tool bên dưới cho phép một AI agent chạy trong trình duyệt
 * đọc và thay đổi signal `temperature` — trạng thái UI thật của app.
 */
@Service()
export class ThermostatService {
  /** Nhiệt độ hiện tại — state thật của app, được cập nhật live trên màn hình. */
  readonly temperature = signal(21);

  /** Số lần AI đã điều chỉnh nhiệt độ. */
  readonly adjustments = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'get_temperature',
      description: 'Reads the current thermostat temperature in Celsius.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => ({
        content: [{ type: 'text', text: `Current temperature is ${this.temperature()}°C.` }],
      }),
    });

    declareExperimentalWebMcpTool({
      name: 'set_temperature',
      description: 'Sets the target temperature of the thermostat in Celsius (between 15 and 30).',
      inputSchema: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Target temperature in Celsius' },
        },
        required: ['value'],
        additionalProperties: false,
      },
      execute: ({ value }) => {
        // Angular KHÔNG tự validate input — phải validate ở runtime.
        if (value < 15 || value > 30) {
          return {
            content: [{ type: 'text', text: 'Invalid temperature. Must be between 15 and 30°C.' }],
          };
        }
        this.temperature.set(value);
        this.adjustments.update((n) => n + 1);
        return {
          content: [{ type: 'text', text: `Temperature set to ${value}°C.` }],
        };
      },
    });
  }
}
