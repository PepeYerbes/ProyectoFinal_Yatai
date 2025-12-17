import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type Category = {
  _id?: string;
  name: string;
  description?: string;
  parentCategory?: string | null;
  imagesUrl?: string[];
};

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Category[]>(`${this.api}/categories`).pipe(
      catchError(() => throwError(() => new Error('No se pudieron obtener las categorías')))
    );
  }

  getById(id: string) {
    return this.http.get<Category>(`${this.api}/categories/${id}`).pipe(
      catchError(() => throwError(() => new Error('No se pudo obtener la categoría')))
    );
  }

  create(body: Partial<Category>) {
    return this.http.post<{ category: Category }>(`${this.api}/categories`, body).pipe(
      map(res => res.category),
      catchError(() => throwError(() => new Error('No se pudo crear la categoría')))
    );
  }

  update(id: string, body: Partial<Category>) {
    return this.http.put<Category>(`${this.api}/categories/${id}`, body).pipe(
      catchError(() => throwError(() => new Error('No se pudo actualizar la categoría')))
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/categories/${id}`).pipe(
      catchError(() => throwError(() => new Error('No se pudo eliminar la categoría')))
    );
  }
}
