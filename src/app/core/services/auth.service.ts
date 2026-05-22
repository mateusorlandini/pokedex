import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Observable, from, map, switchMap } from 'rxjs';

import { firebaseAuth, firebaseFirestore } from './firebase.config';

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
          updateProfile(user, { displayName: name })
            .then(() => sendEmailVerification(user))
            .then(() =>
              setDoc(doc(firebaseFirestore, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                createdAt: serverTimestamp(),
                emailVerified: false,
              })
            )
        )
      )
    );
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      map(({ user }) => {
        if (!user.emailVerified) {
          signOut(firebaseAuth);
          const err = Object.assign(new Error('Email not verified'), {
            code: 'auth/email-not-verified',
          });
          throw err;
        }
      })
    );
  }

  logout(): void {
    signOut(firebaseAuth);
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(firebaseAuth, email));
  }

  resendVerificationEmail(): Observable<void> {
    const user = firebaseAuth.currentUser;
    if (!user) return from(Promise.reject(new Error('No user signed in')));
    return from(sendEmailVerification(user));
  }
}
