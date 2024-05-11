import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { amount, uid } = await req.json() as {  amount:number, uid:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!amount) throw new Error("Quantidade de créditos não informada");         
        if (amount < 5) throw new Error("Quantidade de créditos abaixo do mínimo permitido");         

        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('iniciando subscrição...');
        const uf = new UserFinancialData();
        
        await uf.buyCredits({ uid, amount });

        return NextResponse.json({data:true});

    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return NextResponse.json({error:`Houve um erro: ${e.message}`});
    }
    
};