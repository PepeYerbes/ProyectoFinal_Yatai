import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../../core/category.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <div class="admin-categories">
      <ui-card>
        <div class="header">
          <h3>Categorías</h3>
          <ui-button variant="primary" (click)="newCategory()">Nueva Categoría</ui-button>
        </div>
        <div *ngIf="loading">Cargando categorías...</div>
        <ul *ngIf="!loading">
          <li *ngFor="let c of categories">
            <strong>{{ c.name }}</strong>
            <div class="actions">
              <ui-button variant="secondary" (click)="edit(c._id)">Editar</ui-button>
              <ui-button variant="danger" (click)="remove(c._id)">Eliminar</ui-button>
            </div>
          </li>
        </ul>
      </ui-card>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  private svc = inject(CategoryService);
  private router = inject(Router);
  categories: Category[] = [];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({ next: (res) => { this.categories = res || []; this.loading = false; }, error: () => this.loading = false });
  }

  newCategory() { this.router.navigateByUrl('/admin/categories/new'); }
  edit(id?: string) { if (!id) return; this.router.navigateByUrl(`/admin/categories/${id}/edit`); }
  remove(id?: string) {
    if (!id) return;
    if (!confirm('Eliminar categoría?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: (e) => alert('Error: ' + e.message) });
  }
}
