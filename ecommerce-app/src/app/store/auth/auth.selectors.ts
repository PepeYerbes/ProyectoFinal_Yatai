/**
 * 🎯 NgRx Auth Selectors
 *
 * Los selectores son funciones que extraen y transforman datos del estado.
 * Son como "getters" optimizados con memoización automática.
 *
 * Antes: userStateService.user$ → observable directo
 * Ahora: store.select(selectUser) → selector optimizado con memoización
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.models';

/**
 * 🏗️ Selector base del feature 'auth'
 *
 * Accede a la parte 'auth' del estado global del store.
 */
export const selectAuth = createFeatureSelector<AuthState>('auth');

/**
 * 👤 Selector del usuario actual
 *
 * Equivale a: userStateService.user$
 * Extrae solo el usuario del estado de auth.
 */
export const selectUser = createSelector(selectAuth, (state) => state.user);

/**
 * 🔐 Selector de estado de autenticación
 *
 * Equivale a: userStateService.user$.pipe(map(user => !!user))
 * Calcula si hay un usuario autenticado (true/false).
 */
export const selectIsAuthenticated = createSelector(selectUser, (user) => !!user);
