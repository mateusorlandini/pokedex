import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
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
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/favorites/favorites.page').then((m) => m.FavoritesPage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
