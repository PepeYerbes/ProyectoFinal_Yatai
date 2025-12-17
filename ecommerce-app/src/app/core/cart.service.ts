import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductService } from './product.service';

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

  // Estado reactivo del carrito
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  // Contador de items en el carrito
  public get itemCount(): number {
    const cart = this.cartSubject.value;
    return cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  /**
   * Obtener carrito del usuario actual
   */
  getCart(userId: string): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart/user/${userId}`).pipe(
      tap((response) => {
        // ✅ Manejar correctamente cuando cart es null
        this.cartSubject.next(response.cart);
        if (response.cart) {
          console.warn('✅ Carrito obtenido:', response.cart);
        } else {
          console.warn('📭 No hay carrito para este usuario');
        }
      }),
      catchError((error) => {
        console.error('❌ Error obteniendo carrito:', error);
        return throwError(() => new Error('No se pudo obtener el carrito'));
      })
    );
  }

  /**
   * Agregar producto al carrito con validación de stock
   */
  addToCart(userId: string, productId: string, quantity: number = 1): Observable<CartResponse> {
    if (quantity <= 0) {
      return throwError(() => new Error('La cantidad debe ser mayor a 0'));
    }

    // Obtener carrito actual y stock del producto para validar
    const cart = this.cartSubject.value;
    const currentQuantityInCart = cart?.products?.find(p => p.product._id === productId)?.quantity || 0;
    
    return this.productService.getById(productId).pipe(
      tap((product: Product) => {
        // Validar que la cantidad total no exceda el stock disponible
        const totalQuantity = currentQuantityInCart + quantity;
        if (totalQuantity > product.stock) {
          throw new Error(
            `Stock insuficiente. Stock disponible: ${product.stock}. ` +
            `Cantidad en carrito: ${currentQuantityInCart}. ` +
            `Máximo a agregar: ${Math.max(0, product.stock - currentQuantityInCart)}`
          );
        }
      }),
      // Proceder a agregar al carrito si la validación pasó
      switchMap(() => {
        const body = { userId, productId, quantity };
        return this.http.post<CartResponse>(`${this.baseUrl}/cart/add-product`, body).pipe(
          tap((response) => {
            this.cartSubject.next(response.cart);
            console.warn(`✅ Producto agregado al carrito: ${quantity}x`);
          }),
          catchError((error) => {
            console.error('❌ Error agregando al carrito:', error);
            const message = error?.error?.message || error?.message || 'No se pudo agregar al carrito';
            return throwError(() => new Error(message));
          })
        );
      }),
      catchError((error) => {
        console.error('❌ Validación de stock fallida:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(cartId: string, productId: string, newQuantity: number): Observable<Cart> {
    const cart = this.cartSubject.value;
    if (!cart) throw new Error('No hay carrito activo');

    const updatedProducts = cart.products
      .map((item) => (item.product._id === productId ? { ...item, quantity: newQuantity } : item))
      .filter((item) => item.quantity > 0); // Remover si quantity = 0

    const body = {
      user: cart.user,
      products: updatedProducts.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
    };

    return this.http.put<Cart>(`${this.baseUrl}/cart/${cartId}`, body).pipe(
      tap((updatedCart) => {
        this.cartSubject.next(updatedCart);
        console.warn('✅ Cantidad actualizada en el carrito');
      }),
      catchError((error) => {
        console.error('❌ Error actualizando carrito:', error);
        return throwError(() => new Error('No se pudo actualizar el carrito'));
      })
    );
  }

  /**
   * Remover producto del carrito
   */
  removeFromCart(cartId: string, productId: string): Observable<Cart> {
    return this.updateQuantity(cartId, productId, 0);
  }

  /**
   * Limpiar carrito
   */
  clearCart(cartId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cart/${cartId}`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        console.warn('✅ Carrito limpiado completamente');
      }),
      catchError((error) => {
        console.error('❌ Error limpiando carrito:', error);
        return throwError(() => new Error('No se pudo limpiar el carrito'));
      })
    );
  }

  /**
   * Obtener precio total del carrito
   */
  getTotalPrice(): number {
    const cart = this.cartSubject.value;
    return (
      cart?.products?.reduce((total, item) => total + item.product.price * item.quantity, 0) || 0
    );
  }
}
