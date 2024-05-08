'use client';

import usePdfList from "@/src/hooks/usePdfList";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useCallback, useMemo, useRef, useState } from "react";

import { Pdf, QuestionPdf, QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { twMerge } from "tailwind-merge";
import PdfCard from "./PdfCard";

import { UsersControlPrivileges } from "@/src/config/firebase-admin/collectionTypes/users/control";
import useQuestionsList from "@/src/hooks/useQuestionsList";
import useQuizList from "@/src/hooks/useQuizList";
import useUserFinancialData from "@/src/hooks/useUserFinancialData";
import useUserPrivileges, { PrivilegesData } from "@/src/hooks/useUserPrivileges";
import { UseState } from "@/utils/common.types";
import DetailsSection from "./DetailsSection";
import DetaisMenu from "./DetaisMenu";
import ListMenu from "./ListMenu";
import QuestionSection from "./QuestionSection";
import QuestionsMenu from "./QuestionsMenu";
import QuizMenu from "./QuizMenu";
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
    genres:string[],
    quizList:UseState<QuizPdf[]>,
    selectedGenres:UseState<string[]>,
    showQuestions:UseState<boolean>,
    questionList:UseState<QuestionPdf[]>,
    showQuestion:UseState<QuestionPdf | null>,
    askQuestion:UseState<boolean>,
    details:UseState<Pdf | null>,
    showQuestionList:UseState<boolean>,
    search:UseState<string>,
    showQuiz:UseState<boolean>,
    previleges: UseState<Record<string, UsersControlPrivileges>>,
    privilegesData: PrivilegesData,
}    


export default function PdfList() {

    const getPdfRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const {pdfList:[pdfList, ], genres, filteredList, selectedGenres:[selectedGenres, setSelectedGenres]} = usePdfList() ?? {};
    const [details, setDetails] = useState<Pdf | null>(null);
    
    const { financialData:[ financialData ] } = useUserFinancialData() ?? {};
    const { previleges, privilegesData } = useUserPrivileges() ?? {};
    const questionListHook = useQuestionsList({ pdfId:details?.id })
    const quizListHook = useQuizList({ pdfId:details?.id })
    const [quizList, setQuizList] = quizListHook.quizList;
    const [showQuestions, setShowQuestions] = useState(false);
    const [ questionList, setQuestionList ] = questionListHook?.pdfQuestions ?? [];
    const [showQuestion, setShowQuestion ] = questionListHook?.showQuestion ?? [];
    const [askQuestion, setAskQuestion] = questionListHook?.askQuestion ?? [];
    const [showQuestionList, setShowQuestionList] = questionListHook?.showQuestionList ?? [];
    const [showQuiz, setShowQuiz] = useState(false);
    // const [showQuiz, setShowQuiz] = useState<QuizPdf | null>(null);
    const [search, setSearch] = useState('');
    const [searchPdf, setSearchPdf] = useState('');

    const questionHooks = {
        genres,
        selectedGenres:[selectedGenres, setSelectedGenres],
        showQuestions:[showQuestions, setShowQuestions],
        questionList:[questionList, setQuestionList],
        quizList:[quizList, setQuizList],
        showQuestion:[showQuestion, setShowQuestion],
        askQuestion:[askQuestion, setAskQuestion],
        details:[details, setDetails],
        showQuestionList:[showQuestionList, setShowQuestionList],
        search:[search, setSearch],
        showQuiz:[showQuiz, setShowQuiz],
        previleges:previleges as UseState<Record<string, UsersControlPrivileges>>,
        privilegesData,
    } as PdfHooks

    

    const goToQuestions = useCallback((show:boolean) => {   
        resetScroll()

        setShowQuestions(show);
        setShowQuestionList(show);
        setShowQuiz(false);
    }, [setDetails]);

    const goToPdfList = useCallback(() => {
        resetScroll()

        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(false);
        setShowQuestions(false);
        setDetails(null);
        setShowQuiz(false);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList, setShowQuestions, setDetails]);
    
    const goToQuestionList = useCallback(() => {
        resetScroll()

        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuiz(false);
        setShowQuestionList(true);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList]);

    const goToAskQuestion = useCallback(() => {
        resetScroll()

        setShowQuestion(null);
        setShowQuestions(true);
        setAskQuestion(true);
        setShowQuiz(false);
        setShowQuestionList(false);
    }, [setShowQuestion, setAskQuestion, setShowQuestionList]);
    
    const choosePdf = useCallback((pdf:Pdf | null) => {
            resetScroll()

            setDetails(pdf);
            setShowQuiz(false);
            setShowQuestions(false);
            setShowQuestionList(false);
    }, [setDetails, setShowQuestions, setShowQuestionList, wrapperRef.current?.getBoundingClientRect().top]);

    const gotToQuestion = useCallback((showQuestion:QuestionPdf | null) => {
        resetScroll()

        setShowQuestion(showQuestion);
        setShowQuestionList(false);
        setAskQuestion(false);
        setShowQuiz(false);
    }, [setShowQuestion, setShowQuestionList, setAskQuestion]); 

    const gotToQuiz = useCallback(() => {
        resetScroll()
        
        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(false);
        setShowQuestions(false);
        setShowQuiz(true);
    }, [setShowQuestion, setShowQuestionList, setAskQuestion]); 

    function resetScroll() {
        if (!wrapperRef.current) return;
        const form = document.getElementById('Formularios')
        const top = wrapperRef.current.offsetTop;
        form?.scrollTo({ top:top * .95, behavior:'smooth' })
    }
      

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
        
        return filteredList?.map(item => (
        <PdfCard key={item.id} pdf={item} choosePdf={choosePdf} questionHooks={questionHooks} />
        ))
    }, [filteredList])

    return (
        dimensions &&
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-start gap-4 py-7" >
            {(financialData?.paymentMethods ?? 0) === 0 && (
                <div className="max-sm:w-[90%] w-[768px] flex flex-col gap-1 items-center justify-center bg-red-500 p-4 rounded shadow" >
                    <span className="text-white" >
                        Atenção! Você ainda não cadastrou nenhum cartão de crédito.
                    </span>
                    <span className="text-white" >
                        Após se esgotarem os recursos gratuitos, não será possível usar os serviços.
                    </span>
                    <button className="bg-gray-100 p-2 rounded shadow text-base font-normal mt-2" >
                        Clique aqui para cadastra agora.
                    </button>
                </div>
            )}
            <div ref={wrapperRef} className="bg-white rounded shadow max-sm:w-[90%] w-[768px] flex items-center justify-around py-4" >
                {details && !showQuestions && !showQuiz && <DetaisMenu choosePdf={choosePdf} functions={functions} />}
                {details && showQuestions && !showQuiz && <QuestionsMenu questionHooks={questionHooks} functions={functions} />}
                {!details && !showQuestions && !showQuiz && <ListMenu getPdfRef={getPdfRef} questionHooks={questionHooks} />}
                {showQuiz && details && !showQuestions && <QuizMenu functions={functions} questionHooks={questionHooks} />}
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