import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  createShippingAddress(payload: any): Observable<any> {
    return this.http.post(`${this.api}/shipping-addresses`, payload);
  }

  createPaymentMethod(payload: any): Observable<any> {
    return this.http.post(`${this.api}/payment-methods`, payload);
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(`${this.api}/orders`, payload);
  }
}
