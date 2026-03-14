import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';
import { FavoritesService } from '../../../../core/services/favorites.service';

@Component({
  selector: 'app-pokedex-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class PokedexHeaderComponent {
  @Input() showFavoritesOnly = false;
  @Input() totalCount = 0;
  @Input() visibleCount = 0;

  @Output() search = new EventEmitter<string>();
  @Output() toggleFavorites = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly favoritesService = inject(FavoritesService);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  onToggleFavorites(): void {
    this.toggleFavorites.emit();
  }
}
