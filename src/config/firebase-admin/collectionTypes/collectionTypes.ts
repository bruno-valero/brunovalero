import { Control } from "./control";
import { ReadPdf } from "./pdfReader";
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
    /** **Coleção Raiz** Registra quais são todas as transações financeiras realizadas */
    transactions:Record<string, Record<string, {
        /** ID único do stripe identificando a trasazão */
        stripeId:string,
        type:string,
    }>>
}