import { Component, Input } from '@angular/core';
import { POKEMON_TYPE_COLORS, PokemonTypeName } from '../../../core/models/pokemon.model';

@Component({
  selector: 'app-type-badge',
  standalone: true,
  template: `
    <span
      class="type-badge"
      [style.background]="getColor()"
      [style.color]="getTextColor()"
    >
      {{ typeName }}
    </span>
  `,
  styles: [`
    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }
  `],
})
export class TypeBadgeComponent {
  @Input({ required: true }) typeName!: string;

  getColor(): string {
    return POKEMON_TYPE_COLORS[this.typeName as PokemonTypeName] ?? '#A8A77A';
  }

  getTextColor(): string {
    const lightTypes = ['electric', 'ice', 'normal', 'ground', 'fairy', 'steel', 'bug', 'rock', 'flying'];
    return lightTypes.includes(this.typeName) ? '#1a1a2e' : '#ffffff';
  }
}
