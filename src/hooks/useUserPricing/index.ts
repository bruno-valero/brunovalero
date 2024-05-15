import { Control } from "@/src/config/firebase-admin/collectionTypes/control";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { useEffect, useState } from "react";


export type PrivilegesData = {
    coverGenerationForPrivateDocs:number,
    pdfUpload:number,
    questions:number,
    quizGenerationPrivateDocs:number,
    quizGenerationPublicDocs:number,
};


export default function useUserPricing() {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];

    const [pricing, setPricing ] = useState<Control['pricing'] | null>(null);
    
    useEffect(() => {

        const snaps = {} as Record<string, any>;
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            if (!user) return;
            fromCollection('control', db!).getDocById(`pricing`).onSnapshotExecute((snap) => {
                const previleges = snap?.data as Control['pricing'] | undefined;
                setPricing(previleges ?? null);
            }, snaps, `pdf ${user.uid} pricing`);            
            
        });

        return () => {
            Object.values(snaps).map(item => item());
        };

    },[]);

    return {
        pricing:[pricing, setPricing] as UseState<Control['pricing'] | null>,        
    };

}