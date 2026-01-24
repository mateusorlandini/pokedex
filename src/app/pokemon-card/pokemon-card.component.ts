import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Pokemon, PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss'
})
export class PokemonCardComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  isLoading = true;
  @Input() filterTerm = '';

  constructor(private readonly pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList().subscribe((response) => {
      if (!response.results.length) {
        this.pokemonList = [];
        this.isLoading = false;
        return;
      }

      forkJoin(
        response.results.map((item) =>
          this.pokemonService.getPokemon(item.name)
        )
      ).subscribe(
        (pokemon) => {
          this.pokemonList = pokemon;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
    }, () => {
      this.isLoading = false;
    });
  }

  get filteredPokemonList(): Pokemon[] {
    const term = this.filterTerm.trim().toLowerCase();
    if (!term) {
      return this.pokemonList;
    }

    return this.pokemonList.filter((pokemon) => {
      if (pokemon.name.toLowerCase().includes(term)) {
        return true;
      }

      return String(pokemon.id) === term;
    });
  }
}
