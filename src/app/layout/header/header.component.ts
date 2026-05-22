import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { FavoritesService } from '../../state/favorites/favorites.service';
import { AuthService } from '../../core/services/auth.service';

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
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  onToggleFavorites(): void {
    this.toggleFavorites.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
