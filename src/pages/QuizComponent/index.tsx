'use client'

import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import QuizFinish from "./QuizFinish";
import QuizPresentation from "./QuizPresentation";
import QuizQuestion from "./QuizQuestion";


export default function QuizComponent({ quiz }:{ quiz:QuizPdf | null }) {
    const params = useParams() as {id:string};
    console.log(params);
    console.log(`quia title: ${quiz?.title}`);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const { height, width } = globalState.dimensions
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;
    

    const [tries, setTries] = useState<Record<string, QuizPdfTry>>({});  
    const [currQuestion, setCurrQuestion] = useState(0);
    const [init, setInit] = useState(false);
    const [finish, setFinish] = useState(false);

    const questions = useMemo(() => {
        
        const questionOrder = shuffleArray(Object.keys(quiz?.questions ?? {})) as string[];

        return questionOrder.map(item => {
            const question = quiz?.questions?.[item];
            return {
                ...(question as NonNullable<typeof question>), 
                options: shuffleArray(Object.values(question?.options ?? {})) as string[],
            };
        })
    }, []);


    function shuffleArray(array:any[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const initQuiz = useCallback(() => {
        setInit(true);
    }, [setInit])

    const finishQuiz = useCallback(() => {
        setFinish(true);
    }, [setFinish])

    const updateCurrQuestion = useCallback((questionIndex:number) => {
        setCurrQuestion(questionIndex);
    }, [setCurrQuestion]);

    const updateTries = useCallback((newTry:QuizPdfTry['questions'][''], questionId:string) => {
        setTries(prev => ({...prev, [questionId]:{...(prev[questionId] ?? {}), questions:{...(prev[questionId]?.questions ?? {}), [questionId]:newTry}}}));
    }, [setTries]);

    const updateTryTime = useCallback((time:number, questionId:string) => {
        setTries(prev => ({...prev, [questionId]:{...(prev[questionId] ?? {}), questions:{...prev[questionId]?.questions, [questionId]: {...(prev[questionId]?.questions[questionId] ?? {}), timeAnswering:time}}}}));
    }, [setTries]);

    const updateTryAnswer = useCallback((answer:string, questionId:string) => {
        setTries(prev => ({...prev, [questionId]:{...(prev[questionId] ?? {}), questions:{...prev[questionId]?.questions, [questionId]: {...(prev[questionId]?.questions[questionId] ?? {}), answer:answer}}}}));
    }, [setTries]);
    
      
    
    return (
        <div className="w-full" style={{height:height - 80}} >
            <img src={quiz?.imageBackground.wide.url} alt={quiz?.title} className="w-full object-fill absolute top-[-40px] z-[-1]" style={{height:height}} />
            <div className="min-w-full min-h-full flex flex-col items-center justify-center" style={{backgroundColor:'rgba(0,0,0,.3)'}} >
                <div className={twMerge("flex gap-2 flex-col items-center justify-center max-w-[768px] p-6 rounded shadow", init && 'min-w-[768px]')} style={{backgroundColor:init ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.8)'}} >
                    {!init && !finish && <QuizPresentation quiz={quiz} init={initQuiz} />}
                    {init && !finish && <QuizQuestion finishQuiz={finishQuiz} currQuestion={[currQuestion, updateCurrQuestion]} questions={questions} tries={tries} setTries={setTries} updateTries={updateTries} updateTryTime={updateTryTime} updateTryAnswer={updateTryAnswer} />}
                    {finish && <QuizFinish tries={tries} questions={questions} quiz={quiz} />}
                </div>
            </div>
        </div>
    );
};