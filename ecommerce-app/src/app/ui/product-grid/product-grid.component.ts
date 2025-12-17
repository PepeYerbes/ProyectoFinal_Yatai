import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardSimpleComponent } from '../product-card-simple/product-card-simple.component';
import { Product } from '../../core/product.service';

export type GridVariant = 'default' | 'compact' | 'wide' | 'list' | 'masonry';

@Component({
  selector: 'ui-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardSimpleComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css'
})
export class ProductGridComponent implements OnInit, OnDestroy {
  @Input() products: Product[] = [];
  @Input() isLoading = false;
  @Input() showStock = true;
  @Input() showAddToCart = true;
  @Input() showDescription = true;
  @Input() showRating = true;
  @Input() showEmptyState = true;
  @Input() showErrorState = true;
  @Input() showRetryButton = true;
  @Input() showEmptyStateAction = false;
  @Input() showGridInfo = false;
  @Input() placeholderImage = 'img/products/proximamente.png';
  @Input() gridVariant: GridVariant = 'default';
  @Input() loadingItemsCount = 8;
  @Input() hasFilters = false;
  @Input() hasSearchQuery = false;
  @Input() hasError = false;
  @Input() isRetrying = false;

  // Empty state customization
  @Input() emptyStateTitle = '';
  @Input() emptyStateMessage = '';
  @Input() emptyActionText = '';

  // Error state customization
  @Input() errorTitle = '';
  @Input() errorMessage = '';

  // Loading states for individual products
  @Input() loadingProductIds: string[] = [];
  @Input() favoriteIds: string[] = [];

  @Output() productClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() imageClick = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<{ product: Product; isFavorite: boolean }>();
  @Output() emptyStateAction = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  private resizeObserver?: ResizeObserver;
  currentColumns = 0;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  get gridClass(): string {
    const classes: string[] = [this.gridVariant];

    if (this.hasFilters) {
      classes.push('has-filters');
    }

    return classes.join(' ');
  }

  get loadingArray(): number[] {
    return Array(this.loadingItemsCount).fill(0);
  }

  get isDevelopment(): boolean {
    return isDevMode();
  }

  get defaultEmptyTitle(): string {
    if (this.hasSearchQuery) return 'No encontramos productos';
    if (this.hasFilters) return 'No hay productos con esos filtros';
    return 'No hay productos disponibles';
  }

  get defaultEmptyMessage(): string {
    if (this.hasSearchQuery) return 'Prueba con otros términos de búsqueda o revisa la ortografía.';
    if (this.hasFilters) return 'Prueba con otros filtros o borra algunos para ver más productos.';
    return 'Vuelve más tarde para ver nuevos productos.';
  }

  onProductClick(product: Product) {
    this.productClick.emit(product);
  }

  onAddToCart(product: Product) {
    this.addToCart.emit(product);
  }

  onImageClick(product: Product) {
    this.imageClick.emit(product);
  }

  onFavoriteToggle(event: { product: Product; isFavorite: boolean }) {
    this.favoriteToggle.emit(event);
  }

  isFavoriteFor(product: Product): boolean {
    if (!this.favoriteIds || this.favoriteIds.length === 0) return false;
    return this.favoriteIds.includes(product._id);
  }

  onEmptyStateAction() {
    this.emptyStateAction.emit();
  }

  onRetry() {
    this.retry.emit();
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.updateColumnCount(entry.contentRect.width);
      }
    });

    // Observe the component's element
    const element = document.querySelector('.products-grid');
    if (element) {
      this.resizeObserver.observe(element);
    }
  }

  private updateColumnCount(width: number) {
    let columns = 1;

    switch (this.gridVariant) {
      case 'compact':
        if (width >= 1025) columns = Math.floor(width / 240);
        else if (width >= 769) columns = Math.floor(width / 200);
        else if (width >= 481) columns = Math.floor(width / 180);
        break;

      case 'wide':
        if (width >= 1400) columns = Math.floor(width / 360);
        else if (width >= 1025) columns = Math.floor(width / 320);
        else if (width >= 769) columns = Math.floor(width / 280);
        else if (width >= 481) columns = Math.floor(width / 220);
        break;

      case 'list':
        columns = 1;
        break;

      case 'masonry':
        if (width >= 1400) columns = 5;
        else if (width >= 1025) columns = 4;
        else if (width >= 769) columns = 3;
        else if (width >= 481) columns = 2;
        break;

      default: // 'default'
        if (width >= 1025) columns = Math.floor(width / 280);
        else if (width >= 769) columns = Math.floor(width / 240);
        else if (width >= 481) columns = Math.floor(width / 200);
        break;
    }

    if (this.currentColumns !== columns) {
      this.currentColumns = columns;
      this.cdr.detectChanges();
    }
  }

  // Utility methods for analytics or debugging
  getGridMetrics() {
    return {
      variant: this.gridVariant,
      productCount: this.products.length,
      currentColumns: this.currentColumns,
      isLoading: this.isLoading,
      hasError: this.hasError
    };
  }

  // Method to handle grid layout changes
  changeGridVariant(variant: GridVariant) {
    this.gridVariant = variant;
    this.cdr.detectChanges();
  }

  // Method to track product interactions for analytics
  trackProductInteraction(product: Product, action: 'view' | 'click' | 'add-to-cart') {
    // This could be connected to an analytics service
    if (this.isDevelopment) {
      console.warn(`Product ${action}:`, {
        productId: product._id,
        productName: product.name,
        gridVariant: this.gridVariant,
        action
      });
    }
  }
}
