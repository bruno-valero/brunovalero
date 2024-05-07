import { Cotacao } from "@/src/modules/projectExclusive/UpdateDollarPrice";

/** **Coleção Raiz** Registra dados administrativos sobre o negócio */
export type Control = {
    /** Contém variaveis importantes para o funcionamento do negócio */
    variables:ControlVariables,
    /** Contém informações sobre os planos de serviço para todos os serviços fornecidos */
    plans:ControlPlan,    
};

/** Contém variaveis importantes para o funcionamento do negócio */
export type ControlVariables = {
    /** Contém registros sobre o preço do Dollar com relação a outras moedas.
     * 
     * Esta variável deve ser atulizada diariamente.
     * 
     * Atualmente o métodod **UpdateDollarPrice.priceOnBackEnd** está sendo responsável por fazer esta atualização.
     */
    dollarPrice:{
        /** Contém registros sobre o preço do Dollar com relação ao Real Brasileiro (**BRL**) */
        brl:{
            /** Preço do Dollar em Real */
            price:number,
            /** Última atualização no sistema */
            updateTime:number,
            /** Dados mais específicos sobre a cotação do Dollar */
            metadata:Cotacao,
        }
    }
};

/** Contém informações sobre os planos de serviço para todos os serviços fornecidos */
export type ControlPlan = {
    /** **Nova Coleção** Contém informações sobre os planos de serviço para serviço de **upload e leitura de PDFs** */
    readPdf:{
        /** Contém informações sobre os plano de serviço **gratuito** para o serviço de **upload e leitura de PDFs** */
        free:ControlPlanReadPdfPlans,
        /** Contém informações sobre os plano de serviço **standard (intermediário)** para o serviço de **upload e leitura de PDFs** */
        standard:ControlPlanReadPdfPlans,
        /** Contém informações sobre os plano de serviço **enterprise (empresarial)** para o serviço de **upload e leitura de PDFs** */
        enterprise:ControlPlanReadPdfPlans,
    },
};


