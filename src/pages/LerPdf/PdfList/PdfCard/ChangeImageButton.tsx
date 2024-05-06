import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";



export default function ChangeImageButton({ pdf, imageWidth, imageHeight, imageCovers, item, i:index }:{ pdf: Pdf, imageWidth:number, imageHeight:number, imageCovers:Pdf['imageCover'], item:Pdf['imageCover'][0], i:number }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    const [load, setLoad] = useState(false);

    async function changeImage() {
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
        <button onClick={() => changeImage()} style={{width:imageWidth * .3, height:imageHeight * .3}} >
            <img src={item.url} alt={`Imagem ${index + 1}`} className="object-cover rounded shadow w-full h-full"  />
        </button>
    );

};