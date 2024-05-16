import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import cutTextMask from "@/utils/functions/masks/cutTextMask";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { useRef } from "react";
import { MdOutlinePublic } from "react-icons/md";
import { SiPrivateinternetaccess } from "react-icons/si";
import { twMerge } from "tailwind-merge";
import { PdfFunctions, PdfHooks } from "..";
import AddImageButton from "./AddImageButton";
import ChangeImageButton from "./ChangeImageButton";
import ChangeTitleButton from "./ChangeTitleButton";


export default function PdfCard({ pdf, functions, questionHooks }:{ pdf:Pdf, functions: PdfFunctions, questionHooks: PdfHooks }) {

    const inputNameRef = useRef<HTMLInputElement>(null);    

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const imageWidth = (dimensions?.width ?? 0) > 500 ?  220 : 180
    const imageHeight = imageWidth*1.75
    const imageCover = pdf?.imageCover?.filter(item => item.active)?.[0]?.sizes.sm.url as string | undefined;

    const { privilegesData } = questionHooks ?? { genres:0, selectedGenres:[1,2] };
    // alert(JSON.stringify(privilegesData, null, 2))
    return (
        dimensions && (
            <div className="flex flex-col items-center justify-between gap-3 rounded shadow p-3 text-wrap max-w-[230px] flex-1 hover:scale-[1.05] transition-all duration-300" style={{maxWidth:imageWidth + 12, maxHeight:imageHeight + (imageHeight * .5)}} >
                
                <div className="flex gap-2 flex-col items-start justify-center"  >
                    <Popover>
                        <PopoverTrigger className="relative group flex gap-2 items-start justify-center" style={{width:dimensions.width < 500 ? imageWidth *.7 : imageWidth, height:dimensions.width < 500 ? imageHeight *.7 : imageHeight}} >
                            <img 
                            className="w-full h-full object-cover rounded"
                            src={imageCover ?? "https://firebasestorage.googleapis.com/v0/b/brunovalero-49561.appspot.com/o/imagePlaceholder.png?alt=media&token=e6228ad2-c051-46f5-b8d2-9df3a7a33452"} 
                            alt={pdf.customTitle ?? pdf.metadata.title} />
                        </PopoverTrigger>
                        <PopoverContent>
                            <span className="text-lg font-bold" style={{color:colors.valero()}} >Opções de Imagem</span>
                            <Separator className="mb-2" />
                            <div className="text-sm font-semibold mb-2 text-green-700" >
                                {privilegesData.coverGenerationForPrivateDocs ? `Você possui ${privilegesData.coverGenerationForPrivateDocs} gerações de imagem da capa gratuitas.` : `Gere uma nova imagem representando o conteúdo por apenas ${moneyMask(questionHooks.pricing?.readPdf.actionsValue.coverGenerationForPrivateDocs ?? {})}`}
                            </div>
                            <div className={twMerge("text-sm font-semibold mb-2")} >
                                {pdf.customTitle ?? pdf.metadata.title} pop
                            </div>
                            <div className="w-full flex gap-2 items-start justify-start overflow-x-auto" >
                                    <AddImageButton {...{ pdf, imageWidth, imageHeight, functions }} />
                                {pdf.imageCover.length >= 1 && pdf.imageCover.map((item, i) => (
                                    <ChangeImageButton {...{ pdf, imageWidth, imageHeight, imageCovers:pdf.imageCover, item, i, functions }} />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>                
                    <div className="w-full flex flex-col gap-1 items-start justify-center" >
                        <Popover onOpenChange={(open) => open && inputNameRef.current?.focus()} >
                            <PopoverTrigger className={twMerge("")} >                            
                                <h2 className="font-bold text-sm" >
                                    {cutTextMask(pdf.customTitle || pdf.metadata.title || 'Sem Nome', dimensions.width < 500 ? 15 : 25)}
                                </h2>                    
                            </PopoverTrigger>
                            <PopoverContent>
                                <span className="text-lg font-bold" style={{color:colors.valero()}} >Trocar Título</span>
                                <Separator className="mb-2" />
                                {/* <input ref={inputNameRef} type="text" defaultValue={pdf.customTitle ?? pdf.metadata.title ?? ''} className="outline-none p-2 border-none w-full rounded" style={{backgroundColor:colors.valero(.1)}} /> */}
                                <ChangeTitleButton pdf={pdf} text={inputNameRef.current?.value} functions={functions} />
                            </PopoverContent>
                        </Popover>

                    </div>
                    <div className="w-full flex flex-col gap-1 items-start justify-center">
                        <span className="font-light text-sm" >{pdf.metadata.totalPages} páginas</span>
                        <span className="font-light text-sm" >{Number(pdf.metadata.totalWords).toLocaleString()} palavras</span>
                        <span className="font-light text-sm flex gap-2 items-center justify-center"  > {pdf.userId !== globalUser.data?.uid ? <><MdOutlinePublic /> Público</> : <><SiPrivateinternetaccess /> privado</> }</span>
                    </div>
                </div>
                <div className="group relative w-full flex flex-col gap-1 items-center justify-center" >               
                    <button onClick={() => functions.choosePdf(pdf)} className="text-white font-semibold text-sm bottom-2 rounded p-2 w-full mt-1" style={{backgroundColor:colors.pdf()}} >
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
        )
    );

};