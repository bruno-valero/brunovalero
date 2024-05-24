'use client';

import usePdfList from "@/src/hooks/usePdfList";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Pdf, QuestionPdf, QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { twMerge } from "tailwind-merge";
import PdfCard from "./PdfCard";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollComponent } from "@/src/components/structural/ScrollComponent";
import { Control } from "@/src/config/firebase-admin/collectionTypes/control";
import { UsersControlPrivileges, UsersFinancialData } from "@/src/config/firebase-admin/collectionTypes/users/control";
import useQuestionsList from "@/src/hooks/useQuestionsList";
import useQuizList from "@/src/hooks/useQuizList";
import useUserPricing from "@/src/hooks/useUserPricing";
import useUserPrivileges, { PrivilegesData } from "@/src/hooks/useUserPrivileges";
import Post from "@/src/modules/Request/Post";
import StripeFrontEnd from "@/src/modules/stripe/frontend/StripeFrontEnd";
import CardSetup from "@/src/modules/stripe/frontend/StripeFrontEnd/tsx/CardSetup";
import { UseState } from "@/utils/common.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CiCreditCard1 } from "react-icons/ci";
import DetailsSection from "./DetailsSection";
import DetaisMenu from "./DetaisMenu";
import ListMenu from "./ListMenu";
import PricingSection from "./Pricing/PricingSection";
import QuestionSection from "./QuestionSection";
import QuestionsMenu from "./QuestionsMenu";
import QuizMenu from "./QuizMenu";
import QuizSection from "./QuizSection";


export type PdfFunctions = {
    hasPaymentMethods: () => boolean,
    insChangingPublic: ({ pdf, title, message }: {
        pdf: Pdf;
        title: string;
        message: string;
    }) => boolean,   
    hasInsufficientCredits: ({ message, title, privilege }: {
        message?: string | undefined;
        title?: string | undefined;
        privilege?: "coverGenerationForPrivateDocs" | "pdfUpload" | "questions" | "quizGenerationPrivateDocs" | "quizGenerationPublicDocs" | undefined;
    }) => boolean,     
    gotToQuestion: (showQuestion:QuestionPdf | null, details: Pdf | null) => void;
    goToQuestions: (show: boolean, details: Pdf | null) => void;
    goToPdfList: (details: Pdf | null) => void;
    goToQuestionList: (details: Pdf | null) => void;
    goToAskQuestion: (details: Pdf | null) => void;
    choosePdf: (pdf: Pdf | null) => void;
    gotToQuiz: (details: Pdf | null) => void;
    isLogged: () => boolean;
    resetScroll: () => void;
    scrollToPlans: () => void;
}

