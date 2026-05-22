import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import { environment } from '../../../environments/environment';

export const firebaseApp = initializeApp(environment.firebase);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDatabase = getDatabase(firebaseApp);
