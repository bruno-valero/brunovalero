import { Request } from "firebase-functions/v2/https";
import { Control } from "../../../src/config/firebase-admin/collectionTypes/control";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import VectorStoreProcess from "../../../src/modules/VectorStoreProcess";
import UploadPdfProcess from "../../../src/modules/projectExclusive/UploadPdfProcess";


export default async function readPdfUploadRoute(req:Request) {
    try {
        const { pdfUrl, docId, uid } = await req.body as { pdfUrl: string, docId:string, uid:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");        
        if (!pdfUrl) throw new Error("Documento inválido");  

        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        console.log(`pdfUrl:${pdfUrl}, docId:${docId}, uid:${uid}`);
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = userSnap.exists ? userSnap.data() : null;
        if (!user) throw new Error("Usuário não encontrado");        
        console.log('lendo o conteúdo');


        const resp = await admin_firestore.collection('control').doc('vectorStore').get();
        const vectorStore = (resp.exists ? resp.data() : null) as Control['vectorStore'] | null;
        if(!vectorStore) throw new Error("Vector Store não encontrada");
        const items = Object.entries(vectorStore.indexes).filter(item => !!item[1]);
        const v = new VectorStoreProcess();
        const vectorIndex = await v.checkNamespacesAmount(items[0][0]);
        await readPdf.partialUpload({ pdfUrl, docId, user, vectorIndex });

        console.log('Processo finalizado com sucesso!');
        return {data:true};
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return {error:`Houver um erro: ${e.message}`};
    }
}