import { UsersControl } from "@/src/config/firebase-admin/collectionTypes/users/control";
import fromCollection from "@/src/config/firebase/firestore";
import FirebaseUserBase from "@/src/modules/FIREBASE/FirebaseUserBase";
import { UseState } from "@/utils/common.types";
import { Firestore } from "firebase/firestore";
import { useEffect, useState } from "react";


export type PrivilegesData = {
    coverGenerationForPrivateDocs:number,
    pdfUpload:number,
    questions:number,
    quizGenerationPrivateDocs:number,
    quizGenerationPublicDocs:number,
};

type GlobalUser = FirebaseUserBase<{
    email: string;
    uid: string;
    id: string;
    name: string;
    image: string;
    stripeId?: string | undefined;
    stripeIdDev?: string | undefined;
}>

export default function useUserFinancialData({ globalUser, db }:{ globalUser:GlobalUser, db:Firestore}) {

    // const globalState = useGlobalProvider();
    // const [, setResetedState] = globalState.resetedState ?? [];
    // const globalUser = globalState.globalUser;
    // const { db, storage } = globalState.firebase ?? {};
    // const [publicError, setPublicError] = globalState.publicError ?? [];

    const [financialData, setFinancialData ] = useState<UsersControl['financialData'] | null>(null);
    
    useEffect(() => {

        const snaps = {} as Record<string, any>;
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            if (!user) return;
            fromCollection('users', db!).getDocById(user.uid).getCollection('control').getDocById('financialData').onSnapshotExecute((snap) => {
                const previleges = snap?.data as UsersControl['financialData'] | undefined;
                setFinancialData(previleges ?? null);
            }, snaps, `pdf ${user.uid} privileges`);            
            
        });

        return () => {
            Object.values(snaps).map(item => item());
        };

    },[]);

    return {
        financialData:[financialData, setFinancialData] as UseState<UsersControl['financialData'] | null>,
    };

}