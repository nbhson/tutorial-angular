import { Component, effect, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  query = signal('');
  results = signal<string[]>([]);

  constructor() {
    // Demo thật: ghi signal trong effect — v19 không cần allowSignalWrites
    // (flag đã bị xóa khỏi signature effect(fn, options))
    effect(() => {
      const q = this.query().trim().toLowerCase();
      // ✅ Ghi signal khác trong effect — hợp lệ từ v19
      this.results.set(
        ['apple', 'banana', 'orange'].filter((f) => f.includes(q))
      );
    });
  }

  onInput(value: string): void {
    this.query.set(value);
  }
}