/** Contém informações sobre os planos **free, standar e enterprise** para serviço de **upload e leitura de PDFs** */
export type ControlPlanReadPdfPlans = {
    /** nome customizável do plano */
    customName:'Básico' | 'Empreendedor' | 'Prêmium',
    /** Informações sobre as perguntas por mês que o usuário tem permissão de fazer */
    questionsPerMonth:{
        /** Número de perguntas por mês que o usuário tem permissão de fazer */
        amount:number | 'unlimited',
        /** Preço de cata pergunta que o usuário tem permissão de fazer */
        price:number,
    },
    /** Informações sobre os uploads de PDFs por mês que o usuário tem permissão de fazer */
    pdfUploadsPerMonth:{
        /** Número de uploads de PDFs por mês que o usuário tem permissão de fazer */
        amount:number | 'unlimited',
        /** Preço de cata upload de PDFs que o usuário tem permissão de fazer */
        chunkOfWords:number,
        /** Preço de cata upload de PDFs que o usuário tem permissão de fazer */
        pricePerChunkOfWords:number,
    },
    /** Número total de documentos que o usuário tem permissão de possuir.
     * 
     * Ao atingir este número há duas opções:
     * 
     * **Opção 1** - O usuário muda de plano escolhendo um que possibilite o permita possuir um número total de PDFs maior do que o plano atual.
     
    * **Opção 2** - O usuário apaga alguns PDFs carregados no sistema, perdendo todas as informações relacionads a ele, como Perguntas ou Quizes realizados
     */
    docsPeruser:PlanValue,
    /** Número total de Quizes que o usuário tem permissão de gerar em cada documento pdf disponível */
    quizPerDoc:{
        /** Informações sovre o total de Quizes que o usuário tem permissão de gerar em cada documento privado, ou seja, apenas aqueles que o próprio usuário carregou no sistema */
        privateDoc:{
            /** Número total de Quizes que o usuário tem permissão de gerar em cada documento privado, ou seja, apenas aqueles que o próprio usuário carregou no sistema */
            amount:PlanValue,
            /** Informações sovre os Quizes que o usuário tem permissão de gerar por mês em documentos privados, ou seja, apenas aqueles que o próprio usuário carregou no sistema */
            generations:{
                /** Número de Quizes que o usuário tem permissão de gerar por mês em documentos privados, ou seja, apenas aqueles que o próprio usuário carregou no sistema */
                amount:PlanValue,
                /** Preço de cada Quiz que o usuário fizer em documentos em documentos privados, ou seja, apenas aqueles que o próprio usuário carregou no sistema */
                price:number
            },
        },
        /** Número total de Quizes que o usuário tem permissão de gerar em cada documento público, ou seja, apenas aqueles que estão disponíveis publicamente para todos os usuários.
         * 
         * **Observação:** Os Quizes gerados pelo usuário em documentos públicos somente serão visíveis para  o usuário que o gerou.
         * Isto serve para abrir a possibilidade de não obrigar o usuário a carregar um documento para depois poder gerar um Quiz.
         * Dessa forma é possivel gerar Quizes novos sem nunca ter carregado um documento.
         */
        publicDoc:{
            /** Número total de Quizes que o usuário tem permissão de gerar em cada documento público, ou seja, apenas aqueles que estão disponíveis publicamente para todos os usuários
            
            * **Observação:** Os Quizes gerados pelo usuário em documentos públicos somente serão visíveis para  o usuário que o gerou.
                * Isto serve para abrir a possibilidade de não obrigar o usuário a carregar um documento para depois poder gerar um Quiz.
                * Dessa forma é possivel gerar Quizes novos sem nunca ter carregado um documento.
             */
            amount:PlanValue,
            /** Informações sovre os Quizes que o usuário tem permissão de gerar por mês em documentos públicos, ou seja, apenas aqueles que estão disponíveis publicamente para todos os usuários
            
            * **Observação:** Os Quizes gerados pelo usuário em documentos públicos somente serão visíveis para  o usuário que o gerou.
                * Isto serve para abrir a possibilidade de não obrigar o usuário a carregar um documento para depois poder gerar um Quiz.
                * Dessa forma é possivel gerar Quizes novos sem nunca ter carregado um documento.
             */
            generations:{
                /** Número de Quizes que o usuário tem permissão de gerar por mês em documentos públicos, ou seja, apenas aqueles que estão disponíveis publicamente para todos os usuários
                
                * **Observação:** Os Quizes gerados pelo usuário em documentos públicos somente serão visíveis para  o usuário que o gerou.
                * Isto serve para abrir a possibilidade de não obrigar o usuário a carregar um documento para depois poder gerar um Quiz.
                * Dessa forma é possivel gerar Quizes novos sem nunca ter carregado um documento.
                 */
                amount:PlanValue,
                /** Preço de cada Quiz que o usuário fizer em documentos em documentos públicos, ou seja, apenas aqueles que estão disponíveis publicamente para todos os usuários
                
                * **Observação:** Os Quizes gerados pelo usuário em documentos públicos somente serão visíveis para  o usuário que o gerou.
                * Isto serve para abrir a possibilidade de não obrigar o usuário a carregar um documento para depois poder gerar um Quiz.
                * Dessa forma é possivel gerar Quizes novos sem nunca ter carregado um documento.
                 */
                price:number
            },
        },
    },
    /** Informações sobre o total Capas de documentos (Pdf) que o usuário tem permissão de gerar em cada documento. */
    coverPerDoc:{
        /** Número total Capas de documentos (Pdf) que o usuário tem permissão de gerar em cada documento. */
        amount:PlanValue,
        /** Preço da geração de cada capa. */
        price:number
    },
    /** Informações sobre a execussão de perguntas para mais de um document (pdf) simultâneo. */
    multiDocsQuestions:{
        /** Informações sobre a execussão de perguntas para até três documentos (pdf) simultâneos. */
        upToThreeDocs:{
            /** Número de perguntas que o usuário tem permissão de fazer para até três documentos (pdf) simultâneos. */
            amount:number | 'unlimited',
            /** Preço de cada pergunta realizada para até três documentos (pdf) simultâneos. */
            price:number,
        },
        /** Informações sobre a execussão de perguntas para mais de três documentos (pdf) simultâneos. */
        moreThanThreeDocs:{
            /** Número de perguntas que o usuário tem permissão de fazer para mais de três documentos (pdf) simultâneos. */
            amount:number | 'unlimited',
            /** Preço de cada pergunta realizada para mais de três documentos (pdf) simultâneos. */
            price:number,
        },
    },
};

type PlanValue = number | 'unlimited';
type PlanAmountAndPrice ={
    amount:number | 'unlimited',
    price:number,
};