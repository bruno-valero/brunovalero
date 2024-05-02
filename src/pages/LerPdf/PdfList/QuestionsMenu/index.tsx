import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { FaThList } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";

import { RiQuestionnaireFill } from "react-icons/ri";

interface QuestionsMenuProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
        showQuestionList:UseState<boolean>,

    }
}

export default function QuestionsMenu({ questionHooks }:QuestionsMenuProps) {

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

    function goToAskQuestion() {
        setShowQuestion(null);
        setAskQuestion(true);
        setShowQuestionList(false);
    }

    function goToQuestionList() {
        setShowQuestion(null);
        setAskQuestion(false);
        setShowQuestionList(true);
    }


    return (
        <>            
            {showQuestionList ? (
                <>
                    <button onClick={() => goToAskQuestion()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >
                        {/* <FaThList style={{color:colors.valero(.8)}} size={22} /> */}
                        <RiQuestionnaireFill style={{color:colors.valero(.8)}} size={22} />
                        <span  className='' style={{color:colors.valero(.8)}} >Perguntar</span>                                     
                    </button>
                    <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >                
                        <button className="py-3 pl-3 pr-2 text-white font-bold rounded flex gap-2 items-center justify-center" >
                            <MdQuiz color={colors.valero(.8)} size={22} />
                            <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
                        </button>
                    </div>
                    <button onClick={() => {}} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >                
                        <FaFilePdf size={26} style={{color:colors.valero(.8)}} />
                        <span  className='' style={{color:colors.valero(.8)}} >Lista de PDFs</span>                                     
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
                    <button onClick={() => {}} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2" >                
                        <FaFilePdf size={26} style={{color:colors.valero(.8)}} />
                        <span  className='' style={{color:colors.valero(.8)}} >Lista de PDFs</span>                                     
                    </button>
                </>
            )}   
        </>
    );

};