import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Pokemon, POKEMON_TYPE_COLORS, PokemonTypeName } from '../../../core/models/pokemon.model';
import { PokemonService } from '../../../core/services/pokemon.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ToastService } from '../../../core/services/toast.service';
import { TypeBadgeComponent } from '../type-badge/type-badge.component';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, TypeBadgeComponent],
  template: `
    <article
      class="card"
      [style.--type-color]="primaryTypeColor"
      (click)="navigateToDetails()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Ver detalhes de ' + pokemon.name"
    >
      <button
        class="card__favorite"
        type="button"
        [class.card__favorite--active]="favoritesService.isFavorite(pokemon.id)"
        (click)="onToggleFavorite($event)"
        [attr.aria-label]="favoritesService.isFavorite(pokemon.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div class="card__image-wrapper">
        <div class="card__bg-circle"></div>
        <img
          class="card__image"
          [src]="pokemonService.getArtwork(pokemon)"
          [alt]="pokemon.name"
          loading="lazy"
        />
      </div>

      <div class="card__info">
        <span class="card__id">#{{ pokemon.id | number: '3.0-0' }}</span>
        <h3 class="card__name">{{ pokemon.name }}</h3>
        <div class="card__types">
          @for (type of pokemon.types; track type.type.name) {
            <app-type-badge [typeName]="type.type.name" />
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card {
      --type-color: #A8A77A;
      position: relative;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 16px;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .card:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .card__favorite {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--surface-2);
      backdrop-filter: blur(8px);
      display: grid;
      place-items: center;
      cursor: pointer;
      z-index: 2;
      transition: transform 0.2s ease, color 0.2s ease;
      color: var(--text-soft);
    }

    .card__favorite svg {
      width: 18px;
      height: 18px;
    }

    .card__favorite:hover {
      transform: scale(1.15);
      color: #ef4444;
    }

    .card__favorite--active {
      color: #ef4444;
    }

    .card__favorite--active svg {
      fill: #ef4444;
    }

    .card__image-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      min-height: 140px;
    }

    .card__bg-circle {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--type-color);
      opacity: 0.1;
      filter: blur(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .card:hover .card__bg-circle {
      opacity: 0.18;
      transform: scale(1.2);
    }

    .card__image {
      width: 120px;
      height: 120px;
      object-fit: contain;
      position: relative;
      z-index: 1;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
    }

    .card:hover .card__image {
      transform: scale(1.08) translateY(-4px);
    }

    .card__info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card__id {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-soft);
      letter-spacing: 0.04em;
    }

    .card__name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      text-transform: capitalize;
      color: var(--text);
      letter-spacing: -0.01em;
    }

    .card__types {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
  `],
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: Pokemon;

  readonly pokemonService = inject(PokemonService);
  readonly favoritesService = inject(FavoritesService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  get primaryTypeColor(): string {
    const typeName = this.pokemon.types[0]?.type.name as PokemonTypeName;
    return POKEMON_TYPE_COLORS[typeName] ?? '#A8A77A';
  }

  navigateToDetails(): void {
    this.router.navigate(['/pokemon', this.pokemon.id]);
  }

  onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    const wasFavorite = this.favoritesService.isFavorite(this.pokemon.id);
    this.favoritesService.toggle(this.pokemon.id);

    this.toastService.show(
      wasFavorite
        ? `${this.pokemon.name} removido dos favoritos`
        : `${this.pokemon.name} adicionado aos favoritos!`,
      wasFavorite ? 'info' : 'success'
    );
  }
}
