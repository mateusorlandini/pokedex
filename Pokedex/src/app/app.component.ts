import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PokemonCardComponent} from "./pokemon-card/pokemon-card.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Pokedex';
}
