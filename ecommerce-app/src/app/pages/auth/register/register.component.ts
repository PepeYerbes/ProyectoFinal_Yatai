import { CommonModule } from '@angular/common';
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
import { matchPasswords, passwordStrength } from '../../../shared/validators';

import { ButtonComponent } from '../../../ui/button/button.component';
import { FormFieldComponent } from '../../../ui/form-field/form-field.component';
import { InputComponent } from '../../../ui/input/input.component';

type RegisterForm = FormGroup<{
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmar: FormControl<string>;
  terminos: FormControl<boolean>;
}>;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  loading = false;
  bannerText = '';
  bannerKind: 'ok' | 'error' = 'ok';
  form: RegisterForm;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.nonNullable.group(
      {
        displayName: this.fb.nonNullable.control('', [Validators.required]),
        email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
        password: this.fb.nonNullable.control('', [Validators.required, passwordStrength(6)]),
        confirmar: this.fb.nonNullable.control('', [Validators.required]),
        terminos: this.fb.nonNullable.control(false, [Validators.requiredTrue]),
      },
      { validators: [matchPasswords('password', 'confirmar')] }
    );
  }

  err(ctrl: keyof RegisterForm['controls']): string {
    const c = this.form.get(ctrl as string);
    if (!c || !(c.touched || c.dirty) || c.valid) return '';
    if (c.errors?.['required']) return 'Este campo es obligatorio.';
    if (c.errors?.['email']) return 'Ingresa un correo válido.';
    if (c.errors?.['minLengthPwd']) return `La contraseña debe tener al menos 6 caracteres.`;
    if (c.errors?.['digitRequired']) return 'La contraseña debe incluir al menos un número.';
    if (c.errors?.['requiredTrue']) return 'Debes aceptar los términos.';
    return 'Revisa este campo.';
  }

  groupErr(key: string): string {
    const g = this.form;
    return (g.touched || g.dirty) && g.errors?.[key] ? 'Las contraseñas no coinciden.' : '';
  }

  private showBanner(kind: 'ok' | 'error', text: string) {
    this.bannerKind = kind;
    this.bannerText = text;
  }

  submit() {
    if (this.form.invalid || this.form.pending) return;
    this.loading = true;
    this.bannerText = '';
    const { displayName, email, password } = this.form.getRawValue();

    this.auth.register({ displayName, email, password }).subscribe({
      next: () => {
        this.loading = false;
        this.showBanner('ok', 'Registro exitoso. Ahora inicia sesión.');
        setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
      },
      error: (e: Error) => {
        this.loading = false;
        this.showBanner('error', e.message || 'No se pudo completar el registro.');
      },
    });
  }
}