export type PdfHooks = {
    financialData: UsersFinancialData | null,
    genres:string[],
    pricing:Control['pricing'],
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
    const pansRef = useRef<HTMLDivElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;
    const financialData = globalState.financialData;
    const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints ?? [];

    const {pdfList:[pdfList, ], genres, filteredList, selectedGenres:[selectedGenres, setSelectedGenres]} = usePdfList() ?? {};
    const [details, setDetails] = useState<Pdf | null>(null);
    
    const stripe = new StripeFrontEnd(envs);
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const stripeJs = stripe.useLoadStripe();
    const { clientSecret, requestSetupIntent } = stripe.useSetupIntent();
    // const { financialData:[ financialData ] } = useUserFinancialData() ?? {};
    const { pricing:[pricing] } = useUserPricing();
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
        financialData,
        genres,
        pricing,
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

    const isLogged = useCallback(() => {
        if (!globalUser.data) {
            setPublicError({ title:'É necessário Login', message:`Faça login antes de prosseguir.`, action:() => globalUser.createWithLogin() });
            return false;
        }   
        return true;     
    }, [setPublicError]);

    const resetScroll = useCallback(() => {
        if (!wrapperRef.current) return;
        const form = document.getElementById('Formularios')
        const top = wrapperRef.current.offsetTop;
        form?.scrollTo({ top:top * .95, behavior:'smooth' })
    }, []); 

    const scrollToPlans = useCallback(() => {
        if (!pansRef.current) return;
        const form = document.getElementById('Formularios')
        const top = pansRef.current.offsetTop;
        form?.scrollTo({ top:top, behavior:'smooth' })
    }, []);    

    type Params = 'goToQuestions' | 'goToPdfList' | 'goToQuestionList' | 'goToAskQuestion' | 'choosePdf' | 'gotToQuestion' | 'gotToQuiz';
    
    useEffect(() => {
        const section = params?.get(`section`) as Params | null;
        const pdfId = params?.get(`details`);

        if(section === 'goToQuestions') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null)
            setShowQuestions(true);
            setShowQuestionList(true);
            setShowQuiz(false);
            return;
        }
        if(section === 'goToPdfList') {
            setShowQuestion(null);
            setAskQuestion(false);
            setShowQuestionList(false);
            setShowQuestions(false);
            setDetails(null);
            setShowQuiz(false);
            return;
        }

        if(section === 'goToQuestionList') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null)
            setShowQuestion(null);
            setAskQuestion(false);
            setShowQuiz(false);
            setShowQuestionList(true);
            return;
        }

        if(section === 'goToAskQuestion') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null)
            setShowQuestion(null);
            setShowQuestions(true);
            setAskQuestion(true);
            setShowQuiz(false);
            setShowQuestionList(false);
            return;
        }

        if(section === 'choosePdf') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null);
            setShowQuiz(false);
            setShowQuestions(false);
            setShowQuestionList(false);
            return;
        }
        
        if(section === 'gotToQuestion') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null)
            setShowQuestion(showQuestion);
            setShowQuestionList(false);
            setAskQuestion(false);
            setShowQuiz(false);
            return;
        }

        if(section === 'gotToQuiz') {
            setDetails(filteredList.filter(item => item.id === pdfId)?.[0] ?? null)
            setShowQuestion(null);
            setAskQuestion(false);
            setShowQuestionList(false);
            setShowQuestions(false);
            setShowQuiz(true);
            return;
        }
    }, [params, filteredList])


    const goToQuestions = useCallback((show:boolean, details: Pdf | null) => {   
        resetScroll()

        router.push(`?section=goToQuestions&details=${details?.id ?? null}`, {  scroll: false })
        // setShowQuestions(show);
        // setShowQuestionList(show);
        // setShowQuiz(false);
    }, [resetScroll]);

    const goToPdfList = useCallback(() => {
        resetScroll()

        router.push(`?section=goToPdfList`, {  scroll: false })
        // setShowQuestion(null);
        // setAskQuestion(false);
        // setShowQuestionList(false);
        // setShowQuestions(false);
        // setDetails(null);
        // setShowQuiz(false);
    }, [resetScroll]);
    
    const goToQuestionList = useCallback((details: Pdf | null) => {
        resetScroll()

        router.push(`?section=goToQuestionList&details=${details?.id ?? null}`, {  scroll: false })
        // setShowQuestion(null);
        // setAskQuestion(false);
        // setShowQuiz(false);
        // setShowQuestionList(true);
    }, [resetScroll]);

    const goToAskQuestion = useCallback((details: Pdf | null) => {
        resetScroll()

        router.push(`?section=goToAskQuestion&details=${details?.id ?? null}`, {  scroll: false })
        // setShowQuestion(null);
        // setShowQuestions(true);
        // setAskQuestion(true);
        // setShowQuiz(false);
        // setShowQuestionList(false);
    }, [resetScroll]);
    
    const choosePdf = useCallback((pdf:Pdf | null) => {
            resetScroll()

            router.push(`?section=choosePdf&details=${pdf?.id ?? null}`, {  scroll: false })
            // setDetails(pdf);
            // setShowQuiz(false);
            // setShowQuestions(false);
            // setShowQuestionList(false);
    }, [resetScroll]);

    const gotToQuestion = useCallback((showQuestion:QuestionPdf | null, details: Pdf | null) => {
        resetScroll()

        router.push(`?section=gotToQuestion&details=${details?.id ?? null}&showQuestion=${showQuestion}`, {  scroll: false })
        // setShowQuestion(showQuestion);
        // setShowQuestionList(false);
        // setAskQuestion(false);
        // setShowQuiz(false);
    }, [resetScroll]); 

    const gotToQuiz = useCallback((details: Pdf | null) => {
        resetScroll()

        router.push(`?section=gotToQuiz&details=${details?.id ?? null}`, {  scroll: false })
        // setShowQuestion(null);
        // setAskQuestion(false);
        // setShowQuestionList(false);
        // setShowQuestions(false);
        // setShowQuiz(true);
    }, [resetScroll]); 


    const insChangingPublic = useCallback(({pdf, title, message}:{pdf:Pdf, title:string, message:string}) => {
        if (globalUser.data?.uid !== pdf.userId) {
            setPublicError({ title, message });
            return true;
        };
        return false;
    }, [setPublicError, globalUser])

    const hasInsufficientCredits = useCallback(({message, title, privilege}:{message?:string, title?:string, privilege?:'coverGenerationForPrivateDocs' | 'pdfUpload' | 'questions' | 'quizGenerationPrivateDocs' | 'quizGenerationPublicDocs'}) => {
        const credits = financialData?.credits ?? 0;
        let priv = 0;
        alert(`privilege: ${privilege}`);
        alert(`privilegesData[privilege]: ${JSON.stringify(privilegesData, null, 2)}`);
        if (privilege && privilegesData[privilege]) {
            priv = privilegesData[privilege];
        }
        if(priv === 0 && credits < 5) {
            setAlertBuyPoints({ alert:true, message, title });
            return true;
        }
        return false;
    }, [setAlertBuyPoints, financialData, privilegesData]);

    const hasPaymentMethods = useCallback(() => {
        const paymentMethods = (financialData?.paymentMethods ?? 0);
        if(paymentMethods > 0) return true;
        setPublicError({ title:`Método de pagamento`, message:`Para realizar esta ação é necessário possuir um cartão de crédito cadastrado.` });
        return false;

        
    }, [setPublicError, financialData]);

     
      

    const functions:PdfFunctions = {
        hasPaymentMethods,
        insChangingPublic,
        hasInsufficientCredits,
        gotToQuiz,
        gotToQuestion,
        goToQuestions,
        goToPdfList,
        goToQuestionList,
        goToAskQuestion,
        choosePdf,
        isLogged,
        resetScroll,
        scrollToPlans,
    }

    async function cardRegister() {
        const log = isLogged()
        if (!log) return;

        const post = new Post('/api/stripe/getStripeId');
        post.addData({ userData:globalUser.data });
        const resp = await post.send();
        const cus = (await resp?.json()) as { data:string } | undefined;
        if (!cus?.data) throw new Error("Usuário inválido");
        const customer = cus.data;
        const metadata = {
            uid:globalUser.data?.uid ?? '',
        }
        await requestSetupIntent({ customer, metadata });
    }


    const pdfListMemo = useMemo(() => {
        
        return filteredList?.map(item => (
        <PdfCard key={item.id} pdf={item} functions={functions} questionHooks={questionHooks} />
        ))
    }, [filteredList, questionHooks]);

    return (
        dimensions &&
        <>
            <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-start gap-4 py-7" >
                
                {(financialData?.paymentMethods ?? 0) === 0 && (
                    <div className="max-sm:w-[90%] w-[768px] flex flex-col gap-1 items-center justify-center bg-red-500 p-4 rounded shadow" >
                        <span className="text-white" >
                            Atenção! Você ainda não cadastrou nenhum cartão de crédito.
                        </span>
                        <span className="text-white" >
                            Após se esgotarem os recursos gratuitos, não será possível usar os serviços.
                        </span>
                        <Popover>
                            <PopoverTrigger>
                                <div onClick={async () => cardRegister()} className="bg-gray-100 p-2 px-4 rounded shadow text-base font-normal mt-4 flex flex-row gap-2 items-center justify-center" >
                                    <CiCreditCard1 size={25} />
                                    <span>
                                        Cadastrar agora.
                                    </span>
                                </div>                            
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] flex flex-col items-center justify-center" >
                                <ScrollComponent className="flex flex-col items-center justify-center w-full max-h-[500px] p-4" >
                                    {clientSecret && (
                                        <CardSetup {...{clientSecret, stripe:stripeJs }} />
                                    )}
                                </ScrollComponent>
                            </PopoverContent>
                        </Popover>

                    </div>
                )}
                <div ref={wrapperRef} className="bg-white rounded shadow max-sm:w-[90%] w-[768px] flex items-center justify-around py-4" >
                    {details && !showQuestions && !showQuiz && <DetaisMenu questionHooks={questionHooks} functions={functions} />}
                    {details && showQuestions && !showQuiz && <QuestionsMenu questionHooks={questionHooks} functions={functions} />}
                    {!details && !showQuestions && !showQuiz && <ListMenu getPdfRef={getPdfRef} questionHooks={questionHooks} functions={functions} />}
                    {showQuiz && details && !showQuestions && <QuizMenu functions={functions} questionHooks={questionHooks} />}
                </div>
                <div className={twMerge("bg-white rounded shadow max-sm:w-[90%] w-[768px] min-h-screen flex flex-row flex-wrap items-stretch justify-start gap-4 p-4", details && 'items-start justify-center')} >
                    {details && !showQuestions && !showQuiz && <DetailsSection questionHooks={questionHooks} functions={functions} />}                
                    {!details && !showQuestions && !showQuiz && pdfListMemo}
                    {showQuestions && details && !showQuiz && <QuestionSection questionHooks={questionHooks} functions={functions} />}
                    {showQuiz && details && !showQuestions && <QuizSection questionHooks={questionHooks} functions={functions} />}
                </div>
                
            </div>

            <div ref={pansRef} className="w-full p-8" >

                <PricingSection functions={functions} />

            </div>
        </>
    );

};