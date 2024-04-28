import envs from "@/envs";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TokenTextSplitter, TokenTextSplitterParams } from 'langchain/text_splitter';

import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from 'langchain/chains';
import FileForge from "../FileForge";
import { PdfGenresOptions } from "../projectExclusive/PdfGenres";




export type PdfParsedData = {
    info: {
        source: any;
        type: string;
        genres: PdfGenresOptions[];
        title: any;
        author: any;
        page: string;
        docId: string;
        lines?:string;
        vectorID?:string;
    };
    pageContent: string;
    metadata: Record<string, any>;
}[]
type PdfParsedMetadata = {
    source:string,
    type:string,
    genres:string[],
    title:string,
    author:string,
    totalPages:string,
    totalWords:string,
    totalTokens:string,
    docId:string,   
}


export default class VectorStoreProcess {


    constructor() {


    };


    
    protected async readPdf({url, filePath, genres, blob:blobContent, docId}:{url?:string, filePath?:string, blob:Blob, genres?:PdfGenresOptions[], docId:string}) {
        if (!url && !filePath && !blobContent) throw new Error("Nem a url do pdf, nem o caminho do arquivo foram informados.");
        let blob:Blob;
        if (filePath) {
            const file = new FileForge({filePath:{path:filePath, type:'application/pdf'}});
            blob = await file.blob();
        } else if (blobContent) {
            blob = blobContent;
        } else {
            console.log(`lendo pdf por link: ${url}`);
            const resp = await fetch(url!);
            console.log('resposta chegou...');
            console.log('extraindo blob...');
            blob = await resp.blob();
            console.log('blob extrido com sucesso!');
        };
        
        console.log('instanciando o carregador...');
        const loader = new PDFLoader(blob);
        console.log('carregando blob...');
        const pdf = (await loader.load());
        const data:PdfParsedData = pdf.map(item => {
            const info = {
                source:item.metadata?.source,
                type:'pdf',
                genres:genres ?? [],
                title:item.metadata?.pdf?.info?.Title ?? 'desconhecido',
                author:item.metadata?.pdf?.info?.Author ?? 'desconhecido',
                page:`${item.metadata?.loc?.pageNumber}` ?? 'desconhecido',                
                docId,                
            };
            return {
                ...item,
                info
            }
        });
        const dataItem = data[0].info;
        const metadata:PdfParsedMetadata = {
            source:dataItem.source,
            type:dataItem.type,
            genres:dataItem.genres,
            title:dataItem.title,
            author:dataItem.author,
            totalPages:String(data.length),
            totalWords:String(data.map(item => item.pageContent.replaceAll('\n', '').replaceAll(/ +/g, ' ')).join(' ').split(' ').length),
            totalTokens:String(Math.ceil(data.map(item => item.pageContent).join('').length / 3.5)),
            docId,   
        }
        console.log(JSON.stringify(metadata, null, 2));
        return {data, metadata};
    };

    protected async pdfSplitter({data, splitterOptions}:{data:PdfParsedData, splitterOptions?:Partial<TokenTextSplitterParams> | undefined}) {
        const splitter = new TokenTextSplitter(splitterOptions ?? {
            encodingName:'cl100k_base',
            chunkSize:600,
            chunkOverlap:0,
        });
        const splittedPdf = (await splitter.splitDocuments(data)).map((item, i) => {
            const page = {...item} as PdfParsedData[0];
            const metadata = {
                ...page.info,
                lines:page.metadata?.loc?.lines?.from ? `${page.metadata.loc.lines.from}-${page.metadata.loc.lines.to}` : '',
                vectorID:`${page.info.docId}-${i}`,
            };
            const resp = {...page};
            resp.metadata = metadata;
            return resp;
        });

        return splittedPdf;
    }

