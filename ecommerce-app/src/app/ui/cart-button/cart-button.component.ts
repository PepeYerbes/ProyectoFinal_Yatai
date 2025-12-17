import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'ui-cart-button',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, BadgeComponent],
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.css'
})
export class CartButtonComponent {
  @Input() count = 0;
  @Input() label = 'Carrito';
  @Input() showLabel = true;
}
