'use client'

import { getApps, initializeApp } from "firebase/app";
import { Auth, OAuthCredential, User, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { UseState } from '@/utils/common.types';

 
import { Envs } from '@/envs';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { createContext, useContext, useState } from 'react';
import z from "zod";
import { userSchema } from "../config/firebase-admin/collectionTypes/users";
import { UsersFinancialData } from "../config/firebase-admin/collectionTypes/users/control";
import firebaseInit from '../config/firebase/init';
import useFirebaseUser from "../hooks/useFirebaseUser";
import useResize, { Dimensions } from "../hooks/useResize";
import useUserFinancialData from "../hooks/useUserFinancialData";
import FirebaseUserBase from "../modules/FIREBASE/FirebaseUserBase";

export type GlobalProviderType = { 
  login: { 
    user:UseState<User | null>, 
    credential:UseState<OAuthCredential | null>, 
  } 
  publicError:UseState<PublicError>, 
  alertBuyPoints:UseState<AlertBuyPoints>, 
  financialData: UsersFinancialData | null,
  fromServer: { 
    envs:Envs, 
  }; 
  dimensions:Dimensions,
  globalUser:FirebaseUserBase<z.infer<typeof userSchema>>,
  resetedState:UseState<number>,
  firebase: { 
    auth:Auth | null, 
    database:Database | null, 
    db:Firestore | null, 
    storage: FirebaseStorage | null, 
  }; 
} 

const GlobalProvider = createContext<GlobalProviderType>({} as any); 
export const useGlobalProvider = () =>  useContext(GlobalProvider); 

interface GlobalContextProviderProps { 
  children:React.ReactNode; 
  fromServer: { 
    envs:Envs 
  };   
} 

export type PublicError = { title:string, message:string };
export type AlertBuyPoints = { title?:string, message?:string, alert:boolean };

export default function GlobalContextProvider({ children, fromServer }:GlobalContextProviderProps) { 

  const [user, setUser] = useState<GlobalProviderType['login']['user'][0]>(null); 
  const [credential, setCredential] = useState<GlobalProviderType['login']['credential'][0]>(null); 
  const [publicError, setPublicError] = useState<PublicError>({ title:'', message:'' }); 
  const [alertBuyPoints, setAlertBuyPoints] = useState<AlertBuyPoints>({ alert:false }); 

  const { app, auth, database, db, storage } =  firebaseInit({ envs:fromServer.envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps });
  const { dimensions } = useResize();
  const { globalUser, resetedState } = useFirebaseUser({ auth:auth!, db:db! });

  // Dados financeiros do usuário
  const { financialData:[ financialData ] } = useUserFinancialData({ globalUser:globalUser.current, db:db! }) ?? {};

  const context:GlobalProviderType = {
    login:{
      user:[user, setUser], 
      credential:[credential, setCredential], 
    }, 
    publicError:[publicError, setPublicError], 
    alertBuyPoints:[alertBuyPoints, setAlertBuyPoints], 
    financialData,
    dimensions,
    globalUser:globalUser.current,
    resetedState,
    fromServer, 
    firebase:{ 
      auth, 
      database, 
      db,  
      storage, 
    } 
  }; 

  return ( 
    <GlobalProvider.Provider value={context}>       
      {children} 
    </GlobalProvider.Provider> 
  ) 
} 
