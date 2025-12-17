import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../../core/admin.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { Router } from '@angular/router';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <div class="admin-users">
      <ui-card>
        <h3>Usuarios</h3>
        <div *ngIf="loading">Cargando usuarios...</div>
        <table *ngIf="!loading">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.displayName }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.isActive ? 'Sí' : 'No' }}</td>
              <td>
                <ui-button variant="secondary" (click)="toggle(u._id)">{{ u.isActive ? 'Desactivar' : 'Activar' }}</ui-button>
                <ui-button variant="danger" (click)="remove(u._id)">Eliminar</ui-button>
              </td>
            </tr>
          </tbody>
        </table>
      </ui-card>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private admin = inject(AdminService);
  private router = inject(Router);
  users: AdminUser[] = [];
  loading = true;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.admin.getUsers({ limit: '50' }).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  toggle(id: string) {
    this.admin.toggleUserStatus(id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Error: ' + err.message)
    });
  }

  remove(id: string) {
    if (!confirm('Eliminar usuario? (esto solo desactiva en backend)')) return;
    this.admin.deleteUser(id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Error: ' + err.message)
    });
  }

  edit(id: string) {
    this.router.navigate(['/admin/users', id, 'edit']);
  }
}
