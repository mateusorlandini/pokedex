import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';
import { Observable, from, map, switchMap } from 'rxjs';

import { firebaseAuth, firebaseDatabase } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null | undefined>(undefined);

  readonly currentUser = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly currentUserName = computed(() => this._user()?.displayName ?? null);

  // Observable for the auth guard — first emission is the resolved auth state
  readonly user$ = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(firebaseAuth, (user) => subscriber.next(user))
  );

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => this._user.set(user));
  }

  register(name: string, email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      switchMap(({ user }) =>
        from(
          updateProfile(user, { displayName: name }).then(() =>
            set(ref(firebaseDatabase, `users/${user.uid}`), {
              uid: user.uid,
              email: user.email,
              displayName: name,
              createdAt: serverTimestamp(),
            })
          )
        )
      )
    );
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return from(signOut(firebaseAuth));
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(firebaseAuth, email));
  }
}
