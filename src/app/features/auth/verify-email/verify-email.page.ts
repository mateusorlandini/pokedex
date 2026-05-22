import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { firebaseAuth } from '../../../core/services/firebase.config';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.scss',
})
export class VerifyEmailPage {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isResending = signal(false);
  readonly isChecking = signal(false);

  get userEmail(): string {
    return firebaseAuth.currentUser?.email ?? '';
  }

  onResend(): void {
    this.isResending.set(true);
    this.authService.resendVerificationEmail().subscribe({
      next: () => {
        this.toastService.show('Verification email sent!', 'success');
        this.isResending.set(false);
      },
      error: () => {
        this.toastService.show('Failed to resend. Try again later.', 'error');
        this.isResending.set(false);
      },
    });
  }

  onContinue(): void {
    const user = firebaseAuth.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isChecking.set(true);
    user.reload().then(() => {
      if (firebaseAuth.currentUser?.emailVerified) {
        this.router.navigate(['/pokemon']);
      } else {
        this.toastService.show('Email not verified yet. Please check your inbox.', 'error');
        this.isChecking.set(false);
      }
    });
  }

  onBackToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
