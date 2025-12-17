import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../core/product.service';

import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { WishlistService } from '../../core/wishlist.service';
import { ReviewListComponent } from '../../ui/review-list/review-list.component';
import { ReviewFormComponent } from '../../ui/review-form/review-form.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ReviewListComponent, ReviewFormComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);

  product: Product | null = null;
  isFavorite = false;
  loading = true;
  error: string | null = null;
  addingToCart = false;
  cartSuccess = false;
  quantityInCart = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error = 'ID de producto no encontrado';
      this.loading = false;
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    this.error = null;

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isFavorite = this.wishlistService.isFavorite(id);
        
        // Cargar cantidad del producto en el carrito
        this.loadQuantityInCart(id);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'No se pudo cargar el producto';
        this.loading = false;
      }
    });
  }

  private loadQuantityInCart(productId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.quantityInCart = 0;
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload.userId || payload.sub;

      if (!userId) {
        this.quantityInCart = 0;
        return;
      }

      this.cartService.getCart(userId).subscribe({
        next: (response) => {
          if (response.cart) {
            const item = response.cart.products.find(p => p.product._id === productId);
            this.quantityInCart = item?.quantity || 0;
          } else {
            this.quantityInCart = 0;
          }
        },
        error: () => {
          this.quantityInCart = 0;
        }
      });
    } catch {
      this.quantityInCart = 0;
    }
  }

  toggleFavorite() {
    if (!this.product?._id) return;
    const newState = this.wishlistService.toggle(this.product._id);
    this.isFavorite = newState;
  }

  addToCart() {
    if (!this.product) {
      alert('Producto no encontrado');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      alert('Por favor inicia sesión para agregar productos al carrito');
      this.router.navigate(['/login']);
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      alert('Error al obtener datos de usuario');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload.userId || payload.sub;

      if (!userId) {
        alert('Error al obtener datos de usuario');
        return;
      }

      this.addingToCart = true;
      this.cartSuccess = false;

      this.cartService.addToCart(userId, this.product._id, 1).subscribe({
        next: () => {
          this.addingToCart = false;
          this.cartSuccess = true;
          // Actualizar la cantidad mostrada en carrito
          this.loadQuantityInCart(this.product!._id);
          setTimeout(() => (this.cartSuccess = false), 3000);
        },
        error: (err) => {
          this.addingToCart = false;
          alert(`Error: ${err?.message || 'No se pudo agregar al carrito'}`);
        }
      });
    } catch {
      alert('Error al procesar la solicitud');
    }
  }

  onReviewSubmitted() {
    // Recargar reviews después de que se envíe una nueva
    if (this.product?._id) {
      this.loadProduct(this.product._id);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}
