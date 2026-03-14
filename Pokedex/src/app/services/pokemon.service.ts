import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
}

export interface PokemonSpeciesResponse {
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionChainNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainNode[];
}

export interface EvolutionChainResponse {
  chain: EvolutionChainNode;
}

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private readonly http: HttpClient) {}

  getPokemonList(limit = 200000, offset = 0): Observable<PokemonListResponse> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon`, {
      params,
    });
  }

  getPokemon(nameOrId: string | number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${nameOrId}`);
  }

  searchPokemonByName(name: string): Observable<Pokemon> {
    const normalized = name.trim().toLowerCase();
    return this.getPokemon(normalized);
  }

  getPokemonSpecies(nameOrId: string | number): Observable<PokemonSpeciesResponse> {
    return this.http.get<PokemonSpeciesResponse>(`${this.baseUrl}/pokemon-species/${nameOrId}`);
  }

  getEvolutionChain(url: string): Observable<EvolutionChainResponse> {
    return this.http.get<EvolutionChainResponse>(url);
  }
}
