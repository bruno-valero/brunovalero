import { userSchema } from "@/src/config/firebase-admin/collectionTypes/users";
import fromCollection from "@/src/config/firebase/firestore";
import FirebaseUserBase from "@/src/modules/FIREBASE/FirebaseUserBase";
import { UseState } from "@/utils/common.types";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";


export default function useFirebaseUser({ auth, db }:{ auth:Auth, db:Firestore }) {

    const [resetedState, setResetState] = useState(0);
    
    const resetState = useCallback(() => {
        setResetState(prev => {
            const newPrev = new Date().getTime();
            return newPrev;
        })
    }, [setResetState]);
    
    const globalUser = useRef(new FirebaseUserBase({ auth:auth!, db:db!, resetState, schema:userSchema, apiCreationPath:'/api/users/create-by-uid', _collection:(uid) => fromCollection('users', db!).getDocById(uid) }));      
    
    useEffect(() => {
        const unsub = globalUser.current.userAuth.onAuthStateChanged((user) => {      
            if (!user) {
            globalUser.current.resetUser();
            }
            globalUser.current.onSnapshot(user ?? null, () => {});
        });
        return () => {
            unsub();
            globalUser.current.clearSnapshots();
        }
    }, []); 
       
    return {
        resetedState: [resetedState, setResetState] as UseState<number>,
        globalUser,
    }
}