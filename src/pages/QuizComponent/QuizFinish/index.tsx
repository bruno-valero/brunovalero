import { Separator } from "@/components/ui/separator";
import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface QuizQuestionProps {
    quiz: QuizPdf | null,
    tries:Record<string, QuizPdfTry>,
    questions:{
        options: string[];
        id: string;
        question: string;
        answer: string;
    }[]
};

export default function QuizFinish({ quiz, tries, questions }: QuizQuestionProps) {    
    const router = useRouter();

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const dimensions = globalState.dimensions
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { envs } = globalState.fromServer ?? {};

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
        };
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
        
        const questions = Object.keys(tries).reduce((acc:Questions, key) => {
            const item = tries[key]
            item.id = key;
            
            const question = item.questions[item.id]
            question.rightOption = quiz.questions[item.id].answer;
            question.id = item.id;
            acc[item.id] = question;
            return acc;
        }, {} as Questions);
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

        

        return {data:thisTry, rightQuestionsAmount:rightQuestions.length};

    }, [tries, quiz]);

    async function sendTry(newTry?:QuizPdfTry['questions']) {
        if (!newTry) return null;
        if (!quiz || !globalUser.data) return;
        type Data = { docId:string, uid:string, quizTryQuestions:QuizPdfTry['questions'], quiz:QuizPdf }
        const data:Data =  { docId:quiz.docId, uid:globalUser.data.uid, quizTryQuestions:newTry, quiz };

        const cloudFunction = 'https://southamerica-east1-brunovalero-49561.cloudfunctions.net/readPdfAddQuizTry';
        const apiPath = `/api/readPdf/add-quiz-try`;
        const url = envs.useCloudFunctions ? cloudFunction : apiPath;
        const path = url;
        const post = new Post(path);
        post.addData(data);
        const resp = await post.send();
        const json = (await resp?.json() as {data: QuizPdfTry});
        console.log(`json: ${JSON.stringify(json, null, 2)}`);
        router.push(`/ler-pdf/quiz/${quiz.docId}-${quiz.id}/${json.data.id}`);
    };

    return (
        dimensions &&
        <div className="w-full h-full flex flex-col items-start justify-center" >            
            <h2 className="text-lg font-semibold" style={{color:colors.valero()}} >
                {quiz?.title}
            </h2>
            <Separator className="my-2 mt-3" style={{color:colors.valero(), backgroundColor:colors.valero()}} />
            
            <div className="w-full flex gap-8 mt-4" >
                <div className="flex flex-col gap-3 mt-4" >
                    <span className="text-lg font-semibold" style={{color:colors.valero()}} >
                        Tempo: {millisecondsToTime(Object.values(newTry?.data.questions ?? {}).reduce((acc, item) => item.timeAnswering + acc, 0), true)}
                    </span>
                    <span className="text-lg font-bold" style={{color:colors.valero()}} >
                        Score: {newTry?.data.score}%
                    </span>
                    <span>
                        Total de Perguntas: {questions.length}
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
                    Envie seu resultado para receber um feedback mais profundo e registrar sua tentativa, podendo revê-la posteriormente.
                </span>
            </div>

            <div className="w-full flex items-center justify-center mt-4" >     
                <button onClick={() => sendTry(newTry?.data.questions)} className={twMerge("flex gap-2 items-center justify-center p-2 px-6 text-white rounded shadow")} style={{backgroundColor:colors.valero()}} >
                    {/* <BsArrowLeft size={25} color="white" /> */}
                    <span>Enviar</span>
                </button>                
            </div>
        </div>
    );

};