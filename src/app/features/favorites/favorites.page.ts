import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PokemonService } from '../../data-access/pokeapi/pokemon.service';
import { Pokemon } from '../../core/models/pokemon.model';
import { FavoritesService } from '../../state/favorites/favorites.service';
import { PokemonCardComponent } from '../../ui/pokemon-card/pokemon-card.component';
import { PokeballSpinnerComponent } from '../../ui/loaders/pokeball-spinner.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [PokemonCardComponent, PokeballSpinnerComponent],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
})
export class FavoritesPage implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly pokemonList = signal<Pokemon[]>([]);
  readonly displayedPokemon = computed(() => {
    const ids = new Set(this.favoritesService.favorites().map((f) => f.pokemonId));
    return this.pokemonList().filter((p) => ids.has(p.id));
  });

  ngOnInit(): void {
    const records = this.favoritesService.favorites();

    if (records.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const requests = records.map((r) =>
      this.pokemonService.getPokemon(r.pokemonId).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe((results) => {
      this.pokemonList.set(results.filter((p): p is Pokemon => p !== null));
      this.isLoading.set(false);
    });
  }

  goToPokedex(): void {
    this.router.navigate(['/pokemon']);
  }
}
