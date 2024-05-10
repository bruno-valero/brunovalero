import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollComponent } from "@/src/components/structural/ScrollComponent";
import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useMemo } from "react";
import { FaShareAlt } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface QuizQuestionProps {
    quiz: QuizPdf | null,
    quizTry:QuizPdfTry | null;
};

export default function QuizFinish({ quiz, quizTry }: QuizQuestionProps) {    

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const { width, height } = globalState.dimensions ?? {};
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];

    function millisecondsToTime(ms:number, notMillis?:boolean) {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        let milliseconds = Math.floor((ms % 1000));
      
        // Adiciona um zero à esquerda se o valor for menor que 10
        const s = (seconds < 10) ? `0${seconds}` : seconds;
        const m = (minutes < 10) ? `0${minutes}` : minutes;
        const h = (hours < 10) ? `0${hours}` : hours;
        const mss = (milliseconds < 10) ? `00${milliseconds}` : (milliseconds < 100) ? `0${milliseconds}` : milliseconds;
        
        if (notMillis) {
            return hours ? `${h}:${m}:${s}:${mss}` : `${m}:${s}`;
        }
        return hours ? `${h}:${m}:${s}:${mss}` : `${m}:${s}:${mss}`;
    };

    const newTry = useMemo(() => {
        if (!quiz) return null;
        type Questions = Record<string, {
            id: string;
            timeAnswering: number;
            rightOption: string;
            answer: string;
        }>
        
        const questions = (quizTry?.questions ?? {})
        // console.log(`tries: ${tries}`, tries)
        // console.log(`questions: ${questions}`, questions)
        // return questions;
        const report = Object.values(questions).map(item => {
            const regex = new RegExp(item.answer, 'ig')
            return regex.test(item.rightOption)
        })

        const rightQuestions = report.filter(item => !!item);
        const score = Number(((rightQuestions.length / report.length) * 100).toFixed(2));

        const thisTry:QuizPdfTry = {
            id:String(new Date().getTime()),
            performanceObservation:'',
            tip:'',
            quizId:quiz.id,
            score,
            userId:globalUser.data?.id ?? '',
            questions,
        };

        

        return {data:thisTry, rightQuestionsAmount:rightQuestions.length, questionsAmount:report.length};

    }, [quiz, quizTry]);    

    function sendWhatsapp() {
        const url = window.location.href;
        const text = `
        Acabei de fazer um quiz gerado dinamicamente à partir do conteúdo de um pdf.

        Essa foi minha performance:

        ${url}
        `.replaceAll(/  /g, '');

        const data = encodeURIComponent(text);
        const link = `https://wa.me/?text=${data}`
        window.open(link)
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(window.location.href)
    }

    return (
        width &&
        <div className="w-full h-full flex flex-col items-start justify-center" >
            
            <div className="w-full flex items-center justify-between pr-5">
                <h2 className="text-lg font-semibold" style={{color:colors.valero()}} >
                    {quiz?.title}
                </h2>
                <Popover>
                    <PopoverTrigger className={twMerge("flex gap-2 items-center justify-center p-3 text-white rounded-full shadow hover:bg-gray-100")} >
                        <FaShareAlt color={colors.valero(.9)} size={22} />
                    </PopoverTrigger>
                    <PopoverContent className="flex gap-2 flex-col items-start justify-start" style={{color:colors.valero()}} >
                        <span className="text-lg font-semibold" >
                            Compartilhar
                        </span>   
                        <Separator className="" style={{color:colors.valero(), backgroundColor:colors.valero()}} /> 
                        
                        <button onClick={() => sendWhatsapp()} className="mt-2" >
                            <span>
                                Whatsapp
                            </span>                 
                        </button> 
                        <button onClick={() => copyToClipboard()} className="" >
                            <span>
                                Copiar link
                            </span>                 
                        </button> 
                    </PopoverContent>
                </Popover>                  
            </div>
            <Separator className="my-2 mt-3" style={{color:colors.valero(), backgroundColor:colors.valero()}} />
            
            <div className={twMerge("w-full flex gap-8 mt-4", width < 500 && 'flex-col items-center justify-center')} >
                <div className="flex flex-col gap-1 mt-3" >
                    <span className="text-lg font-semibold" style={{color:colors.valero()}} >
                        Tempo: {millisecondsToTime(Object.values(newTry?.data.questions ?? {}).reduce((acc, item) => item.timeAnswering + acc, 0), true)}
                    </span>
                    <span className="text-lg font-bold" style={{color:colors.valero()}} >
                        Score: {newTry?.data.score}%
                    </span>
                    <span>
                        Total de Perguntas: {newTry?.questionsAmount}
                    </span>
                    <span>
                        Total de Acertos: {newTry?.rightQuestionsAmount}
                    </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 items-center justify-center px-3" >
                    <span className="text-lg font-semibold" >
                        Parabéns!
                    </span>
                    <span className="text-base font-normal" >
                        Você possui um bom conhecimento relacionado ao tema "{quiz?.title}".
                    </span>
                    <span className="text-base font-normal" >
                        Seria interessante fazer algumas perguntas sobre o assunto, pois ainda ficaram algumas lacunas.
                    </span>
                </div>
            </div>

            <Separator className="my-2 mt-6" style={{color:colors.valero(), backgroundColor:colors.valero(.5)}} />

            <div className="mt-3 w-[80%] flex self-center" >
                <span className="text-base font-semibold" >
                    Veja um feedback mais profundo sobre sua tentativa.
                </span>
            </div>


            <div className="w-full flex gap-6 items-center justify-center mt-4" >     
                <Popover>
                    <PopoverTrigger className={twMerge("flex gap-2 items-center justify-center p-2 px-6 text-white rounded shadow")} style={{backgroundColor:colors.valero()}} >
                        Ver Relatório
                    </PopoverTrigger>
                    <PopoverContent className="w-auto h-auto p-[4px]" >
                        <ScrollComponent className={twMerge("w-[600px] h-[400px] border-none outline-none px-3", width < 500 && 'w-[300px] h-[350px]')} >
                            {quizTry?.performanceObservation.split('\n').map(item => (
                                <>
                                    <span>
                                        {item}
                                    </span><br />
                                </>
                            ))}                        
                        </ScrollComponent>
                    </PopoverContent>
                </Popover>  

                <Popover>
                    <PopoverTrigger className={twMerge("flex gap-2 items-center justify-center p-2 px-6 text-white rounded shadow")} style={{backgroundColor:colors.valero()}} >
                        Ver Feedback
                    </PopoverTrigger>
                    <PopoverContent className="w-auto h-auto p-[4px]" >
                        <ScrollComponent className={twMerge("w-[600px] h-[400px] border-none outline-none px-3" , width < 500 && 'w-[300px] h-[350px]')} >
                            {quizTry?.tip.split('\n').map(item => (
                                <>
                                    <span>
                                        {item}
                                    </span><br />
                                </>
                            ))}
                        </ScrollComponent>
                    </PopoverContent>
                </Popover>                                
            </div>
        </div>
    );

};