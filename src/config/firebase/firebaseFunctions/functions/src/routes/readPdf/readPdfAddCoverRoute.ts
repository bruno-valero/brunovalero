import { Request } from "firebase-functions/v2/https";
import { Control } from "../../../src/config/firebase-admin/collectionTypes/control";
import { UsersUser } from "../../../src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import VectorStoreProcess from "../../../src/modules/VectorStoreProcess";
import UploadPdfProcess from "../../../src/modules/projectExclusive/UploadPdfProcess";
import Images from "../../../src/modules/projectExclusive/UploadPdfProcess/Images";


export default async function readPdfAddCoverRoute(req:Request) {
    try {
        const { docId, uid, autoBuy } = await req.body as {  docId:string, uid:string, autoBuy?:boolean };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");         

        // @ts-ignore
        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('Iniciando a requisição para esponder a pergnta...');

        const resp = await admin_firestore.collection('control').doc('vectorStore').get();
        const vectorStore = (resp.exists ? resp.data() : null) as Control['vectorStore'] | null;
        if(!vectorStore) throw new Error("Vector Store não encontrada");
        const items = Object.entries(vectorStore.indexes).filter(item => !!item[1]);
        const v = new VectorStoreProcess();
        const vectorIndex = await v.checkNamespacesAmount(items[0][0]);
        const images = (new Images()).addNewImage({ docId, userId:user.uid, autoBuy, minCredits:5, vectorIndex });

        return {data:images};
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return {error:`Houve um erro: ${e.message}`};
    }
}