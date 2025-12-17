import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="category-form">
      <ui-card>
        <h3>{{ isEdit ? 'Editar Categoría' : 'Crear Categoría' }}</h3>
        <form (ngSubmit)="submit()">
          <label>Nombre</label>
          <input [(ngModel)]="model.name" name="name" required />

          <label>Descripción</label>
          <textarea [(ngModel)]="model.description" name="description"></textarea>

          <label>Imagen (ruta)</label>
          <input [(ngModel)]="imageInput" name="imageInput" placeholder="/img/categories/ejemplo.jpg" />

          <div class="actions">
            <ui-button variant="primary" type="submit">Guardar</ui-button>
            <ui-button variant="secondary" (click)="cancel()">Cancelar</ui-button>
          </div>
        </form>
      </ui-card>
    </div>
  `
})
export class AdminCategoryFormComponent implements OnInit {
  private svc = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  model: any = { name: '', description: '', imagesUrl: [] };
  imageInput = '';
  isEdit = false;
  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit = true;
      this.svc.getById(this.id).subscribe({ next: (c) => { this.model = c; this.imageInput = (c.imagesUrl && c.imagesUrl[0]) || ''; } });
    }
  }

  submit() {
    if (this.imageInput) this.model.imagesUrl = [this.imageInput];
    if (this.isEdit && this.id) {
      this.svc.update(this.id, this.model).subscribe({ next: () => this.router.navigateByUrl('/admin/categories'), error: (e) => alert(e.message) });
    } else {
      this.svc.create(this.model).subscribe({ next: () => this.router.navigateByUrl('/admin/categories'), error: (e) => alert(e.message) });
    }
  }

  cancel() { this.router.navigateByUrl('/admin/categories'); }
}
