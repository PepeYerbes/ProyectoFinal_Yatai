/**
 * ⚡ NgRx Auth Actions
 *
 * Las acciones son eventos que describen qué pasó en la aplicación.
 * Reemplazan las llamadas directas a métodos del UserStateService.
 *
 * Antes: userStateService.loadUser() → llamada directa
 * Ahora: store.dispatch(loadUser()) → acción que puede ser interceptada, logueada, etc.
 */

import { createAction, props } from '@ngrx/store';
import { User } from '../../core/profile.service';

/**
 * 🔄 Acción: Cargar Usuario
 *
 * Equivale a: userStateService.loadUser()
 * Dispara el effect que hace la petición HTTP al servidor.
 */
export const loadUser = createAction('[Auth] Load User');

/**
 * ✅ Acción: Usuario Cargado con Éxito
 *
 * Equivale a: userStateService.setUser(user) después de una respuesta exitosa
 * Contiene los datos del usuario para guardar en el state.
 */
export const loadUserSuccess = createAction('[Auth] Load User Success', props<{ user: User }>());

/**
 * ❌ Acción: Error al Cargar Usuario
 *
 * Equivale a: userStateService.clearUser() después de un error
 * Contiene información del error para debugging.
 */
export const loadUserFailure = createAction('[Auth] Load User Failure', props<{ error: any }>());

/**
 * 🚪 Acción: Logout
 *
 * Equivale a: userStateService.clearUser()
 * Limpia el estado del usuario cuando se hace logout.
 */
export const logout = createAction('[Auth] Logout');
