import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/product.service';

@Component({
  selector: 'ui-product-card-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card-simple.component.html',
  styleUrl: './product-card-simple.component.css'
})
export class ProductCardSimpleComponent {
  @Input() product!: Product;
  @Input() isFavorite = false;
  @Input() showStock = true;
  @Input() showAddToCart = true;
  @Input() showDescription = true;
  @Input() showRating = true;
  @Input() isLoading = false;
  @Input() placeholderImage = '/assets/placeholder-product.jpg';

  @Output() cardClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<{ product: Product; isFavorite: boolean }>();
  @Output() imageClick = new EventEmitter<Product>();

  get hasDiscount(): boolean {
    // Placeholder for future discount feature
    return false;
  }

  get discountPercentage(): number {
    // Placeholder for future discount feature
    return 0;
  }

  get isOutOfStock(): boolean {
    return this.product && this.product.stock === 0;
  }

  get isLowStock(): boolean {
    return this.product && this.product.stock > 0 && this.product.stock <= 5;
  }

  get stockStatus(): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (this.isOutOfStock) return 'out-of-stock';
    if (this.isLowStock) return 'low-stock';
    return 'in-stock';
  }

  get stockMessage(): string {
    if (this.isOutOfStock) return 'Sin stock';
    if (this.isLowStock) return `Últimas ${this.product.stock} unidades`;
    return `En stock (${this.product.stock})`;
  }

  get ratingStars(): boolean[] {
    // Placeholder for future rating feature
    return [];
  }

  get addToCartText(): string {
    if (this.isOutOfStock) return 'No disponible';
    if (this.isLoading) return 'Agregando...';
    return 'Agregar al carrito';
  }

  onCardClick() {
    if (!this.isLoading) {
      this.cardClick.emit(this.product);
    }
  }

  onAddToCart() {
    if (!this.isOutOfStock && !this.isLoading) {
      this.addToCart.emit(this.product);
    }
  }

  onImageClick() {
    if (!this.isLoading) {
      this.imageClick.emit(this.product);
    }
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.remove('loading');
    img.classList.add('loaded');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholderImage;
    img.classList.add('error');
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    this.favoriteToggle.emit({ product: this.product, isFavorite: this.isFavorite });
  }

  get imageSrc(): string {
    const src = this.product?.imagesUrl?.[0];
    if (!src) return this.placeholderImage;
    // Absolute URL
    if (/^https?:\/\//i.test(src)) return src;
    // If stored as frontend asset path (e.g. img/products/xxx.jpg or /img/...)
    if (src.startsWith('/img/') || src.startsWith('img/')) return src.startsWith('/') ? src : `/${src}`;
    // If stored with public/ prefix from backend seeding (public/img/...), map to frontend root
    if (src.startsWith('public/')) {
      const path = src.replace(/^public\//, '');
      return path.startsWith('/') ? path : `/${path}`;
    }
    // If images are uploaded to backend under uploads/ or similar, try backend URL
    if (src.startsWith('uploads/') || src.startsWith('/uploads/')) {
      return `${environment.apiUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
    }
    // Otherwise assume it's a path on the API server
    return `${environment.apiUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
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
