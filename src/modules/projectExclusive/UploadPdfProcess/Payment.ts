import { isProduction } from "@/envs";
import { CollectionTypes } from "@/src/config/firebase-admin/collectionTypes/collectionTypes";
import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { TransactionWithCreditsNature, TransactionWithCreditsPiRelated, TransactionWithCreditsService, TransactionWithCreditsType, TransactionWithMoneyType } from "@/src/config/firebase-admin/collectionTypes/transactions";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import tsToMask from "@/utils/functions/dateTime/tsToMask";
import StripeBackend from "../../stripe/backend/StripeBackend";

export default class Payment {

    stripeBackend:StripeBackend;

    constructor() {
        this.stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
    };

    async uploadPdfPay({ price, docId, newDoc, user }:{ price:number, docId:string, newDoc:Pdf, user:Partial<UsersUser> }) {
        const { control, ...rest } = user;
        const usersData = rest as Required<typeof rest>
        
        const customer = isProduction ? usersData.stripeId : usersData.stripeIdDev;
        const metadata = {
            transactionType:'readPdf',
            data:JSON.stringify(newDoc),
        };            
        const amount = Math.ceil(price * 100);
        const currency = 'brl';
        
        const pi = await this.stripeBackend.createPaymentIntent({ customer, metadata, amount, currency, moreParams:{confirm:true} });
        const piResponse = await this.stripeBackend.stripe.paymentIntents.retrieve(pi.id);
        const paymentStatus = piResponse.status;
        if (paymentStatus === 'succeeded') {
            newDoc.payment = {
                stripeId:piResponse.id,                    
            }
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);

            await this.createMoneyTransaction({ pi:piResponse.id, uid:user.uid!, type:'payment' })
        };
    };

    /**
     * Cria uma transação no banco de dados indicando que foi realizada com dinheiro.
     * 
     * Pode ter sido voltada para comprar créditos, ou para pagar uma subscrição mensal assinada pelo usuário.
     * 
     * @param pi **string -** Identificador de pagamento PaymentIntent fornecido pelo Stripe     
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param type **string -**  Tipo da transação 
     */
    async createMoneyTransaction({ pi, uid, type }:{pi:string, uid:string, type:TransactionWithMoneyType}) {
        const ts = new Date().getTime();
        const monthId = tsToMask({ts, format:['day', 'month', 'year'], seps:['-', '-']})
        const newTransaction:CollectionTypes['transactions'][0]['money'][''] = {
            [pi]:{
                stripeId:pi,
                type:type,                        
            }
        }
        // const oi = '' as unknown as CollectionTypes['transactions'][0]['money']['']        
        await admin_firestore.collection('transactions').doc(uid).collection('money').doc(monthId).set(newTransaction, {merge:true});
    };

    /**
     * Cria uma transação no banco de dados indicando que foi realizada com os créditos que o usuário havia previamente comprado.
     * 
     * @param amount **number -** Quantidade de créditos que foi usado nesta transação
     * @param service **string -** Serviço  disponibilizado pelo modelo de negócio
     * @param type **string -** Tipo de ação disponibilizado pelo serviço que foi usufruido para gerar esta transação
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     */
    async createCreditTransaction({ amount, service, type, uid, nature, piRelated }:{amount:number, service:TransactionWithCreditsService, type:TransactionWithCreditsType, uid:string, nature:TransactionWithCreditsNature, piRelated:TransactionWithCreditsPiRelated}) {
        const ts = new Date().getTime();
        const monthId = tsToMask({ts, format:['day', 'month', 'year'], seps:['-', '-']})
        const id = String(ts);
        const newTransaction:CollectionTypes['transactions'][0]['credits'][''] = {
            [id]:{
                id,
                amount,
                service,
                type,
                nature,
                piRelated
            }
        }
        // const oi = '' as unknown as CollectionTypes['transactions'][0]['money']['']        
        await admin_firestore.collection('transactions').doc(uid).collection('money').doc(monthId).set(newTransaction, {merge:true});
    };

};