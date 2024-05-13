import { Request } from "firebase-functions/v2/https";
import { UsersUser } from "../../../src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import UploadPdfProcess from "../../../src/modules/projectExclusive/UploadPdfProcess";
import UserFinancialData from "../../../src/modules/projectExclusive/UserManagement/UserFinancialData";


export default async function readPdfSwitchPlanRoute(req:Request) {
    try {
        const { plan, uid } = await req.body as {  plan:'free' | 'standard' | 'enterprise', uid:string };
        if (!uid) throw new Error("Usuário não encontrado");        
        if (!plan) throw new Error("Plano de Assinatura inválido");         
        // @ts-ignore
        const readPdf = new UploadPdfProcess();
        console.log('altenticando usuário');
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, "control">;
        if (!user) throw new Error("Usuário não encontrado");   
        console.log('iniciando subscrição...');
        const uf = new UserFinancialData();
        
        const stripeId = await uf.userManagement.getStripeId({ uid:user.uid, userData:user });
        
        if (plan === 'free') {
            await uf.switchToFreeSubscription({ stripeId });            
            return {data:true};
        } else if (plan === 'standard') {
            await uf.switchToStandardSubscription({ stripeId });            
            return {data:true};
        } else if (plan === 'enterprise') {
            await uf.switchToEnterpriseSubscription({ stripeId });            
            return {data:true};
        }

        return {data:false};
        

        

    } catch (e:any) {
        console.log('Houver um erro:', e.message);
        return {error:`Houve um erro: ${e.message}`};
    }
}