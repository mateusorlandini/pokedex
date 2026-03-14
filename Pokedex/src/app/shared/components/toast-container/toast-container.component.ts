import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--success]="toast.type === 'success'"
          [class.toast--error]="toast.type === 'error'"
          [class.toast--info]="toast.type === 'info'"
          (click)="toastService.dismiss(toast.id)"
        >
          <span class="toast__icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @default { ℹ }
            }
          </span>
          <span class="toast__message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #fff;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      cursor: pointer;
      animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .toast--success { background: rgba(34, 197, 94, 0.92); }
    .toast--error { background: rgba(239, 68, 68, 0.92); }
    .toast--info { background: rgba(59, 130, 246, 0.92); }

    .toast__icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
