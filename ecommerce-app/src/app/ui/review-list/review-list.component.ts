import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review, ReviewService } from '../../core/review.service';


@Component({
  selector: 'ui-review-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent implements OnInit {
  @Input() productId?: string;

  private reviewService = inject(ReviewService);

  reviews: Review[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.load();
  }

  ngOnChanges() {
    this.load();
  }

  load() {
    if (!this.productId) return;
    this.loading = true;
    this.error = null;

    this.reviewService.getByProduct(this.productId).subscribe({
      next: (res) => {
        this.reviews = res.reviews || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'No se pudieron cargar las reseñas';
        this.loading = false;
      }
    });
  }

  formatAgo(date?: string) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'hace poco';
  }
}
