import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.css'
})
export class MobileMenuComponent implements OnInit {
  isMobileMenuOpen = false;

  categories = [
    'Electrónicos',
    'Ropa & Moda',
    'Hogar & Jardín',
    'Deportes & Aire Libre',
    'Belleza & Cuidado Personal',
    'Automóviles',
    'Juguetes & Juegos',
    'Libros & Literatura',
    'Música & Películas',
    'Salud & Bienestar'
  ];

  navLinks = [
    { label: 'Nuevos Productos', href: '/new-products' },
    { label: 'Ofertas', href: '/offers' },
    { label: 'Marcas', href: '/brands' },
    { label: 'Blog', href: '/blog' }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Prevent body scrolling when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onCategoryClick(category: string): void {
    console.log('Category clicked:', category);
    // Handle category navigation
    this.closeMobileMenu();
  }

  onNavLinkClick(link: any): void {
    console.log('Nav link clicked:', link);
    // Handle navigation
    this.closeMobileMenu();
  }
}
