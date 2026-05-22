import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No account found with this email or password.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/email-not-verified':
      return 'Please verify your email before logging in. Check your inbox.';
    default:
      return 'Login failed. Please try again.';
  }
}

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.page.html',
    styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  errorMessage(controlName: 'email' | 'password'): string {
    const control = this.form.controls[controlName];
    if (!control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Enter a valid email';
    if (control.errors['minlength']) return 'Min 6 characters';
    return 'Invalid value';
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/pokemon']);
      },
      error: (err) => {
        const code: string = err?.code ?? '';
        if (code === 'auth/email-not-verified') {
          this.router.navigate(['/verify-email']);
        } else {
          this.toastService.show(firebaseErrorMessage(code), 'error');
        }
        this.isSubmitting.set(false);
      },
    });
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  onForgotPassword(): void {
    this.router.navigate(['/reset-password']);
  }
}
