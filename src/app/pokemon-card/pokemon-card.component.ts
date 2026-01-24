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
  evolutionRows: Pokemon[][] = [];
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
    this.evolutionRows = [];
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

  getPokemonShinyImage(pokemon: Pokemon): string | null {
    return pokemon.sprites.front_shiny;
  }

  formatHeight(height: number): string {
    return `${height / 10} m`;
  }

  formatWeight(weight: number): string {
    return `${weight / 10} kg`;
  }

  private loadEvolutionChain(pokemon: Pokemon): void {
    this.isEvolutionLoading = true;
    this.evolutionRows = [];

    this.pokemonService.getPokemonSpecies(pokemon.id).subscribe({
      next: (species) => {
        const chainUrl = species?.evolution_chain?.url;
        if (!chainUrl) {
          this.isEvolutionLoading = false;
          return;
        }

        this.pokemonService.getEvolutionChain(chainUrl).subscribe({
          next: (chain) => {
            const rows = this.extractEvolutionRows(chain.chain);
            if (!rows.length) {
              this.isEvolutionLoading = false;
              return;
            }

            const uniqueNames = Array.from(new Set(rows.flat().map((name) => name.toLowerCase())));

            forkJoin(uniqueNames.map((name) => this.pokemonService.getPokemon(name))).subscribe({
              next: (pokemonList) => {
                const pokemonByName = pokemonList.reduce<Record<string, Pokemon>>((acc, current) => {
                  acc[current.name.toLowerCase()] = current;
                  return acc;
                }, {});

                this.evolutionRows = rows.map((row) =>
                  row.map((name) => pokemonByName[name.toLowerCase()]).filter(Boolean)
                );
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

  private extractEvolutionRows(node: EvolutionChainNode | null): string[][] {
    if (!node) {
      return [];
    }

    const buildRows = (current: EvolutionChainNode): string[][] => {
      if (!current.evolves_to.length) {
        return [[current.species.name]];
      }

      return current.evolves_to
        .flatMap((child) => buildRows(child))
        .map((row) => [current.species.name, ...row]);
    };

    return buildRows(node);
  }
}
