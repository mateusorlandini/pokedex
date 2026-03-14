import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STAT_LABELS, STAT_COLORS } from '../../../core/models/pokemon.model';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-row">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
      <div class="stat-track">
        <div
          class="stat-fill"
          [style.width.%]="percentage"
          [style.background]="color"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .stat-row {
      display: grid;
      grid-template-columns: 42px 36px 1fr;
      align-items: center;
      gap: 10px;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 0.85rem;
      font-weight: 600;
      text-align: right;
      color: var(--text);
    }

    .stat-track {
      height: 8px;
      border-radius: 999px;
      background: var(--stat-track, rgba(0, 0, 0, 0.08));
      overflow: hidden;
    }

    .stat-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `],
})
export class StatBarComponent implements OnInit {
  @Input({ required: true }) statName!: string;
  @Input({ required: true }) value!: number;
  @Input() maxValue = 255;

  label = '';
  color = '#6390F0';
  percentage = 0;

  ngOnInit(): void {
    this.label = STAT_LABELS[this.statName] ?? this.statName;
    this.color = STAT_COLORS[this.statName] ?? '#6390F0';
    this.percentage = Math.min((this.value / this.maxValue) * 100, 100);
  }
}
