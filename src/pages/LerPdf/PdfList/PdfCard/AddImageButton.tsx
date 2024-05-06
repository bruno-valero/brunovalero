import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";



export default function AddImageButton({ pdf, imageWidth, imageHeight }:{ pdf: Pdf, imageWidth:number, imageHeight:number }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;

    const [load, setLoad] = useState(false);

    async function addCover() {
        setLoad(true);
        const path = `/api/readPdf/add-cover`;
        const post = new Post(path);
        post.addData({ docId:pdf.id, uid:globalUser.data?.uid, autoBuy:false });
        const resp = await post.send();
        const data = await resp?.json();
        console.log(data);
        setLoad(false);
    }

    return (
        <button onClick={() => addCover()} className="flex items-center justify-center rounded" style={{width:imageWidth * .3, height:imageHeight * .3, backgroundColor:'rgba(190,190,190,.7)', color:colors.valero()}} >
            {!load ? <FaPlus size={25} color={colors.valero()} /> : 'Aguarde...'}
        </button>
    );

};