import { admin_firestore } from "@/src/config/firebase-admin/config";
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { pdfUrl, docId, uid } = await req.json() as { pdfUrl: string, docId:string, uid:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!docId) throw new Error("Id do Documento inválido");        
        if (!pdfUrl) throw new Error("Documento inválido");  

        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        console.log(`pdfUrl:${pdfUrl}, docId:${docId}, uid:${uid}`);
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = userSnap.exists ? userSnap.data() : null;
        if (!user) throw new Error("Usuário não encontrado");        
        
        return NextResponse.json({data:true});
    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return NextResponse.json({error:`Houver um erro: ${e.message}`});
    }
    
};