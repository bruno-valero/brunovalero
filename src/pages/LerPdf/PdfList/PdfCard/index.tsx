import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";


export default function PdfCard({ pdf, choosePdf }:{ pdf:Pdf, choosePdf:(pdf:Pdf | null) => void }) {

    const imageWidth = 180
    const imageHeight = imageWidth*1.75
    const imageCover = pdf.imageCover.filter(item => item.active)?.[0]?.url as string | undefined;

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    async function addCover() {
        const path = `/api/readPdf/add-cover`;
        const post = new Post(path);
        post.addData({ docId:pdf.id, uid:globalUser.data?.uid, autoBuy:false });
        const resp = await post.send();
        const data = await resp?.json();
        console.log(data);
    }
    return (
        <div className="flex flex-col items-center justify-between gap-3 rounded shadow p-3 text-wrap max-w-[230px] flex-1 hover:scale-[1.05] transition-all duration-300" style={{maxWidth:imageWidth + 12, maxHeight:imageHeight + (imageHeight * .5)}} >
            
            <div className="flex gap-2 flex-col items-start justify-center"  >
                <div className="relative group flex gap-2 items-start justify-center" style={{width:imageWidth, height:imageHeight}} >
                    <img 
                    className="w-full h-full object-cover rounded"
                    src={imageCover ?? "https://firebasestorage.googleapis.com/v0/b/brunovalero-49561.appspot.com/o/imagePlaceholder.png?alt=media&token=e6228ad2-c051-46f5-b8d2-9df3a7a33452"} 
                    alt={pdf.customTitle ?? pdf.metadata.title} />
                    {!imageCover &&(
                        <button onClick={() => addCover()} className="group-hover:flex hidden text-white font-semibold text-sm absolute bottom-2 rounded p-1" style={{backgroundColor:colors.valero()}} >
                            Gerar Imagem
                        </button>
                    )}
                </div>
                <div className="w-full flex flex-col gap-1 items-start justify-center" >
                    <h2 className="font-bold text-sm" >
                        {cutTextMask(pdf.customTitle ?? pdf.metadata.title, 25)}
                    </h2>                    
                </div>
                <div className="w-full flex flex-col gap-1 items-start justify-center">
                    <span className="font-light text-sm" >{pdf.metadata.totalPages} páginas</span>
                    <span className="font-light text-sm" >{Number(pdf.metadata.totalWords).toLocaleString()} palavras</span>
                </div>
            </div>
            <div className="group relative w-full flex flex-col gap-1 items-center justify-center" >               
                <button onClick={() => choosePdf(pdf)} className="text-white font-semibold text-sm bottom-2 rounded p-2 w-full mt-2" style={{backgroundColor:colors.pdf()}} >
                    Abrir
                </button>
            </div>
            {/* {decodeURIComponent(pdf.description).split('\n').map(text => (
                <>
                    <span>{text}</span>
                    <br />
                </>
            ))}
            <span>{pdf.price}</span> */}
        </div>
    );

};