import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Pokemon, PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss'
})
export class PokemonCardComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  isLoading = true;
  @Input() filterTerm = '';
  @Input() showFavoritesOnly = false;
  selectedPokemon: Pokemon | null = null;
  favorites = new Set<number>();

  constructor(private readonly pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList().subscribe((response) => {
      if (!response.results.length) {
        this.pokemonList = [];
        this.isLoading = false;
        return;
      }

      forkJoin(
        response.results.map((item) =>
          this.pokemonService.getPokemon(item.name)
        )
      ).subscribe(
        (pokemon) => {
          this.pokemonList = pokemon;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
    }, () => {
      this.isLoading = false;
    });
  }

  get filteredPokemonList(): Pokemon[] {
    const term = this.filterTerm.trim().toLowerCase();
    let list = this.pokemonList;

    if (this.showFavoritesOnly) {
      list = list.filter((pokemon) => this.favorites.has(pokemon.id));
    }

    if (!term) {
      return list;
    }

    return list.filter((pokemon) => {
      if (pokemon.name.toLowerCase().includes(term)) {
        return true;
      }

      return String(pokemon.id) === term;
    });
  }

  openPokemon(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
  }

  closePokemon(): void {
    this.selectedPokemon = null;
  }

  toggleFavorite(pokemon: Pokemon, event: MouseEvent): void {
    event.stopPropagation();

    if (this.favorites.has(pokemon.id)) {
      this.favorites.delete(pokemon.id);
      return;
    }

    this.favorites.add(pokemon.id);
  }

  isFavorite(pokemon: Pokemon): boolean {
    return this.favorites.has(pokemon.id);
  }

  getPokemonImage(pokemon: Pokemon): string | null {
    return pokemon.sprites.front_default;
  }

  formatHeight(height: number): string {
    return `${height / 10} m`;
  }

  formatWeight(weight: number): string {
    return `${weight / 10} kg`;
  }
}
