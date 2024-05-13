import SetLoadingFalse from "@/src/components/structural/SetLoadingFalse";
import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import QuizTryComponent from "@/src/pages/QuizTryComponent";
import { Obj } from "@/utils/common.types";
import { Metadata } from "next";
import { cache } from "react";


interface QuizTryProps {
    params: Obj<string, string>,
    searchParams: Obj<string, string>,
  };

const getQuizTry = cache(async (id:string, quizTry:string) => {
  const docId = id.split('-')[0];
  
  const quizId = id.split('-')[1];
  
  const productSnap = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quizId).collection('tries').doc(quizTry).get();
  const catProds = !productSnap.exists ? null : productSnap.data() as QuizPdfTry | null;    
  return catProds;
})

const getQuiz = cache(async (id:string) => {
  const docId = id.split('-')[0];
  const quizId = id.split('-')[1];
  
  const productSnap = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quizId).get();
  const catProds = !productSnap.exists ? null : productSnap.data() as QuizPdf | null;    
  return catProds;
})
  
  export async function generateMetadata({ params }:QuizTryProps):Promise<Metadata> {
    const id = params.id;        
    const quiz = await getQuiz(id);
  
    if (!quiz) return {
      title:'Não Encontrado',
    }
  
    return {
      title:quiz.title,
      description:quiz.description.split(':')[1],
      openGraph:{
        images:[
          {
            url:quiz.imageBackground.wide.url,
            alt:quiz.title,
            height:1024,
            width:1792,          
          }
        ],
      },
    };
  };


export default async function QuizTry({ params }:QuizTryProps) {
    const id = params.id;
    const tryId = params.try;
    const quiz = await getQuiz(id);
    const quizTry = await getQuizTry(id, tryId);

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center relative" >
          <SetLoadingFalse />
          <QuizTryComponent quiz={quiz} quizTry={quizTry} />
          <div className="min-h-20 h-20" ></div>
        </div>
    );
};