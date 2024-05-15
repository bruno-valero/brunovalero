import { QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useQuestionsList({ pdfId }:{ pdfId?:string }) {


    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db } = globalState.firebase ?? {};

    const [pdfQuestions, setPdfQuestions] = useState<QuestionPdf[]>([]);

    const [showQuestionList, setShowQuestionList ] = useState(true);
    const [showQuestion, setShowQuestion ] = useState<QuestionPdf | null>(null);
    const [askQuestion, setAskQuestion] = useState(false);

    useEffect(() => {
        if (pdfQuestions.length === 0) {
            setAskQuestion(true);
            setShowQuestionList(false);
        }
    }, [pdfQuestions]);

    useEffect(() => {
        const snaps = {} as Record<string, any>
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            if (!pdfId) return;
            if (!user) return;
            fromCollection('services', db!).getDocById('readPdf').getCollection('data').getDocById(pdfId).getCollection('questions').onSnapshotExecute((snap) => {
                const questions = snap.map(item => item.data) as QuestionPdf[];
                setPdfQuestions(questions);
                console.log(`questions: ${JSON.stringify(questions, null, 2)}`);
            }, snaps, `pdf ${pdfId} questions`, undefined, [where('userId', '==', user.uid)])                

        });

        return () => {
            Object.values(snaps).map(item => item());
        }

    },[pdfId]);

    const data = {
        pdfQuestions:[pdfQuestions, setPdfQuestions] as UseState<QuestionPdf[]>,
        showQuestion:[showQuestion, setShowQuestion ] as UseState<QuestionPdf | null>,
        askQuestion: [askQuestion, setAskQuestion] as UseState<boolean>,
        showQuestionList: [showQuestionList, setShowQuestionList] as UseState<boolean>,
    }
    return data;


}