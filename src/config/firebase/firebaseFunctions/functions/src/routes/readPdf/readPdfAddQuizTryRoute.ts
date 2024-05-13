import { Request } from "firebase-functions/v2/https";
import { QuizPdf, QuizPdfTry } from "../../../src/config/firebase-admin/collectionTypes/pdfReader";
import { UsersUser } from "../../../src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import Quiz from "../../../src/modules/projectExclusive/UploadPdfProcess/Quiz";


export default async function readPdfAddQuizTryRoute(req:Request) {
    try {
        const { docId, uid, quizTryQuestions, quiz } = await req.body as { docId:string, uid:string, quizTryQuestions:QuizPdfTry['questions'], quiz:QuizPdf };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");         

        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('Iniciando a requisição para esponder a pergnta...');
        const quizTry = await (new Quiz()).newQuizTry({ quiz, quizTryQuestions, userId:uid });
        return {data:quizTry};
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return {error:`Houve um erro: ${e.message}`};
    }
}