import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FallbackComponent } from "./components/fallback.component";

@Component({
  selector: 'app-root',
  template: `
  <app-fallback>
    <span class="header">New Header </span>
    <span id="content">New Content </span>
    <span data='footer'>New Footer </span>
  </app-fallback>
  `,
  styles: [``],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FallbackComponent]
})
export class AppComponent {
  title = '3_signal-new-api';
}
