'use client';

import usePdfList from "@/src/hooks/usePdfList";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useCallback, useMemo, useRef, useState } from "react";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { twMerge } from "tailwind-merge";
import PdfCard from "./PdfCard";

import useQuestionsList from "@/src/hooks/useQuestionsList";
import { UseState } from "@/utils/common.types";
import DetailsSection from "./DetailsSection";
import DetaisMenu from "./DetaisMenu";
import ListMenu from "./ListMenu";
import QuestionSection from "./QuestionSection";
import QuestionsMenu from "./QuestionsMenu";


export default function PdfList() {

    const getPdfRef = useRef<HTMLInputElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    const [pdfList, ] = usePdfList();
    const [details, setDetails] = useState<Pdf | null>(null);
    
    const [showQuestions, setShowQuestions] = useState(false);
    const questionListHook = useQuestionsList({ pdfId:details?.id })
    const [ questionList, setQuestionList ] = questionListHook.pdfQuestions;
    const [showQuestion, setShowQuestion ] = questionListHook.showQuestion;
    const [askQuestion, setAskQuestion] = questionListHook.askQuestion;

    const questionHooks = {
        showQuestions:[showQuestions, setShowQuestions],
        questionList:[questionList, setQuestionList],
        showQuestion:[showQuestion, setShowQuestion],
        askQuestion:[askQuestion, setAskQuestion],
        details:[details, setDetails],
    } as {
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
    }

    

    const goToQuestions = useCallback((show:boolean) => {
        setShowQuestions(show);
    }, [setDetails]);
    
    const choosePdf = useCallback((pdf:Pdf | null) => {
        setDetails(pdf);
        setShowQuestions(false);
    }, [setDetails]);


    const pdfListMemo = useMemo(() => pdfList.map(item => (
        <PdfCard key={item.id} pdf={item} choosePdf={choosePdf} />
    )), [pdfList])

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-start gap-4 py-7" >
            
            <div className="bg-white rounded shadow max-sm:w-[90%] w-[768px] flex items-center justify-around py-4" >
                {details && !showQuestions && <DetaisMenu choosePdf={choosePdf} goToQuestions={() => goToQuestions(true)} />}
                {details && showQuestions && <QuestionsMenu questionHooks={questionHooks} />}
                {!details && !showQuestions && <ListMenu getPdfRef={getPdfRef} />}
            </div>
            <div className={twMerge("bg-white rounded shadow max-sm:w-[90%] w-[768px] min-h-screen flex flex-row flex-wrap items-stretch justify-start gap-4 p-4", details && 'items-start justify-center')} >
                {details && !showQuestions && <DetailsSection details={details} goToQuestions={() => goToQuestions(true)} />}                
                {!details && !showQuestions && pdfListMemo}
                {showQuestions && details && (
                    <QuestionSection questionHooks={questionHooks} />
                )}
            </div>
        </div>
    );

};