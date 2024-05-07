import { QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { useEffect, useState } from "react";

export default function useQuizList({ pdfId }:{ pdfId?:string }) {


    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db } = globalState.firebase ?? {};

    const [quizList, setShowQuizList ] = useState<QuizPdf[]>([]);

    useEffect(() => {
        const snaps = {} as Record<string, any>
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            if (!pdfId) return;
            fromCollection('services', db!).getDocById('readPdf').getCollection('data').getDocById(pdfId).getCollection('quiz').onSnapshotExecute((snap) => {
                const questions = snap.map(item => item.data) as QuizPdf[];
                setShowQuizList(questions);
                console.log(`Quizes: ${JSON.stringify(questions, null, 2)}`);
            }, snaps, `pdf ${pdfId} Quizes`)                
            
            if (user) {  
                            
            } 
        });

        return () => {
            Object.values(snaps).map(item => item());
        }

    },[pdfId]);

    const data = {
        quizList:[quizList, setShowQuizList] as UseState<QuizPdf[]>,        
    };
    return data;


}