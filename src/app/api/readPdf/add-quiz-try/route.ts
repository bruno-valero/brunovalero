import { QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import Quiz from "@/src/modules/projectExclusive/UploadPdfProcess/Quiz";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { docId, uid, quizTryQuestions } = await req.json() as {  docId:string, uid:string, quizTryQuestions:QuizPdfTry['questions'] };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");         

        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('Iniciando a requisição para esponder a pergnta...');
        const images = (new Quiz()).newQuizTry({ quiz, quizTryQuestions, userId })
        return NextResponse.json({data:images});
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return NextResponse.json({error:`Houve um erro: ${e.message}`});
    }
    
};