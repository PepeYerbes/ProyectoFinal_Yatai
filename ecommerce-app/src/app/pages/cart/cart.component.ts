import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem, Cart } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { OrderService } from '../../core/order.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  userId: string;
  email: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);

  cartItems: CartItem[] = [];
  currentCart: Cart | null = null;
  isLoading = true;
  error: string | null = null;
  isEmpty = false;
  showCheckoutForm = false;

  // Checkout form model
  shipping = {
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
    phone: ''
  };

  payment = {
    type: 'credit_card',
    cardNumber: '',
    cardHolderName: '',
    expiryDate: ''
  };
  isProcessing = false;

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.error = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Por favor inicia sesión para ver tu carrito';
      this.isLoading = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const userId = decoded.userId;

      this.cartService.getCart(userId).subscribe({
        next: (response) => {
          if (response.cart && response.cart.products) {
            this.currentCart = response.cart;
            this.cartItems = response.cart.products;
            this.isEmpty = this.cartItems.length === 0;
          } else {
            this.isEmpty = true;
            this.currentCart = null;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar carrito:', err);
          this.error = 'No se pudo cargar el carrito';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error decodificando token:', error);
      this.error = 'Error de autenticación';
      this.isLoading = false;
    }
  }

  removeFromCart(productId: string) {
    if (!this.currentCart) return;

    this.cartService.removeFromCart(this.currentCart._id, productId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error al remover producto:', err);
        this.error = 'No se pudo remover el producto';
      }
    });
  }

  updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) return;
    if (!this.currentCart) return;

    // Buscar el producto en los items del carrito
    const cartItem = this.cartItems.find(item => item.product._id === productId);
    if (!cartItem) return;

    // Validar que la nueva cantidad no exceda el stock disponible
    if (newQuantity > cartItem.product.stock) {
      alert(`❌ Stock insuficiente. Stock disponible: ${cartItem.product.stock}`);
      return;
    }

    this.cartService.updateQuantity(this.currentCart._id, productId, newQuantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        this.error = 'No se pudo actualizar la cantidad';
      }
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.error = 'El carrito está vacío';
      return;
    }
    // Mostrar formulario de checkout
    this.showCheckoutForm = true;
  }

  async submitCheckout() {
    if (!this.currentCart) return;
    this.isProcessing = true;
    this.error = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Por favor inicia sesión';
      this.isProcessing = false;
      return;
    }

    try {
      const decoded = jwtDecode<unknown>(token);
      const userId = this.extractId(decoded);
      if (!userId) {
        this.error = 'Error al obtener datos de usuario';
        this.isProcessing = false;
        return;
      }

      // 1) Crear dirección de envío
      const shippingPayload = { user: userId, ...this.shipping };
      const shippingRes = await this.orderService.createShippingAddress(shippingPayload).toPromise();

      // 2) Crear método de pago (simple)
      const paymentPayload: Record<string, unknown> = { user: userId, type: this.payment.type };
      if (this.payment.type === 'credit_card') {
        (paymentPayload as Record<string, unknown>)['cardNumber'] = this.payment.cardNumber.replace(/\s+/g, '');
        (paymentPayload as Record<string, unknown>)['cardHolderName'] = this.payment.cardHolderName;
        (paymentPayload as Record<string, unknown>)['expiryDate'] = this.payment.expiryDate;
      }
      const paymentRes = await this.orderService.createPaymentMethod(paymentPayload).toPromise();

      // 3) Crear orden usando productos del carrito
      const products = this.cartItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const shippingId = this.extractId(shippingRes) || undefined;
      const paymentId = this.extractId(paymentRes) || undefined;

      const orderPayload: Record<string, unknown> = {
        user: userId,
        products,
        shippingCost: 0
      };
      if (shippingId) (orderPayload as Record<string, unknown>)['shippingAddress'] = shippingId;
      if (paymentId) (orderPayload as Record<string, unknown>)['paymentMethod'] = paymentId;

      const orderRes = await this.orderService.createOrder(orderPayload).toPromise();

      // 4) Limpiar carrito
      if (this.currentCart) {
        await this.cartService.clearCart(this.currentCart._id).toPromise();
      }

      this.showCheckoutForm = false;
      this.isProcessing = false;
      const createdId = this.extractId(orderRes) || '—';
      alert('Orden creada correctamente. ID: ' + createdId);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      console.error('Checkout error', err);
      this.error = this.getErrorMessage(err) || 'Error en el proceso de pago';
      this.isProcessing = false;
    }
  }

  private extractId(obj: unknown): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as Record<string, unknown>;
    if (typeof o['_id'] === 'string') return o['_id'];
    if (typeof o['id'] === 'string') return o['id'];
    if (typeof o['userId'] === 'string') return o['userId'];
    return undefined;
  }

  private getErrorMessage(err: unknown): string | undefined {
    if (!err) return undefined;
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      const o = err as Record<string, unknown>;
      if (typeof o['message'] === 'string') return o['message'];
      if (typeof o['error'] === 'string') return o['error'];
      if (o['error'] && typeof o['error'] === 'object') {
        const oe = o['error'] as Record<string, unknown>;
        if (typeof oe['message'] === 'string') return oe['message'];
      }
    }
    return undefined;
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
