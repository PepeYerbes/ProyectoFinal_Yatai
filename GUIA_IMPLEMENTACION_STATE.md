# 🛠️ GUÍA PRÁCTICA: Implementar State Management

## Parte 1: MEJORAR ProductService (15 minutos)

### ANTES - Sin estado centralizado
```typescript
// product.service.ts
export class ProductService {
  getAll() {
    return this.http.get<{ products: Product[] }>(`/api/products`);
  }
}

// home.component.ts
ngOnInit() {
  this.productService.getAll().subscribe(res => {
    this.products = res.products; // Cada componente hace su llamada
  });
}
```

**Problemas:**
- ❌ Cada componente hace llamadas HTTP redundantes
- ❌ Sin cache reactivo
- ❌ No se actualiza automáticamente en otros componentes

---

### DESPUÉS - Con BehaviorSubject

**Archivo:** [product.service.ts](ecommerce-app/src/app/core/product.service.ts)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // 📦 Estado centralizado: lista de productos
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  // 🏷️ Estado: categorías
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  /**
   * Obtener TODOS los productos (con cache)
   * - Primera llamada: HTTP ✅
   * - Llamadas siguientes: desde BehaviorSubject 🚀
   */
  getAll(): Observable<{ products: Product[] }> {
    // Si ya tenemos datos, devolverlos inmediatamente
    const cached = this.productsSubject.value;
    if (cached.length > 0) {
      return this.products$.pipe(
        map(products => ({ products }))
      );
    }

    // Si no, traer del servidor y cachear
    return this.http.get<{ products: Product[] }>(`${this.api}/products`).pipe(
      tap(res => {
        const normalized = (res.products || []).map(p => this.normalizeProduct(p));
        this.productsSubject.next(normalized);
      }),
      map(res => ({
        ...res,
        products: (res.products || []).map(p => this.normalizeProduct(p))
      })),
      shareReplay(1) // Compartir entre múltiples suscriptores
    );
  }

  /**
   * Obtener productos por categoría
   */
  getByCategory(categoryId: string): Observable<Product[]> {
    return this.http
      .get<{ products: Product[] }>(
        `${this.api}/products/search?category=${categoryId}`
      )
      .pipe(
        map(res => (res.products || []).map(p => this.normalizeProduct(p))),
        tap(products => {
          // Actualizar estado con todos los productos (merge)
          const current = this.productsSubject.value;
          const merged = [
            ...current.filter(p => !products.find(np => np._id === p._id)),
            ...products
          ];
          this.productsSubject.next(merged);
        })
      );
  }

  /**
   * Cargar categorías (similar pattern)
   */
  loadCategories(): Observable<Category[]> {
    const cached = this.categoriesSubject.value;
    if (cached.length > 0) {
      return this.categories$;
    }

    return this.http.get<Category[]>(`${this.api}/categories`).pipe(
      tap(categories => this.categoriesSubject.next(categories)),
      catchError(() => {
        console.error('Error cargando categorías');
        return of([]);
      })
    );
  }

  // ... resto de métodos ...

  private normalizeProduct(product: Product): Product {
    if (!product) return product;
    product.imagesUrl = (product.imagesUrl || []).map((img) => this.normalizeImage(img));
    return product;
  }

  private normalizeImage(src?: string): string {
    if (!src) return '/assets/placeholder-product.jpg';
    if (/^https?:\/\//i.test(src)) return src;
    if (src.includes('assets/imagen/')) {
      const filename = src.split('/').pop();
      return `/img/products/${filename}`;
    }
    return src.startsWith('/') ? src : `/${src}`;
  }
}
```

---

## Parte 2: CONSUMIR desde el Componente (async pipe)

### ANTES - Manual subscription
```typescript
// home.component.ts
export class HomeComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAll()
      .pipe(
        map(res => res.products),
        takeUntil(this.destroy$) // ❌ Manual cleanup
      )
      .subscribe(products => {
        this.products = products;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Template
<div *ngFor="let p of products">{{ p.name }}</div>
```

---

### DESPUÉS - async pipe (automático)

```typescript
// home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products">
      <div *ngFor="let p of products$ | async" class="product-card">
        <h3>{{ p.name }}</h3>
        <p>{{ p.price | currency }}</p>
        <button (click)="addToCart(p)">Agregar</button>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // ✅ Observable público - sin subscribe manual
  products$ = this.productService.products$;

  ngOnInit() {
    // ✅ Solo cargar, el async pipe se encarga del resto
    this.productService.getAll().subscribe();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product._id, 1).subscribe();
  }
}

