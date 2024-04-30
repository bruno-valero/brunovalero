
/** **Nova Coleção** Registra informações administrativas sobre o usuário. */
export type UsersControl = {
    /** Privilégios de recursos gratuitos que o usuário recebe por fazer certas ações no sistema */
    PrivilegesFreeServices:Record<string, UsersControlPrivileges>,
};


/** Um dos Privilégios de recursos gratuitos que o usuário recebe por fazer certas ações no sistema */
export type UsersControlPrivileges = {
    /** ID único do privilégio */
    id:string,
    /** Título do privilégio */
    privilegeTitle:string,
    /** Descrição do privilégio */
    privilegeDescription:string,
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