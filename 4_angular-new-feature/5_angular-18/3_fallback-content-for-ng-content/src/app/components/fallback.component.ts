import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fallback',
  template: `
    <ng-content select=".header">Default Header</ng-content>
    <ng-content select="#content">Default Content Body</ng-content>
    <ng-content select="[data='footer']">Default Footer</ng-content>
    <hr>
    <ng-content>Default Content</ng-content>
  `,
  styles: [``],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class FallbackComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
