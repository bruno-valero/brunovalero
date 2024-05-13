import { Request } from "firebase-functions/v2/https";
import { UsersUser } from "../../../src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import UploadPdfProcess from "../../../src/modules/projectExclusive/UploadPdfProcess";
import UserFinancialData from "../../../src/modules/projectExclusive/UserManagement/UserFinancialData";


export default async function readPdfBuyCreditsRoute(req:Request) {
    try {
        const { amount, uid } = await req.body as {  amount:number, uid:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!amount) throw new Error("Quantidade de créditos não informada");         
        if (amount < 5) throw new Error("Quantidade de créditos abaixo do mínimo permitido");         
        // @ts-ignore
        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   

        console.log('Comprando créditos...');
        const uf = new UserFinancialData();        
        await uf.buyCredits({ uid, amount });

        return {data:true};

    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return {error:`Houve um erro: ${e.message}`};
    }
}