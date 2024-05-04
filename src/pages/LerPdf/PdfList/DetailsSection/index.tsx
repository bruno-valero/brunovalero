import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import DetailsCard from "../DetailsCard";

import questions from '@/src/images/askAnything.png';
import quiz from '@/src/images/quiz.png';
import { UseState } from "@/utils/common.types";


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
    functions: {
        goToQuestions: (show: boolean) => void;
        goToPdfList: () => void;
        goToQuestionList: () => void;
        goToAskQuestion: () => void;
        choosePdf: (pdf: Pdf | null) => void;
    },
}

export default function DetailsSection({ questionHooks, functions }:DetailsSectionProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


    const [ questionList, setQuestionList ] = questionHooks.questionList;
    const [ showQuestion, setShowQuestion ] = questionHooks.showQuestion;
    const [askQuestion, setAskQuestion] = questionHooks.askQuestion;
    const [details, setDetails] = questionHooks.details;
    const [showQuestionList, setShowQuestionList] = questionHooks.showQuestionList;
    const [search, setSearch] = questionHooks.search;


    return (
        <>
            {details && (
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

                    <div className="flex flex-row gap-6 justify-center items-stretch" >
                        <DetailsCard
                        text='Obtenha respostas precisas para suas dúvidas, independentemente do conteúdo.'
                        image={questions.src}
                        buttonText="Perguntar"
                        buttonAction={() => functions.goToAskQuestion()}
                        /> 
                        <DetailsCard
                        text='Enriqueça sua experiência de aprendizado com a geração de um quiz personalizado sobre o conteúdo do seu documento.'
                        image={quiz.src}
                        buttonText="Iniciar"
                        buttonAction={() => {}}
                        /> 
                    </div>
                </div>
            )}
        </>
    );

};