import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { FaThList } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";

import { useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { RiQuestionnaireFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

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
    functions: {
        goToQuestions: (show: boolean) => void;
        goToPdfList: () => void;
        goToQuestionList: () => void;
        goToAskQuestion: () => void;
        choosePdf: (pdf: Pdf | null) => void;
    }
    
}

export default function QuestionsMenu({ questionHooks, functions }:QuestionsMenuProps) {

    const inputRef = useRef<HTMLInputElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


    const [ questionList, setQuestionList ] = questionHooks.questionList;
    const [ showQuestion, setShowQuestion ] = questionHooks.showQuestion;
    const [ showQuestions, setShowQuestions ] = questionHooks.showQuestions;
    const [askQuestion, setAskQuestion] = questionHooks.askQuestion;
    const [details, setDetails] = questionHooks.details;
    const [showQuestionList, setShowQuestionList] = questionHooks.showQuestionList;
    const [search, setSearch] = questionHooks.search;

    
    const goToAskQuestion = functions.goToAskQuestion;
    const goToQuestionList = functions.goToQuestionList;
    const goToPdfList = functions.goToPdfList;

    return (
        <>            
            {showQuestionList ? (
                <>
                    <div className="shadow p-3 text-white font-bold rounded flex items-center justify-center gap-0" >
                        <input ref={inputRef} placeholder="Encontre uma informação..." onChange={(e) => setSearch(e.target.value)} value={search} type="text" className={twMerge("outline-none border-none p-2 text-lg font-semibold")} style={{color:colors.valero(.8)}} />  
                        <FiSearch onClick={() => inputRef.current?.focus()} size={30} style={{color:colors.valero(.8), padding:3}} className="cursor-text" />
                    </div>
                    {/* <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >                
                        <button className="py-3 pl-3 pr-2 text-white font-bold rounded flex gap-2 items-center justify-center" >
                            <MdQuiz color={colors.valero(.8)} size={22} />
                            <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
                        </button>
                    </div> */}
                    <button onClick={() => goToPdfList()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >                
                        <FaFilePdf size={26} style={{color:colors.valero(.8)}} />
                        <span  className='' style={{color:colors.valero(.8)}} >Lista de PDFs</span>                                     
                    </button>
                    <button onClick={() => goToAskQuestion()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >
                        {/* <FaThList style={{color:colors.valero(.8)}} size={22} /> */}
                        <RiQuestionnaireFill style={{color:colors.valero(.8)}} size={22} />
                        <span  className='' style={{color:colors.valero(.8)}} >Perguntar</span>                                     
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => goToQuestionList()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >
                        <FaThList style={{color:colors.valero(.8)}} size={22} />
                        <span  className='' style={{color:colors.valero(.8)}} >Perguntas</span>                                     
                    </button>
                    <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >                
                        <button className="py-3 pl-3 pr-2 text-white font-bold rounded flex gap-2 items-center justify-center" >
                            <MdQuiz color={colors.valero(.8)} size={22} />
                            <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
                        </button>
                    </div>
                    <button onClick={() => goToPdfList()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >                
                        <FaFilePdf size={26} style={{color:colors.valero(.8)}} />
                        <span  className='' style={{color:colors.valero(.8)}} >Lista de PDFs</span>                                     
                    </button>
                </>
            )}   
        </>
    );

};