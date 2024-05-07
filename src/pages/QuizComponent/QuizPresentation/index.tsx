import { QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { BsArrowRight } from "react-icons/bs";



export default function QuizPresentation({ quiz, init }: { quiz:QuizPdf | null, init:() => any }) {
    
    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const { height, width } = globalState.dimensions ?? {}
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];

    return (
        width &&
        <>
            <span className=" text-7xl font-black" style={{color:colors.valero()}} >
                Quiz
            </span>
            <h1 className="text-2xl font-normal" style={{color:colors.valero()}} >
                {quiz?.title.split(' ').map(item => `${item[0].toUpperCase()}${item.slice(1)}`).join(' ')}
            </h1>
            {/* <p className="text-base font-light ">
                {quiz?.description.split(':')[1]}
            </p> */}
            <button onClick={() => init()} className="rounded shadow p-3 px-5 flex gap-3 items-center justify-center text-white font-light mt-4 mb-2" style={{backgroundColor:colors.valero()}} >
                <span>Iniciar quiz</span>
                <BsArrowRight size={25} color="white" />
            </button>
        </>
    );

};