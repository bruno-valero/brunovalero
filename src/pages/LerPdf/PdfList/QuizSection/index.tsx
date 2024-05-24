import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import { IoMdAdd } from "react-icons/io";
import { PdfFunctions, PdfHooks } from "..";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import Post from "@/src/modules/Request/Post";
import { zodResolver } from "@hookform/resolvers/zod";
import { where } from "firebase/firestore";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
  

const formSchema = z.object({
    quizFocus:z.string().min(10, 'A descrição do foco do Quiz deve ter no mínimo 10 caracteres')
});

type From = z.infer<typeof formSchema>

export default function QuizSection({ functions, questionHooks }:{ functions:PdfFunctions, questionHooks:PdfHooks }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;
    const { envs } = globalState.fromServer ?? {};

    const [tries, setTries] = useState<Record<string, QuizPdfTry[]>>({});
    const [loadQuizCreation, setLoadQuizCreation] = useState(false);

    const { register, formState:{errors}, handleSubmit } = useForm<From>({ resolver:zodResolver(formSchema) });


    const [ questionList, setQuestionList ] = questionHooks?.questionList ?? [];
    const [ showQuestion, setShowQuestion ] = questionHooks?.showQuestion ?? [];
    const [ showQuestions, setShowQuestions ] = questionHooks?.showQuestions ?? [];
    const [askQuestion, setAskQuestion] = questionHooks?.askQuestion ?? [];
    const [details, setDetails] = questionHooks?.details ?? [];
    const [showQuestionList, setShowQuestionList] = questionHooks?.showQuestionList ?? [];
    const [search, setSearch] = questionHooks?.search ?? [];
    const [quizList, setQuizList] = questionHooks?.quizList ?? [];
    const privilegesData = questionHooks?.privilegesData ?? [];


    const phrases = [
        'Aumente seu conhecimento ao consolidar o que aprendeu ao ler o livro, reforçando conceitos e informações importantes.',
        'A possibilidade de interagir com o conteúdo por meio de quizzes tornará sua experiência de leitura mais envolvente e motivadora, incentivando-o a continuar aprendendo.',
        'Avalie seu entendimento, identificando áreas em que pode precisar revisar ou se aprofundar.',
        'Personalize sua experiência  de acordo com seus interesses e necessidades individuais ao gerar quizzes voltados para um tema escolhido por você, permitindo que você se concentre em áreas específicas do conteúdo que deseja reforçar.',
        'Desafie sua mente ao resolver quizzes desafiadores, promovendo o pensamento crítico e proporcionando uma experiência de aprendizado mais enriquecedora.',
        'Economize tempo ao gerar quizzes a partir do conteúdo do documento, você economizará tempo e esforço na criação de materiais de estudo complementares, para você ou seus alunos e companheiros.',
        'Revise de forma eficiente com essa ferramenta eficaz para revisão, permitindo que você repasse o conteúdo do livro de forma rápida e eficiente.',
        'Resolver quizzes sobre o conteúdo do livro ajudará você a aplicar o conhecimento adquirido em situações práticas, fortalecendo sua compreensão e retenção.',
    ];

    const indexes:number[] = [];

    async function createQuiz(data:From) {
        const log = functions.isLogged();
        if (!log) return;
        const privilege = globalUser?.data?.uid === details?.userId ? `quizGenerationPrivateDocs` : `quizGenerationPublicDocs`
        const hasInsufficientCredits = functions.hasInsufficientCredits({ privilege });
        if (hasInsufficientCredits) return;
        // if (0 < 1) return;
        setLoadQuizCreation(true);
        console.log(data);

        const cloudFunction = 'https://southamerica-east1-brunovalero-49561.cloudfunctions.net/readPdfAddQuiz';
        const apiPath = `/api/readPdf/add-quiz`;
        const url = envs.useCloudFunctions ? cloudFunction : apiPath;
        const path = url;
        const post = new Post(path);
        post.addData({ docId:details?.id, uid:globalUser.data?.uid, autoBuy:false, quizFocus:data.quizFocus });
        const resp = await post.send();
        const quiz = await resp?.json();
        alert(JSON.stringify(quiz, null, 2))
        console.log(`Quiz: ${quiz}`);
        setLoadQuizCreation(false);
    };

    async function getTries( docId:string, quizId:string ) {
        const resp = await fromCollection('services', db!).getDocById('readPdf').getCollection('data').getDocById(docId).getCollection('quiz').getDocById(quizId).getCollection('tries').docs([where('userId', '==', globalUser.data?.uid)])
        const data = resp.map(item => item.data) as QuizPdfTry[];
        setTries(prev => ({...prev, [quizId]:data}));
        return data;
    }

    function openUrl(url:string) {
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('target', '_black');
        a.click();
    }

    return (
        dimensions &&
        <div className="flex flex-col gap-3 items-center justify-center w-full p-4" >
            <h2 className="" style={{color:colors.valero()}} >
                <span className="text-2xl font-normal" >Quizzes de </span>
                <span className="text-2xl font-bold" >{cutTextMask(details?.customTitle ?? details?.metadata.title ?? '', 25)}</span>
            </h2>            
            
            <div className="w-[85%] flex flex-col items-center justify-center gap-3 mt-4" >  
                <ul className="list-disc flex flex-col items-center justify-center gap-3" >
                    {new Array(3).fill(0).map((item, i) => {
                        function getIndex() {
                            return Math.floor(Math.random() * phrases.length); 
                        }
                        let index = getIndex();        
                        
                        while(indexes.includes(index)) {
                            index = getIndex();
                        }
                        indexes.push(index);
                        
                        return (                            
                            <li>
                                {phrases[index]}
                            </li>
                        )
                    })}
                </ul>
                
                
                <Popover >
                    <PopoverTrigger className="shadow rounded p-3 flex gap-3 items-center justify-center mt-5">
                        <IoMdAdd size={24} />
                        <span>Novo Quiz</span>                                
                    </PopoverTrigger>
                    <PopoverContent className="w-[90%]" >
                        <form onSubmit={handleSubmit(createQuiz)} className="flex flex-col gap-3 items-center justify-center p-5" >
                            <span className="text-sm font-semibold text-green-700" >
                                {
                                    (globalUser.data?.uid === details?.userId) 
                                        ? 
                                            (privilegesData.quizGenerationPrivateDocs ? `Você possiu ${privilegesData.quizGenerationPrivateDocs} gerações de quiz gratuitas` : `Gere um novo quiz por apenas R$2,00`) 
                                        : 
                                            (privilegesData.quizGenerationPublicDocs ? `Você possiu ${privilegesData.quizGenerationPublicDocs} gerações de quiz gratuitas` : `Gere um novo quiz por apenas R$2,00`)
                                }
                            </span>
                            <textarea {...register('quizFocus')} placeholder="Digite o tema do novo Quiz..." className="w-full outline-none rounded p-3 text-lg focus:border-[2px]" style={{borderBottomWidth:2, borderColor:colors.valero(.7), color:colors.valero()}} />
                            {errors.quizFocus && <span className="text-sm text-wrap text-red-700 font-semibold mb-2" >{errors.quizFocus.message}</span>}
                            <button type="submit" disabled={loadQuizCreation} className="text-white text-base font-normal p-2 rounded w-full" style={{backgroundColor:colors.valero()}} >
                                {loadQuizCreation ? `Aguarde de 1 a 2 minutos...` :`Criar Quiz`}
                            </button>
                        </form>                   
                    </PopoverContent>
                </Popover>

                <Separator className="my-2" color={colors.valero()} />

                <div className="flex flex-wrap items-start justify-start w-full" >
                    {quizList.map(item => (
                        <Popover>
                            <PopoverTrigger className="w-[250px] rounded-md shadow p-1" >
                                <img src={item.imageBackground.wide.url} alt={item.title} className="w-full object-cover rounded" />
                                <span className="font-semibold text-sm p-2" >{Object.values(item.questions).length} questões</span>
                                <h2 className="font-semibold text-sm p-2" >
                                    {item.title}
                                </h2> 
                            </PopoverTrigger>
                            <PopoverContent>
                                {/* window.open(`${window.location.href}/quiz/${item.docId}-${item.id}`) */}
                                <button onClick={() => openUrl(`${window.location.href.split('?')[0]}/quiz/${item.docId}-${item.id}`)} className="rounded shadow my-1 p-2 w-full text-white" style={{backgroundColor:colors.valero()}} >
                                    Iniciar Quiz
                                </button>
                                <button disabled={!!tries[item.id]} onClick={() => getTries(item.docId, item.id)} className="w-full flex items-center justify-center p-2" >
                                    {!tries[item.id] ? `Carregar Tentativas` : `Tentativas`}
                                </button>
                                <Separator className="my-2" color={colors.valero()} />
                                <div className="flex flex-col gap-2" >
                                    {tries[item.id]?.map((t, i) => (
                                        <button onClick={() => openUrl(`${window.location.href.split('?')[0]}/quiz/${item.docId}-${item.id}/${t.id}`)} className="p-2 rounded shadow w-full" >
                                            Tentativa {i + 1} - acertos: {t.score * 100}%
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    ))}
                </div>
                
            </div>

        </div>
    );


};