import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type User = {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  avatar: string;
  isActive: boolean;
  __v?: number;
};

export type ProfileResponse = {
  message: string;
  user: User;
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/users/profile`);
  }
}
