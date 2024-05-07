import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { FaThList } from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { PdfFunctions, PdfHooks } from "../index";


export default function QuizMenu({questionHooks, functions}:{questionHooks: PdfHooks, functions:PdfFunctions}) {  

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { width } = globalState.dimensions ?? {};

    return (
        width &&
        <>
            <button onClick={() => functions.gotToQuiz()} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')}  >                            
                <MdQuiz color={colors.valero(.8)} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
            </button>

            <button onClick={() => functions.goToQuestions(true)} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')}  >                                                        
                <FaClipboardQuestion color={colors.valero(.8)} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >Perguntas</span>
            </button> 

            <button onClick={() => functions.goToPdfList()} className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2", width < 500 && 'p-2 text-sm')}  >                                                                                                                
                <FaThList style={{color:colors.valero(.8)}} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >PDFs</span>
            </button>                         

        </>
    );

};