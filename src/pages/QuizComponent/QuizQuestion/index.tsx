import { Separator } from "@/components/ui/separator";
import { QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { SetState } from "@/utils/common.types";
import { useEffect, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { GiFinishLine } from "react-icons/gi";
import { twMerge } from "tailwind-merge";

interface QuizQuestionProps { 
    finishQuiz: () => void,
    currQuestion:[number, (questionIndex: number) => void], 
    tries:Record<string, QuizPdfTry>,
    setTries: SetState<Record<string, QuizPdfTry>>,
    updateTries:(newTry:QuizPdfTry['questions'][''], questionId:string) => void,
    updateTryTime: (time: number, questionId: string) => void,
    updateTryAnswer: (answer: string, questionId: string) => void,
    questions:{
        options: string[];
        id: string;
        question: string;
        answer: string;
    }[]
};

export default function QuizQuestion({ finishQuiz, currQuestion, tries, setTries, updateTries, updateTryTime, updateTryAnswer, questions }: QuizQuestionProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const { height, width } = globalState.dimensions ?? {}
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [index, setIndex] = currQuestion ?? [];
    const [update, setUpdate] = useState(0)

    useEffect(() => {
        updateTries({
            answer:'',
            id:questions[index].id,
            rightOption:questions[index].answer,
            timeAnswering:0,
        }, questions[index].id)
    }, [])

    useEffect(() => {
        const time = setInterval(() => {
            const questionId = questions[index].id;
            setTries(prev => ({...prev, [questionId]:{...(prev[questionId] ?? {}), questions:{...prev[questionId]?.questions, [questionId]: {...(prev[questionId]?.questions[questionId] ?? {}), timeAnswering:(prev?.[questionId]?.questions?.[questionId]?.timeAnswering) + 100}}}}));
            // updateTryTime((tries[questions[index].id]?.questions?.[questions[index].id]?.timeAnswering) + 100, questions[index].id)
            // setUpdate(new Date().getTime());
        }, 100);

        return () => clearInterval(time);
    }, [index])

    function selectQuestion(answer: string) {
        updateTryAnswer(answer, questions[index ?? 0].id);
        // alert(`answer: ${answer}`)
    }

    function millisecondsToTime(ms:number) {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        let milliseconds = Math.floor((ms % 1000));
      
        // Adiciona um zero à esquerda se o valor for menor que 10
        const s = (seconds < 10) ? `0${seconds}` : seconds;
        const m = (minutes < 10) ? `0${minutes}` : minutes;
        const h = (hours < 10) ? `0${hours}` : hours;
        const mss = (milliseconds < 10) ? `00${milliseconds}` : (milliseconds < 100) ? `0${milliseconds}` : milliseconds;
        
        return hours ? `${h}:${m}:${s}:${mss}` : `${m}:${s}:${mss}`;
      }

      const answer = tries?.[questions?.[index ?? 0].id]?.questions?.[questions?.[index ?? 0].id]?.answer

    return (
        dimensions &&
        <div className="w-full h-full flex flex-col items-start justify-center" >
            <div className="w-full flex items-end justify-between mb-4" >
                <span className="w-[90%] flex items-center justify-center" >
                    {(index + 1)} / {(questions.length)}
                </span>
                <span className="text-sm font-normal text-start" >
                    {millisecondsToTime(tries[questions[index].id]?.questions?.[questions[index].id]?.timeAnswering ?? 0)}
                </span>
            </div>
            <h2 className="text-lg font-semibold" style={{color:colors.valero()}} >
                {index + 1}) {questions[index].question}
            </h2>
            <Separator className="my-2 mt-3" style={{color:colors.valero(), backgroundColor:colors.valero()}} />
            <ul className="w-full flex flex-col gap-3 mt-4" >
                {questions[index].options.map(option => (
                    <li className="w-full" >
                        <button onClick={() => selectQuestion(option)} className="w-full p-4 rounded text-start border text-lg font-bold" style={{color:answer === option ? 'white' : colors.valero(.8), borderColor:colors.valero(.5), backgroundColor:answer === option ? colors.valero() : 'white'}} >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="w-full flex items-center justify-around mt-4" >
     
                <button onClick={() => setIndex(index - 1)} disabled={index === 0} className={twMerge("flex gap-2 items-center justify-center p-2 px-4 text-white rounded shadow", index === 0 && 'cursor-not-allowed')} style={{backgroundColor:colors.valero(index > 0 ? 1 : .7)}} >
                    <BsArrowLeft size={25} color="white" />
                    <span>Voltar</span>
                </button>

                <button onClick={() => index === (questions.length - 1) ? finishQuiz() : setIndex(index + 1)} className={twMerge("flex gap-2 items-center justify-center p-2 px-4 text-white rounded shadow")} style={{backgroundColor:colors.valero()}} >
                    {index === (questions.length - 1) && <GiFinishLine size={25} color="white" />}
                    <span>{index === (questions.length - 1) ? 'Terminar' : 'Avançar'}</span>
                    {!(index === (questions.length - 1)) && <BsArrowRight size={25} color="white" />}                    
                </button>
            </div>
        </div>
    );

};