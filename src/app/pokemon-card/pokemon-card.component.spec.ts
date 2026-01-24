import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PokemonCardComponent } from './pokemon-card.component';
import { EvolutionChainResponse, Pokemon, PokemonListResponse, PokemonService, PokemonSpeciesResponse } from '../services/pokemon.service';

class PokemonServiceMock {
  private readonly pokemonMap: Record<string, Pokemon> = {
    bulbasaur: {
      id: 1,
      name: 'bulbasaur',
      base_experience: 64,
      height: 7,
      weight: 69,
      sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        front_shiny: null,
      },
      types: [],
      abilities: [],
      stats: [],
      moves: [],
    },
    charmander: {
      id: 4,
      name: 'charmander',
      base_experience: 62,
      height: 6,
      weight: 85,
      sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        front_shiny: null,
      },
      types: [],
      abilities: [],
      stats: [],
      moves: [],
    },
  };

  getPokemonList(): ReturnType<PokemonService['getPokemonList']> {
    const response: PokemonListResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ],
    };

    return of(response);
  }

  getPokemon(nameOrId: string | number): ReturnType<PokemonService['getPokemon']> {
    const key = String(nameOrId).toLowerCase();
    return of(this.pokemonMap[key]);
  }

  getPokemonSpecies(): ReturnType<PokemonService['getPokemonSpecies']> {
    const response: PokemonSpeciesResponse = {
      evolution_chain: {
        url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
      },
    };

    return of(response);
  }

  getEvolutionChain(): ReturnType<PokemonService['getEvolutionChain']> {
    const response: EvolutionChainResponse = {
      chain: {
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [
          {
            species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
            evolves_to: [],
          },
        ],
      },
    };

    return of(response);
  }
}

describe('PokemonCardComponent', () => {
  let component: PokemonCardComponent;
  let fixture: ComponentFixture<PokemonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
      providers: [
        { provide: PokemonService, useClass: PokemonServiceMock },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pokemons on init', () => {
    expect(component.pokemonList.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should filter favorites when enabled', () => {
    component.favorites.add(1);
    component.showFavoritesOnly = true;

    const filtered = component.filteredPokemonList;

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('bulbasaur');
  });

  it('should filter by search term', () => {
    component.filterTerm = 'char';
    const filtered = component.filteredPokemonList;

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('charmander');
  });

  it('should filter by id when search term is numeric', () => {
    component.filterTerm = '1';
    const filtered = component.filteredPokemonList;

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1);
  });

  it('should open and close pokemon details', () => {
    const pokemon = component.pokemonList[0];
    component.openPokemon(pokemon);
    expect(component.selectedPokemon).toBe(pokemon);

    component.closePokemon();
    expect(component.selectedPokemon).toBeNull();
  });

  it('should toggle favorites and stop propagation', () => {
    const pokemon = component.pokemonList[0];
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.toggleFavorite(pokemon, event);
    expect(component.isFavorite(pokemon)).toBeTrue();
    expect(event.stopPropagation).toHaveBeenCalled();

    component.toggleFavorite(pokemon, event);
    expect(component.isFavorite(pokemon)).toBeFalse();
  });

  it('should format height and weight', () => {
    expect(component.formatHeight(7)).toBe('0.7 m');
    expect(component.formatWeight(69)).toBe('6.9 kg');
  });
});
