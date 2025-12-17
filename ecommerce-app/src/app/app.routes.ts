import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { CategoryComponent } from './pages/category/category.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { authGuard } from './core/auth.guard';
import { perfilResolver } from './core/perfil.resolver';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'search', component: SearchComponent },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { path: 'products/:id', component: ProductDetailComponent },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    resolve: { profileData: perfilResolver }
  },
  { path: 'category/:id', component: CategoryComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'deals', component: HomeComponent }, // Por ahora redirige a home
  { path: 'new', component: HomeComponent }, // Por ahora redirige a home
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/admin-products.component').then(m => m.AdminProductsComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/admin/admin-product-form.component').then(m => m.AdminProductFormComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./pages/admin/admin-product-form.component').then(m => m.AdminProductFormComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/admin-users.component').then(m => m.AdminUsersComponent),
        canActivate: [authGuard, adminGuard]
      }
      ,{
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/admin/admin-user-form.component').then(m => m.AdminUserFormComponent),
        canActivate: [authGuard, adminGuard]
      }
      ,{
        path: 'categories',
        loadComponent: () => import('./pages/admin/admin-categories.component').then(m => m.AdminCategoriesComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./pages/admin/admin-category-form.component').then(m => m.AdminCategoryFormComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () => import('./pages/admin/admin-category-form.component').then(m => m.AdminCategoryFormComponent),
        canActivate: [authGuard, adminGuard]
      }
    ]
  }
];
