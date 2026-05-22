import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { Pokemon } from '../../core/models/pokemon.model';
import { AuthService } from '../../core/services/auth.service';
import { firebaseFirestore } from '../../core/services/firebase.config';

export interface FavoriteRecord {
  pokemonId: number;
  name: string;
  imageUrl: string;
  types: string[];
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);
  private readonly _favorites = signal<FavoriteRecord[]>([]);
  private _unsubscribeSnapshot: (() => void) | null = null;

  readonly favorites = this._favorites.asReadonly();
  readonly count = computed(() => this._favorites().length);
  private readonly _ids = computed(() => new Set(this._favorites().map((f) => f.pokemonId)));

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user === undefined) return; // auth not yet resolved

      if (user) {
        this.subscribeToFirestore(user.uid);
      } else {
        this.clearAndUnsubscribe();
      }
    });
  }

  isFavorite(id: number): boolean {
    return this._ids().has(id);
  }

  toggle(pokemon: Pokemon): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const isFav = this._ids().has(pokemon.id);

    // Optimistic local update
    if (isFav) {
      this._favorites.update((list) => list.filter((f) => f.pokemonId !== pokemon.id));
    } else {
      this._favorites.update((list) => [
        ...list,
        {
          pokemonId: pokemon.id,
          name: pokemon.name,
          imageUrl:
            pokemon.sprites.other?.['official-artwork']?.front_default ??
            pokemon.sprites.front_default ??
            '',
          types: pokemon.types.map((t) => t.type.name),
        },
      ]);
    }

    const docRef = doc(firebaseFirestore, 'users', user.uid, 'favorites', String(pokemon.id));

    if (isFav) {
      deleteDoc(docRef);
    } else {
      setDoc(docRef, {
        pokemonId: pokemon.id,
        name: pokemon.name,
        imageUrl:
          pokemon.sprites.other?.['official-artwork']?.front_default ??
          pokemon.sprites.front_default ??
          '',
        types: pokemon.types.map((t) => t.type.name),
        createdAt: serverTimestamp(),
      });
    }
  }

  private subscribeToFirestore(uid: string): void {
    this._unsubscribeSnapshot?.();
    const favRef = collection(firebaseFirestore, 'users', uid, 'favorites');
    this._unsubscribeSnapshot = onSnapshot(favRef, (snapshot) => {
      const records: FavoriteRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          pokemonId: data['pokemonId'] as number,
          name: data['name'] as string,
          imageUrl: data['imageUrl'] as string,
          types: data['types'] as string[],
        };
      });
      this._favorites.set(records);
    });
  }

  private clearAndUnsubscribe(): void {
    this._unsubscribeSnapshot?.();
    this._unsubscribeSnapshot = null;
    this._favorites.set([]);
  }
}
