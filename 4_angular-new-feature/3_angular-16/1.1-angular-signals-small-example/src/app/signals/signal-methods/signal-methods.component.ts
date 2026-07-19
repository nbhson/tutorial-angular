import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-methods',
  templateUrl: './signal-methods.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./signal-methods.component.css'],
})
export class SignalMethodsComponent implements OnInit {
  // quantity
  quantity = signal(1);
  qtyAvailable = signal<Array<number>>([1, 2, 3, 4, 5]);
  qtyEffect = effect(() => console.log('The last option value: ', this.quantity())); // track quantity() WITH effect side

  // vehicle
  selectedVehicle = signal<Vehicle>({ id: 1, name: 'AT-AT', price: 10000 });
  vehicles = signal<Array<Vehicle>>([]);
  exPrice = computed(() => this.selectedVehicle().price * this.quantity()); // track quantity() & selectedVehicle() NO effect side

  // style
  color = computed(() => this.exPrice() > 50000 ? 'green' : 'blue');

  constructor() {}

  ngOnInit() {
    this.quantity.update((currentValue) => currentValue * 2) // default: 2
    // this.selectedVehicle.mutate(v => v.price = v.price + (v.price * .2)) // default price
    this.selectedVehicle.update(pre => {
      return {
        id: pre.id,
        name: pre.name,
        price: pre.price = pre.price + (pre.price * .2)
      }
    }) // default price
  }

  onQuantityChanges(qty: number) {
    this.quantity.set(qty);

    // this.quantity.set(1);
    // this.quantity.set(2);
    // this.quantity.set(3); // the final result
  }

  addQuantity() {
    // ✅ Dùng update() thay vì mutate() (deprecated)
    this.qtyAvailable.update(prev => [...prev, prev[prev.length - 1] + 1]);
  }
}

export interface Vehicle {
  id: number;
  name: string;
  price: number;
}
