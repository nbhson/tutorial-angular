import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, VERSION } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, JsonPipe],
  template: `
    <div class="container">
      <section id="navigation">
        <a [routerLink]="['']">Home</a>
        <a [routerLink]="['/product']">Product</a>
        <a [routerLink]="['/category']">Category</a>
        <a [routerLink]="['/not-mapped-in-router-ts']">404</a>
      </section>
      
      <p>How to View Angular Devtools Router Tree</p>
      <ol>
        <li>Be in Angular project v19.0.5 or higher</li>
        <li>Open the <a href="https://angular.dev/tools/devtools" target="_blank">devtools</a></li>
        <li>Open the "Open Settings" gear icon</li>
        <li>Toggle on "Enable Router Graph"</li>
        <li>Go to "Router Tree" tab</li>
      </ol>
      
      <div id="router">
        <router-outlet />
      </div>
      
      <section id="app-info">
        <p>Current URL: {{router.url | json}}</p>
        <p>Current build: {{angularVersion.full}}</p>
      </section>
    </div>
  `,
  styles: [`
    a {
      margin: 0 4px;
    }
  `],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  router = inject(Router);
  angularVersion = VERSION;
}
