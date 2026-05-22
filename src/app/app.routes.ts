import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'pokemon',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pokemon-list/home.page').then((m) => m.HomePage),
  },
  {
    path: 'pokemon/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-details.page').then(
        (m) => m.PokemonDetailsPage
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
