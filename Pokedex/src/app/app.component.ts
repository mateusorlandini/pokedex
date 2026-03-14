import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PokemonCardComponent} from "./pokemon-card/pokemon-card.component";
import {HeaderComponent} from "./header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonCardComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Pokedex';
  searchTerm = '';
  showFavoritesOnly = false;

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  onToggleFavorites(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
  }
}
