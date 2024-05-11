import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { GoDesktopDownload } from "react-icons/go";
import { PdfFunctions } from "..";



export default function AddImageButton({ pdf, imageWidth, imageHeight, functions }:{ pdf: Pdf, imageWidth:number, imageHeight:number, functions: PdfFunctions }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [load, setLoad] = useState(false);

    async function addCover() {

        const log = functions.isLogged();
        if (!log) return;
        const insChangingPublic = functions.insChangingPublic({ pdf, title:`Adicionar Capas`, message:`Não é permitido adicionar capas para documentos públicos.\n\nAdicione capas nos documentos que você mesmo fez o upload.` })
        if (insChangingPublic) return;
        const hasInsufficientCredits = functions.hasInsufficientCredits({ privilege:'coverGenerationForPrivateDocs' });
        if (hasInsufficientCredits) return;


        setLoad(true);
        const path = `/api/readPdf/add-cover`;
        const post = new Post(path);
        post.addData({ docId:pdf.id, uid:globalUser.data?.uid, autoBuy:false });
        const resp = await post.send();
        const data = await resp?.json();
        // alert(JSON.stringify(data, null, 2));
        setLoad(false);
    }

    return (
        dimensions &&  
        <button onClick={() => addCover()} disabled={load} className="flex items-center justify-center rounded text-sm" style={{width:imageWidth * .3, height:imageHeight * .3, backgroundColor:'rgba(190,190,190,.7)', color:colors.valero()}} >
            {!load ? <FaPlus size={25} color={colors.valero()} /> : <GoDesktopDownload size={25} color={colors.valero()} />}
        </button>
    );

};