import { isProduction } from "@/envs";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { UsersFinancialData } from "@/src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
import Payment from "../../UploadPdfProcess/Payment";

export default class UserFinancialData {

    payment:Payment;
    stripe:StripeBackend;
    stripeId:'stripeId' | 'stripeIdDev'

    constructor() {

        const stripeId = isProduction ? 'stripeId' : 'stripeIdDev';
        this.payment = new Payment();
        this.stripeId = stripeId;
        this.stripe = new StripeBackend(isProduction ? 'production' : 'test');

    };


    /**
     * Cria a Coleção (collection do Firebase) contendo a estrutura para armazenar os dados financeiros do usuário.
     * 
     * Deve ser usada na criação de um novo usuário, pois ele não terpa a estrutura criada ainda.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     */
    async create(uid:string) {
        
        const financialData:UsersFinancialData = {
            activePlan:{
                readPdf:'free',
            },
            credits:0,
            paymentMethods:0,
        };

        
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('financialData')
            .set(financialData, {merge:true})
    };

    /**
     * Realiza a compra de créditos para um determinado usuário
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param amount **number -** Quantidade de créditos comprada (é a mesma quantiade de Reais)
     */
    async buyCredits(uid:string, amount:number) {
        
        const hasPaymentMethods = await this.hasPaymentMethods({ uid });
        if (!hasPaymentMethods) throw new Error("O usuário não possui métodos de pagamento cadastrados");

        const stripe = this.stripe;
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = userSnap.exists ? userSnap.data() as UsersUser : null;
        if (!user) throw new Error("Usuário inválido");
        
        const customer = user[isProduction ? 'stripeId' : 'stripeIdDev']
        const pi = await stripe.createPaymentIntent({ 
            amount, 
            currency:'brl', 
            customer, 
            moreParams:{confirm:true},
            metadata:{
                uid:user.uid,                
            }
     })
        const financialData:Partial<UsersFinancialData> = {
            credits:0,
        };
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .update(financialData);
        
        await this.payment.createMoneyTransaction({ pi:pi.id, uid, type:"payment" });
        await this.payment.createCreditTransaction({ amount, service:'none', type:'none', uid, nature:'aquisition', piRelated:pi.id })
    };

    /**
     * Verifica se um usuário já possui métodos de pagamento cadastrado
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * 
     * @returns **boolean -** Se possui métodos de pagamento, retorna **true**, senão, retorna **false**
     */
    async hasPaymentMethods({ uid }:{uid:string}) {
        const snap = await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').get();
        const financialData = (snap.exists ? snap.data() : null) as UsersUser['control']['financialData'] | null;
        if (!financialData) return false;
        if (financialData.paymentMethods === 0) return false;
        return true;
    };

    /**
     * Atualiza o o registro de quantos métodos de pagamento o usuário tem registrado.
     * 
     * Este método é idealizado para ser aplicado nos Webhooks do Stripe.
     * 
     * Pois assim, sempre que o usuário atualizar os métodos de pagamento, ou excluí-los, o banco de dados será alimentado com essa informação.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     */
    async updatePaymentMethodsAmount({ uid }:{uid:string}) {
        const snap = await admin_firestore.collection('users').doc(uid).get();
        const user = (snap.exists ? snap.data() : null) as UsersUser | null;
        if (!user) return null;

        const stripeId = user[this.stripeId]
        const paymentMethods = await this.stripe.stripe.customers.listPaymentMethods(stripeId);
        const pmAmount = paymentMethods.data.length;
        await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').update({ paymentMethods:pmAmount })

        return user;
    }

};