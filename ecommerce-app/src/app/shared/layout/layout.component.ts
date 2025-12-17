import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ProductService } from '../../core/product.service';
import { User } from '../../core/profile.service';
import { ThemeService } from '../../core/theme.service';
import { UserStateService } from '../../core/user-state.service';

// NgRx Imports - Para el nuevo sistema de estado
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectUser } from '../../store/auth/auth.selectors';

// UI Components
import { ButtonComponent } from '../../ui/button/button.component';
import { CartButtonComponent } from '../../ui/cart-button/cart-button.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { SearchBarComponent } from '../../ui/search-bar/search-bar.component';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';

interface Category {
  _id: string;
  name: string;
  description: string;
}

// Removemos la interfaz local y usamos la del ProfileService

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    SearchBarComponent,
    DropdownComponent,
    CartButtonComponent,
    ButtonComponent,
    IconComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit, OnDestroy {
  searchQuery = '';
  categories: Category[] = [];

  // ❌ ANTES: Estado local del usuario
  // user: User | null = null;

  showUserMenu = false;
  showCategoriesMenu = false;
  showMobileMenu = false;

  // ❌ ANTES: Suscripción manual para cleanup
  private userSubscription: Subscription = new Subscription();

  // ✅ DESPUÉS: Observable del usuario desde NgRx Store
  // El template usará 'user$ | async' en lugar de 'user'
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private themeService: ThemeService,
    // ⚠️ MANTENEMOS: UserStateService por compatibilidad (otros componentes pueden usarlo)
    private userStateService: UserStateService,
    // AGREGAMOS: NgRx Store para el nuevo sistema
    private store: Store
  ) {
    // ✅ INICIALIZAR: Observable del usuario desde NgRx Store después de la inyección
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    // Initialize theme
    this.themeService.init();
    this.loadCategories();

    // ❌ ANTES: Suscripción manual al UserStateService
    // this.subscribeToUserState();

    // ❌ ANTES: Cargar usuario con UserStateService
    // this.userStateService.loadUser();

    // ✅ DESPUÉS: Disparar acción NgRx para cargar usuario
    // Esta acción activará el effect que hará la petición HTTP
    this.store.dispatch(AuthActions.loadUser());

    // Check initial screen size
    this.checkScreenSize();
  }

  ngOnDestroy() {
    // ❌ ANTES: Cleanup suscripciones manuales
    // this.userSubscription.unsubscribe();
    // ✅ DESPUÉS: No necesitamos cleanup manual
    // El async pipe se encarga automáticamente de las suscripciones
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 768;

    // Close mobile menu when switching to desktop
    if (!isMobile && this.showMobileMenu) {
      this.showMobileMenu = false;
    }

    // Close desktop menus when switching to mobile
    if (isMobile && (this.showUserMenu || this.showCategoriesMenu)) {
      this.showUserMenu = false;
      this.showCategoriesMenu = false;
    }
  }

  loadCategories() {
  this.productService.getCategories().subscribe({
    next: (categories) => {
      this.categories = categories;
    },
    error: (err) => {
      console.error('Error loading categories', err);
    }
  });
}

  /**
   * ❌ ANTES: Suscripción manual al UserStateService
   *
   * Este método ya no es necesario porque usamos el async pipe en el template.
   * El async pipe maneja automáticamente la suscripción y el cleanup.
   */
  /*
  private subscribeToUserState() {
    this.userSubscription = this.userStateService.user$.subscribe({
      next: (user) => {
        this.user = user;
        console.log('Estado del usuario actualizado en Layout:', user?.displayName || 'No autenticado');
      },
      error: (error) => {
        console.error('Error en suscripción de usuario:', error);
      }
    });
  }
  */

  onSearch(query: string) {
    if (query.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: query },
      });
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showCategoriesMenu = false;
  }

  toggleCategoriesMenu() {
    this.showCategoriesMenu = !this.showCategoriesMenu;
    this.showUserMenu = false;
  }

  selectCategory(category: Category) {
    this.showCategoriesMenu = false;
    this.router.navigate(['/category', category._id]);
  }

  logout() {
    // ❌ ANTES: Lógica manual de logout
    // this.authService.logout();
    // this.userStateService.clearUser();

    // ✅ DESPUÉS: Disparar acción de logout
    // Esta acción limpiará el estado y ejecutará el AuthService.logout() en el effect
    this.store.dispatch(AuthActions.logout());

    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  closeMenus() {
    this.showUserMenu = false;
    this.showCategoriesMenu = false;
    this.showMobileMenu = false;
  }

  // Mobile menu methods
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    // Close other menus when opening mobile menu
    if (this.showMobileMenu) {
      this.showUserMenu = false;
      this.showCategoriesMenu = false;
    }
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
