import z from "zod"
import { UsersControl } from "./control"

/** **Coleção Raiz** Registra quais são todos os usuário que fizeram login */
export type Users = Record<string, UsersUser>

export type UsersUser = {
    /** **Nova Coleção** Registra informações administrativas sobre o usuário. */
    control:UsersControl,
    
    /** ID único de usuário gerado pelo **Firebase Authenticator**. */
    uid:string,
    /** ID único de usuário gerado ao criar uma conta. */
    id:string,
    /** ID único de Customer gerado pelo stripe. Deve ser usado em Produção */
    stripeId:string,
    /** ID único de Customer gerado pelo stripe. Deve ser usado em Desenvolvimento */
    stripeIdDev:string,
    /** Nome do usuário */
    name:string,
    /** Email do usuário */
    email:string,
    /** Url da foto do usuário */
    image:string,
}


export const userSchema = z.object({
    uid:z.string().min(5),
    id:z.string().min(5),
    stripeId: z.string().min(5).optional(),
    stripeIdDev: z.string().min(5).optional(),
    name: z.string().min(2),
    email: z.string().email(),
    image: z.string().url(),
})