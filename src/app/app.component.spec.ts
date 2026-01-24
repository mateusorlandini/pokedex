import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {Observable, of} from 'rxjs';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { PokemonCardComponent } from './pokemon-card/pokemon-card.component';
import { PokemonListResponse, PokemonService } from './services/pokemon.service';

class PokemonServiceMock {
  getPokemonList(): ReturnType<PokemonService['getPokemonList']> {
    const response: PokemonListResponse = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    return of(response);
  }

  getPokemon(): Observable<null> {
    return of({} as never);
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: PokemonService, useClass: PokemonServiceMock }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Pokedex' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Pokedex');
  });

  it('should render header and card components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const cards = fixture.debugElement.query(By.directive(PokemonCardComponent));
    expect(header).toBeTruthy();
    expect(cards).toBeTruthy();
  });

  it('should update search term from handler', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.onSearch('pika');
    expect(app.searchTerm).toBe('pika');
  });

  it('should toggle favorites flag from handler', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.showFavoritesOnly).toBeFalse();
    app.onToggleFavorites();
    expect(app.showFavoritesOnly).toBeTrue();
  });
});
