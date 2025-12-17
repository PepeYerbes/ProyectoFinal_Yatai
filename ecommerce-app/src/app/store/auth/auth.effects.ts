/**
 * 🌊 NgRx Auth Effects
 *
 * Los effects manejan efectos laterales (side effects) como llamadas HTTP.
 * Escuchan acciones y pueden disparar nuevas acciones basadas en el resultado.
 *
 * Antes: userStateService.loadUser() → lógica directa en el servicio
 * Ahora: Effect → lógica desacoplada que escucha la acción loadUser
 */

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ProfileService } from '../../core/profile.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  // 🔧 Inyección moderna de dependencias (Angular 18+)
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  /**
   * 🔄 Effect: Cargar Usuario
   *
   * Equivale a la lógica completa de userStateService.loadUser():
   * 1. Verificar si está logueado
   * 2. Hacer petición HTTP al perfil
   * 3. Actualizar estado con éxito o error
   */
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      // 👂 Escuchar solo la acción 'loadUser'
      ofType(AuthActions.loadUser),

      // 🔄 Para cada acción loadUser, hacer esto:
      mergeMap(() => {
        // ✅ Verificación temprana: ¿está logueado?
        if (!this.authService.isLoggedIn()) {
          // ❌ No logueado → disparar logout para limpiar estado
          return of(AuthActions.logout());
        }

        // 🌐 Hacer petición HTTP para obtener perfil
        return this.profileService.getProfile().pipe(
          // ✅ Éxito → disparar acción de éxito con los datos
          map((response) => AuthActions.loadUserSuccess({ user: response.user })),

          // ❌ Error → disparar acción de error
          catchError((error) => of(AuthActions.loadUserFailure({ error })))
        );
      })
    )
  );

  /**
   * 🚪 Effect: Logout
   *
   * Equivale a: authService.logout()
   * Se ejecuta cuando se dispara la acción logout y limpia el token
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      // 👂 Escuchar solo la acción 'logout'
      ofType(AuthActions.logout),

      // 🧹 Ejecutar la lógica de logout del AuthService
      map(() => {
        this.authService.logout(); // Limpia el localStorage
        console.log('🔓 NgRx Effect: Usuario deslogueado');
        return { type: '[Auth] Logout Complete' }; // Acción interna, no la exportamos
      })
    )
  );
}
