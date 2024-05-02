import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, RefObject } from "react";
import { FaFilter, FaThList } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";


export default function ListMenu({ getPdfRef }:{ getPdfRef:RefObject<HTMLInputElement> }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


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
        
    }


    return (
        <>
            <button className="bg-gray-100 shadow p-3 text-white font-bold rounded flex items-center justify-center  "  >
                <FaFilter color={colors.valero(.8)} />
                <span  className='' style={{color:colors.valero(.8)}} >Filtro</span>
            </button>                
            <div className="bg-gray-100 rounded shadow gap-2 flex items-center justify-center"  >
                <button className="py-3 pr-3 pl-2 text-white font-bold rounded flex items-center justify-center" style={{}} >
                    <IoGrid size={26} className="text-black" style={{color:colors.valero(.8)}} />
                </button>
                <button className="py-3 pl-3 pr-2 text-white font-bold rounded flex items-center justify-center" >
                    <FaThList size={26} className="text-black" style={{color:colors.valero(.3)}} />
                </button>
            </div>
            <button onClick={() => getPdfRef.current?.click()} className="p-3 text-white font-bold rounded shadow flex items-center justify-center gap-2" style={{backgroundColor:colors.valero()}} >
                <TiPlus color="white" size={22} />
                <span>Novo Documento</span>                                        
            </button>
            <input ref={getPdfRef} type="file" accept=".pdf" onChange={uploadDocuments} className="hidden" multiple />
        </>
    );

};