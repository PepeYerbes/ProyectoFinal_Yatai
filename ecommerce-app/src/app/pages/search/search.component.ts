import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  products: Product[] = [];
  loading = false;
  searchQuery = '';
  error = '';
  addingToCartIds: Set<string> = new Set();

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.searchProducts();
      }
    });
  }

  searchProducts() {
    this.loading = true;
    this.error = '';

    this.productService.search(this.searchQuery).subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onAddToCart(product: Product) {
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

      this.addingToCartIds.add(product._id);
      this.cartService.addToCart(userId, product._id, 1).subscribe({
        next: () => {
          this.addingToCartIds.delete(product._id);
          alert(`✅ ${product.name} agregado al carrito`);
        },
        error: (err) => {
          this.addingToCartIds.delete(product._id);
          alert(`❌ Error: ${err?.message || 'No se pudo agregar al carrito'}`);
        }
      });
    } catch (error) {
      console.error('Error decodificando token:', error);
      alert('Error al procesar la solicitud');
    }
  }

  isAddingToCart(productId: string): boolean {
    return this.addingToCartIds.has(productId);
  }
}
