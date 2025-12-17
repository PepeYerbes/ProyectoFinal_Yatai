import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="product-form">
      <ui-card>
        <h3>{{ isEdit ? 'Editar Producto' : 'Crear Producto' }}</h3>
        <form #f="ngForm" (ngSubmit)="submit()">
          <label>Nombre</label>
          <input name="name" [(ngModel)]="model.name" required />

          <label>Precio</label>
          <input name="price" type="number" [(ngModel)]="model.price" required />

          <label>Stock</label>
          <input name="stock" type="number" [(ngModel)]="model.stock" required />

          <label>Descripción</label>
          <textarea name="description" [(ngModel)]="model.description"></textarea>

          <label>Imagen (ruta relativa)</label>
          <input name="imagesUrl" [(ngModel)]="imageInput" placeholder="/img/products/ejemplo.jpg" />

          <div class="actions">
            <ui-button variant="primary" type="submit">Guardar</ui-button>
            <ui-button variant="secondary" (click)="cancel()">Cancelar</ui-button>
          </div>
        </form>
      </ui-card>
    </div>
  `
})
export class AdminProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  model: any = { name: '', price: 0, stock: 0, description: '', imagesUrl: [] };
  imageInput = '';
  isEdit = false;
  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit = true;
      this.productService.getById(this.id).subscribe({ next: (p) => { this.model = p; this.imageInput = (p.imagesUrl && p.imagesUrl[0]) || ''; } });
    }
  }

  submit() {
    if (this.imageInput) this.model.imagesUrl = [this.imageInput];
    if (this.isEdit && this.id) {
      this.productService.updateProduct(this.id, this.model).subscribe({ next: () => this.router.navigate(['/admin/products']), error: (e) => alert(e.message) });
    } else {
      this.productService.createProduct(this.model).subscribe({ next: () => this.router.navigate(['/admin/products']), error: (e) => alert(e.message) });
    }
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }
}
