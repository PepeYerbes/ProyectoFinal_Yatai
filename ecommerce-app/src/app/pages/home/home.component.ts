import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { WishlistService } from '../../core/wishlist.service';
import { ProductGridComponent } from '../../ui/product-grid/product-grid.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProductGridComponent,
    ButtonComponent,
    CardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private sanitizer = inject(DomSanitizer);

  products: Product[] = [];
  featuredProducts: Product[] = [];
  favorites: string[] = [];
  isLoading = true;
  error: string | null = null;

  // Carousel videos
  currentVideoIndex = 0;
  videos = [
    {
      id: 1,
      title: ' Tenemos un Yatai para cada antojo',
      url: '/img/products/1.mp4'
    },
     {
      id: 2,
      title: 'Las estaciones más deli para tus eventos ',
      url: '/img/products/2.mp4'
    },
     {
      id: 3,
      title: 'Descubre nuestros productos',
      url: '/img/products/3.mp4'
    }
  ];

  getSafeUrl(index: number): SafeResourceUrl {
    const i = Math.max(0, Math.min(index, this.videos.length - 1));
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videos[i].url);
  }

  nextVideo() {
    this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videos.length;
  }

  prevVideo() {
    this.currentVideoIndex = (this.currentVideoIndex - 1 + this.videos.length) % this.videos.length;
  }

  goToVideo(index: number) {
    this.currentVideoIndex = index;
  }

  ngOnInit() {
    this.loadProducts();
    this.favorites = this.wishlistService.getFavorites();
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response.products || [];
        // Debug logs removed in production
        // Tomar los primeros 8 productos como destacados
        this.featuredProducts = this.products.slice(0, 8);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'No se pudieron cargar los productos';
        this.isLoading = false;
      }
    });
  }

  get uniqueCategories() {
    const categories = this.products.map(p => p.category);
    const unique = categories.filter((category, index, self) =>
      self.findIndex(c => c._id === category._id) === index
    );
    return unique.slice(0, 6); // Mostrar máximo 6 categorías
  }

  onProductClick(product: Product) {
    this.router.navigate(['/products', product._id]);
  }

  onAddToCart(product: Product) {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      alert('Por favor inicia sesión para agregar productos al carrito');
      this.router.navigate(['/login']);
      return;
    }

    // Obtener el userId del token JWT
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

      // Agregar producto al carrito
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

  onFavoriteToggle(event: { product: Product; isFavorite: boolean }) {
    const id = event.product._id;
    if (!id) return;
    // Update service and local copy
    if (event.isFavorite) {
      this.wishlistService.add(id);
    } else {
      this.wishlistService.remove(id);
    }
    this.favorites = this.wishlistService.getFavorites();
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/category', categoryId]);
  }

  onImageError(event: Event) {
    // Imagen de fallback si la imagen de la categoría no se puede cargar
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/category-placeholder.jpg';
  }
}
