import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminUser = {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getUsers(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return this.http.get<{ users: AdminUser[] }>(`${this.api}/users${qs ? '?' + qs : ''}`).pipe(
      catchError(() => throwError(() => new Error('No se pudieron obtener los usuarios')))
    );
  }

  updateUser(id: string, body: Partial<AdminUser>) {
    return this.http.put<{ user: AdminUser }>(`${this.api}/users/${id}`, body).pipe(
      catchError(() => throwError(() => new Error('No se pudo actualizar el usuario')))
    );
  }

  toggleUserStatus(id: string) {
    return this.http.patch<{ user: AdminUser }>(`${this.api}/users/${id}/toggle-status`, {}).pipe(
      catchError(() => throwError(() => new Error('No se pudo cambiar el estado del usuario')))
    );
  }

  deleteUser(id: string) {
    return this.http.delete<{ message?: string }>(`${this.api}/users/${id}`).pipe(
      catchError(() => throwError(() => new Error('No se pudo eliminar el usuario')))
    );
  }
}
