'use client'

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import DetailsCard from "../DetailsCard";

import questions from '@/src/images/askAnything.png';
import quiz from '@/src/images/quiz.png';
import FileForge from "@/src/modules/FileForge";
import { UseState } from "@/utils/common.types";
import { getBlob, ref } from "firebase/storage";
import { PdfFunctions } from "..";


interface DetailsSectionProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
        showQuestionList:UseState<boolean>,
        search:UseState<string>,
    },
    functions: PdfFunctions,
}

export default function DetailsSection({ questionHooks, functions }:DetailsSectionProps) {

    const globalState = useGlobalProvider();
    const resetedState = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { storage } = globalState.firebase ?? {};
    const dimensions = globalState.dimensions;
    const publicError = globalState.publicError;


    const [ questionList, setQuestionList ] = questionHooks?.questionList ?? [{}, {}];
    const [ showQuestion, setShowQuestion ] = questionHooks?.showQuestion ?? [{}, {}];
    const [askQuestion, setAskQuestion] = questionHooks?.askQuestion ?? [{}, {}];
    const [details, setDetails] = questionHooks?.details ?? [{}, {}];
    const [showQuestionList, setShowQuestionList] = questionHooks?.showQuestionList ?? [{}, {}];
    const [search, setSearch] = questionHooks?.search ?? [{}, {}];

    async function downloadPdf(url:string, path:string) {
       try {
        const storageRef = ref(storage!, path);
        const blob = await getBlob(storageRef);
        //  const data = await (await fetch(url)).blob();
         const fileForge = new FileForge({ blob });
         await fileForge.download();
       } catch (e:any) {
        alert(e.message)
        alert(url)
       }
    }

    function isPC() {
        return !navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i);
    }
    


    return (
        <>
            {dimensions && details && (
                <div className="w-[90%] flex flex-col items-center justify-start" >
                    <h2 className="text-3xl font-bold text-center" style={{color:colors.valero(.9)}} >
                        {details.customTitle ?? details.metadata.title}
                    </h2>
                    {/* <span>{JSON.stringify(details.metadata.genres)}</span> */}
                    <span className="text-wrap font-normal text-base mt-3" style={{color:colors.valero(.9)}} >
                        {decodeURIComponent(details.description).trim().split('.').filter(item => !!item).map(item => (
                            <>
                                <span>{item}.</span>
                                <br /><br />
                            </>
                        ))}
                    </span>

                    <div className="flex gap-4 my-3" >   
                        {isPC() && (
                            <button onClick={() => downloadPdf(details.pdfUrl, `services/readPdf/documents/${globalUser.data?.uid}/${details.id}`)} className="rounded shadow p-3 px-5 hover:bg-gray-100" >
                                Baixar PDF
                            </button>
                        )}                     
                        <button onClick={() => window.open(details.pdfUrl)} className="rounded shadow p-3 px-5 hover:bg-gray-100" >
                            Abrir PDF
                        </button>
                    </div>

                    <div className="flex flex-row gap-6 justify-center items-stretch" >
                        <DetailsCard
                        text='Obtenha respostas precisas para suas dúvidas, independentemente do conteúdo.'
                        image={questions.src}
                        buttonText="Perguntar"
                        buttonAction={() => functions.goToAskQuestion(details)}
                        /> 
                        <DetailsCard
                        text='Enriqueça sua experiência de aprendizado com a geração de um quiz personalizado sobre o conteúdo do seu documento.'
                        image={quiz.src}
                        buttonText="Iniciar"
                        buttonAction={() => functions.gotToQuiz(details)}
                        /> 
                    </div>
                </div>
            )}
        </>
    );

};