import { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Envs } from '../../../envs';


type FirebaseInitProps = {
  envs: Envs,
  initializeApp: (options: FirebaseOptions, name?: string | undefined) => FirebaseApp;
  getAuth: (app?: FirebaseApp | undefined) => Auth;
  getDatabase: (app?: FirebaseApp | undefined, url?: string | undefined) => Database;
  getFirestore:(app?: FirebaseApp | undefined) => Firestore;
  getStorage:(app?: FirebaseApp | undefined) => FirebaseStorage;
  getApps:() => FirebaseApp[]
};

export default function firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps }: FirebaseInitProps) {
  const regExp = new RegExp(envs.FIREBASE_API_KEY ?? '', 'ig');
  if (!envs.FIREBASE_API_KEY || regExp.test('TESTE')) return {
    app:null,
    auth:null,
    database:null,
    db:null,
    storage:null,
  };
  const firebaseConfig = {
    apiKey: envs.FIREBASE_API_KEY,
    authDomain: envs.FIREBASE_AUTH_DOMAIN,
    databaseURL: envs.FIREBASE_DATABASE_URL,
    projectId: envs.FIREBASE_PROJECT_ID,
    storageBucket: envs.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envs.FIREBASE_MESSAGING_SENDER_ID,
    appId: envs.FIREBASE_APP_ID,
    measurementId: envs.FIREBASE_MEASUREMENT_ID,
  };

  // console.log('firebaseConfig: ', firebaseConfig)
  // @ts-ignore
  const apps = getApps();
  const app = initializeApp(firebaseConfig); 
  const auth = getAuth(app);
  const database = getDatabase(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return {
    app,
    auth,
    database,
    db,
    storage,
  };
}

