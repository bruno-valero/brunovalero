import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { question, docId, uid, autoBuy } = await req.json() as { question: string, docId:string, uid:string, autoBuy?:boolean };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");        
        if (!question) throw new Error("Questão do usuário não enviada");  

        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('Iniciando a requisição para esponder a pergnta...');
        const response = await readPdf.askQuestion({ question, docId, user, autoBuy, minCredits:5 });
        return NextResponse.json({data:response});
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return NextResponse.json({error:`Houve um erro: ${e.message}`});
    }
    
};