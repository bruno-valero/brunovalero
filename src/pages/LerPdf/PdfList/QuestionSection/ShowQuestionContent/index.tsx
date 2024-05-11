import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiOpenBook } from "react-icons/gi";


interface ShowQuestionContentProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
    }
}


export default function ShowQuestionContent({ questionHooks }:ShowQuestionContentProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [showChunk, setShowChunk] = useState(0);

    const [ questionList, setQuestionList ] = questionHooks?.questionList ?? [];
    const [ showQuestion, setShowQuestion ] = questionHooks?.showQuestion ?? [];
    const [askQuestion, setAskQuestion] = questionHooks?.askQuestion ?? [];
    const [details, setDetails] = questionHooks?.details ?? [];
    

    function changeChunk({ front, back }:{front?:boolean, back?:boolean}) {
        const max = (showQuestion?.response.chunksRelated.length ?? 0) - 1;        
        if (front && (showChunk < max)) {            
            setShowChunk(prev => prev + 1);
        }
        if (back && (showChunk > 0)) {            
            setShowChunk(prev => prev - 1);
        }
    }

    function showResponse() {
        return decodeURIComponent(showQuestion?.response.text ?? '').split(/\. /).filter(item => !!item).map(item => <span>{item}.<br /><br /></span>)
    };

    function showPageContent(index:number) {
        return showQuestion?.response.chunksRelated[index].pageContent.split(/\.\n| [a-z]\)/).filter(item => !!item).map(item => <span>{item}.<br /><br /></span>)
    };

    function getChunkPage(index:number) {
        return showQuestion?.response.chunksRelated[index].metadata.page;
    };

    function getChunkLines(index:number) {
        return showQuestion?.response.chunksRelated[index].metadata.lines?.split('-');
    };


    return (
        dimensions &&
        <div className="w-full flex flex-col items-center justify-center" >
            <h2 className="text-lg font-bold" style={{color:colors.valero()}} >
                {showQuestion?.question}
            </h2>
            <p className="text-base font-normal mt-4" style={{color:colors.valero()}} >
                {showResponse()}
            </p>
            <span className="text-2xl font-bold mt-6" style={{color:colors.valero()}} >
                Leia os trechos abaixo para uma maior compreenção
            </span>
            <div  className="flex gap-10 items-center justify-center mt-6" >
                <button onClick={() => changeChunk({ back:true })} className="flex gap-2 items-center justify-center hover:bg-gray-300 p-2 rounded shadow" >
                    <FaChevronLeft />{`Trecho Anterior`}
                </button>
                <button onClick={() => changeChunk({ front:true })} className="flex gap-2 items-center justify-center hover:bg-gray-300 p-2 rounded shadow" >
                    {`Trecho Seguinte`}<FaChevronRight />
                </button>
            </div>
            <span className="mt-5 font-bold text-lg" style={{color:colors.valero()}} >
                Techo retirado da página {getChunkPage(showChunk)}, da linha {getChunkLines(showChunk)?.[0]} à {getChunkLines(showChunk)?.[1]}
            </span>
            <span className="mt-3" >(Trecho {showChunk + 1}/{showQuestion?.response.chunksRelated.length})</span>
            <button onClick={() => window.open(details?.pdfUrl)} className="flex gap-2 items-center justify-center shadow rounded hover:bg-gray-300 p-2 my-3 font-semibold" >
                <GiOpenBook color={colors.valero()} size={30} className="hover:text-white"  />
                Abrir Pdf
            </button>
            <p className="text-base font-normal mt-2" style={{color:colors.valero()}} >
                {showPageContent(showChunk)}
            </p>
        </div>
    )
}