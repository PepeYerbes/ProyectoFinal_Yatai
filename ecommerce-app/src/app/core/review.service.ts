import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReviewUser {
  _id?: string;
  displayName?: string;
  avatar?: string;
}

export interface Review {
  _id?: string;
  user: ReviewUser | string;
  product: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/reviews`;

  create(review: { product: string; rating: number; comment?: string }) {
    return this.http.post<{ message: string; review: Review }>(`${this.api}`, review).pipe(
      catchError((err) => throwError(() => new Error(err?.error?.message || 'No se pudo crear la review')))
    );
  }

  getByProduct(productId: string) {
    return this.http
      .get<{ message: string; count: number; reviews: Review[] }>(`${this.api}/product/${productId}`)
      .pipe(
        map((res) => ({ ...res, reviews: res.reviews || [] })),
        catchError(() => throwError(() => new Error('No se pudieron obtener las reviews')))
      );
  }

  getMyReviews() {
    return this.http.get<{ message: string; count: number; reviews: Review[] }>(`${this.api}/my-reviews`).pipe(
      map((res) => ({ ...res, reviews: res.reviews || [] })),
      catchError(() => throwError(() => new Error('No se pudieron obtener tus reviews')))
    );
  }

  update(reviewId: string, payload: { rating: number; comment?: string }) {
    return this.http.put<{ message: string; review: Review }>(`${this.api}/${reviewId}`, payload).pipe(
      catchError(() => throwError(() => new Error('No se pudo actualizar la review')))
    );
  }

  delete(reviewId: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${reviewId}`).pipe(
      catchError(() => throwError(() => new Error('No se pudo eliminar la review')))
    );
  }
}
