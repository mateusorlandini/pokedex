import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pokeball-spinner',
  standalone: true,
  template: `<div class="pokeball" [class]="'pokeball--' + size()"></div>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .pokeball {
      position: relative;
      border-radius: 50%;
      animation: pokeball-spin 0.9s linear infinite;
      flex-shrink: 0;
    }

    /* ── Size variants ─────────────────────────────── */
    .pokeball--sm  { width: 22px;  height: 22px;  border: 2px solid var(--pokeball-border, #1a1a2e); }
    .pokeball--md  { width: 56px;  height: 56px;  border: 3px solid var(--pokeball-border, #1a1a2e); }
    .pokeball--lg  { width: 80px;  height: 80px;  border: 4px solid var(--pokeball-border, #1a1a2e); }

    /* ── Red top / white bottom ────────────────────── */
    .pokeball {
      background: linear-gradient(
        to bottom,
        #e74c3c  0%,
        #e74c3c  calc(50% - 2px),
        var(--pokeball-border, #1a1a2e) calc(50% - 2px),
        var(--pokeball-border, #1a1a2e) calc(50% + 2px),
        #f8f9fa  calc(50% + 2px),
        #f8f9fa  100%
      );
    }

    /* ── Center button ─────────────────────────────── */
    .pokeball::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #f8f9fa;
      border: 2px solid var(--pokeball-border, #1a1a2e);
      z-index: 1;
      box-shadow: 0 0 0 2px #f8f9fa;
    }

    .pokeball--sm::after  { width: 8px;   height: 8px;  border-width: 1.5px; box-shadow: 0 0 0 1.5px #f8f9fa; }
    .pokeball--md::after  { width: 18px;  height: 18px; border-width: 2px;   box-shadow: 0 0 0 2px #f8f9fa; }
    .pokeball--lg::after  { width: 26px;  height: 26px; border-width: 3px;   box-shadow: 0 0 0 3px #f8f9fa; }

    @keyframes pokeball-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class PokeballSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
}
