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
  other?: {
    'official-artwork'?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
    dream_world?: {
      front_default?: string | null;
    };
  };
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
  genera?: Array<{
    genus: string;
    language: { name: string };
  }>;
  flavor_text_entries?: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
}

export interface GenerationListResponse {
  count: number;
  results: { name: string; url: string }[];
}

export interface GenerationResponse {
  id: number;
  name: string;
  main_region: { name: string; url: string };
  pokemon_species: { name: string; url: string }[];
}

export interface GenerationInfo {
  id: number;
  name: string;
  region: string;
  label: string;
  speciesNames: string[];
}

export const GENERATION_LABELS: Record<number, string> = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
};

export interface EvolutionChainNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainNode[];
  evolution_details: Array<{
    min_level?: number | null;
    trigger?: { name: string };
    item?: { name: string } | null;
  }>;
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

export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export const POKEMON_TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const POKEMON_TYPE_GRADIENTS: Record<PokemonTypeName, string> = {
  normal: 'linear-gradient(135deg, #A8A77A, #C6C5A0)',
  fire: 'linear-gradient(135deg, #EE8130, #F5AC78)',
  water: 'linear-gradient(135deg, #6390F0, #9DB7F5)',
  electric: 'linear-gradient(135deg, #F7D02C, #FAEB70)',
  grass: 'linear-gradient(135deg, #7AC74C, #A7DB8D)',
  ice: 'linear-gradient(135deg, #96D9D6, #BCE6E6)',
  fighting: 'linear-gradient(135deg, #C22E28, #D67873)',
  poison: 'linear-gradient(135deg, #A33EA1, #C183C1)',
  ground: 'linear-gradient(135deg, #E2BF65, #EBD69D)',
  flying: 'linear-gradient(135deg, #A98FF3, #C6B7F5)',
  psychic: 'linear-gradient(135deg, #F95587, #FA92B2)',
  bug: 'linear-gradient(135deg, #A6B91A, #C6D16E)',
  rock: 'linear-gradient(135deg, #B6A136, #D1C17D)',
  ghost: 'linear-gradient(135deg, #735797, #A292BC)',
  dragon: 'linear-gradient(135deg, #6F35FC, #A27DFA)',
  dark: 'linear-gradient(135deg, #705746, #A29288)',
  steel: 'linear-gradient(135deg, #B7B7CE, #D1D1E0)',
  fairy: 'linear-gradient(135deg, #D685AD, #F4BDC9)',
};

export const ALL_POKEMON_TYPES: PokemonTypeName[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

export const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  'speed': 'SPD',
};

export const STAT_COLORS: Record<string, string> = {
  'hp': '#FF5959',
  'attack': '#F5AC78',
  'defense': '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  'speed': '#FA92B2',
};
