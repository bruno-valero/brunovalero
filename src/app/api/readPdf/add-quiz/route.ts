import { Control } from "@/src/config/firebase-admin/collectionTypes/control";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import VectorStoreProcess from "@/src/modules/VectorStoreProcess";
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import Quiz from "@/src/modules/projectExclusive/UploadPdfProcess/Quiz";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { docId, uid, autoBuy, quizFocus } = await req.json() as {  docId:string, uid:string, autoBuy?:boolean, quizFocus:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");         

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
        const images = (new Quiz()).addQuiz({ quizFocus, docId, isPublic:false, userId:user.uid, autoBuy, minCredits:5, vectorIndex })

        return NextResponse.json({data:images});
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return NextResponse.json({error:`Houve um erro: ${e.message}`});
    }
    
};