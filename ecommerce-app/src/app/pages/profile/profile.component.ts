import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../core/profile.service';
import { UserStateService } from '../../core/user-state.service';

// NgRx Imports - Para acceder al estado del usuario
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  // ✅ Importar componentes necesarios
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  // ❌ ANTES: Estado local del perfil
  // profile: User | null = null;
  // error = '';

  // ✅ DESPUÉS: Observable del usuario desde NgRx Store
  // El template usará 'user$ | async' para mostrar los datos
  user$: Observable<User | null>;

  // ❌ ANTES: Mantenemos temporalmente para no romper el código existente
  profile: User | null = null;
  error = '';
  private userSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    // ⚠️ MANTENEMOS: UserStateService por compatibilidad
    private userStateService: UserStateService,
    // AGREGAMOS: Store para acceder al estado NgRx
    private store: Store
  ) {
    // ✅ Inicializar el observable después de la inyección
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // ❌ ANTES: Suscripción manual y lógica compleja
    // this.subscribeToUserState();
    // const data = this.route.snapshot.data['profileData'];
    // if (data && !this.profile) {
    //   this.profile = data.user || data;
    // }
    // if (!this.profile && !this.error) {
    //   this.userStateService.loadUser();
    // }

    // ✅ DESPUÉS: Solo disparar acción NgRx para cargar usuario
    // El template usará 'user$ | async' para mostrar los datos automáticamente
    this.store.dispatch(AuthActions.loadUser());

    // ⚠️ TEMPORAL: Mantener suscripción existente para compatibilidad
    this.subscribeToUserState();
  }

  ngOnDestroy(): void {
    // Cleanup suscripciones para evitar memory leaks
    this.userSubscription.unsubscribe();
  }

  /**
   * Suscribirse al estado reactivo del usuario
   */
  private subscribeToUserState(): void {
    this.userSubscription = this.userStateService.user$.subscribe({
      next: (user) => {
        this.profile = user;
        this.error = user ? '' : 'No hay usuario autenticado';
        console.log(
          'ProfileComponent - Usuario actualizado:',
          user?.displayName || 'No autenticado'
        );
      },
      error: (error) => {
        console.error('ProfileComponent - Error en suscripción:', error);
        this.error = 'Error cargando el perfil del usuario';
        this.profile = null;
      },
    });
  }
}
