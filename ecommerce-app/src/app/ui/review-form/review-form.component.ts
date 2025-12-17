import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../core/review.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'ui-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent {
  @Input() productId!: string;
  @Output() submitted = new EventEmitter<void>();

  reviewService = inject(ReviewService);
  authService = inject(AuthService);

  rating = 5;
  comment = '';
  loading = false;
  error: string | null = null;

  canSubmit(): boolean {
    return this.rating >= 1 && this.rating <= 5 && this.authService.isLoggedIn();
  }

  submit() {
    if (!this.productId) return;
    if (!this.canSubmit()) {
      this.error = 'Debes iniciar sesión y seleccionar una calificación entre 1 y 5.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.reviewService.create({ product: this.productId, rating: this.rating, comment: this.comment }).subscribe({
      next: () => {
        this.loading = false;
        this.comment = '';
        this.rating = 5;
        this.submitted.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Error al enviar la review';
      }
    });
  }
}
