import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'pokedex_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _favorites = signal<Set<number>>(this.loadFromStorage());

  readonly favorites = computed(() => this._favorites());
  readonly count = computed(() => this._favorites().size);

  toggle(id: number): void {
    const current = new Set(this._favorites());

    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }

    this._favorites.set(current);
    this.saveToStorage(current);
  }

  isFavorite(id: number): boolean {
    return this._favorites().has(id);
  }

  private loadFromStorage(): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return new Set(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  private saveToStorage(favorites: Set<number>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // ignore
    }
  }
}
