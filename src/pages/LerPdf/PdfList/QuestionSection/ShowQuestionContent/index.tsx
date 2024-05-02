import { QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


export default function ShowQuestionContent({ question }:{ question:QuestionPdf }) {

    const [showChunk, setShowChunk] = useState(0);

    function changeChunk({ front, back }:{front?:boolean, back?:boolean}) {
        const max = question.response.chunksRelated.length - 1;        
        if (front && (showChunk < max)) {            
            setShowChunk(prev => prev + 1);
        }
        if (back && (showChunk > 0)) {            
            setShowChunk(prev => prev - 1);
        }
    }

    function showPageContent(index:number) {
        return question.response.chunksRelated[index].pageContent.split('.').filter(item => !!item).map(item => <span>{item}.<br /><br /></span>)
    };

    function getChunkPage(index:number) {
        return question.response.chunksRelated[index].metadata.page;
    };

    function getChunkLines(index:number) {
        return question.response.chunksRelated[index].metadata.lines?.split('-');
    };


    return (
        <div className="w-full flex flex-col items-center justify-center" >
            <h2 className="text-lg font-bold" style={{color:colors.valero()}} >
                {question.question}
            </h2>
            <p className="text-base font-normal mt-4" style={{color:colors.valero()}} >
                {decodeURIComponent(question.response.text).split('.').filter(item => !!item).map(item => <span>{item}.<br /><br /></span>)}
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
            <p className="text-base font-normal mt-4" style={{color:colors.valero()}} >
                {showPageContent(showChunk)}
            </p>
        </div>
    )
}