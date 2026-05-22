import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PokeballSpinnerComponent } from '../../../ui/loaders/pokeball-spinner.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, PokeballSpinnerComponent],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  showError(): boolean {
    const ctrl = this.form.controls.email;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  errorMessage(): string {
    const errors = this.form.controls.email.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Enter a valid email';
    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.authService.sendPasswordReset(email).subscribe({
      next: () => {
        this.sent.set(true);
        this.isSubmitting.set(false);
      },
      error: () => {
        // Firebase doesn't reveal whether the email exists — treat all errors generically
        this.toastService.show('Something went wrong. Please try again.', 'error');
        this.isSubmitting.set(false);
      },
    });
  }

  onBackToLogin(): void {
    this.router.navigate(['/login']);
  }
}
