import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ProfileService, User } from './profile.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  // BehaviorSubject para el estado del usuario
  // Inicia con null (usuario no autenticado)
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observable público para que los componentes se suscriban
  public user$ = this.currentUserSubject.asObservable();

  /**
   * Obtiene el usuario actual (valor inmediato, no reactivo)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Carga los datos del usuario desde el servidor
   * Solo si está autenticado
   */
  loadUser(): void {
    // Si no está logueado, no hacer nada
    if (!this.authService.isLoggedIn()) {
      this.clearUser();
      return;
    }

    // Obtener datos del perfil desde el servidor
    this.profileService.getProfile().pipe(
      tap((response) => {
        // Actualizar el estado con los datos del usuario
        this.setUser(response.user);
        console.log('Usuario cargado:', response.user.displayName);
      }),
      catchError((error) => {
        console.error('Error cargando usuario:', error);
        // Si hay error, limpiar el estado
        this.clearUser();
        return EMPTY;
      })
    ).subscribe();
  }

  /**
   * Establece un usuario en el estado
   */
  setUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Limpia el estado del usuario (logout)
   */
  clearUser(): void {
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}
