import { PdfParsedData, PdfParsedMetadata, VectorStoreResponseSourceDocuments } from "@/src/modules/VectorStoreProcess";

/** Serviço de upload e leitura de PDFs */
export type ReadPdf = {
    /** (Não sei se usarei esta variável) Panos disponíveis para este serviço. */
    plans:{
        current:'free' | 'standard' | 'enterprise',

    },
    /** **Nova coleção no documento** Um objeto, onde cada chave é um Pdf após a leitura de um arquivo PDF atravéz do serviço "readPdf" */
    data:Record<string, Pdf>,
}


/** Pdf após a leitura de um arquivo PDF atravéz do serviço "readPdf" */
export type Pdf = {
    /** ID único do pdf. */
    id:string,
    /** Título opcional, customizável pelo usuário. */
    customTitle?:string,
    /** Url do pdf guardado no Firebase Storage. */
    pdfUrl:string,
    /** ID único do usuário que gerou o pdf (se foi gerado pelo adm o ID deve ser "public"). */
    userId:string,
    /** Preço para a geração do pdf. */
    price:number,
    /** Descrição do quiz. */
    description:string,
    /** Indica se o pdf é público. */
    public:boolean,
    /** Indica se o pagamento foi feito. */
    payment?:{
        /** ID único do pagamento fornecido pelo stripe. */
        stripeId:string,
        /** Indica se o pagamento foi devilvido. */
        devolution?:{
            /** ID único da devolução fornecido pelo stripe. */
            stripeId:string,
        },
    },
    /** Data de criação do pdf (deve estar em formato timestamp, porém transformado em string). */
    dateOfCreation:string,
    /** Metadata do pdf. */
    metadata:PdfParsedMetadata,
    /** Imagens da capa do pdf.
     * 
     * Apenas uma será usada para representar o conteúdo, é a que possuir a variável **active = true**. */
    imageCover:{
        /** URL da imagem de fundo. */
        url:string, 
        /** Caminho da imagem de fundo no firebase storage. */
        storagePath:string,
        /** Indica se esta capa foi escolhida para estar ativa pelo usuário (quando uma capa é ativada, as outras devem ser desativada, de forma que apenas uma permaneça ativa). */
        active:boolean, 
        /** outros tamanhos da imagem. */
        sizes:{
            min:{
                /** URL da imagem de fundo. */
                url:string, 
                /** Caminho da imagem de fundo no firebase storage. */
                storagePath:string,
            },
            sm:{
                /** URL da imagem de fundo. */
                url:string, 
                /** Caminho da imagem de fundo no firebase storage. */
                storagePath:string,
            },
            md:{
                /** URL da imagem de fundo. */
                url:string, 
                /** Caminho da imagem de fundo no firebase storage. */
                storagePath:string,
            },
        }
    }[],
    /** **Nova coleção no documento** Um objeto, onde cada chave é uma Pergunta que pode ser gerada após o processo de upload e leituda de um pdf atravéz do serviço "readPdf". */
    questions:Record<string, QuestionPdf>,
    /** **Nova coleção no documento:** Um objeto, onde cada chave é um Quiz que pode ser gerado após ou durante o processo de upload e leituda de um pdf atravéz do serviço "readPdf". */
    quiz:Record<string, QuizPdf>,
}

/** Pergunta que pode ser gerada após o processo de upload e leituda de um pdf atravéz do serviço "readPdf". */
export type QuestionPdf = {
    /** ID único da pergunta. */
    id:string,
    /** ID único do usuário que realizou a pergunta. */
    userId:string,
    /** Preço da pergunta. */
    price:number,
    /** Texto da pergunta, ou seja, a pergunta em si */
    question:string,
    /** Resposta da pergunta */
    response:{
        /** Trechos do texto que foram usados para responder a pergunta */
        chunksRelated:VectorStoreResponseSourceDocuments,
        /** Texto da resposta, ou seja, a resposta em si  */
        text:string,
    },
};

/** Quiz que pode ser gerado após ou durante o processo de upload e leituda de um pdf atravéz do serviço "readPdf". */
export type QuizPdf = {
    /** ID único do quiz. */
    id:string,
    /** ID único do pdf ao qual o quiz foi gerado. */
    docId:string,
    /** ID único do usuário que gerou o quiz (se foi gerado pelo adm o ID deve ser "public"). */
    userId:string,
    /** Título do quiz. */
    title:string,
    /** Descrição do quiz. */
    description:string,
    /** Indica se o quiz é público. */
    public:boolean,
    /** Preço para a geração do quiz. */
    price:number,
    /** Imagem de fundo do quiz, em diferentes proporções. */
    imageBackground:{
        /** Imagem de fundo em proporção ampla. */
        wide:{
            /** URL da imagem de fundo. */
            url:string, 
            /** Caminho da imagem de fundo no firebase storage. */
            path:string
        },
        /** Imagem de fundo em proporção estreita. */
        slim:{
            /** URL da imagem de fundo. */
            url:string, 
            /** Caminho da imagem de fundo no firebase storage. */
            path:string            
        },
    },
    /** Trechos de conteúdo relacionados ao quiz. */
    chunksRelated:{
        /** Conteúdo da página. */
        pageContent:string, 
        /** Metadados do PDF. */
        metadata:PdfParsedData[0]['info']        
    }[],
    /** Perguntas do quiz. */
    questions:Record<string, {
        /** ID único da pergunta. */
        id:string,
        /** Texto da pergunta. */
        question:string,
        /** Resposta correta da pergunta. */
        answer:string,
        /** Opções de resposta. */
        options:{
            a:string,
            b:string,
            c:string,
            d:string,
            e:string,
        },
    }>,
    /** **Nova coleção no documento** Um objeto, onde cada chave é um Tentativa do quiz feita por um usuário (opcional). */
    tries?:Record<string, QuizPdfTry>,
};

/** Tentativa do quiz feita por um usuário (opcional). */
export type QuizPdfTry = {
    /** ID único da tentativa. */
    id:string,
    /** ID único do quiz ao qual esta tentativa foi feita. */
    quizId:string,
    /** ID único do usuário que realizou a tentativa. */
    userId:string,
     /** Perguntas respondidas na tentativa. */
    questions:Record<string, {
        /** ID único da pergunta. */
        id:string,
        /** Tempo gasto para responder a pergunta. */
        timeAnswering:number,
        /** Opção correta da pergunta. */
        rightOption:string,
        /** Resposta selecionada pelo usuário. */
        answer:string,
    }>,
    /** Pontuação da tentativa. */
    score:number,
    /** Observação de desempenho. */
    performanceObservation:string,
    /** Dica fornecida baseado no desempenho. */
    tip:string,
};