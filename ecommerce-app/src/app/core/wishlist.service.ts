import { Injectable } from '@angular/core';

const STORAGE_KEY = 'wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private _ids: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        this._ids = new Set(arr);
      }
    } catch (e) {
      this._ids = new Set();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this._ids)));
    } catch (e) {
      // ignore
    }
  }

  getFavorites(): string[] {
    return Array.from(this._ids);
  }

  isFavorite(id: string): boolean {
    return this._ids.has(id);
  }

  add(id: string) {
    this._ids.add(id);
    this.saveToStorage();
  }

  remove(id: string) {
    this._ids.delete(id);
    this.saveToStorage();
  }

  toggle(id: string): boolean {
    if (this._ids.has(id)) {
      this._ids.delete(id);
      this.saveToStorage();
      return false;
    }
    this._ids.add(id);
    this.saveToStorage();
    return true;
  }

  clear() {
    this._ids.clear();
    this.saveToStorage();
  }
}
