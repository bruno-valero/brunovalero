import SetLoadingFalse from "@/src/components/structural/SetLoadingFalse";
import { QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import QuizComponent from "@/src/pages/QuizComponent";
import { Obj } from "@/utils/common.types";
import { Metadata } from "next";
import { cache } from "react";


interface QuizProps {
    params: Obj<string, string>,
    searchParams: Obj<string, string>,
  };

const getQuiz = cache(async (id:string) => {
    const docId = id.split('-')[0];
    const quizId = id.split('-')[1];
    
    const productSnap = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quizId).get();
    const catProds = !productSnap.exists ? null : productSnap.data() as QuizPdf | null;    
    return catProds;
  })
  
  export async function generateMetadata({ params }:QuizProps):Promise<Metadata> {
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


export default async function Quiz({ params }:QuizProps) {
    const id = params.id;
    const quiz = await getQuiz(id);

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center relative" >
            <SetLoadingFalse />
            <QuizComponent quiz={quiz} />
            <div className="min-h-20 h-20" ></div>
        </div>
    );
};