import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ALL_POKEMON_TYPES, POKEMON_TYPE_COLORS, PokemonTypeName } from '../../../../core/models/pokemon.model';

@Component({
  selector: 'app-type-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="type-filter">
      <button
        class="type-chip"
        [class.type-chip--active]="!selectedType"
        (click)="onSelect(null)"
      >
        All
      </button>
      @for (type of types; track type) {
        <button
          class="type-chip"
          [class.type-chip--active]="selectedType === type"
          [style.--chip-color]="getColor(type)"
          (click)="onSelect(type)"
        >
          {{ type }}
        </button>
      }
    </div>
  `,
  styles: [`
    .type-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 0;
    }

    .type-chip {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .type-chip:hover {
      border-color: var(--chip-color, var(--text-soft));
      color: var(--text);
    }

    .type-chip--active {
      background: var(--chip-color, var(--accent-primary));
      border-color: var(--chip-color, var(--accent-primary));
      color: #fff;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--chip-color, var(--accent-primary)) 40%, transparent);
    }
  `],
})
export class TypeFilterComponent {
  @Input() selectedType: string | null = null;
  @Output() typeChange = new EventEmitter<string | null>();

  readonly types = ALL_POKEMON_TYPES;

  getColor(type: string): string {
    return POKEMON_TYPE_COLORS[type as PokemonTypeName] ?? '#A8A77A';
  }

  onSelect(type: string | null): void {
    this.typeChange.emit(type);
  }
}
