'use client';

import usePdfList from "@/src/hooks/usePdfList";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useCallback, useMemo, useRef, useState } from "react";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { twMerge } from "tailwind-merge";
import PdfCard from "./PdfCard";

import useQuestionsList from "@/src/hooks/useQuestionsList";
import useQuizList from "@/src/hooks/useQuizList";
import { UseState } from "@/utils/common.types";
import DetailsSection from "./DetailsSection";
import DetaisMenu from "./DetaisMenu";
import ListMenu from "./ListMenu";
import QuestionSection from "./QuestionSection";
import QuestionsMenu from "./QuestionsMenu";
import QuizSection from "./QuizSection";

export type PdfFunctions = {
    gotToQuestion: (showQuestion:QuestionPdf | null) => void;
    goToQuestions: (show: boolean) => void;
    goToPdfList: () => void;
    goToQuestionList: () => void;
    goToAskQuestion: () => void;
    choosePdf: (pdf: Pdf | null) => void;
    gotToQuiz: () => void

}

export type PdfHooks = {
    showQuestions:UseState<boolean>,
    questionList:UseState<QuestionPdf[]>,
    showQuestion:UseState<QuestionPdf | null>,
    askQuestion:UseState<boolean>,
    details:UseState<Pdf | null>,
    showQuestionList:UseState<boolean>,
    search:UseState<string>,
    showQuiz:UseState<boolean>,
}    


export default function PdfList() {

    const getPdfRef = useRef<HTMLInputElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    const [pdfList, ] = usePdfList();
    const [details, setDetails] = useState<Pdf | null>(null);
    
    const questionListHook = useQuestionsList({ pdfId:details?.id })
    const quizListHook = useQuizList({ pdfId:details?.id })
    const [quizList, setQuizList] = quizListHook.quizList;
    const [showQuestions, setShowQuestions] = useState(false);
    const [ questionList, setQuestionList ] = questionListHook.pdfQuestions;
    const [showQuestion, setShowQuestion ] = questionListHook.showQuestion;
    const [askQuestion, setAskQuestion] = questionListHook.askQuestion;
    const [showQuestionList, setShowQuestionList] = questionListHook.showQuestionList;
    const [showQuiz, setShowQuiz] = useState(false);
    // const [showQuiz, setShowQuiz] = useState<QuizPdf | null>(null);
    const [search, setSearch] = useState('');

    const questionHooks = {
        showQuestions:[showQuestions, setShowQuestions],
        questionList:[questionList, setQuestionList],
        quizList:[quizList, setQuizList],
        showQuestion:[showQuestion, setShowQuestion],
        askQuestion:[askQuestion, setAskQuestion],
        details:[details, setDetails],
        showQuestionList:[showQuestionList, setShowQuestionList],
        search:[search, setSearch],
        showQuiz:[showQuiz, setShowQuiz],
    } as PdfHooks

    

    const goToQuestions = useCallback((show:boolean) => {
        setShowQuestions(show);
        setShowQuestionList(show);
    }, [setDetails]);

    const goToPdfList = useCallback(() => {
        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(false);
        setShowQuestions(false);
        setDetails(null);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList, setShowQuestions, setDetails]);
    
    const goToQuestionList = useCallback(() => {
        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(true);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList]);

    const goToAskQuestion = useCallback(() => {
        setShowQuestion(null);
        setShowQuestions(true);
        setAskQuestion(true);
        setShowQuestionList(false);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList]);
    
    const choosePdf = useCallback((pdf:Pdf | null) => {
        setDetails(pdf);
        setShowQuestions(false);
        setShowQuestionList(false);
    }, [setDetails, setShowQuestions, setShowQuestionList]);

    const gotToQuestion = useCallback((showQuestion:QuestionPdf | null) => {
        setShowQuestion(showQuestion);
        setShowQuestionList(false);
        setAskQuestion(false);
    }, [setShowQuestion, setShowQuestionList, setAskQuestion]); 

    const gotToQuiz = useCallback(() => {
        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(false);
        setShowQuestions(false);
        setShowQuiz(true);
    }, [setShowQuestion, setShowQuestionList, setAskQuestion]); 
      

    const functions:PdfFunctions = {
        gotToQuiz,
        gotToQuestion,
        goToQuestions,
        goToPdfList,
        goToQuestionList,
        goToAskQuestion,
        choosePdf
    }


    const pdfListMemo = useMemo(() => {
        
        return pdfList.map(item => (
        <PdfCard key={item.id} pdf={item} choosePdf={choosePdf} />
        ))
    }, [pdfList])

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-start gap-4 py-7" >
            
            <div className="bg-white rounded shadow max-sm:w-[90%] w-[768px] flex items-center justify-around py-4" >
                {details && !showQuestions && !showQuiz && <DetaisMenu choosePdf={choosePdf} functions={functions} />}
                {details && showQuestions && !showQuiz && <QuestionsMenu questionHooks={questionHooks} functions={functions} />}
                {!details && !showQuestions && !showQuiz && <ListMenu getPdfRef={getPdfRef} />}
            </div>
            <div className={twMerge("bg-white rounded shadow max-sm:w-[90%] w-[768px] min-h-screen flex flex-row flex-wrap items-stretch justify-start gap-4 p-4", details && 'items-start justify-center')} >
                {details && !showQuestions && !showQuiz && <DetailsSection questionHooks={questionHooks} functions={functions} />}                
                {!details && !showQuestions && !showQuiz && pdfListMemo}
                {showQuestions && details && !showQuiz && <QuestionSection questionHooks={questionHooks} functions={functions} />}
                {showQuiz && details && !showQuestions && <QuizSection questionHooks={questionHooks} functions={functions} />}
            </div>
        </div>
    );

};