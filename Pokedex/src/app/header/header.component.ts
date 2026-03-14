import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() showFavoritesOnly = false;
  @Output() search = new EventEmitter<string>();
  @Output() toggleFavorites = new EventEmitter<void>();

  onSearch(value: string): void {
    this.search.emit(value);
  }

  onToggleFavorites(): void {
    this.toggleFavorites.emit();
  }
}
