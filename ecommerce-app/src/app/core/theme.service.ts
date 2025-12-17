import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'pref-theme';
  setTheme(t: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(this.key, t);
  }
  init() {
    const t = (localStorage.getItem(this.key) as 'light' | 'dark') ?? 'light';
    this.setTheme(t);
  }
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    this.setTheme(cur === 'light' ? 'dark' : 'light');
  }
}
