import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const errors: ValidationErrors = {};
    if (value.length < 6) errors['minlength'] = true;
    if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
    if (!/[^a-zA-Z0-9]/.test(value)) errors['noSpecial'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
}

type RegisterField = 'name' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  showError(field: RegisterField): boolean {
    if (field === 'confirmPassword') {
      const ctrl = this.form.controls.confirmPassword;
      const groupError = this.form.errors?.['passwordMismatch'] && (ctrl.dirty || ctrl.touched);
      return (ctrl.invalid && (ctrl.dirty || ctrl.touched)) || !!groupError;
    }
    const ctrl = this.form.controls[field];
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  errorMessage(field: RegisterField): string {
    if (field === 'confirmPassword') {
      const ctrl = this.form.controls.confirmPassword;
      if (ctrl.errors?.['required']) return 'This field is required';
      if (this.form.errors?.['passwordMismatch']) return 'Passwords do not match';
      return '';
    }

    const ctrl = this.form.controls[field];
    if (!ctrl.errors) return '';

    if (field === 'name') {
      if (ctrl.errors['required']) return 'This field is required';
      if (ctrl.errors['minlength']) return 'Min 2 characters';
    }
    if (field === 'email') {
      if (ctrl.errors['required']) return 'This field is required';
      if (ctrl.errors['email']) return 'Enter a valid email';
    }
    if (field === 'password') {
      if (ctrl.errors['required']) return 'This field is required';
      if (ctrl.errors['minlength']) return 'Min 6 characters';
      if (ctrl.errors['noUppercase']) return 'Must contain at least one uppercase letter';
      if (ctrl.errors['noSpecial']) return 'Must contain at least one special character';
    }
    return 'Invalid value';
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.toastService.show('Account created! Welcome, ' + name, 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const code: string = err?.code ?? '';
        const message =
          code === 'auth/email-already-in-use'
            ? 'This email is already registered.'
            : (err?.message ?? 'Registration failed. Please try again.');
        this.toastService.show(message, 'error');
        this.isSubmitting.set(false);
      },
    });
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }
}
