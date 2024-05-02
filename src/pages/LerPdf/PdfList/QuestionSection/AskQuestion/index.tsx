import { Textarea } from "@/components/ui/textarea";
import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import { useForm } from "react-hook-form";
import { IoSendSharp } from "react-icons/io5";

import { zodResolver } from '@hookform/resolvers/zod';
import { RxDotFilled } from "react-icons/rx";
import z from "zod";

interface AskQuestionProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
    }
}

const questionSchema = z.object({
    question:z.string().min(20, 'A pergunta deve ter no mínimo 20 caracteres. Digite uma pergunta mais bem elaborada.')
});
type Question = z.infer<typeof questionSchema>

export default function AskQuestion({ questionHooks }:AskQuestionProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


    const [ questionList, setQuestionList ] = questionHooks.questionList;
    const [ showQuestion, setShowQuestion ] = questionHooks.showQuestion;
    const [askQuestion, setAskQuestion] = questionHooks.askQuestion;
    const [details, setDetails] = questionHooks.details;

    const { register, handleSubmit, formState:{ errors } } = useForm<Question>({ resolver:zodResolver(questionSchema) });   

    async function sendQuestion({ question }:Question) {
        console.log(question)
        const apiPath = `/api/readPdf/send-question`;
        const post = new Post(apiPath);
        post.addData({ question, docId:details?.id??null, uid:globalUser.data?.uid });
        const resp = await post.send();
        const { error, data } = await resp?.json();
        if (error || !data) {
            alert(`Houve um erro: ${error ?? 'Os dados não vieram'}`);
            return;
        }
        console.log(`resposta: ${data}`);
        setShowQuestion(data as QuestionPdf);
    }

    return (
        <div className="w-full flex flex-col gap-3 items-center justify-center" >
            <div className="w-[80%] flex flex-col gap-3 items-center justify-center mt-4" >
                <h3 className="text-2xl text-wrap font-light" style={{color:colors.valero()}} >
                Perguntar sobre o {' '}
                    <span className="text-2xl font-bold" >{cutTextMask(details?.customTitle ?? details?.metadata.title ?? '', 28)}</span>
                </h3>

                <p className="flex flex-col items-start justify-center gap-3 text-base font-normal mt-5" color={colors.valero()} >
                    <span className="flex flow-row items-start justify-center gap-1" >
                        <RxDotFilled color={colors.valero()} size={35} />
                        Relembre uma informação importante, esquecida por causa da "correria do dia a dia".
                    </span>
                    <span className="flex flow-row items-start justify-center gap-1" >
                        <RxDotFilled color={colors.valero()} size={58} />
                        Evite procurar manualmente por informações em um documento extenso, essa é uma maneira rápida e eficaz de encontrar exatamente o que você precisa.
                    </span>
                    <span className="flex flow-row items-start justify-center gap-1" >
                        <RxDotFilled color={colors.valero()} size={58} />
                        Às vezes, uma análise mais detalhada ou uma explicação mais clara sobre um ponto específico do texto são importantes, aqui isto é acessível.
                    </span>
                    <span className="flex flow-row items-start justify-center gap-1" >
                        <RxDotFilled color={colors.valero()} size={70} />
                        Pode servir como uma ferramenta de aprendizado, faça perguntas sobre conceitos ou termos que você não entende totalmente, para obter uma explicação mais detalhada.
                    </span>                    
                </p>

                <form  onSubmit={handleSubmit(sendQuestion)} className="w-full" >
                    <Textarea {...register('question')} placeholder={`Faça uma pergunta...`} className="outline-none mt-4 text-lg font-medium h-[300px]" style={{outlineWidth:0, borderWidth:2, borderColor:colors.valero(), color:colors.valero()}}  />
                    {errors.question && (
                    <span className="text-red-500 text-base font-semibold" >
                        {errors.question.message}
                    </span>
                    )}
                    <button type="submit" className="flex gap-3 items-center justify-center text-xl w-full p-4" style={{color:colors.valero()}} >
                        Enviar
                        <IoSendSharp color={colors.valero()} size={22} />
                    </button>
                </form>
            </div>

        </div>
    );

};