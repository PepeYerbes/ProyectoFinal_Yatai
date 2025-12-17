/**
 * 🔄 NgRx Auth Reducer
 *
 * El reducer es una función pura que toma el estado actual y una acción,
 * y devuelve el nuevo estado. Es como el "setState" de React pero más predecible.
 *
 * Antes: BehaviorSubject.next(newValue) → cambio directo
 * Ahora: Reducer → cambio predecible basado en acciones
 */

import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.models';

export const authReducer = createReducer<AuthState>(
  initialAuthState,

  /**
   * ✅ Cuando se carga el usuario exitosamente
   *
   * Equivale a: this.currentUserSubject.next(user)
   * Guarda el usuario en el estado del store.
   */
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
  })),

  /**
   * 🚪 Cuando se hace logout
   *
   * Equivale a: this.currentUserSubject.next(null)
   * Limpia el usuario del estado del store.
   */
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
  }))
);
