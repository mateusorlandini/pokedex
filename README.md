<div align="center">

# Pokédex

**A modern, enterprise-grade Pokémon explorer built with Angular 21 and Firebase**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Pokédex is a full-stack Angular 21 web app that lets authenticated trainers browse, search, filter, and favorite Pokémon using live data from the PokéAPI.

**[Try it live →](https://pokedex-5a812.firebaseapp.com/login)**

</div>

---

## Features

- **Authentication** — Email/password sign-up with email verification, login, and password reset via Firebase Auth
- **Persistent Favorites** — Favorites saved to Firestore and synced in real time across devices
- **Browse All 9 Generations** — Switch between Kanto through Paldea; Pokémon fetched and cached per generation
- **Search & Filter** — Real-time search by name, filter by type, sort by number or name
- **Detailed Pokémon Pages** — Stats, abilities, moves, evolution chain, shiny sprites, and Pokémon cries
- **Dark / Light Theme** — Toggle themes with automatic OS preference detection
- **Skeleton Loading** — Elegant loading placeholders instead of spinners
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Lazy Loading** — Route-based code splitting for fast initial load
- **Request Caching** — API responses cached with RxJS `shareReplay` — no redundant network calls

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Angular 21 (standalone components, signals, new control flow) |
| **Language** | TypeScript |
| **Styling** | SCSS with CSS custom properties (design tokens) |
| **State** | Angular Signals + RxJS |
| **Auth** | Firebase Authentication (email/password) |
| **Database** | Firestore (favorites, user profiles) |
| **API** | [PokéAPI v2](https://pokeapi.co/) |
| **Hosting** | Firebase Hosting |

## Live Demo

The app is deployed at:

**[https://pokedex-5a812.firebaseapp.com/login](https://pokedex-5a812.firebaseapp.com/login)**

Register with any email address, verify it, and start exploring.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/mateusorlandini/pokedex.git
cd pokedex
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Build

```bash
npm run build
```

Production bundle outputs to `dist/pokedex/`.

### Test

```bash
npm test
```

Runs unit tests via Karma + Jasmine in headless Chrome. To run a single spec file:

```bash
ng test --include='**/pokemon.service.spec.ts'
```

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # AuthGuard (protects /pokemon, /favorites)
│   ├── models/          # Domain types & design constants
│   └── services/        # AuthService, ThemeService, ToastService, firebase.config
├── data-access/
│   └── pokeapi/         # PokéAPI HTTP client with per-key caching
├── state/
│   └── favorites/       # Firestore-backed signal store
├── layout/
│   └── header/          # App shell (search, theme toggle, logout)
├── features/
│   ├── auth/            # login, register, verify-email, reset-password pages
│   ├── pokemon-list/    # Main grid with generation selector, filters, sort
│   ├── pokemon-detail/  # Detail page — stats, moves, evolution chain, cries
│   └── favorites/       # Dedicated favorites page
└── ui/                  # Presentational components
    ├── pokemon-card/
    ├── filters/         # type-filter
    ├── loaders/         # skeleton-card
    ├── toast/
    ├── type-badge/
    └── stat-bar/
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

## Authentication Flow

```
Register → Verify Email → Login → Pokédex
```

- Registration sends a verification email via Firebase Auth
- Protected routes (`/pokemon`, `/pokemon/:id`, `/favorites`) require a verified, authenticated session
- Password reset is available from the login screen
- Favorites are scoped to the authenticated user and synced to Firestore in real time

## Contributing

```bash
git clone https://github.com/mateusorlandini/pokedex.git
cd pokedex
npm install
npm start   # http://localhost:4200
npm test    # run unit tests
```

Open an issue to discuss changes before submitting a pull request.
