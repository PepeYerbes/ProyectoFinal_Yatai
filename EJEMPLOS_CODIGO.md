# 💻 EJEMPLOS DE CÓDIGO: Implementación Detallada

## Ejemplo 1: ProductService con products$ BehaviorSubject

**Archivo a crear/modificar:** `ecommerce-app/src/app/core/product.service.ts`

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Category {
  _id: string;
  name: string;
  description: string;
  imagesUrl: string[];
  parentCategory: string | null;
}

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagesUrl: string[];
  category: Category;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  /**
   * 📦 ESTADO CENTRALIZADO: Todos los productos
   * Se actualiza cuando:
   * - getAll() es llamado
   * - getByCategory() es llamado
   * - search() es llamado
   */
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  /**
   * 🏷️ ESTADO CENTRALIZADO: Todas las categorías
   */
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  /**
   * Obtener TODOS los productos
   * 
   * ✅ SMART CACHING:
   * - Primera llamada: HTTP GET
   * - Siguientes llamadas: desde BehaviorSubject (caché)
   * 
   * @returns Observable con array de productos
   */
  getAll(): Observable<{ products: Product[] }> {
    // 🔍 Verificar si ya tenemos datos en caché
    const cachedProducts = this.productsSubject.value;
    if (cachedProducts.length > 0) {
      // ✅ Devolver desde caché (sin HTTP)
      return this.products$.pipe(
        map(products => ({ products })),
        shareReplay(1) // Compartir con múltiples suscriptores
      );
    }

    // ❌ No hay caché, traer del servidor
    return this.http
      .get<{ products: Product[] }>(`${this.api}/products`)
      .pipe(
        // 🔄 Normalizar y almacenar en caché
        tap(response => {
          const normalized = (response.products || []).map(p =>
            this.normalizeProduct(p)
          );
          this.productsSubject.next(normalized);
        }),
        // 🎯 Normalizar respuesta
        map(response => ({
          ...response,
          products: (response.products || []).map(p =>
            this.normalizeProduct(p)
          ),
        })),
        // 🔗 Compartir entre suscriptores
        shareReplay(1),
        // ⚠️ Manejar errores
        catchError(() =>
          throwError(
            () => new Error('No se pudieron obtener los productos')
          )
        )
      );
  }

  /**
   * Obtener producto por ID
   * @param id - ID del producto
   * @returns Producto encontrado
   */
  getById(id: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.api}/products/${id}`)
      .pipe(
        map(p => this.normalizeProduct(p)),
        catchError(() =>
          throwError(
            () => new Error('No se pudo obtener el producto')
          )
        )
      );
  }

  /**
   * Buscar productos
   * @param query - Término de búsqueda
   * @returns Array de productos que coinciden
   */
  search(query: string): Observable<{ products: Product[] }> {
    return this.http
      .get<{ products: Product[] }>(
        `${this.api}/products/search?q=${encodeURIComponent(query)}`
      )
      .pipe(
        // 🔄 Actualizar caché con resultados de búsqueda
        tap(response => {
          const normalized = (response.products || []).map(p =>
            this.normalizeProduct(p)
          );
          // Merge con productos existentes
          const current = this.productsSubject.value;
          const merged = [
            ...current.filter(p => !normalized.find(n => n._id === p._id)),
            ...normalized,
          ];
          this.productsSubject.next(merged);
        }),
        map(res => ({
          ...res,
          products: (res.products || []).map(p =>
            this.normalizeProduct(p)
          ),
        }))
      );
  }

  /**
   * Obtener productos por categoría
   * @param categoryId - ID de la categoría
   * @returns Array de productos de esa categoría
   */
  getByCategory(categoryId: string): Observable<Product[]> {
    return this.http
      .get<{ products: Product[] }>(
        `${this.api}/products/search?category=${categoryId}`
      )
      .pipe(
        map(res => (res.products || []).map(p => this.normalizeProduct(p))),
        tap(products => {
          // 🔄 Actualizar caché
          const current = this.productsSubject.value;
          const merged = [
            ...current.filter(p => !products.find(np => np._id === p._id)),
            ...products,
          ];
          this.productsSubject.next(merged);
        }),
        catchError(() =>
          throwError(
            () => new Error('No se pudieron obtener los productos')
          )
        )
      );
  }

  /**
   * Cargar categorías
   * @returns Array de categorías
   */
  getCategories(): Observable<Category[]> {
    // 🔍 Verificar caché
    const cached = this.categoriesSubject.value;
    if (cached.length > 0) {
      return this.categories$;
    }

    // Traer del servidor
    return this.http
      .get<Category[]>(`${this.api}/categories`)
      .pipe(
        tap(categories => this.categoriesSubject.next(categories)),
        catchError(() => {
          console.error('❌ Error cargando categorías');
          return of([]);
        })
      );
  }

  // ==================== ADMIN METHODS ====================

  /**
   * ADMIN: Crear nuevo producto
   */
  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.http
      .post<Product>(`${this.api}/products`, payload)
      .pipe(
        tap(newProduct => {
          // 🔄 Actualizar caché local
          const normalized = this.normalizeProduct(newProduct);
          const current = this.productsSubject.value;
          this.productsSubject.next([...current, normalized]);
        }),
        map(p => this.normalizeProduct(p)),
        catchError(() =>
          throwError(
            () => new Error('No se pudo crear el producto')
          )
        )
      );
  }

  /**
   * ADMIN: Actualizar producto
   */
  updateProduct(
    id: string,
    payload: Partial<Product>
  ): Observable<Product> {
    return this.http
      .put<Product>(`${this.api}/products/${id}`, payload)
      .pipe(
        tap(updatedProduct => {
          // 🔄 Actualizar caché local
          const normalized = this.normalizeProduct(updatedProduct);
          const current = this.productsSubject.value;
          const updated = current.map(p =>
            p._id === id ? normalized : p
          );
          this.productsSubject.next(updated);
        }),
        map(p => this.normalizeProduct(p)),
        catchError(() =>
          throwError(
            () => new Error('No se pudo actualizar el producto')
          )
        )
      );
  }

  /**
   * ADMIN: Eliminar producto
   */
  deleteProduct(id: string): Observable<{ message?: string }> {
    return this.http
      .delete<{ message?: string }>(`${this.api}/products/${id}`)
      .pipe(
        tap(() => {
          // 🔄 Actualizar caché local
          const current = this.productsSubject.value;
          const filtered = current.filter(p => p._id !== id);
          this.productsSubject.next(filtered);
        }),
        catchError(() =>
          throwError(
            () => new Error('No se pudo eliminar el producto')
          )
        )
      );
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Normalizar producto: arreglar rutas de imágenes
   */
  private normalizeProduct(product: Product): Product {
    if (!product) return product;
    product.imagesUrl = (product.imagesUrl || []).map(img =>
      this.normalizeImage(img)
    );
    return product;
  }

  /**
   * Normalizar ruta de imagen según contexto
   */
  private normalizeImage(src?: string): string {
    if (!src) return '/assets/placeholder-product.jpg';
    if (/^https?:\/\//i.test(src)) return src; // URL absoluta
    if (src.includes('assets/imagen/')) {
      const filename = src.split('/').pop();
      return `/img/products/${filename}`;
    }
    if (src.startsWith('/img/') || src.startsWith('img/')) {
      const path = src.replace(/^public\//, '');
      return path.startsWith('/') ? path : `/${path}`;
    }
    return `${this.api.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
  }
}
```

---

## Ejemplo 2: Componente consumiendo products$

**Archivo:** `ecommerce-app/src/app/pages/home/home.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { UserStateService } from '../../core/user-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home">
      <!-- OPCIÓN 1: Con async pipe (recomendado) ✅ -->
      <div class="products-grid">
        <div *ngFor="let product of products$ | async" class="product-card">
          <img [src]="product.imagesUrl[0]" [alt]="product.name" />
          <h3>{{ product.name }}</h3>
          <p class="price">${{ product.price }}</p>
          <p class="stock" [class.low]="product.stock < 5">
            Stock: {{ product.stock }}
          </p>
          <button (click)="addToCart(product)">Agregar al Carrito</button>
        </div>
      </div>

      <!-- OPCIÓN 2: Con loading state -->
      <div *ngIf="isLoading$ | async" class="loading">
        Cargando productos...
      </div>

      <!-- OPCIÓN 3: Con error handling -->
      <div *ngIf="error$ | async as error" class="error">
        {{ error }}
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private userService = inject(UserStateService);

  // ✅ Observable directo del servicio (sin subscribe)
  products$ = this.productService.products$;

  // 📊 Opcional: tracking de estado de carga
  isLoading$ = new BehaviorSubject(false);
  error$ = new BehaviorSubject<string | null>(null);

  ngOnInit() {
    // 📥 Cargar productos (se cachean automáticamente)
    this.isLoading$.next(true);
    this.productService.getAll().subscribe({
      next: () => this.isLoading$.next(false),
      error: (err) => {
        this.error$.next(err.message);
        this.isLoading$.next(false);
      },
    });

    // 👤 Opcional: cargar usuario si está logueado
    if (this.userService.getCurrentUser()) {
      console.warn('✅ Usuario logueado');
    }
  }

  /**
   * Agregar producto al carrito
   * @param product Producto a agregar
   */
  addToCart(product: Product) {
    // Obtener userId del usuario logueado
    const user = this.userService.getCurrentUser();
    if (!user) {
      console.error('Usuario no logueado');
      return;
    }

    // Agregar al carrito (valida stock automáticamente)
    this.cartService.addToCart(user._id, product._id, 1).subscribe({
      next: () => {
        console.warn('✅ Producto agregado');
      },
      error: (err) => {
        console.error('❌ Error:', err.message);
        alert(err.message);
      },
    });
  }
}
```

---

## Ejemplo 3: CartService (Ya existe, mejoras)

**Archivo:** `ecommerce-app/src/app/core/cart.service.ts` (ajustes)

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductService } from './product.service';

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  products: CartItem[];
}

export interface CartResponse {
  message: string;
  cart: Cart | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private baseUrl = `${environment.apiUrl}`;

  /**
   * 🛒 ESTADO CENTRALIZADO: Carrito del usuario
   * Se actualiza cuando:
   * - addToCart() es llamado
   * - removeFromCart() es llamado
   * - updateQuantity() es llamado
   * - clearCart() es llamado
   */
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  /**
   * Getter: Contador reactivo de items
   * Útil para mostrar en el badge del navbar
   */
  public get itemCount(): number {
    const cart = this.cartSubject.value;
    return cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  /**
   * Getter: Total del precio
   */
  public get totalPrice(): number {
    return this.getTotalPrice();
  }

  /**
   * Obtener carrito actual (valor inmediato)
   * Útil cuando necesitas el estado ahora mismo
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Obtener carrito del servidor
   * @param userId - ID del usuario
   * @returns Observable con el carrito
   */
  getCart(userId: string): Observable<CartResponse> {
    return this.http
      .get<CartResponse>(`${this.baseUrl}/cart/user/${userId}`)
      .pipe(
        // 🔄 Actualizar estado local
        tap(response => {
          this.cartSubject.next(response.cart);
          if (response.cart) {
            console.warn('✅ Carrito obtenido:', response.cart);
          } else {
            console.warn('📭 No hay carrito para este usuario');
          }
        }),
        // ⚠️ Manejar errores
        catchError(error => {
          console.error('❌ Error obteniendo carrito:', error);
          return throwError(
            () => new Error('No se pudo obtener el carrito')
          );
        })
      );
  }

  /**
   * Agregar producto al carrito
   * ⚠️ Valida stock antes de agregar
   *
   * @param userId - ID del usuario
   * @param productId - ID del producto
   * @param quantity - Cantidad a agregar (default 1)
   * @returns Observable con carrito actualizado
   * @throws Error si stock insuficiente
   */
  addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ): Observable<CartResponse> {
    // ✅ Validación: cantidad positiva
    if (quantity <= 0) {
      return throwError(
        () => new Error('La cantidad debe ser mayor a 0')
      );
    }

    // 🔍 Obtener cantidad actual en carrito
    const cart = this.cartSubject.value;
    const currentQuantityInCart =
      cart?.products?.find(p => p.product._id === productId)?.quantity || 0;

    // 📦 Validar stock del producto
    return this.productService
      .getById(productId)
      .pipe(
        // 🔄 Validar que no exceda stock
        tap((product: Product) => {
          const totalQuantity = currentQuantityInCart + quantity;
          if (totalQuantity > product.stock) {
            throw new Error(
              `Stock insuficiente. Stock disponible: ${product.stock}. ` +
              `Cantidad en carrito: ${currentQuantityInCart}. ` +
              `Máximo a agregar: ${Math.max(0, product.stock - currentQuantityInCart)}`
            );
          }
        }),
        // 📤 Enviar solicitud HTTP
        switchMap(() => {
          const body = { userId, productId, quantity };
          return this.http.post<CartResponse>(
            `${this.baseUrl}/cart/add-product`,
            body
          );
        }),
        // 🔄 Actualizar estado
        tap(response => {
          this.cartSubject.next(response.cart);
          console.warn(
            `✅ Producto agregado al carrito: ${quantity}x`
          );
        }),
        // ⚠️ Manejar errores HTTP
        catchError(error => {
          console.error('❌ Error agregando al carrito:', error);
          const message =
            error?.error?.message ||
            error?.message ||
            'No se pudo agregar al carrito';
          return throwError(() => new Error(message));
        })
      );
  }

  /**
   * Actualizar cantidad de un producto
   * @param cartId - ID del carrito
   * @param productId - ID del producto
   * @param newQuantity - Nueva cantidad
   * @returns Observable con carrito actualizado
   */
  updateQuantity(
    cartId: string,
    productId: string,
    newQuantity: number
  ): Observable<Cart> {
    const cart = this.cartSubject.value;
    if (!cart) throw new Error('No hay carrito activo');

    const updatedProducts = cart.products
      .map(item =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
      .filter(item => item.quantity > 0); // Remover si quantity = 0

    const body = {
      user: cart.user,
      products: updatedProducts.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
    };

    return this.http
      .put<Cart>(`${this.baseUrl}/cart/${cartId}`, body)
      .pipe(
        tap(updatedCart => {
          this.cartSubject.next(updatedCart);
          console.warn('✅ Cantidad actualizada en el carrito');
        }),
        catchError(error => {
          console.error('❌ Error actualizando carrito:', error);
          return throwError(
            () => new Error('No se pudo actualizar el carrito')
          );
        })
      );
  }

  /**
   * Remover producto del carrito
   * @param cartId - ID del carrito
   * @param productId - ID del producto
   * @returns Observable con carrito actualizado
   */
  removeFromCart(cartId: string, productId: string): Observable<Cart> {
    return this.updateQuantity(cartId, productId, 0);
  }

  /**
   * Limpiar carrito completamente
   * @param cartId - ID del carrito
   * @returns Observable void
   */
  clearCart(cartId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/cart/${cartId}`)
      .pipe(
        tap(() => {
          this.cartSubject.next(null);
          console.warn('✅ Carrito limpiado completamente');
        }),
        catchError(error => {
          console.error('❌ Error limpiando carrito:', error);
          return throwError(
            () => new Error('No se pudo limpiar el carrito')
          );
        })
      );
  }

  /**
   * Obtener precio total del carrito
   * @returns Total en dinero
   */
  getTotalPrice(): number {
    const cart = this.cartSubject.value;
    return (
      cart?.products?.reduce(
        (total, item) =>
          total + item.product.price * item.quantity,
        0
      ) || 0
    );
  }
}
```

---

## Ejemplo 4: Componente admin sin `any`

**Archivo:** `ecommerce-app/src/app/pages/admin/admin-user-form.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { User } from '../../core/profile.service';

