import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  isCategoriesDropdownOpen = false;

  categories = [
    'Smartphones',
    'Laptops',
    'Gaming',
    'Audio',
    'Smart Home',
    'Accesorios'
  ];

  navLinks = [
    { label: 'Ofertas', href: '/offers' },
    { label: 'Novedades', href: '/new' },
    { label: 'Marcas', href: '/brands' },
    { label: 'Soporte', href: '/support' }
  ];

  toggleCategoriesDropdown() {
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.nav-menu-container');
    if (!dropdown) {
      this.isCategoriesDropdownOpen = false;
    }
  }

  onCategoryClick(category: string) {
    console.log('Category clicked:', category);
    this.isCategoriesDropdownOpen = false;
    // Aquí iría la navegación a la categoría
  }
}
