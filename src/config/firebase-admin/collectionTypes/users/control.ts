
/** **Nova Coleção** Registra informações administrativas sobre o usuário. */
export type UsersControl = {
    /** Privilégios de recursos gratuitos que o usuário recebe por fazer certas ações no sistema */
    PrivilegesFreeServices:Record<string, UsersControlPrivileges>,
    /** **Document do Firestore** Dados financeiros com relação ou modelo de negócio */
    financialData:UsersFinancialData,
};

/** **Document do Firestore** Dados financeiros com relação ou modelo de negócio */
export type UsersFinancialData = {
    /** Opção ativada pelo usuário que permite a compra automática de créditos quando o valor a ser gasto supera os créditos
     * 
     * Este objeto contém os dados referentes a esta permissão
     * 
     */
    autoBuyCredits:{
        /** Opção ativada pelo usuário que permite a compra automática de créditos quando o valor a ser gasto supera os créditos
         * 
         * se o valor for **true**, significa que o usuário permitiu a compra automática.
         */
        allow:boolean,
        /** Valor a ser usado para realizar a compra automática de créditos quando o valor a ser gasto supera os créditos */
        amount:number
    },
    /** Quantidade de créditos que o usuário comprou e mantém reservado */
    credits:number,
    /** Número de formas de pagamento que o usuário tem registrado.
     * 
     * As formas de pagamento em si não são registradas no sistema por questão de segurança.
     * 
     * Esta variável somente indica se o usuário já cadastrou alguma forma de pagamento, visando facilitar a comunicação com o Front End.
     */
    paymentMethods:number,
    /** Os planos de assinatura que o usuário possui ativos */
    activePlan:{
        /** Indica qual plano de assinatura o usuário assinou para o serviço de "Leitura de PDFs" */
        readPdf:'free' | 'standard' | 'enterprise',
    },
    upcomingPlans?:{
        readPdf:{
            plan:'free' | 'standard' | 'enterprise',
            requestDate:string,
            takeEffectDate:string,
        }
    }
}


/** Um dos Privilégios de recursos gratuitos que o usuário recebe por fazer certas ações no sistema */
export type UsersControlPrivileges = {
    /** ID único do privilégio */
    id:string,
    /** Título do privilégio */
    privilegeTitle:string,
    /** Nível do privilégio (deve ser numérico), quanto maior for o nível, indica superioridade de atributos */
    level:number,
    /** Descrição do privilégio */
    privilegeDescription:string,
    /** timestamp da última atualização deste privilégio */
    lastUpdate:string,
    /** mês em formato dd-mm-aaaa da última atualização deste privilégio */
    lastMonthUpdate:string,
    /** indica se este privilégio será renovado todo mês */
    isMonthly:boolean,
    /** Os benefícios que o privilégio concede ao usuário */
    privilegeData: {
        /** Os benefícios relacionado ao serviço de Leitura de PDFs (**"readPdf"**) */
        readPdf:{
            /** Número restante de questões gratuitas que o usuário pode fazer **para qualquer um dos PDFs** */
            questions:number,
            /** Número restante de uploads gratuitos de pdf que o usuário pode realizar */
            pdfUpload:number,
             /** Número restante de **Geração de Quiz** gratuitos que o usuário pode realizar */
            quizGeneration:{
                /** Número restante de **Geração de Quiz** gratuitos em **documetos privados** que o usuário pode realizar */
                privateDocs:number,
                /** Número restante de **Geração de Quiz** gratuitos em **documetos públicos** que o usuário pode realizar */
                publicDocs:number,
            },
            /** Número restante de **Geração de Capa Para Documentos** gratuitas que o usuário pode realizar */
            coverGenerationForPrivateDocs:number,
        },
    }
};