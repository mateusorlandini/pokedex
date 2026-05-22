import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PokemonService } from '../../data-access/pokeapi/pokemon.service';
import { FavoritesService } from '../../state/favorites/favorites.service';
import { ToastService } from '../../core/services/toast.service';
import {
  Pokemon,
  EvolutionChainNode,
  POKEMON_TYPE_COLORS,
  PokemonTypeName,
} from '../../core/models/pokemon.model';
import { TypeBadgeComponent } from '../../ui/type-badge/type-badge.component';
import { StatBarComponent } from '../../ui/stat-bar/stat-bar.component';
import { PokeballSpinnerComponent } from '../../ui/loaders/pokeball-spinner.component';

interface EvolutionStep {
  pokemon: Pokemon;
  minLevel?: number | null;
  trigger?: string;
}

interface MoveEntry {
  name: string;
  method: string;
  level: number;
}

interface MoveGroup {
  method: string;
  label: string;
  moves: MoveEntry[];
}

const METHOD_ORDER = ['level-up', 'machine', 'egg', 'tutor'];
const METHOD_LABELS: Record<string, string> = {
  'level-up': 'Level Up',
  'machine': 'TM / HM',
  'egg': 'Egg Move',
  'tutor': 'Move Tutor',
  'other': 'Other',
};
const MOVES_LIMIT = 40;

@Component({
    selector: 'app-pokemon-details-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, TypeBadgeComponent, StatBarComponent, PokeballSpinnerComponent],
    templateUrl: './pokemon-details.page.html',
    styleUrl: './pokemon-details.page.scss'
})
export class PokemonDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _loadCancel$ = new Subject<void>();
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
  readonly showAllMoves = signal(false);

  readonly groupedMoves = computed<MoveGroup[]>(() => {
    const p = this.pokemon();
    if (!p) return [];

    const groups = new Map<string, MoveEntry[]>();
    for (const m of p.moves) {
      const detail = m.version_group_details?.at(-1);
      const method = detail?.move_learn_method?.name ?? 'other';
      const level = detail?.level_learned_at ?? 0;
      if (!groups.has(method)) groups.set(method, []);
      groups.get(method)!.push({ name: m.move.name, method, level });
    }
    groups.get('level-up')?.sort((a, b) => a.level - b.level);

    const knownMethods = METHOD_ORDER.filter((m) => groups.has(m));
    const otherMethods = [...groups.keys()].filter((k) => !METHOD_ORDER.includes(k));
    return [...knownMethods, ...otherMethods].map((method) => ({
      method,
      label: METHOD_LABELS[method] ?? method,
      moves: groups.get(method)!,
    }));
  });

  readonly visibleGroupedMoves = computed<MoveGroup[]>(() => {
    const groups = this.groupedMoves();
    if (this.showAllMoves()) return groups;
    let remaining = MOVES_LIMIT;
    const result: MoveGroup[] = [];
    for (const group of groups) {
      if (remaining <= 0) break;
      const visible = group.moves.slice(0, remaining);
      remaining -= visible.length;
      result.push({ ...group, moves: visible });
    }
    return result;
  });

  readonly hiddenMovesCount = computed(() => {
    if (this.showAllMoves()) return 0;
    const shown = this.visibleGroupedMoves().reduce((s, g) => s + g.moves.length, 0);
    return (this.pokemon()?.moves.length ?? 0) - shown;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.resetState();
      this.loadPokemon(id);
    });
  }

  back(): void {
    this.router.navigate(['/pokemon']);
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
    this.favoritesService.toggle(p);
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

  private resetState(): void {
    this._loadCancel$.next();
    this.isLoading.set(true);
    this.hasError.set(false);
    this.pokemon.set(null);
    this.evolutionChain.set([]);
    this.description.set('');
    this.category.set('');
    this.showAllMoves.set(false);
  }

  private loadPokemon(id: string): void {
    this.pokemonService.getPokemon(id).pipe(takeUntil(this._loadCancel$)).subscribe({
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
    this.pokemonService.getPokemonSpecies(pokemon.id).pipe(takeUntil(this._loadCancel$)).subscribe({
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

    this.pokemonService.getPokemonSpecies(pokemon.id).pipe(takeUntil(this._loadCancel$)).subscribe({
      next: (species) => {
        const chainUrl = species?.evolution_chain?.url;
        if (!chainUrl) {
          this.isEvolutionLoading.set(false);
          return;
        }

        this.pokemonService.getEvolutionChain(chainUrl).pipe(takeUntil(this._loadCancel$)).subscribe({
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
            ).pipe(takeUntil(this._loadCancel$)).subscribe({
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
