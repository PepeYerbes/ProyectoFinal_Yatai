import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/product.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { Router } from '@angular/router';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <div class="admin-products">
      <ui-card>
        <h3>Productos</h3>
        <div *ngIf="loading">Cargando productos...</div>
        <ul *ngIf="!loading">
          <li *ngFor="let p of products">
            <strong>{{ p.name }}</strong> — <span>{{ p.price | currency:"MXN" }}</span>
            <ui-button variant="secondary" (click)="edit(p)">Editar</ui-button>
            <ui-button variant="danger" (click)="remove(p._id)">Eliminar</ui-button>
          </li>
        </ul>
      </ui-card>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  products: Product[] = [];
  loading = true;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  edit(p: Product) {
    this.router.navigate(['/admin/products', p._id, 'edit']);
  }

  remove(id: string) {
    if (!confirm('Eliminar producto?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Error: ' + err.message)
    });
  }
}