// Template es más limpio:
// ✅ *ngFor lo actualiza automáticamente
// ✅ No necesitas ngOnDestroy
// ✅ No hay memory leaks
```

---

## Parte 3: CONSOLIDAR Usuario (Elegir UNO)

### Opción A: Simplificar a BehaviorSubject

**Archivo:** [user-state.service.ts](ecommerce-app/src/app/core/user-state.service.ts) (ya existe)

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ProfileService, User } from './profile.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  // 👤 Estado: usuario autenticado
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.currentUserSubject.asObservable();

  // 🔐 Estado: si está logueado
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Obtener usuario actual (valor inmediato)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Cargar usuario del servidor
   */
  loadUser(): void {
    if (!this.authService.isLoggedIn()) {
      this.clearUser();
      return;
    }

    this.profileService.getProfile().pipe(
      tap((response) => {
        this.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
        console.warn('✅ Usuario cargado:', response.user.displayName);
      }),
      catchError((error) => {
        console.error('❌ Error cargando usuario:', error);
        this.clearUser();
        return EMPTY;
      })
    ).subscribe();
  }

  /**
   * Establecer usuario en el estado
   */
  setUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  /**
   * Limpiar usuario (logout)
   */
  clearUser(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Actualizar rol del usuario
   */
  updateUserRole(newRole: 'guest' | 'customer' | 'admin'): void {
    const user = this.currentUserSubject.value;
    if (user) {
      this.setUser({ ...user, role: newRole });
    }
  }
}
```

**✅ Ventajas:**
- Simple de entender
- Sin configuración extra
- Funciona bien para apps pequeñas/medianas

**❌ Desventajas:**
- Sin debugging avanzado
- Más propenso a errores manuales

---

### Opción B: Usar NgRx (Recomendado si crece)

#### Paso 1: Crear Models
**Archivo:** [store/user/user.models.ts](ecommerce-app/src/app/store/user/user.models.ts) (NUEVO)

```typescript
import { User } from '../../core/profile.service';

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialUserState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};
```

#### Paso 2: Crear Actions
**Archivo:** [store/user/user.actions.ts](ecommerce-app/src/app/store/user/user.actions.ts) (NUEVO)

```typescript
import { createAction, props } from '@ngrx/store';
import { User } from '../../core/profile.service';

export const loadUser = createAction(
  '[User] Load User'
);

export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: User }>()
);

export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: string }>()
);

export const logout = createAction(
  '[User] Logout'
);

export const updateUserRole = createAction(
  '[User] Update Role',
  props<{ newRole: 'guest' | 'customer' | 'admin' }>()
);
```

#### Paso 3: Crear Reducer
**Archivo:** [store/user/user.reducer.ts](ecommerce-app/src/app/store/user/user.reducer.ts) (NUEVO)

```typescript
import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { UserState, initialUserState } from './user.models';

export const userReducer = createReducer<UserState>(
  initialUserState,

  on(UserActions.loadUser, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(UserActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    isAuthenticated: true,
  })),

  on(UserActions.loadUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
  })),

  on(UserActions.logout, (state) => ({
    ...state,
    user: null,
    isAuthenticated: false,
  })),

  on(UserActions.updateUserRole, (state, { newRole }) => ({
    ...state,
    user: state.user ? { ...state.user, role: newRole } : null,
  }))
);
```

#### Paso 4: Crear Effects (para HTTP)
**Archivo:** [store/user/user.effects.ts](ecommerce-app/src/app/store/user/user.effects.ts) (NUEVO)

```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as UserActions from './user.actions';
import { ProfileService } from '../../core/profile.service';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private profileService = inject(ProfileService);

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap(() =>
        this.profileService.getProfile().pipe(
          map((response) => UserActions.loadUserSuccess({ user: response.user })),
          catchError((error) =>
            of(UserActions.loadUserFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
```

