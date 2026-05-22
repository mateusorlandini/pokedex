import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const DB_URL = 'https://pokedex-5a812-default-rtdb.firebaseio.com';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly http = inject(HttpClient);

  registerUser(profile: { name: string; email: string }): Observable<unknown> {
    return this.http.post(`${DB_URL}/users.json`, {
      ...profile,
      createdAt: new Date().toISOString(),
    });
  }
}
