import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrength(min = 6): ValidatorFn {
  const digit = /\d/;
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    if (v.length < min) return { minLengthPwd: { requiredLength: min } };
    if (!digit.test(v)) return { digitRequired: true };
    return null;
  };
}

export function matchPasswords(passKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passKey)?.value;
    const conf = group.get(confirmKey)?.value;
    return pass && conf && pass !== conf ? { passwordsMismatch: true } : null;
  };
}

export function emailFormat(): ValidatorFn {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    return emailRegex.test(value) ? null : { email: true };
  };
}
