import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image skeleton-pulse"></div>
      <div class="skeleton-info">
        <div class="skeleton-id skeleton-pulse"></div>
        <div class="skeleton-name skeleton-pulse"></div>
        <div class="skeleton-types">
          <div class="skeleton-badge skeleton-pulse"></div>
          <div class="skeleton-badge skeleton-pulse"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: var(--card-bg, #fff);
      border-radius: 20px;
      padding: 16px;
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .skeleton-pulse {
      background: linear-gradient(
        90deg,
        var(--skeleton-base, rgba(0, 0, 0, 0.06)) 25%,
        var(--skeleton-shine, rgba(0, 0, 0, 0.1)) 50%,
        var(--skeleton-base, rgba(0, 0, 0, 0.06)) 75%
      );
      background-size: 200% 100%;
      animation: pulse 1.5s ease-in-out infinite;
      border-radius: 8px;
    }

    .skeleton-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 16px;
      margin-bottom: 12px;
    }

    .skeleton-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-id {
      width: 40px;
      height: 14px;
    }

    .skeleton-name {
      width: 80%;
      height: 20px;
    }

    .skeleton-types {
      display: flex;
      gap: 6px;
    }

    .skeleton-badge {
      width: 60px;
      height: 22px;
      border-radius: 999px;
    }

    @keyframes pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonCardComponent {}
