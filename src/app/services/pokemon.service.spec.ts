import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PokemonService } from './pokemon.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request pokemon list with params', () => {
    service.getPokemonList(50, 100).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url === 'https://pokeapi.co/api/v2/pokemon' &&
      request.params.get('limit') === '50' &&
      request.params.get('offset') === '100'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('should request pokemon by id', () => {
    service.getPokemon(25).subscribe();

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/25');
    expect(req.request.method).toBe('GET');
    req.flush({} as never);
  });

  it('should normalize search by name', () => {
    service.searchPokemonByName('  PiKaChu ').subscribe();

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/pikachu');
    expect(req.request.method).toBe('GET');
    req.flush({} as never);
  });
});