/**
 * Interfaz para el formulario de usuario
 * Extiende User para agregar campos opcionales del form
 */
interface UserFormModel extends User {
  // Campo adicional para mostrar errores del form
  _formError?: string;
}

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="user-form">
      <ui-card>
        <h3>{{ id ? 'Editar Usuario' : 'Crear Usuario' }}</h3>

        <div *ngIf="model._formError" class="error-message">
          {{ model._formError }}
        </div>

        <form (ngSubmit)="submit()">
          <!-- NOMBRE -->
          <label>Nombre *</label>
          <input
            [(ngModel)]="model.displayName"
            name="displayName"
            type="text"
            required
            placeholder="Nombre completo"
          />

          <!-- EMAIL -->
          <label>Email *</label>
          <input
            [(ngModel)]="model.email"
            name="email"
            type="email"
            required
            placeholder="email@example.com"
          />

          <!-- ROL -->
          <label>Rol *</label>
          <select [(ngModel)]="model.role" name="role" required>
            <option value="">-- Selecciona rol --</option>
            <option value="guest">Guest (Visitante)</option>
            <option value="customer">Customer (Cliente)</option>
            <option value="admin">Admin (Administrador)</option>
          </select>

          <!-- ACTIVO -->
          <label>Estado</label>
          <select [(ngModel)]="model.isActive" name="isActive">
            <option [ngValue]="true">Activo</option>
            <option [ngValue]="false">Inactivo</option>
          </select>

          <!-- AVATAR (OPCIONAL) -->
          <label>Avatar (URL)</label>
          <input
            [(ngModel)]="model.avatar"
            name="avatar"
            type="url"
            placeholder="https://..."
          />

          <!-- ACCIONES -->
          <div class="actions">
            <ui-button variant="primary" type="submit">
              {{ id ? 'Guardar cambios' : 'Crear usuario' }}
            </ui-button>
            <ui-button variant="secondary" (click)="cancel()">
              Cancelar
            </ui-button>
          </div>
        </form>
      </ui-card>
    </div>
  `,
  styles: [
    `
      .user-form {
        padding: 2rem;
      }
      .error-message {
        color: #d32f2f;
        padding: 1rem;
        background-color: #ffebee;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      label {
        font-weight: 500;
        margin-top: 0.5rem;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class AdminUserFormComponent implements OnInit {
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /**
   * ✅ TIPADO CORRECTO: UserFormModel
   * - Autocompletado en IDE
   * - Errores en compile-time
   * - Sin `any`
   */
  model: UserFormModel = {
    _id: '',
    displayName: '',
    email: '',
    role: 'guest',
    isActive: true,
    avatar: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _formError: undefined,
  };

  id: string | null = null;

  ngOnInit() {
    // 🔍 Obtener ID de la ruta
    this.id = this.route.snapshot.paramMap.get('id');

    // 📥 Si hay ID, cargar usuario existente
    if (this.id) {
      this.admin.getUsers({}).subscribe({
        next: (res) => {
          // Buscar usuario por ID
          const user = (res.users || []).find(x => x._id === this.id);
          if (user) {
            // ✅ Asignar usuario tipado
            this.model = { ...user, _formError: undefined };
          } else {
            this.model._formError = 'Usuario no encontrado';
          }
        },
        error: (err) => {
          this.model._formError = `Error al cargar: ${err.message}`;
          console.error('❌ Error cargando usuario:', err);
        },
      });
    }
  }

  /**
   * Guardar/actualizar usuario
   */
  submit() {
    // ✅ Validaciones
    if (!this.model.displayName?.trim()) {
      this.model._formError = 'El nombre es requerido';
      return;
    }

    if (!this.model.email?.trim()) {
      this.model._formError = 'El email es requerido';
      return;
    }

    if (!this.model.role) {
      this.model._formError = 'El rol es requerido';
      return;
    }

    if (!this.id) {
      this.model._formError = 'No hay usuario para actualizar';
      return;
    }

    // 📤 Enviar actualización
    this.admin.updateUser(this.id, this.model).subscribe({
      next: () => {
        console.warn('✅ Usuario actualizado');
        this.router.navigate(['/admin/users']);
      },
      error: (e) => {
        this.model._formError = `Error: ${e.message}`;
        console.error('❌ Error actualizando usuario:', e);
      },
    });
  }

  /**
   * Cancelar y volver
   */
  cancel() {
    this.router.navigate(['/admin/users']);
  }
}
```

---

## Ejemplo 5: Test unitario para ProductService

**Archivo:** `ecommerce-app/src/app/core/product.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../environments/environment';

describe('ProductService con State Management', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hay requests pendientes
  });

  /**
   * TEST 1: Primera llamada debe hacer HTTP
   */
  it('debe hacer HTTP call en la primera llamada', (done) => {
    const mockProducts = {
      products: [
        {
          _id: '1',
          name: 'Producto 1',
          price: 50,
          stock: 10,
          imagesUrl: [],
          category: { _id: 'cat1', name: 'Bebidas', description: '', imagesUrl: [], parentCategory: null },
        },
      ],
    };

    service.getAll().subscribe(() => {
      expect(service.products$).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  /**
   * TEST 2: Segunda llamada debe usar caché
   */
  it('debe usar caché en la segunda llamada', (done) => {
    const mockProducts = {
      products: [
        {
          _id: '1',
          name: 'Producto 1',
          price: 50,
          stock: 10,
          imagesUrl: [],
          category: { _id: 'cat1', name: 'Bebidas', description: '', imagesUrl: [], parentCategory: null },
        },
      ],
    };

    // Primera llamada
    service.getAll().subscribe(() => {
      // Segunda llamada
      service.getAll().subscribe(() => {
        expect(service.products$.value.length).toBe(1);
        done();
      });

      // Solo debe haber 1 request HTTP
      httpMock.expectNone(
        `${environment.apiUrl}/products`
      );
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products`
    );
    req.flush(mockProducts);
  });

  /**
   * TEST 3: BehaviorSubject se actualiza
   */
  it('debe actualizar BehaviorSubject cuando llama getAll()', (done) => {
    const mockProducts = {
      products: [
        {
          _id: '1',
          name: 'Producto 1',
          price: 50,
          stock: 10,
          imagesUrl: [],
          category: { _id: 'cat1', name: 'Bebidas', description: '', imagesUrl: [], parentCategory: null },
        },
        {
          _id: '2',
          name: 'Producto 2',
          price: 75,
          stock: 5,
          imagesUrl: [],
          category: { _id: 'cat1', name: 'Bebidas', description: '', imagesUrl: [], parentCategory: null },
        },
      ],
    };

    service.products$.subscribe(products => {
      if (products.length > 0) {
        expect(products.length).toBe(2);
        expect(products[0].name).toBe('Producto 1');
        done();
      }
    });

    service.getAll().subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products`
    );
    req.flush(mockProducts);
  });
});
```

---

Estos ejemplos cubren:
- ✅ ProductService con products$ caché
- ✅ Componente usando async pipe
- ✅ CartService mejorado
- ✅ Componente admin sin `any`
- ✅ Tests unitarios

¡Cópia, adapta y usa! 🚀

