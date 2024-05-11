import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { PdfFunctions } from "..";



export default function ChangeTitleButton({ pdf, text, functions }:{ pdf: Pdf, text?:string, functions: PdfFunctions }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [load, setLoad] = useState(false) ?? [];
    const [title, setTitle] = useState(pdf?.customTitle ?? pdf?.metadata?.title ?? '') ?? [];

    async function changeTitle(text?:string) {
        const insChangingPublic = functions.insChangingPublic({ pdf, title:`Trocar Títulos`, message:`Não é permitido trocar os títulos de documentos públicos.\n\n` })
        if (insChangingPublic) return;     

        setLoad(true);
        if (!text) return;
        await fromCollection('services', db!).getDocById('readPdf').getCollection('data').getDocById(pdf.id).update({ customTitle:text });
        setLoad(false);
    }

    return (
        dimensions &&
        <>
            <input onChange={(e) => setTitle(e.target.value)} type="text" value={title} defaultValue={pdf.customTitle ?? pdf.metadata.title ?? ''} className="outline-none p-2 border-none w-full rounded" style={{backgroundColor:colors.valero(.1)}} />
            <button onClick={() => changeTitle(title)} className="p-3 text-white rounded shadow w-full mt-2" style={{backgroundColor:colors.valero()}} >
                Trocar
            </button>
        </>
    );

};