import { isProduction } from "@/envs";
import { UsersUser, userSchema } from "@/src/config/firebase-admin/collectionTypes/users";
import { admin_auth, admin_firestore } from "@/src/config/firebase-admin/config";
import z from "zod";
import StripeBackend from "../../stripe/backend/StripeBackend";

export default class UserManagement {

    constructor() {



    };


    async createUser(uid:string) {

        if (!uid) throw new Error("Identificador de usuário inválido!");
        const user = await admin_auth.getUser(uid);
        const userModel:z.infer<typeof userSchema> = {
        name:user.displayName!,
        email:user.email!,
        image:user.photoURL!,      
        uid:user.uid,
        id:String(new Date().getTime()),
        };
        const parse = userSchema.safeParse(userModel);
        if (!parse.success) throw new Error("O usuário contém o Schema de dados incorreto!");
        const data = userSchema.parse(userModel);

        const stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
        const stripeCus = await stripeBackend.stripe.customers.create({
            email:data.email,
            name:data.name,
            metadata:{
                uid:data.uid,
            }
        })
        data[isProduction ? 'stripeId' : 'stripeIdDev'] = stripeCus.id;

        await admin_firestore.collection('users').doc(uid).set(data);
        return { authUser:user, userData:data };
    };


    /**
     * Busca o identificador único de usuário sedido pelo Stripe. 
     * 
     * Se ele não for encontrado no banco de dados, cria um novo usuário no Stripe e salva seu ID no banco de dados, em seguida retorna seu valor.
     * 
     * Se ele for encontrado no banco de dados, retorna seu valor.
     * 
     * @param uid **string -** ID único de usuário fornecido pelo Firebase Auth
     * @param userData **Omit(UsersUser, 'control') [opicional] -** Dados do usuário, se forem passados, evita uma requisição ao Firebase para obtê-los.
     * @returns Retorna o ID único do usuário sedido pelo Stripe, correspondente com o modo atual, seja "Desenvolvimento" ou "Produção"
     */
    async getStripeId({ uid, userData }:{uid:string, userData?:Omit<UsersUser, 'control'>}) {
        
        let user:Omit<UsersUser, 'control'> | null;
        if (userData) {
            user = userData;
        } else {
            const userSnap = await admin_firestore.collection('users').doc(uid).get();
            user = (userSnap.exists ? userSnap.data() : null) as Omit<UsersUser, 'control'> | null;
            if (!user) throw new Error(`Usuário "${uid}" não encontrado`);
        }

        const idType = isProduction ? 'stripeId' : 'stripeIdDev';
        if (!user[idType]) {
            const cus = await (new StripeBackend(isProduction ? 'production' : 'test')).stripe.customers.create({
                email:user.email,
                name:user.name,
                metadata:{
                    uid:user.uid,
                }
            });
            await admin_firestore.collection('users').doc(uid).update({idType:cus.id});
            return cus.id;
        }
        return user[idType];
    };

};