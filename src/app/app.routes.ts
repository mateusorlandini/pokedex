import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/pokedex/pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./features/pokedex/pages/details/pokemon-details.page').then(
        (m) => m.PokemonDetailsPage
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
