import { afterNextRender, afterRender, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule],
})
export class AppComponent {
  secretWord = signal('angular17');
  word = signal('');
  success = computed(() => this.secretWord() === this.word());
  // Note: viewChild.required() là v17.2 preview / v18 stable — v17.0 dùng viewChild() + optional check
  wordBlock = viewChild<ElementRef>('wordBlock');

  constructor() {
    // v17 API: afterNextRender(cb) — chạy 1 lần sau render đầu tiên
    afterNextRender(() => {
      console.log('First render done, DOM ready:', this.wordBlock()?.nativeElement);
    });

    // v17 API: afterRender(cb, {phase}) — object spec {write, read, ...} là từ v18.1+
    // Giữ AfterRenderRef để .destroy() khi cleanup (tránh leak subscription trong callback)
    const ref = afterRender(
      () => {
        const el = this.wordBlock()?.nativeElement;
        if (el) {
          el.style.backgroundColor = this.success() ? 'green' : 'red';
        }
      },
      { phase: 'write' }
    );
    // Khi không cần nữa: ref.destroy();
  }
}