#### Paso 5: Crear Selectors
**Archivo:** [store/user/user.selectors.ts](ecommerce-app/src/app/store/user/user.selectors.ts) (NUEVO)

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.models';

const selectUserState = createFeatureSelector<UserState>('user');

export const selectCurrentUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectUserState,
  (state: UserState) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectUserState,
  (state: UserState) => state.isLoading
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);
```

#### Paso 6: Usar en Componente
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../store/user/user.selectors';
import * as UserActions from '../../store/user/user.actions';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="user$ | async as user">
      <h1>{{ user.displayName }}</h1>
      <p>{{ user.email }}</p>
      <p>Rol: {{ user.role }}</p>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);

  // ✅ Observable del usuario desde el store
  user$ = this.store.select(UserSelectors.selectCurrentUser);
  isLoading$ = this.store.select(UserSelectors.selectIsLoading);

  ngOnInit() {
    this.store.dispatch(UserActions.loadUser());
  }
}
```

**✅ Ventajas:**
- Debugging con Redux DevTools
- Escalable para apps grandes
- Patrón predecible
- Fácil de testear

**❌ Desventajas:**
- Boilerplate inicial
- Curva de aprendizaje
- Overkill para apps pequeñas

---

## Parte 4: MEJORAR CartService (Ya está bien, pequeños ajustes)

**Archivo:** [cart.service.ts](ecommerce-app/src/app/core/cart.service.ts)

Tu CartService ya está bien implementado ✅. Solo agreguerequire estos métodos:

```typescript
/**
 * Obtener número total de items
 */
public get itemCount(): number {
  const cart = this.cartSubject.value;
  return cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;
}

/**
 * Observable para cambios en el carrito
 */
public cart$ = this.cartSubject.asObservable();

/**
 * Obtener total del carrito
 */
getTotalPrice(): number {
  const cart = this.cartSubject.value;
  return (
    cart?.products?.reduce((total, item) => 
      total + item.product.price * item.quantity, 0
    ) || 0
  );
}
```

---

## Parte 5: ELIMINAR `any` Types en Admin

**Archivo:** [admin-user-form.component.ts](ecommerce-app/src/app/pages/admin/admin-user-form.component.ts)

### ANTES ❌
```typescript
model: any = { displayName: '', email: '', role: 'guest', isActive: true };
```

### DESPUÉS ✅
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { ProfileService, User } from '../../core/profile.service';

interface UserFormModel extends User {
  // Campos opcionales del formulario
}

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`
})
export class AdminUserFormComponent implements OnInit {
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ✅ Tipado correctamente
  model: UserFormModel = {
    _id: '',
    displayName: '',
    email: '',
    role: 'guest',
    isActive: true,
    avatar: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.admin.getUsers({}).subscribe({
        next: (res) => {
          const user = (res.users || []).find(x => x._id === this.id);
          if (user) this.model = user;
        }
      });
    }
  }

  submit() {
    if (!this.id) return;
    this.admin.updateUser(this.id, this.model).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (e) => alert(e.message)
    });
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }
}
```

---

## 📊 Resumen de Cambios

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `product.service.ts` | Agregar `products$` BehaviorSubject | 🔴 ALTA |
| `user-state.service.ts` | Consolidar (eliminar duplicación con NgRx) | 🟡 MEDIA |
| `cart.service.ts` | Mantener, solo revisar métodos helper | ✅ OK |
| `admin-user-form.component.ts` | Eliminar `any`, usar tipos correctos | 🟡 MEDIA |
| Componentes | Usar `async` pipe en lugar de subscribe | 🔴 ALTA |

---

## ✅ Testing: Cómo Validar

```typescript
// product.service.spec.ts
describe('ProductService con State', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  it('debe cachear productos después del primer GET', (done) => {
    const mockProducts = {
      products: [
        { _id: '1', name: 'Producto 1', price: 50 },
        { _id: '2', name: 'Producto 2', price: 100 }
      ]
    };

    // Primera llamada
    service.getAll().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/products`);
    req.flush(mockProducts);

    // Segunda llamada - debe venir del cache
    let cachedProducts: any;
    service.products$.subscribe(p => cachedProducts = p);

    expect(cachedProducts.length).toBe(2);
    http.expectNone(`${environment.apiUrl}/products`); // No debe hacer otra solicitud

    done();
  });
});
```

