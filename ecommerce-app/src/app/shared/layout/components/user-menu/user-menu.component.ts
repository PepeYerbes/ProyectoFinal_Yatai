import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent {
  isDropdownOpen = false;
  isAuthenticated = false; // Esta lógica vendría de un servicio de autenticación

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.user-menu-container');
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
  }

  onLogin() {
    console.log('Login clicked');
    // Aquí iría la lógica de login
  }

  onLogout() {
    console.log('Logout clicked');
    // Aquí iría la lógica de logout
    this.isDropdownOpen = false;
  }
}