    protected logInfoPdfPreload({splittedPdf, metadata}:{splittedPdf:PdfParsedData, metadata:PdfParsedMetadata}) {
        const largerTetx = splittedPdf.reduce((acc, item) => {
            return acc.length > item.pageContent.length ? acc : item.pageContent;
        }, '');        
        console.log(`metadata: ${JSON.stringify(splittedPdf[0].metadata, null, 2)}.`);
        console.log(`Maior chunck: ${largerTetx.length} caracteres.`);
        console.log(`Maior chunck: ${Math.ceil(largerTetx.length / 3.5)} tokens aproximadamente.`);
        console.log(`Total de ${metadata.totalTokens} tokens aproximadamente.`);
    }


    protected async pineconeAddPdf({ splittedPdf }:{ splittedPdf:PdfParsedData }) {
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index('semantic-search');
        const embeddings = new OpenAIEmbeddings({openAIApiKey:envs.OPENAI_API_KEY});

        const pineconeStore = new PineconeStore(embeddings, { 
            pineconeIndex,
            maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
            namespace:splittedPdf[0].metadata.docId,
         }); 
         await pineconeStore.addDocuments(splittedPdf, splittedPdf.map(item => item.metadata.vectorID))         
        console.log(`enviado para o index "semantic-search"`);
    }

    async pineconeDeletePdf(namespace:string) {
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index('semantic-search');
        const embeddings = new OpenAIEmbeddings({openAIApiKey:envs.OPENAI_API_KEY});

        const pineconeStore = new PineconeStore(embeddings, { 
            pineconeIndex,
            maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
            namespace:namespace,
         }); 
        await pineconeStore.delete({namespace, deleteAll:true});
        console.log(`pdf ${namespace} deletado com sucesso!`);
    };

    async PDFloader({url, filePath, blob, genres, docId }:{url?:string, filePath?:string, genres?:PdfGenresOptions[], blob:Blob, docId:string}) {
        const file = 'src/modules/VectorStoreProcess/Vade_mecum_2023.pdf';        
        // const { data, metadata } = await this.readPdf({filePath:filePath??file})        
        const { data, metadata } = await this.readPdf({url, filePath, genres, blob, docId});   
        const splittedPdf:PdfParsedData = await this.pdfSplitter({data, splitterOptions:{encodingName:'cl100k_base', chunkSize:600, chunkOverlap:0}})
                
        this.logInfoPdfPreload({metadata, splittedPdf});

        await this.pineconeAddPdf({ splittedPdf });

        return { data, metadata };
    };

    /**
     * Busca por namespaces e não por filters
     * @param question pergunta do usuário
     * @param docId namespace
     * @returns resposta do GPT
     */
    async search(question:string, docId:string) {
        
        console.log(`iniciando...`);       
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index('semantic-search');

        const embeddings = new OpenAIEmbeddings({openAIApiKey:envs.OPENAI_API_KEY});
        const vectorStore = await PineconeStore.fromExistingIndex(
            embeddings,
        { pineconeIndex, namespace:docId }
        );

        console.log(`query: ${question}`);       

        const response = await this.askGpt(question, vectorStore)
        return response;

    };


    protected async askGpt(question:string, vectorStore:PineconeStore) {

        const openAiChat = new ChatOpenAI({
            openAIApiKey:envs.OPENAI_API_KEY,
            modelName:'gpt-3.5-turbo',
            temperature:.3,            
        });

        const prompt = new PromptTemplate({
            template:`
            Você responde perguntas e passa informações.
            O usuário enviou um arquivo em pdf.
            Use estes trechos do conteúdo para sanar a necessidade do usuário.
            Se os trechos não respondem o pedido  do usuário, responda que você não sabe, não tente inventar uma resposta.

            Se possível adicione mais contexto para a resposta.

            trechos:
            {context}

            pergunta:
            {question}
            `.trim(),
            inputVariables:['context', 'question']
        });

        const chain = RetrievalQAChain.fromLLM(openAiChat, vectorStore.asRetriever(), { 
            prompt, 
            returnSourceDocuments:true,
            verbose:true,
         });   
         
         const response = await chain._call({query:question});
         return response;

    };


};