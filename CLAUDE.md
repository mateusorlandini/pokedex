# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root:

- `npm start` — dev server at http://localhost:4200 (alias for `ng serve`, development configuration)
- `npm run build` — production build, outputs to `dist/pokedex/`
- `npm run watch` — dev build in watch mode
- `npm test` — Karma + Jasmine, headless Chrome. Single test file: `ng test --include='**/pokemon.service.spec.ts'`

There is no ESLint, Prettier, or other linter configured — don't run one expecting it to exist. TypeScript strictness is enforced by the compiler (`tsconfig.json` enables `strict`, `noPropertyAccessFromIndexSignature`, `strictTemplates`, and the rest of Angular's strict suite).

`noPropertyAccessFromIndexSignature` is on — access index-signature properties via bracket notation (`map['key']`), not dot notation.

## Architecture

Angular 17 SPA built around the PokéAPI v2 (`https://pokeapi.co/api/v2`). No backend, no NgModules — every component is standalone. State management is **Angular Signals only** (no NgRx, no BehaviorSubjects for UI state).

### Folder convention

Layout follows `SPEC.MD` (Section 6.2). Only folders with current content exist — SPEC folders for unbuilt features (`core/guards`, `core/interceptors`, `features/auth`, `data-access/firebase`, `state/auth`, `state/pokemon`, `layout/{footer,sidebar,shell}`, `ui/dialogs`, …) are intentionally absent and should be added when those features land.

```
src/app/
├── core/
│   ├── models/        # Domain types & design constants (pokemon.model.ts)
│   └── services/      # Cross-cutting singletons (theme, toast)
├── data-access/
│   └── pokeapi/       # PokéAPI HTTP client (pokemon.service.ts)
├── state/
│   └── favorites/     # Signal-based store (favorites.service.ts)
├── layout/
│   └── header/        # App shell chrome
├── features/
│   ├── pokemon-list/  # / route — listing page (home.page.*)
│   └── pokemon-detail/# /pokemon/:id route (pokemon-details.page.*)
└── ui/                # Reusable presentational components, one folder each
    ├── pokemon-card/
    ├── filters/       # type-filter.component
    ├── loaders/       # skeleton-card.component
    ├── toast/         # toast-container.component
    ├── type-badge/
    └── stat-bar/
```

Routes in `app.routes.ts` are lazy via `loadComponent`. Imports are relative — there are no path aliases configured.

### Data flow

1. **`PokemonService`** (`data-access/pokeapi/pokemon.service.ts`) is the single HTTP gateway.
   - Per-key in-memory caches (`Map<string|number, Observable<…>>`) wrapping `shareReplay(1)` for `getPokemon` and `getPokemonSpecies`. **Reuse these getters** — do not call `http.get` directly for the same endpoints, or the cache is bypassed.
   - Generation listing is also `shareReplay(1)`-cached.

2. **`HomePage`** orchestrates the grid. On generation select, it calls `getGeneration(id)` to get species names, then `forkJoin`s `getPokemon(name)` for each (with `catchError(() => of(null))` per request so one failure doesn't kill the batch). The resulting list is cached per generation in a component-local `Map<number, Pokemon[]>` (`pokemonByGeneration`).
   - All filtering (search, type, favorites-only), sorting, and pagination is derived state via `computed()` signals over `allPokemon`.
   - Pagination is "load more": `currentPage` × `pageSize` (36) slice of the filtered list. Anything that changes the filter set must reset `currentPage` to 1.

3. **`FavoritesService`** (`state/favorites/favorites.service.ts`) — `Set<number>` in a signal, persisted to `localStorage` under key `pokedex_favorites`. Lives under `state/` because it's a store, not an HTTP service.

4. **`ThemeService`** — signal-driven; an `effect()` writes `data-theme="light|dark"` onto `document.documentElement` and persists to `localStorage` (`pokedex_theme`). All theming is CSS custom properties keyed off that attribute — never manipulate styles in TS to change theme. Initial theme falls back to `prefers-color-scheme`.

5. **`ToastService`** — push-and-auto-dismiss signal of `Toast[]`; `ToastContainerComponent` is mounted once in `AppComponent`.

### Domain model

`core/models/pokemon.model.ts` holds the PokéAPI response shapes **and** the design constants: `POKEMON_TYPE_COLORS`, `POKEMON_TYPE_GRADIENTS`, `ALL_POKEMON_TYPES`, `STAT_LABELS`, `STAT_COLORS`, `GENERATION_LABELS`. Type/stat coloring is sourced from these maps — don't hardcode hex values in components.

### Templates & styling

- Use the new control flow syntax (`@if`, `@for`, `@switch`) rather than `*ngIf`/`*ngFor` — that's the convention already in use.
- SCSS uses CSS custom properties as design tokens (see README's Design System table) and BEM class naming.
- Component selectors use the `app-` prefix (configured in `angular.json`).
