import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, useRef, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { twMerge } from "tailwind-merge";
import { PdfFunctions, PdfHooks } from "../..";



export default function SendDocument({ questionHooks, functions }:{ questionHooks:PdfHooks, functions:PdfFunctions }) {

    const getPdfRef = useRef<HTMLInputElement>(null);

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [1,2];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [1,2];
    const dimensions = globalState.dimensions;
    const { envs } = globalState.fromServer ?? {};

    const [load, setLoad] = useState(false);

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
        setLoad(true);        
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

        if (getPdfRef.current) {
            getPdfRef.current.value = '';
        };
        
        setLoad(false);        
    };

    function uploadPDF() {
        const log = functions.isLogged();
        if (!log) return;
        const hasInsufficientCredits = functions.hasInsufficientCredits({ privilege:'pdfUpload' });
        if (hasInsufficientCredits) return;
        getPdfRef.current?.click();
    }


    return (
        <Popover>
            <PopoverTrigger className={twMerge("p-3 text-white font-bold rounded shadow flex items-center justify-center gap-2", dimensions.width < 500 && 'p-2')} style={{backgroundColor:colors.valero()}} >
                <TiPlus color="white" size={dimensions.width < 500 ? 15 : 25} />
                <span>{dimensions.width < 500 ? cutTextMask(`Novo Documento`, 10) : `Novo Documento`}</span>   
            </PopoverTrigger>
            <PopoverContent className="flex flex-col" >   
                <span className="mt-2 text-green-700 font-semibold" >
                    {privilegesData.pdfUpload ? `Você possui ${privilegesData.pdfUpload} uploads de PDFs gratuitos` : `Faça o upload de um PDF por apenas ${moneyMask(questionHooks.pricing?.readPdf.actionsValue.pdfUpload ?? 0)} a cada ${(100_000).toLocaleString()} palavras.`}
                </span>  
                <span className="font-semibold mt-2 mb-3 text-gray-800 text-sm" >
                    Seu documento será armazenado de forma priada, <span className="font-black" >ningém terá acesso a ele.</span>
                </span>                   
                <button onClick={() => uploadPDF()} disabled={load} className="p-3 w-full text-white font-bold rounded shadow flex items-center justify-center gap-2" style={{backgroundColor:colors.valero()}} >                            
                    <span>{load ? `Aguarde...` : `Enviar Documento`}</span>
                </button>
                
                <input ref={getPdfRef} type="file" accept=".pdf" onChange={uploadDocuments} className="hidden" multiple />
            
            </PopoverContent>
        </Popover>
    )
}