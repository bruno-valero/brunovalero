import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import DetailsCard from "../DetailsCard";

import questions from '@/src/images/askAnything.png';
import quiz from '@/src/images/quiz.png';


export default function DetailsSection({ details, goToQuestions }:{ details:Pdf | null, goToQuestions:(show:boolean) => void }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


    


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
                        buttonAction={() => goToQuestions(true)}
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