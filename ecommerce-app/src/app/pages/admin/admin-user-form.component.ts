import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="user-form">
      <ui-card>
        <h3>Editar Usuario</h3>
        <form (ngSubmit)="submit()">
          <label>Nombre</label>
          <input [(ngModel)]="model.displayName" name="displayName" />

          <label>Email</label>
          <input [(ngModel)]="model.email" name="email" />

          <label>Rol</label>
          <select [(ngModel)]="model.role" name="role">
            <option value="guest">guest</option>
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>

          <label>Activo</label>
          <select [(ngModel)]="model.isActive" name="isActive">
            <option [ngValue]="true">Sí</option>
            <option [ngValue]="false">No</option>
          </select>

          <div class="actions">
            <ui-button variant="primary" type="submit">Guardar</ui-button>
            <ui-button variant="secondary" (click)="cancel()">Cancelar</ui-button>
          </div>
        </form>
      </ui-card>
    </div>
  `
})
export class AdminUserFormComponent implements OnInit {
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  model: any = { displayName: '', email: '', role: 'guest', isActive: true };
  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.admin.getUsers({}).subscribe({ next: (res) => {
        const u = (res.users || []).find(x => x._id === this.id);
        if (u) this.model = u;
      }});
    }
  }

  submit() {
    if (!this.id) return;
    this.admin.updateUser(this.id, this.model).subscribe({ next: () => this.router.navigate(['/admin/users']), error: (e) => alert(e.message) });
  }

  cancel() { this.router.navigate(['/admin/users']); }
}
