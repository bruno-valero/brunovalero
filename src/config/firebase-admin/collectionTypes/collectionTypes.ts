import { Control } from "./control";
import { ReadPdf } from "./pdfReader";
import { Transactions } from "./transactions";
import { Users } from "./users";


/** **Todas as Coleções e Sub-Coleções do Firebase Firestore** */
export type CollectionTypes = {
    /** **Coleção Raiz** Registra dados administrativos sobre o negócio */
    control:Control,
    /** **Coleção Raiz** Registra quais são todos os usuário que fizeram login */
    users:Users,
    /** **Coleção Raiz** Registra quais são todos os serviços disponíveis */
    services:{
        /** Serviço de upload e leitura de PDFs */
        readPdf:ReadPdf
    },
    /** **Coleção Raiz** Registra quais são todas as transações financeiras realizadas
     * 
     * Cada documento é um uid (identificador único do firebase auth) de um usuáio.
     * 
     */
    transactions:Transactions,
    /** **Coleção Raiz** cada documento é um Iu único (uid) de usuário */
    userActions:UserActions
};

/** **Coleção Raiz** cada documento é um único (uid) de usuário */
export type UserActions = Record<string, UserActionsMonth>

/** Cada chave é um mês do ano, é um documento da coleção */
export type UserActionsMonth = Record<string, {
    readPdf:{
        questions:string[],
        coverGeneration:string[],
        quizGeneration:string[],
        pdfUploads:string[],
    },
}>;