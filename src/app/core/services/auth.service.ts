import { Injectable, computed, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { push, ref } from 'firebase/database';
import { from, Observable, switchMap } from 'rxjs';

import { firebaseAuth, firebaseDatabase } from './firebase.config';

const STORAGE_TOKEN = 'pokedex_token';
const STORAGE_EXPIRY = 'pokedex_token_expiry';
const STORAGE_NAME = 'pokedex_user_name';
const ONE_HOUR_MS = 3_600_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(STORAGE_TOKEN));
  private readonly _expiry = signal<number>(Number(localStorage.getItem(STORAGE_EXPIRY) ?? 0));
  private readonly _userName = signal<string | null>(localStorage.getItem(STORAGE_NAME));

  readonly isAuthenticated = computed(
    () => !!this._token() && Date.now() < this._expiry()
  );
  readonly currentUserName = this._userName.asReadonly();

  register(name: string, email: string, password: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(firebaseAuth, email, password)
    ).pipe(
      switchMap((credential) => {
        const userId = credential.user.uid;
        return from(
          push(ref(firebaseDatabase, 'users'), {
            uid: userId,
            name,
            email,
            createdAt: new Date().toISOString(),
          }).then(() => undefined as void)
        );
      })
    );
  }

  login(email: string, password: string): Observable<void> {
    return from(
      signInWithEmailAndPassword(firebaseAuth, email, password)
    ).pipe(
      switchMap((credential) =>
        from(
          credential.user.getIdToken().then((token) => {
            const expiry = Date.now() + ONE_HOUR_MS;
            const name = credential.user.displayName ?? email.split('@')[0];
            localStorage.setItem(STORAGE_TOKEN, token);
            localStorage.setItem(STORAGE_EXPIRY, String(expiry));
            localStorage.setItem(STORAGE_NAME, name);
            this._token.set(token);
            this._expiry.set(expiry);
            this._userName.set(name);
          })
        )
      )
    );
  }

  logout(): void {
    signOut(firebaseAuth);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_EXPIRY);
    localStorage.removeItem(STORAGE_NAME);
    this._token.set(null);
    this._expiry.set(0);
    this._userName.set(null);
  }
}
