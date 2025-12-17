import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  _id: string;
  name: string;
  description: string;
  imagesUrl: string[];
  parentCategory: string | null;
}

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagesUrl: string[];
  category: Category;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private normalizeImage(src?: string): string {
    if (!src) return '/assets/placeholder-product.jpg';
    if (/^https?:\/\//i.test(src)) return src;
    
    // Convert assets/imagen/filename.jpg to /img/products/filename.jpg
    if (src.includes('assets/imagen/')) {
      const filename = src.split('/').pop();
      return `/img/products/${filename}`;
    }
    
    // frontend-served assets (public/img/...)
    if (src.startsWith('/img/') || src.startsWith('img/') || src.startsWith('public/img/')) {
      const path = src.replace(/^public\//, '');
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    // uploads or backend-served paths
    return `${this.api.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
  }

  private normalizeProduct(product: Product): Product {
    if (!product) return product;
    product.imagesUrl = (product.imagesUrl || []).map((img) => this.normalizeImage(img));
    return product;
  }


   getAll() {
    return this.http.get<{ products: Product[] }>(`${this.api}/products`).pipe(
      map((res) => ({
        ...res,
        products: (res.products || []).map((p) => this.normalizeProduct(p)),
      })),
      catchError(() =>
        throwError(() => new Error('No se pudieron obtener los productos'))
      )
    );
  }

  getById(id: string) {
    return this.http.get<Product>(`${this.api}/products/${id}`).pipe(
      map((p) => this.normalizeProduct(p)),
      catchError(() =>
        throwError(() => new Error('No se pudo obtener el producto'))
      )
    );
  }

 search(query: string) {
    return this.http.get<{ products: Product[] }>(
      `${this.api}/products/search?q=${encodeURIComponent(query)}`
    ).pipe(
      map((res) => ({
        ...res,
        products: (res.products || []).map((p) => this.normalizeProduct(p)),
      }))
    );
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.api}/categories`).pipe(
      catchError(() =>
        throwError(() => new Error('No se pudieron obtener las categorías'))
      )
    );
  }

  getByCategory(categoryId: string) {
    return this.http
      .get<{ products: Product[] }>(
        `${this.api}/products/search?category=${categoryId}`
      )
      .pipe(
        map((res) => ({
          ...res,
          products: (res.products || []).map((p) => this.normalizeProduct(p)),
        })),
        catchError(() =>
          throwError(() => new Error('No se pudieron obtener los productos'))
        )
      );
  }

  // Admin actions
  createProduct(payload: Partial<Product>) {
    return this.http.post<Product>(`${this.api}/products`, payload).pipe(
      map((p) => this.normalizeProduct(p)),
      catchError(() => throwError(() => new Error('No se pudo crear el producto')))
    );
  }

  updateProduct(id: string, payload: Partial<Product>) {
    return this.http.put<Product>(`${this.api}/products/${id}`, payload).pipe(
      map((p) => this.normalizeProduct(p)),
      catchError(() => throwError(() => new Error('No se pudo actualizar el producto')))
    );
  }

  deleteProduct(id: string) {
    return this.http.delete<{ message?: string }>(`${this.api}/products/${id}`).pipe(
      catchError(() => throwError(() => new Error('No se pudo eliminar el producto')))
    );
  }
}