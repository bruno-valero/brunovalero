import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, RefObject } from "react";
import { FaFilter, FaThList } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { twMerge } from "tailwind-merge";
import { PdfHooks } from "..";


export default function ListMenu({ getPdfRef, questionHooks }:{ getPdfRef:RefObject<HTMLInputElement>, questionHooks: PdfHooks }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [1,2];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [1,2];
    const dimensions = globalState.dimensions;

    const { genres, selectedGenres:[selectedGenres, setSelectedGenres], privilegesData } = questionHooks ?? { genres:0, selectedGenres:[1,2] };


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
        const post = new Post('/api/readPdf/upload');

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

    }

    
    return (
        dimensions && (
            <>
                <Popover>
                    <PopoverTrigger className={twMerge("bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center", dimensions.width < 500 && 'p-2')} >
                        <FaFilter color={colors.valero(.8)} size={dimensions.width < 500 ? 15 : 25} />
                        <span  className='' style={{color:colors.valero(.8)}} >Filtro</span>
                    </PopoverTrigger>
                    <PopoverContent>
                        <ul className="p-2 flex flex-col gap-1" >
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
                    </PopoverContent>
                </Popover>
                <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >

                    <button className={twMerge("py-3 pr-3 pl-2 text-white font-bold rounded flex items-center justify-center", dimensions.width < 500 && 'pr-1')} style={{}} >
                        <IoGrid size={dimensions.width < 500 ? 15 : 25} className="text-black" style={{color:colors.valero(.8)}} />
                    </button>
                    <button className={twMerge("py-3 pl-3 pr-2 text-white font-bold rounded flex items-center justify-center", dimensions.width < 500 && 'pl-1')} >
                        <FaThList size={dimensions.width < 500 ? 15 : 25} className="text-black" style={{color:colors.valero(.3)}} />
                    </button>
                </div>
                <Popover>
                    <PopoverTrigger className={twMerge("p-3 text-white font-bold rounded shadow flex items-center justify-center gap-2", dimensions.width < 500 && 'p-2')} style={{backgroundColor:colors.valero()}} >
                        <TiPlus color="white" size={dimensions.width < 500 ? 15 : 25} />
                        <span>Novo Documento</span>   
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col" >   
                        <span className="mt-2 text-green-700 font-semibold" >
                            {privilegesData.pdfUpload ? `Você possui ${privilegesData.pdfUpload} uploads de PDFs gratuitos` : `Faça o upload de um PDF por apenas R$${0.29.toFixed(2)} a cada ${(100_000).toLocaleString()} palavras.`}
                        </span>  
                        <span className="font-semibold mt-2 mb-3 text-gray-800 text-sm" >
                            Seu documento será armazenado de forma priada, <span className="font-black" >ningém terá acesso a ele.</span>
                        </span>                   
                        <button onClick={() => getPdfRef.current?.click()} className="p-3 w-full text-white font-bold rounded shadow flex items-center justify-center gap-2" style={{backgroundColor:colors.valero()}} >                            
                            <span>Enviar Documento</span>                                        
                        </button>
                    </PopoverContent>
                </Popover>

                <input ref={getPdfRef} type="file" accept=".pdf" onChange={uploadDocuments} className="hidden" multiple />
            </>
        )
    );

};