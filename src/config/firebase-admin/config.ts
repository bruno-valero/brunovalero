import { credential } from 'firebase-admin';
import { getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import serviceAccount from './acolher-funeraria-6f14b1defd35.json';
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
const credentials = credential
const apps = getApps()
const app = apps[0] ?? initializeApp({
  credential:credentials.cert(serviceAccount as ServiceAccount),
});

export const admin_firestore = getFirestore(app);
export const admin_storage = getStorage(app).bucket('leitor-de-bula.appspot.com');
export const admin_auth = getAuth(app);