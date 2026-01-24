import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EvolutionChainNode, Pokemon, PokemonService } from '../services/pokemon.service';

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
  evolutionChain: Pokemon[] = [];
  isEvolutionLoading = false;
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
    this.loadEvolutionChain(pokemon);
  }

  closePokemon(): void {
    this.selectedPokemon = null;
    this.evolutionChain = [];
    this.isEvolutionLoading = false;
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

  private loadEvolutionChain(pokemon: Pokemon): void {
    this.isEvolutionLoading = true;
    this.evolutionChain = [];

    this.pokemonService.getPokemonSpecies(pokemon.id).subscribe({
      next: (species) => {
        const chainUrl = species?.evolution_chain?.url;
        if (!chainUrl) {
          this.isEvolutionLoading = false;
          return;
        }

        this.pokemonService.getEvolutionChain(chainUrl).subscribe({
          next: (chain) => {
            const names = this.extractEvolutionNames(chain.chain);
            if (!names.length) {
              this.isEvolutionLoading = false;
              return;
            }

            forkJoin(names.map((name) => this.pokemonService.getPokemon(name))).subscribe({
              next: (pokemonList) => {
                this.evolutionChain = pokemonList;
                this.isEvolutionLoading = false;
              },
              error: () => {
                this.isEvolutionLoading = false;
              },
            });
          },
          error: () => {
            this.isEvolutionLoading = false;
          },
        });
      },
      error: () => {
        this.isEvolutionLoading = false;
      },
    });
  }

  private extractEvolutionNames(node: EvolutionChainNode | null): string[] {
    if (!node) {
      return [];
    }

    const names: string[] = [];
    const walk = (current: EvolutionChainNode): void => {
      names.push(current.species.name);
      current.evolves_to.forEach(walk);
    };

    walk(node);
    return names;
  }
}
