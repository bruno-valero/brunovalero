import { UsersControl } from "@/src/config/firebase-admin/collectionTypes/users/control";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { useEffect, useMemo, useState } from "react";


export type PrivilegesData = {
    coverGenerationForPrivateDocs:number,
    pdfUpload:number,
    questions:number,
    quizGenerationPrivateDocs:number,
    quizGenerationPublicDocs:number,
};


export default function useUserPrivileges() {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    const [previleges, setPrevileges ] = useState<UsersControl['PrivilegesFreeServices'] | null>(null);
    
    const privilegesData = useMemo(() => {        
        const privilegesData = Object.values(previleges ?? {}).reduce((acc:PrivilegesData, item) => {
            const { 
                coverGenerationForPrivateDocs,
                pdfUpload,
                questions,
                quizGeneration
             } = item.privilegeData.readPdf  

            acc['coverGenerationForPrivateDocs'] = acc['coverGenerationForPrivateDocs'] ? acc['coverGenerationForPrivateDocs'] + coverGenerationForPrivateDocs : coverGenerationForPrivateDocs;
            acc['pdfUpload'] = acc['pdfUpload'] ? acc['pdfUpload'] + pdfUpload : pdfUpload;
            acc['questions'] = acc['questions'] ? acc['questions'] + questions : questions;
            acc['quizGenerationPrivateDocs'] = acc['quizGenerationPrivateDocs'] ? acc['quizGenerationPrivateDocs'] + quizGeneration.privateDocs : quizGeneration.privateDocs;
            acc['quizGenerationPublicDocs'] = acc['quizGenerationPublicDocs'] ? acc['quizGenerationPublicDocs'] + quizGeneration.publicDocs : quizGeneration.publicDocs;

            return acc;
        }, {} as PrivilegesData);

        return privilegesData;
    }, [previleges]);
    
    useEffect(() => {

        const snaps = {} as Record<string, any>;
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            if (!user) return;
            fromCollection('users', db!).getDocById(user.uid).getCollection('control').getDocById('PrivilegesFreeServices').onSnapshotExecute((snap) => {
                const previleges = snap?.data as UsersControl['PrivilegesFreeServices'] | undefined;
                setPrevileges(previleges ?? null);
            }, snaps, `pdf ${user.uid} privileges`);            
            
        });

        return () => {
            Object.values(snaps).map(item => item());
        };

    },[globalUser.data?.uid]);

    return {
        previleges:[previleges, setPrevileges ] as UseState<UsersControl['PrivilegesFreeServices'] | null>,
        privilegesData,
    };

}