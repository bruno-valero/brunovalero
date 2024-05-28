import { credential } from 'firebase-admin';
import { getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import envs from '../../../envs';
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
const credentials = credential
const apps = getApps();
const cert = JSON.parse(envs.FIREBASE_ADMIN_JSON ?? '') as ServiceAccount;
const app = apps[0] ?? initializeApp({
  credential:credentials.cert(cert),
});

export const admin_firestore = getFirestore(app);
export const admin_storage = getStorage(app).bucket('gs://brunovalero-49561.appspot.com');
export const admin_auth = getAuth(app);