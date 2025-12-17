import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  template: `
    <div class="admin-dashboard">
      <ui-card class="admin-card" variant="elevated">
        <h2>Panel de Administración</h2>
        <p>Accede a las herramientas de administración del sitio.</p>
        <div class="actions">
          <ui-button variant="primary" (click)="navigateTo('/admin/products')">Gestionar Productos</ui-button>
          <ui-button variant="secondary" (click)="navigateTo('/admin/categories')">Gestionar Categorías</ui-button>
          <ui-button variant="secondary" (click)="navigateTo('/admin/users')">Gestionar Usuarios</ui-button>
          <ui-button variant="secondary" (click)="navigateTo('/admin/orders')">Gestionar Órdenes</ui-button>
          <ui-button variant="secondary" (click)="navigateTo('/admin/reviews')">Gestionar Reseñas</ui-button>
          
        </div>
      </ui-card>
      <div class="admin-children">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}
  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }
}
