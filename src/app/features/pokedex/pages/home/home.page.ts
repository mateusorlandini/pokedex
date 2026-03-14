import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, catchError } from 'rxjs';

import { PokedexHeaderComponent } from '../../components/header/header.component';
import { TypeFilterComponent } from '../../components/type-filter/type-filter.component';
import { PokemonCardComponent } from '../../../../shared/components/pokemon-card/pokemon-card.component';
import { SkeletonCardComponent } from '../../../../shared/components/skeleton-card/skeleton-card.component';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { Pokemon, GenerationInfo } from '../../../../core/models/pokemon.model';

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    PokedexHeaderComponent,
    TypeFilterComponent,
    PokemonCardComponent,
    SkeletonCardComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly favoritesService = inject(FavoritesService);

  readonly generations = signal<GenerationInfo[]>([]);
  readonly selectedGeneration = signal<number>(1);
  readonly allPokemon = signal<Pokemon[]>([]);
  readonly isLoadingGenerations = signal(true);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly searchTerm = signal('');
  readonly selectedType = signal<string | null>(null);
  readonly showFavoritesOnly = signal(false);
  readonly sortOption = signal<SortOption>('id-asc');
  readonly pageSize = 36;
  readonly currentPage = signal(1);

  private readonly pokemonByGeneration = new Map<number, Pokemon[]>();

  readonly skeletons = Array(12).fill(0);

  readonly filteredPokemon = computed(() => {
    let list = this.allPokemon();
    const term = this.searchTerm().trim().toLowerCase();
    const typeFilter = this.selectedType();
    const favOnly = this.showFavoritesOnly();
    const sort = this.sortOption();

    if (favOnly) {
      list = list.filter((p) => this.favoritesService.isFavorite(p.id));
    }

    if (typeFilter) {
      list = list.filter((p) => p.types.some((t) => t.type.name === typeFilter));
    }

    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          String(p.id) === term ||
          String(p.id).padStart(3, '0').includes(term)
      );
    }

    switch (sort) {
      case 'id-desc':
        list = [...list].sort((a, b) => b.id - a.id);
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        list = [...list].sort((a, b) => a.id - b.id);
    }

    return list;
  });

  readonly paginatedPokemon = computed(() => {
    const filtered = this.filteredPokemon();
    const end = this.currentPage() * this.pageSize;
    return filtered.slice(0, end);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredPokemon().length / this.pageSize)
  );

  readonly hasMore = computed(() => this.currentPage() < this.totalPages());

  readonly currentGenerationLabel = computed(() => {
    const gen = this.generations().find((g) => g.id === this.selectedGeneration());
    return gen?.label ?? '';
  });

  ngOnInit(): void {
    this.loadGenerations();
  }

  onSelectGeneration(genId: number): void {
    if (genId === this.selectedGeneration()) return;
    this.selectedGeneration.set(genId);
    this.currentPage.set(1);
    this.loadPokemonForGeneration(genId);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onTypeFilter(type: string | null): void {
    this.selectedType.set(type);
    this.currentPage.set(1);
  }

  onSort(event: Event): void {
    this.sortOption.set((event.target as HTMLSelectElement).value as SortOption);
    this.currentPage.set(1);
  }

  onToggleFavorites(): void {
    this.showFavoritesOnly.update((v) => !v);
    this.currentPage.set(1);
  }

  loadMore(): void {
    this.currentPage.update((p) => p + 1);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadGenerations(): void {
    this.isLoadingGenerations.set(true);
    this.hasError.set(false);

    this.pokemonService.getGenerations().subscribe({
      next: (gens) => {
        this.generations.set(gens);
        this.isLoadingGenerations.set(false);
        this.loadPokemonForGeneration(1);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoadingGenerations.set(false);
        this.isLoading.set(false);
      },
    });
  }

  private loadPokemonForGeneration(genId: number): void {
    if (this.pokemonByGeneration.has(genId)) {
      this.allPokemon.set(this.pokemonByGeneration.get(genId)!);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.pokemonService.getGeneration(genId).subscribe({
      next: (genResponse) => {
        const speciesNames = genResponse.pokemon_species.map((s) => s.name);

        if (!speciesNames.length) {
          this.allPokemon.set([]);
          this.pokemonByGeneration.set(genId, []);
          this.isLoading.set(false);
          return;
        }

        forkJoin(
          speciesNames.map((name) =>
            this.pokemonService.getPokemon(name).pipe(
              catchError(() => of(null))
            )
          )
        ).subscribe({
          next: (pokemonList) => {
            const sorted = pokemonList
              .filter((p): p is Pokemon => p !== null)
              .sort((a, b) => a.id - b.id);
            this.pokemonByGeneration.set(genId, sorted);
            if (this.selectedGeneration() === genId) {
              this.allPokemon.set(sorted);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
