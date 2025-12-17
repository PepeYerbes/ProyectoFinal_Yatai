import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { UserStateService } from '../../../core/user-state.service';
import { ButtonComponent } from '../../../ui/button/button.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { InputComponent } from '../../../ui/input/input.component';

// NgRx Imports - Para disparar acciones al Store
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, InputComponent, ButtonComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loading = false;
  banner = '';
  form: LoginForm;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    // ⚠️ MANTENEMOS: UserStateService por compatibilidad
    private userStateService: UserStateService,
    // AGREGAMOS: Store para disparar acciones NgRx
    private store: Store
  ) {
    this.form = this.fb.nonNullable.group({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required]),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.banner = '';
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        // ❌ ANTES: Cargar usuario con UserStateService
        // this.userStateService.loadUser();

        // ✅ DESPUÉS: Disparar acción NgRx para cargar usuario
        // Esta acción activará el effect que hará la petición HTTP
        this.store.dispatch(AuthActions.loadUser());

        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: (e: Error) => {
        this.loading = false;
        this.banner = e.message || 'No se pudo iniciar sesión.';
      },
    });
  }
}
