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
     * @returns Retorna os dados financeiros que foram criados
     */
    async create(uid:string) {        
        
        const financialData:UsersFinancialData = {
            activePlan:{
                readPdf:'free',
            },
            autoBuyCredits:{
                allow:false,
                amount:10,
            },
            credits:0,
            paymentMethods:0,
        };

        
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('financialData')
            .set(financialData, {merge:true});
        
        return financialData;
    };

    /**
     * Realiza a compra de créditos para um determinado usuário
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param amount **number -** Quantidade de créditos comprada (é a mesma quantiade de Reais)
     */
    async buyCredits({ uid, amount }:{uid:string, amount:number}) {
        
        const hasPaymentMethods = await this.hasPaymentMethods({ uid });
        if (!hasPaymentMethods) throw new Error("O usuário não possui métodos de pagamento cadastrados");

        const stripe = this.stripe;
        const userSnap = await admin_firestore.collection('users').doc(uid).get();
        const user = userSnap.exists ? userSnap.data() as UsersUser : null;
        if (!user) throw new Error("Usuário inválido");
        
        const customer = user[isProduction ? 'stripeId' : 'stripeIdDev']
        const pi = await stripe.createPaymentIntent({ 
            amount:Math.ceil(amount * 100), 
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
     * Gasta a quantidade de créditos fornecidapelo sistema.
     * 
     * Caso o usuário não tenha créditos o suficiente ou tenha menos do que R$5,00 de crédito e a opção "autoBuy" (do financialData) não esteja a tiva, nem o parâmetro "autoBuy" seja **true**, retornará um erro. Caso contrário irá comprar os créditos para pagar pela transação inciada
     * 
     * Caso o usuário já tenha os créditos sufuciantes, irá descontá-los.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param amount **number -** Quantidade de créditos gasta (é a mesma quantiade de Reais)
     * @param autoBuy **boolean [opicional] -** Se esta opção estiver ativada, caso o usuário não tenha créditos o suficiente, o sistema ierá comprar mais créditos automaticamente e então irá finalizar que tinha iniciado
     * @param minCredits **number [opicional] -** Determinará qual o valor mínimo de créditos que o usuário deve ter reservado
     * @returns 
     */
    async spendCredits({uid, amount, autoBuy, minCredits}:{uid:string, amount:number, autoBuy?:boolean, minCredits?:number}) {
        const fd = await this.checkMinCredits({ uid, autoBuy, minCredits }); 
        fd.credits       
        const update = {
            credits:fd.credits - amount,
        }
        await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').update(update);
        
    };

    /**
     * Faz uma checagem nos créditos do usuário para saber se estão dentro do valor mínimo estabelecido.
     * 
     * Caso não tenha o valor estipulado e não possuir a opção de "autoBuyCredits" habilitada e não tiver o argumento autoBuy = true, então retorna m erro.
     * 
     * Caso tenha permitido a compra automática, executa a compra e quando tiver o valor estipulado, retorna os dados financeiros
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param autoBuy **boolean -** Se esta opção estiver ativada, caso o usuário não tenha créditos o suficiente, o sistema irá comprar mais créditos automaticamente.
     * @param minCredits **number [opicional] -** Determinará qual o valor mínimo que o usuário deve ter reservado
     * @returns Retrna os dados financeiros do usuário (pode retrnar um erro, leia acima)
     */
    async checkMinCredits({ uid, autoBuy, minCredits }:{ uid:string, autoBuy?:boolean, minCredits?:number }) {
        minCredits = minCredits ?? 5;        
        const snap = await admin_firestore.collection('users').doc(uid).get();
        const user = (snap.exists ? snap.data() : null) as Omit<UsersUser, 'control'> | null;
        if (!user) throw new Error("usuário inválido");        
        let fd:UsersFinancialData | null
        fd = await this.getFinancialData({ uid });

        const checkAutoby = async (fd:UsersFinancialData, autoBuy:boolean) => {
            if (autoBuy && minCredits) {
                await this.buyCredits({ uid, amount:minCredits });
                return fd;
            }
            throw new Error("créditos insuficientes");
        }

        if (!fd) {
            fd = await this.create(uid);
            const newFd = await checkAutoby(fd, autoBuy ?? false);
            return newFd;            
        } else {
            if (fd.credits < minCredits) {
                const newFd = await checkAutoby(fd, fd.autoBuyCredits.allow || (autoBuy ?? false));
                return newFd; 
            }
            return fd;
        }
        

    }

    /**
     * Altera as informações relacionadas com a autorização de compra automática de créditos, realizada assim que a quantidade de créditos disponíveis não seja o suficiente para suprir um gasto.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param autoBuyCredits **UsersUser['control']['financialData']['autoBuyCredits'] -** Dados relacionados ao autoByCredits do financialData
     * @returns restorna os dados presentes no documento financialData
     */
    async changeAutoBy({ uid, autoBuyCredits }:{ uid:string, autoBuyCredits:UsersUser['control']['financialData']['autoBuyCredits'] }) {

        const fd = await this.getFinancialData({ uid });
        if (!fd) throw new Error("Dados financeiros não disponíveis");
        await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').update(autoBuyCredits);
        return fd;

    }


    /**
     * Busca os dados financeiros do uduário armazenados no banco de dados.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @returns Se os dados financeiras não forem encontrados, retorna **null**, caso contrário, retorna os dados financeiros.
     */
    async getFinancialData({ uid }:{ uid:string }) {
        const snap = await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').get();
        const fd = (snap.exists ? snap.data() : null) as UsersUser['control']['financialData'] | null;
        if (!fd) return null;
        return fd;
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