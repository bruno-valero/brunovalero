import { UsersControl } from "./control"

/** **Coleção Raiz** Registra quais são todos os usuário que fizeram login */
export type Users = Record<string, {
    /** **Nova Coleção** Registra informações administrativas sobre o usuário. */
    control:UsersControl
}>