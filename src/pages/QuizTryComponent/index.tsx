'use client'

import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useParams } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import QuizFinish from "./QuizFinish";


export default function QuizTryComponent({ quiz, quizTry }:{ quiz:QuizPdf | null, quizTry:QuizPdfTry | null }) {
    const params = useParams() as {id:string};
    console.log(params);
    console.log(`quia title: ${quiz?.title}`);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const { width, height } = globalState.dimensions ?? {}
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    

    const [tries, setTries] = useState<Record<string, QuizPdfTry>>({});  
    const [currQuestion, setCurrQuestion] = useState(0);
    const [init, setInit] = useState(false);
    const [finish, setFinish] = useState(false);


    function shuffleArray(array:any[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    
      
    
    return (
        width &&
        <div className="w-full" style={{height:height - 80}} >
            <img src={width < 500 ? quiz?.imageBackground.slim.url : quiz?.imageBackground.wide.url} alt={quiz?.title} className="w-full object-fill absolute top-[-40px] z-[-1]" style={{height:height}} />
            <div className="min-w-full min-h-full flex flex-col items-center justify-center" style={{backgroundColor:'rgba(0,0,0,.3)'}} >
                <div className={twMerge("flex gap-2 flex-col items-center justify-center max-w-[768px] p-6 rounded shadow", width < 500 && 'min-w-[80%] max-h-[500px] items-start justify-start overflow-y-auto', width < 500 && 'max-w-[80%]')} style={{backgroundColor:init ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.8)'}} >                    
                    <QuizFinish  quizTry={quizTry} quiz={quiz} />
                </div>
            </div>
        </div>
    );
};