import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { FaThList } from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";


export default function DetaisMenu({choosePdf, goToQuestions}:{choosePdf:(pdf:Pdf | null) => void, goToQuestions:() => void}) {


    return (
        <>
            <button className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2"  >                            
                <MdQuiz color={colors.valero(.8)} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >Quiz</span>
            </button>

            <button onClick={() => goToQuestions()} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2"  >                                                        
                <FaClipboardQuestion color={colors.valero(.8)} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >Perguntas</span>
            </button> 

            <button onClick={() => choosePdf(null)} className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center gap-2"  >                                                                                                                
                <FaThList style={{color:colors.valero(.8)}} size={22} />
                <span  className='' style={{color:colors.valero(.8)}} >Lista de PDFs</span>
            </button>                         

        </>
    );

};