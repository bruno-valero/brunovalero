import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { PdfFunctions } from "..";



export default function ChangeImageButton({ pdf, imageWidth, imageHeight, imageCovers, item, i:index, functions }:{ pdf: Pdf, imageWidth:number, imageHeight:number, imageCovers:Pdf['imageCover'], item:Pdf['imageCover'][0], i:number, functions: PdfFunctions }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [load, setLoad] = useState(false) ?? [];

    async function changeImage() {
        const log = functions.isLogged();
        if (!log) return;
        
        const insChangingPublic =  functions.insChangingPublic({ pdf, title:`Trocar Capas`, message:`Não é permitido trocar capas de documentos públicos.\n\nTroque as capas dos documentos que você mesmo fez o upload.` })
        if (insChangingPublic) return;
        
        
        setLoad(true);

        const imageCover = imageCovers.map((item, i) => {
            if (i === index) {
                item.active = true;
            } else {
                item.active = false;
            }
            return item;
        });

        await fromCollection('services', db!).getDocById('readPdf').getCollection('data').getDocById(pdf.id).update({ imageCover });
        setLoad(false);
    }

    return (
        dimensions &&
        <button onClick={() => changeImage()} style={{width:imageWidth * .3, height:imageHeight * .3}} >
            <img src={item.sizes.min.url} alt={`Imagem ${index + 1}`} className="object-cover rounded shadow w-full h-full"  />
        </button>
    );

};