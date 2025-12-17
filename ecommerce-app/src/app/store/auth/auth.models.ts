/**
 * 📋 NgRx Auth Models
 *
 * Este archivo define la estructura del estado de autenticación para NgRx Store.
 * Reemplaza el BehaviorSubject<User | null> del UserStateService con un estado más robusto.
 */

import { User } from '../../core/profile.service';

/**
 * 🏗️ Interfaz del estado de autenticación
 *
 * Define la forma exacta que tendrá nuestro estado en el Store.
 * Por ahora solo mantenemos el usuario, pero NgRx nos permite expandir fácilmente.
 */
export interface AuthState {
  user: User | null; // El usuario autenticado (igual que BehaviorSubject)
}

/**
 * 🎯 Estado inicial
 *
 * Equivale al valor inicial del BehaviorSubject: new BehaviorSubject<User | null>(null)
 */
export const initialAuthState: AuthState = {
  user: null,
};
