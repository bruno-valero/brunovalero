import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { FaThList } from "react-icons/fa";
import { FaCircleQuestion } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";

import { useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { RiQuestionnaireFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { PdfFunctions } from "..";

interface QuestionsMenuProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
        showQuestionList:UseState<boolean>,
        search:UseState<string>,
    },
    functions: PdfFunctions
    
}

export default function QuestionsMenu({ questionHooks, functions }:QuestionsMenuProps) {

    const inputRef = useRef<HTMLInputElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { width } = globalState.dimensions ?? {};


    const [ questionList, setQuestionList ] = questionHooks?.questionList ?? [];
    const [ showQuestion, setShowQuestion ] = questionHooks?.showQuestion ?? [];
    const [ showQuestions, setShowQuestions ] = questionHooks?.showQuestions ?? [];
    const [askQuestion, setAskQuestion] = questionHooks?.askQuestion ?? [];
    const [details, setDetails] = questionHooks?.details ?? [];
    const [showQuestionList, setShowQuestionList] = questionHooks?.showQuestionList ?? [];
    const [search, setSearch] = questionHooks?.search ?? [];

    
    const goToAskQuestion = functions?.goToAskQuestion;
    const goToQuestionList = functions?.goToQuestionList;
    const goToPdfList = functions?.goToPdfList;

    return (
        width &&
        <>            
            {showQuestionList ? (
                <>
                    <div className={twMerge("shadow p-3 text-white font-bold rounded flex items-center justify-center gap-0", width < 500 && 'max-w-[100px] p-1')} >
                        <input ref={inputRef} placeholder={width < 500 ? 'Pesquise' :"Encontre uma informação..."} onChange={(e) => setSearch(e.target.value)} value={search} type="text" className={twMerge("outline-none border-none p-2 text-lg font-semibold", width < 500 && 'max-w-[100px] text-sm')} style={{color:colors.valero(.8)}} />  
                        <FiSearch onClick={() => inputRef.current?.focus()} size={30} style={{color:colors.valero(.8), padding:3}} className="cursor-text" />
                    </div>
                    {/* <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >                
                        <button className="py-3 pl-3 pr-2 text-white font-bold rounded flex gap-2 items-center justify-center" >
                            <MdQuiz color={colors.valero(.8)} size={22} />
                            <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
                        </button>
                    </div> */}
                    <button onClick={() => goToPdfList(details)} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')} >                
                        <FaThList style={{color:colors.valero(.8)}} size={width < 500 ? 15 : 25} />
                        <span  className='' style={{color:colors.valero(.8)}} >PDFs</span>                                     
                    </button>
                    <button onClick={() => goToAskQuestion(details)} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')} >
                        {/* <FaThList style={{color:colors.valero(.8)}} size={22} /> */}
                        <RiQuestionnaireFill style={{color:colors.valero(.8)}} size={width < 500 ? 18 : 25} />
                        <span  className='' style={{color:colors.valero(.8)}} >Perguntar</span>                                     
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => goToQuestionList(details)} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')} >
                        <FaCircleQuestion style={{color:colors.valero(.8)}} size={22} />
                        {/* <FaThList style={{color:colors.valero(.8)}} size={22} /> */}
                        <span  className='' style={{color:colors.valero(.8)}} >Perguntas</span>                                     
                    </button>
                    <div className={twMerge("bg-gray-100 rounded shadow gap-2 flex items-center justify-center", width < 500 && '')}  >                
                        <button onClick={() => functions.gotToQuiz(details)} className={twMerge("p-3 pr-2 text-white font-bold rounded flex gap-2 items-center justify-center", width < 500 && 'p-2 text-sm')} >
                            <MdQuiz color={colors.valero(.8)} size={22} />
                            <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
                        </button>
                    </div>
                    <button onClick={() => goToPdfList(details)} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')} >                
                        <FaThList style={{color:colors.valero(.8)}} size={22} />
                        <span  className='' style={{color:colors.valero(.8)}} >PDFs</span>                                     
                    </button>
                </>
            )}   
        </>
    );

};