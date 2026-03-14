import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PokemonService } from '../../../../core/services/pokemon.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  Pokemon,
  EvolutionChainNode,
  POKEMON_TYPE_COLORS,
  PokemonTypeName,
} from '../../../../core/models/pokemon.model';
import { TypeBadgeComponent } from '../../../../shared/components/type-badge/type-badge.component';
import { StatBarComponent } from '../../../../shared/components/stat-bar/stat-bar.component';

interface EvolutionStep {
  pokemon: Pokemon;
  minLevel?: number | null;
  trigger?: string;
}

@Component({
  selector: 'app-pokemon-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TypeBadgeComponent, StatBarComponent],
  templateUrl: './pokemon-details.page.html',
  styleUrl: './pokemon-details.page.scss',
})
export class PokemonDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly pokemonService = inject(PokemonService);
  readonly favoritesService = inject(FavoritesService);
  private readonly toastService = inject(ToastService);

  readonly pokemon = signal<Pokemon | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly evolutionChain = signal<EvolutionStep[][]>([]);
  readonly isEvolutionLoading = signal(false);
  readonly description = signal('');
  readonly category = signal('');
  readonly activeTab = signal<'about' | 'stats' | 'moves'>('about');

  get id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.loadPokemon();
  }

  back(): void {
    this.location.back();
  }

  get primaryTypeColor(): string {
    const p = this.pokemon();
    if (!p) return '#A8A77A';
    return POKEMON_TYPE_COLORS[p.types[0]?.type.name as PokemonTypeName] ?? '#A8A77A';
  }

  get totalStats(): number {
    const p = this.pokemon();
    if (!p) return 0;
    return p.stats.reduce((sum, s) => sum + s.base_stat, 0);
  }

  formatHeight(height: number): string {
    const meters = height / 10;
    return `${meters.toFixed(1)} m`;
  }

  formatWeight(weight: number): string {
    const kg = weight / 10;
    return `${kg.toFixed(1)} kg`;
  }

  toggleFavorite(): void {
    const p = this.pokemon();
    if (!p) return;
    const wasFav = this.favoritesService.isFavorite(p.id);
    this.favoritesService.toggle(p.id);
    this.toastService.show(
      wasFav ? `${p.name} removido dos favoritos` : `${p.name} adicionado aos favoritos!`,
      wasFav ? 'info' : 'success'
    );
  }

  setTab(tab: 'about' | 'stats' | 'moves'): void {
    this.activeTab.set(tab);
  }

  goToEvolution(pokemonId: number): void {
    this.router.navigate(['/pokemon', pokemonId]);
  }

  private loadPokemon(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.pokemonService.getPokemon(this.id).subscribe({
      next: (pokemon) => {
        this.pokemon.set(pokemon);
        this.isLoading.set(false);
        this.loadSpeciesData(pokemon);
        this.loadEvolutions(pokemon);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private loadSpeciesData(pokemon: Pokemon): void {
    this.pokemonService.getPokemonSpecies(pokemon.id).subscribe({
      next: (species) => {
        const entry = species.flavor_text_entries?.find(
          (e) => e.language.name === 'en'
        );
        if (entry) {
          this.description.set(entry.flavor_text.replace(/[\n\f\r]/g, ' '));
        }
        const genus = species.genera?.find((g) => g.language.name === 'en');
        if (genus) {
          this.category.set(genus.genus);
        }
      },
    });
  }

  private loadEvolutions(pokemon: Pokemon): void {
    this.isEvolutionLoading.set(true);

    this.pokemonService.getPokemonSpecies(pokemon.id).subscribe({
      next: (species) => {
        const chainUrl = species?.evolution_chain?.url;
        if (!chainUrl) {
          this.isEvolutionLoading.set(false);
          return;
        }

        this.pokemonService.getEvolutionChain(chainUrl).subscribe({
          next: (chain) => {
            const rows = this.extractEvolutionRows(chain.chain);
            if (!rows.length) {
              this.isEvolutionLoading.set(false);
              return;
            }

            const uniqueNames = Array.from(
              new Set(rows.flat().map((step) => step.name.toLowerCase()))
            );

            forkJoin(
              uniqueNames.map((name) => this.pokemonService.getPokemon(name))
            ).subscribe({
              next: (pokemonList) => {
                const byName = pokemonList.reduce<Record<string, Pokemon>>(
                  (acc, p) => { acc[p.name.toLowerCase()] = p; return acc; },
                  {}
                );

                this.evolutionChain.set(
                  rows.map((row) =>
                    row
                      .map((step) => ({
                        pokemon: byName[step.name.toLowerCase()],
                        minLevel: step.minLevel,
                        trigger: step.trigger,
                      }))
                      .filter((s) => !!s.pokemon)
                  )
                );
                this.isEvolutionLoading.set(false);
              },
              error: () => this.isEvolutionLoading.set(false),
            });
          },
          error: () => this.isEvolutionLoading.set(false),
        });
      },
      error: () => this.isEvolutionLoading.set(false),
    });
  }

  private extractEvolutionRows(
    node: EvolutionChainNode
  ): Array<Array<{ name: string; minLevel?: number | null; trigger?: string }>> {
    const buildRows = (
      current: EvolutionChainNode
    ): Array<Array<{ name: string; minLevel?: number | null; trigger?: string }>> => {
      const currentStep = {
        name: current.species.name,
        minLevel: current.evolution_details?.[0]?.min_level,
        trigger: current.evolution_details?.[0]?.trigger?.name,
      };

      if (!current.evolves_to.length) {
        return [[currentStep]];
      }

      return current.evolves_to
        .flatMap((child) => buildRows(child))
        .map((row) => [currentStep, ...row]);
    };

    return buildRows(node);
  }
}
