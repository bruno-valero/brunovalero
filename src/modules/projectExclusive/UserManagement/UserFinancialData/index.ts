import { isProduction } from "@/envs";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { UsersFinancialData } from "@/src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import { ControlPlanReadPdfPlans } from "@/src/config/firebase/firebaseFunctions/functions/src/config/firebase-admin/collectionTypes/control";
import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
import Stripe from "stripe";
import UserManagement from "..";
import Payment from "../../UploadPdfProcess/Payment";
import UserPrivileges from "../UserPrivileges";

export default class UserFinancialData {

    payment:Payment;
    stripe:StripeBackend;
    stripeId:'stripeId' | 'stripeIdDev';
    userPrivileges:UserPrivileges;
    userManagement:UserManagement

    constructor() {

        const stripeId = isProduction ? 'stripeId' : 'stripeIdDev';
        this.payment = new Payment();
        this.stripeId = stripeId;
        this.stripe = new StripeBackend(isProduction ? 'production' : 'test');
        this.userPrivileges = new UserPrivileges();
        this.userManagement = new UserManagement();
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
        // this.stripe.stripe.customers.
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
        
        await this.subscribeToFreePlan(uid);
        
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
        
        const customer = await this.userManagement.getStripeId({ uid, userData:user });
        const pI = await stripe.createPaymentIntent({
            amount:Math.ceil(amount * 100), 
            currency:'brl', 
            customer, 
            moreParams:{confirm:true},
            metadata:{
                uid, 
                amount:String(amount),               
            }
        })

        const pi = await stripe.stripe.paymentIntents.retrieve(pI.id);
        await this.updatePointsAmount(pi, amount);
    };

    async updatePointsAmount(pi: Stripe.PaymentIntent, amount:number) {
        const uid = pi.metadata.uid;        
        if (pi.status === 'succeeded' && (pi.metadata.pointsUpdated !== 'true')) {
            await this.stripe.stripe.paymentIntents.update(pi.id, { metadata:{ ...pi.metadata, pointsUpdated:'true' } });

            const resp = await admin_firestore.collection('users').doc(uid).collection('control').doc('PrivilegesFreeServices').get();
            const fd = resp.data() as UsersFinancialData;
            const credits = fd.credits;
    
            const financialData:Partial<UsersFinancialData> = {
                credits: credits + amount,
            };
    
            await admin_firestore
                .collection('users').doc(uid)
                .collection('control').doc('PrivilegesFreeServices')
                .update(financialData);
            
            await this.payment.createMoneyTransaction({ pi:pi.id, uid, type:"payment" });
            await this.payment.createCreditTransaction({ amount, service:'none', type:'none', uid, nature:'aquisition', piRelated:pi.id })            
        }
    }


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

        if (pmAmount === 1) {            
            console.log(`Tornando como default paymente method.....`)
            await this.stripe.stripe.customers.update(stripeId, {
                invoice_settings:{
                    default_payment_method:paymentMethods.data[0].id,
                }
            });            
            console.log(`Default paymente method setado com sucesso! ${paymentMethods.data[0].id}`)
        }

        return user;
    };


    async subscribeToPlan({ user, plan }:{ user:Omit<UsersUser, 'control'>, plan:Stripe.Price }) {
        const customer = await this.userManagement.getStripeId({ uid:user.uid, userData:user });
        const subs = await this.stripe.stripe.subscriptions.search({query: `metadata["stripeId"]:"${customer}" AND metadata["service"]:"readPdf"`})
        console.log(`${subs.data.length} subs encontradas.`)
        await Promise.all(subs.data.map(async(item) => {
            const sub = await this.stripe.stripe.subscriptions.retrieve(item.id);
            if (sub.status === 'active') {
                console.log(`desativando >> ${item.id}`)
                await this.stripe.stripe.subscriptions.update(item.id, { metadata:{ ...item.metadata, canceledToCreateOther:'true' } })
                await this.stripe.stripe.subscriptions.cancel(item.id);
            }
        }));

        // if (0 < 1) return;

        const sub = await this.stripe.stripe.subscriptions.create({
            customer,
            items:[{price:plan.id, quantity: 1}],
            metadata:{
                stripeId:customer,
                plan:plan.nickname,
                uid:user.uid,
                service:plan.metadata.service
            },                                
        });

        const retSub = await this.stripe.stripe.subscriptions.retrieve(sub.id);
        
        if (retSub.status === 'active') {
            await this.updateUserActivePdfPlanFirebase(user.uid, plan.nickname as any);
            return retSub;
        };

        return null;
    };

    async subscribeToFreePlan(uid:string) {
        const resp = await admin_firestore.collection('users').doc(uid).get();
        const user = resp.data() as Omit<UsersUser, 'control'>

        const plansResp = await admin_firestore.collection('control').doc('plans').collection('readPdf').doc('free').get();
        const freePlan = plansResp.data() as ControlPlanReadPdfPlans;

        await this.subscribeToPlan({ user, plan:freePlan.stripePrice });
    }

    async subscribeToStandardPlan(uid:string) {
        const resp = await admin_firestore.collection('users').doc(uid).get();
        const user = resp.data() as Omit<UsersUser, 'control'>

        const plansResp = await admin_firestore.collection('control').doc('plans').collection('readPdf').doc('standard').get();
        const freePlan = plansResp.data() as ControlPlanReadPdfPlans;

        await this.subscribeToPlan({ user, plan:freePlan.stripePrice });
    }

    async subscribeToEnterprisePlan(uid:string) {
        const resp = await admin_firestore.collection('users').doc(uid).get();
        const user = resp.data() as Omit<UsersUser, 'control'>

        const plansResp = await admin_firestore.collection('control').doc('plans').collection('readPdf').doc('enterprise').get();
        const freePlan = plansResp.data() as ControlPlanReadPdfPlans;

        await this.subscribeToPlan({ user, plan:freePlan.stripePrice });
    }

    async updateUserActivePdfPlanFirebase(uid:string, plan:'free' | 'standard' | 'enterprise') {
        const fd = await this.getFinancialData({ uid });
        if (!fd) throw new Error("Financial Data não encontrada");
        
        await admin_firestore.collection('users').doc(uid).collection('control').doc('financialData').update({ activePlan:{ ...fd.activePlan, readPdf:plan } });
        if (plan === 'free') {
            await this.userPrivileges.freePlanMonthlyPrivilege(uid)
        } else if (plan === 'standard') {
            await this.userPrivileges.standardPlanMonthlyPrivilege(uid)
        } else if (plan === 'enterprise') {
            await this.userPrivileges.enterprisePlanMonthlyPrivilege(uid)
        }
        return true;
    }

    async scheduleUpdateUserPlan({ user }:{ user:Omit<UsersUser, 'control'> }) {
        const customer = await this.userManagement.getStripeId({ uid:user.uid, userData:user });

        const subs = await this.stripe.stripe.subscriptions.search({query: `customer:'${customer}'`});
        if (subs.data.length === 0) {
            await this.updateUserActivePdfPlanFirebase(user.uid, 'free');
            return;
        }
        const plan = subs.data[0].metadata.plan as 'free' | 'standard' | 'enterprise';
        if (plan === 'standard') {
            await this.updateUserActivePdfPlanFirebase(user.uid, 'standard');
        } else if (plan === 'enterprise') {
            await this.updateUserActivePdfPlanFirebase(user.uid, 'enterprise');
        } else if (plan === 'free') {
            await this.updateUserActivePdfPlanFirebase(user.uid, 'free');
        }
    }


};