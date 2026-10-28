import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styles: []
})
export class App {
  readonly attacks = [
    { magicDamage: 10 },
    { physicalDamage: 10 },
    { magicDamage: 10, physicalDamage: 10 },
  ];
}
