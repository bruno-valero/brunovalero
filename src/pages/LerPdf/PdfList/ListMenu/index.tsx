import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollComponent } from "@/src/components/structural/ScrollComponent";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, RefObject } from "react";
import { FaFilter } from "react-icons/fa";
import { MdPriceChange } from "react-icons/md";
import { TiPlus } from "react-icons/ti";
import { twMerge } from "tailwind-merge";
import { PdfFunctions, PdfHooks } from "..";


export default function ListMenu({ getPdfRef, questionHooks, functions }:{ getPdfRef:RefObject<HTMLInputElement>, questionHooks: PdfHooks, functions: PdfFunctions }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [1,2];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [1,2];
    const dimensions = globalState.dimensions;
    const { envs } = globalState.fromServer ?? {};

    const { genres, selectedGenres:[selectedGenres, setSelectedGenres], privilegesData, financialData } = questionHooks ?? { genres:0, selectedGenres:[1,2] };


    async function uploadToStorage(pdf:File) {
        if (!globalUser.data) {
            setPublicError({
                title:'Deve estar logado',
                message:'Para fazer o upload de um documento Pdf você deve estar logado',
            })
            return;
        };
        console.log('preparando para fazer o upload...');

        const id = String(new Date().getTime());
        const path = `services/readPdf/documents/${globalUser.data.uid}/${id}`;
        const file = ref(storage!, path);
        await uploadBytes(file, pdf);
        const url = await getDownloadURL(file);

        const cloudFunction = 'https://southamerica-east1-brunovalero-49561.cloudfunctions.net/readPdfUpload';
        const apiPath = '/api/readPdf/upload';
        const reqUrl = envs.useCloudFunctions ? cloudFunction : apiPath;
        const post = new Post(reqUrl);

        const uid = globalUser.data.uid;
        const pdfUrl = url;
        const docId = id;

        post.addData({ pdfUrl, docId, uid });
        await post.send();
        console.log(url);
    };

    async function uploadDocuments(e:ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const notPdf = files.some(item => item.type !== 'application/pdf');
        if (notPdf) {
            setPublicError({
                title:'Apenas PDF',
                message:`Apenas documentos em formato PDF são permitidos. Os outros formatos serão descartados`
            })
        }
        const pdfs = files.filter(item => item.type === 'application/pdf');
        
        await (pdfs.reduce(async (previousPromise, item) => {
            await previousPromise;
            // console.log('aguardando fora...');
            await new Promise(resolve => setTimeout(() => {
                // console.log('aguardando dentro...');
                resolve(null);
            }, 500));
            await uploadToStorage(item);
        }, Promise.resolve()));
        
    };

    function toggleGenres(item: string) {
        setSelectedGenres(prev => {
            return !prev.includes(item) ? [...prev, item] : prev.filter(data => data !== item)
        })

    };

    function uploadPDF() {
        const log = functions.isLogged();
        if (!log) return;
        const hasInsufficientCredits = functions.hasInsufficientCredits({ privilege:'pdfUpload' });
        if (hasInsufficientCredits) return;
        getPdfRef.current?.click();
    }

    
    return (
        dimensions && (
            <>
                <Popover>
                    <PopoverTrigger className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex gap-2 items-center justify-center", dimensions.width < 500 && 'p-2')} >
                        <FaFilter color={colors.valero(.8)} size={dimensions.width < 500 ? 15 : 25} />
                        <span  className='' style={{color:colors.valero(.8)}} >Filtro</span>
                    </PopoverTrigger>
                    <PopoverContent className="p-1" >
                        <ScrollComponent className="h-[300px] p-2 flex flex-col" >
                            <ul className="flex flex-col gap-2" >
                                <li className="w-full" >
                                    <button onClick={() => setSelectedGenres([])} className="rounded w-full shadow p-2" style={{backgroundColor:selectedGenres.length === 0 ? colors.valero() : 'white', color:selectedGenres.length === 0 ? 'white' : colors.valero()}} >
                                        Selecionar Todos
                                    </button>
                                </li>
                                    {genres.map(item => (
                                        <li className="w-full" >
                                            <button onClick={() => toggleGenres(item)} className="rounded w-full shadow p-2" style={{backgroundColor:selectedGenres.includes(item) ? colors.valero() : 'white', color:selectedGenres.includes(item) ? 'white' : colors.valero()}} >
                                                {item}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </ScrollComponent>
                    </PopoverContent>
                </Popover>
                
                {/* <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >

                    <button className={twMerge("py-3 pr-3 pl-2 text-white font-bold rounded flex items-center justify-center", dimensions.width < 500 && 'pr-1')} style={{}} >
                        <IoGrid size={dimensions.width < 500 ? 15 : 25} className="text-black" style={{color:colors.valero(.8)}} />
                    </button>
                    <button className={twMerge("py-3 pl-3 pr-2 text-white font-bold rounded flex items-center justify-center", dimensions.width < 500 && 'pl-1')} >
                        <FaThList size={dimensions.width < 500 ? 15 : 25} className="text-black" style={{color:colors.valero(.3)}} />
                    </button>
                </div> */}

                <Popover>
                    <PopoverTrigger className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex gap-2 items-center justify-center", dimensions.width < 500 && 'p-2')} >
                        <MdPriceChange color={colors.valero(.8)} size={dimensions.width < 500 ? 15 : 25} />
                        <span className='' style={{color:colors.valero(.8)}} > {dimensions.width > 500 && `Plano`} {financialData?.activePlan.readPdf === 'free' ? 'Básico' : (financialData?.activePlan.readPdf == 'standard' ? (dimensions.width < 500 ? cutTextMask('Empreendedor', 5) : `Empreendedor`) : (dimensions.width < 500 ? cutTextMask('Prêmium', 5) : `Prêmium`))}</span>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px]" >
                        <div className="flex flex-col gap-1" >
                            <span className="font-bold" >
                                {`Plano ${financialData?.activePlan.readPdf === 'free' ? 'Básico' : (financialData?.activePlan.readPdf == 'standard' ? `Empreendedor` : `Prêmium`)}`}
                            </span>
                            <span className="text-base font-normal" >
                                Todos os Mêses há <span className="text-green-700 font-semibold" >Benefícios gratuitos.</span>
                            </span>
                            <span className="text-base font-normal" >
                                Veja os benefícios que você ainda não usou.
                            </span>
                        </div>
                        <Separator className="mb-4 mt-2 bg-gray-700" />
                        <div className="flex flex-col" >
                            {!!privilegesData.pdfUpload && (
                                <>
                                    <span>                                
                                        <><span className="font-semibold" >{privilegesData.pdfUpload}</span> <span className="font-semibold" >Uploads de PDFs gratuitos.</span></>
                                    </span>
                                    <Separator className="my-2" />
                                </>
                            )}
                            {!!privilegesData.questions && (
                                <>
                                    <span>
                                        <><span className="font-semibold" >{privilegesData.questions}</span> <span className="font-semibold" >Perguntas gratuitas.</span></>
                                    </span>
                                    <Separator className="my-2" />
                                </>
                            )}
                            {!!privilegesData.coverGenerationForPrivateDocs && (
                                <>
                                    <span>
                                        <><span className="font-semibold" >{privilegesData.coverGenerationForPrivateDocs}</span> <span className="font-semibold" >Gerações de Capas (privadas) gratuitas.</span></>
                                    </span>
                                    <Separator className="my-2" />
                                </>
                            )}
                            {!!privilegesData.quizGenerationPrivateDocs && (
                                <>
                                    <span>
                                        <><span className="font-semibold" >{privilegesData.quizGenerationPrivateDocs}</span> <span className="font-semibold" >Gerações de Quizzes (privados) gratuitos.</span></>
                                    </span>
                                    <Separator className="my-2" />
                                </>
                            )}
                            {!!privilegesData.quizGenerationPublicDocs && (
                                <>
                                    <span>
                                        <><span className="font-semibold" >{privilegesData.quizGenerationPublicDocs}</span> <span className="font-semibold" >Gerações de Quizzes (públicos) gratuitos.</span></>
                                    </span>
                                    <Separator className="my-2" />
                                </>
                            )}
                            <button onClick={() => functions.scrollToPlans()} className="bg-green-600 text-white font-semibold text-lg py-2 px-5 rounded shadow my-3" >
                                Veja os Planos
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger className={twMerge("p-3 text-white font-bold rounded shadow flex items-center justify-center gap-2", dimensions.width < 500 && 'p-2')} style={{backgroundColor:colors.valero()}} >
                        <TiPlus color="white" size={dimensions.width < 500 ? 15 : 25} />
                        <span>{dimensions.width < 500 ? cutTextMask(`Novo Documento`, 10) : `Novo Documento`}</span>   
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col" >   
                        <span className="mt-2 text-green-700 font-semibold" >
                            {privilegesData.pdfUpload ? `Você possui ${privilegesData.pdfUpload} uploads de PDFs gratuitos` : `Faça o upload de um PDF por apenas R$${0.29.toFixed(2)} a cada ${(100_000).toLocaleString()} palavras.`}
                        </span>  
                        <span className="font-semibold mt-2 mb-3 text-gray-800 text-sm" >
                            Seu documento será armazenado de forma priada, <span className="font-black" >ningém terá acesso a ele.</span>
                        </span>                   
                        <button onClick={() => uploadPDF()} className="p-3 w-full text-white font-bold rounded shadow flex items-center justify-center gap-2" style={{backgroundColor:colors.valero()}} >                            
                            <span>Enviar Documento</span>                                        
                        </button>
                    </PopoverContent>
                </Popover>

                <input ref={getPdfRef} type="file" accept=".pdf" onChange={uploadDocuments} className="hidden" multiple />
            </>
        )
    );

};