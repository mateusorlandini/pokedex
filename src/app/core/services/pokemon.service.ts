import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import {
  Pokemon,
  PokemonListResponse,
  PokemonSpeciesResponse,
  EvolutionChainResponse,
  GenerationListResponse,
  GenerationResponse,
  GenerationInfo,
  GENERATION_LABELS,
} from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly pokemonCache = new Map<string | number, Observable<Pokemon>>();
  private readonly speciesCache = new Map<string | number, Observable<PokemonSpeciesResponse>>();

  constructor(private readonly http: HttpClient) {}

  getPokemonList(limit = 151, offset = 0): Observable<PokemonListResponse> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon`, { params });
  }

  getPokemon(nameOrId: string | number): Observable<Pokemon> {
    const key = String(nameOrId).toLowerCase();

    if (!this.pokemonCache.has(key)) {
      const request$ = this.http
        .get<Pokemon>(`${this.baseUrl}/pokemon/${key}`)
        .pipe(shareReplay(1));
      this.pokemonCache.set(key, request$);
    }

    return this.pokemonCache.get(key)!;
  }

  getPokemonSpecies(nameOrId: string | number): Observable<PokemonSpeciesResponse> {
    const key = String(nameOrId).toLowerCase();

    if (!this.speciesCache.has(key)) {
      const request$ = this.http
        .get<PokemonSpeciesResponse>(`${this.baseUrl}/pokemon-species/${key}`)
        .pipe(shareReplay(1));
      this.speciesCache.set(key, request$);
    }

    return this.speciesCache.get(key)!;
  }

  getEvolutionChain(url: string): Observable<EvolutionChainResponse> {
    return this.http.get<EvolutionChainResponse>(url);
  }

  getArtwork(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.other?.dream_world?.front_default ??
      pokemon.sprites.front_default ??
      ''
    );
  }

  getShinyArtwork(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other?.['official-artwork']?.front_shiny ??
      pokemon.sprites.front_shiny ??
      ''
    );
  }

  getGenerations(): Observable<GenerationInfo[]> {
    return this.http
      .get<GenerationListResponse>(`${this.baseUrl}/generation`)
      .pipe(
        map((res) =>
          res.results
            .map((g) => {
              const id = this.extractIdFromUrl(g.url);
              return {
                id,
                name: g.name,
                region: GENERATION_LABELS[id] ?? g.name,
                label: `Gen ${id} - ${GENERATION_LABELS[id] ?? g.name}`,
                speciesNames: [],
              };
            })
            .sort((a, b) => a.id - b.id)
        ),
        shareReplay(1)
      );
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.replace(/\/$/, '').split('/');
    return parseInt(parts[parts.length - 1], 10);
  }

  getGeneration(id: number): Observable<GenerationResponse> {
    return this.http
      .get<GenerationResponse>(`${this.baseUrl}/generation/${id}`)
      .pipe(shareReplay(1));
  }
}
