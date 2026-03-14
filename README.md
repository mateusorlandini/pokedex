<div align="center">

# Pokédex

**A modern, responsive Pokémon explorer built with Angular 17**

[![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=flat-square&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PokéAPI](https://img.shields.io/badge/API-PokéAPI-EF5350?style=flat-square)](https://pokeapi.co/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Explore the first 151 Pokémon with a sleek, portfolio-grade interface. Search, filter by type, sort, favorite, and view detailed stats — all with smooth animations and full dark mode support.

</div>

---

## Features

- **Browse & Search** — Explore 151 Pokémon with real-time search by name or number
- **Type Filtering** — Filter by any of the 18 Pokémon types with color-coded chips
- **Sort Options** — Sort by number (asc/desc) or name (A-Z / Z-A)
- **Favorites System** — Favorite Pokémon persisted in localStorage across sessions
- **Dark / Light Theme** — Toggle themes with automatic OS preference detection
- **Premium Detail Page** — Hero section, tabbed layout (About / Stats / Moves), stat bars, evolution chain, shiny sprites
- **Skeleton Loading** — Elegant loading placeholders instead of spinners
- **Toast Notifications** — Non-intrusive feedback for user actions
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Lazy Loading** — Route-based code splitting for optimal performance
- **Request Caching** — API responses cached with RxJS `shareReplay`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Angular 17 (standalone components, signals, new control flow) |
| **Language** | TypeScript 5.4 |
| **Styling** | SCSS with CSS custom properties (design tokens) |
| **State** | Angular Signals |
| **HTTP** | Angular HttpClient + RxJS |
| **API** | [PokéAPI v2](https://pokeapi.co/) |
| **Architecture** | Feature-based folder structure with core/shared separation |

## Architecture

```
src/app/
├── core/
│   ├── models/            # TypeScript interfaces & constants
│   └── services/          # Singleton services (pokemon, favorites, theme, toast)
├── shared/
│   └── components/        # Reusable UI components
│       ├── pokemon-card/   # Card with hover effects & type colors
│       ├── type-badge/     # Color-coded type pill
│       ├── stat-bar/       # Animated stat bar
│       ├── skeleton-card/  # Loading placeholder
│       └── toast-container/# Notification system
├── features/
│   └── pokedex/
│       ├── components/    # Feature-specific components
│       │   ├── header/     # Search bar, theme toggle, favorites filter
│       │   └── type-filter/# Scrollable type chip selector
│       └── pages/
│           ├── home/       # Main grid page with filters & pagination
│           └── details/    # Premium detail page with tabs & evolutions
├── app.component.*        # Root shell
├── app.config.ts          # Providers
└── app.routes.ts          # Lazy-loaded routes
```

## Design System

| Token | Light | Dark |
|-------|-------|------|
| **Background** | `#f5f6fa` | `#0c0f1a` |
| **Card** | `#ffffff` | `#161926` |
| **Text** | `#0f172a` | `#f1f5f9` |
| **Accent** | `#ef4444` | `#f87171` |
| **Border** | `rgba(15,23,42,0.08)` | `rgba(255,255,255,0.08)` |

**Typography:** Inter (400–800) · **Border Radius:** 12–20px · **Shadows:** Multi-layer, theme-aware

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pokedex.git
cd pokedex/Pokedex

# Install dependencies
npm install

# Start development server
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Build

```bash
ng build
```

Production bundle is output to `dist/pokedex/`.

## Technical Highlights

- **Angular 17 Signals** — Reactive state without RxJS overhead for UI state
- **New Control Flow** — `@if`, `@for`, `@switch` syntax for cleaner templates
- **Standalone Components** — No NgModules, tree-shakable architecture
- **Lazy Routes** — Each page loaded on demand for fast initial load (~76 KB transfer)
- **Request Caching** — `shareReplay(1)` prevents redundant API calls
- **CSS Custom Properties** — Theme switching with zero JavaScript style manipulation
- **BEM Methodology** — Consistent, maintainable CSS class naming
- **Accessibility** — `aria-label`, `role`, `tabindex`, keyboard navigation, focus-visible states

## Screenshots

> Add screenshots of the Home page (light + dark), Detail page, and mobile view for maximum portfolio impact.

| Home (Light) | Home (Dark) | Detail Page | Mobile |
|:---:|:---:|:---:|:---:|
| *screenshot* | *screenshot* | *screenshot* | *screenshot* |

## License

This project is open source and available under the [MIT License](LICENSE).
