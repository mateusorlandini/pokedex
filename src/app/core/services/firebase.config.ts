import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyC7doFHHLpTHH9g_gmKO5jQInG30DpuL6I',
  authDomain: 'pokedex-5a812.firebaseapp.com',
  databaseURL: 'https://pokedex-5a812-default-rtdb.firebaseio.com',
  projectId: 'pokedex-5a812',
  storageBucket: 'pokedex-5a812.firebasestorage.app',
  messagingSenderId: '370943961176',
  appId: '1:370943961176:web:ffc6736d06dcf2971f822d',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDatabase = getDatabase(firebaseApp);
