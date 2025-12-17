import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { Product } from '../../core/product.service';

@Component({
  selector: 'ui-product-card',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, BadgeComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isFavorite = false;
  @Input() isLoading = false;
  @Input() compact = false;
  @Input() showDescription = true;
  @Input() showRating = true;
  @Input() showCategory = true;
  @Input() showStock = true;
  @Input() showAddToCart = true;
  @Input() placeholderImage = '/assets/placeholder-product.jpg';

  @Output() cardClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<{ product: Product; isFavorite: boolean }>();
  @Output() imageClick = new EventEmitter<Product>();
  @Output() categoryClick = new EventEmitter<string>();

  get hasDiscount(): boolean {
    // Placeholder for future discount feature
    return false;
  }

  get discountPercentage(): number {
    // Placeholder for future discount feature
    return 0;
  }

  get isOutOfStock(): boolean {
    return this.product.stock === 0;
  }

  get isLowStock(): boolean {
    return this.product.stock > 0 && this.product.stock <= 5;
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

  onAddToCart(event: Event) {
    event.stopPropagation();
    if (!this.isOutOfStock && !this.isLoading) {
      this.addToCart.emit(this.product);
    }
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation();
    if (!this.isLoading) {
      this.isFavorite = !this.isFavorite;
      this.favoriteToggle.emit({ product: this.product, isFavorite: this.isFavorite });
    }
  }

  onImageClick(event: Event) {
    event.stopPropagation();
    if (!this.isLoading) {
      this.imageClick.emit(this.product);
    }
  }

  onCategoryClick(event: Event, categoryName: string) {
    event.stopPropagation();
    if (!this.isLoading) {
      this.categoryClick.emit(categoryName);
    }
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholderImage;
    img.classList.add('error');
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
