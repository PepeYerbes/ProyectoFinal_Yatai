import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { WishlistService } from '../../core/wishlist.service';
import { ProductGridComponent } from '../../ui/product-grid/product-grid.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ProductGridComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);

  products: Product[] = [];
  favorites: string[] = [];
  loading = false;
  categoryId = '';
  categoryName = '';
  error = '';

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.error = 'Categoría inválida';
        return;
      }

      this.categoryId = id;
      this.favorites = this.wishlistService.getFavorites();
      this.loadProductsByCategory();
    });
  }

  loadProductsByCategory() {
    this.loading = true;
    this.error = '';

    this.productService.getByCategory(this.categoryId).subscribe({
      next: (response) => {
        this.products = response.products;
        if (response.products.length > 0) {
          this.categoryName = response.products[0].category.name;
        }
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onProductClick(product: Product) {
    this.router.navigate(['/products', product._id]);
  }

  onFavoriteToggle(event: { product: Product; isFavorite: boolean }) {
    const id = event.product._id;
    if (!id) return;
    if (event.isFavorite) {
      this.wishlistService.add(id);
    } else {
      this.wishlistService.remove(id);
    }
    this.favorites = this.wishlistService.getFavorites();
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
        console.error('No se pudo obtener el ID del usuario del token');
        alert('Error al obtener datos de usuario');
        return;
      }

      this.cartService.addToCart(userId, product._id, 1).subscribe({
        next: () => {
          alert(`✅ ${product.name} agregado al carrito`);
        },
        error: (err) => {
          console.error('Error al agregar al carrito:', err);
          alert(`❌ Error: ${err.message}`);
        }
      });
    } catch (error) {
      console.error('Error decodificando token:', error);
      alert('Error al procesar la solicitud');
    }
  }
}
