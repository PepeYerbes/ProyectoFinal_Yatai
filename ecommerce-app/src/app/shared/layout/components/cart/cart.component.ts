import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItemsCount = 0; // Esta lógica vendría de un servicio de carrito

  onCartClick() {
    console.log('Cart clicked');
    // Aquí iría la lógica para abrir el carrito
  }
}
