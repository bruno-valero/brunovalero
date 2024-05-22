import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TokenTextSplitter, TokenTextSplitterParams } from 'langchain/text_splitter';
import envs from "../../../envs";

import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from 'langchain/chains';
import { Control } from "../../../src/config/firebase-admin/collectionTypes/control";
import { admin_firestore } from "../../../src/config/firebase-admin/config";
import FileForge from "../FileForge";
import { PdfGenresOptions } from "../projectExclusive/PdfGenres";
import UpdateDollarPrice from "../projectExclusive/UpdateDollarPrice";




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
export type PdfParsedMetadata = {
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

export type VectorStoreResponseSourceDocuments = {pageContent:string, metadata:PdfParsedData[0]['info']}[];

export type VectorStoreProcessSearchResponse = {
    text:string,
    sourceDocuments:VectorStoreResponseSourceDocuments,
};


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

        const checkMetadataValue = (value:any) => {
            if (typeof value === 'string') return value;
            return '';
        }

        const data:PdfParsedData = pdf.map(item => {
            const info = {
                source:item.metadata?.source,
                type:'pdf',
                genres:genres ?? [],
                title:checkMetadataValue(item.metadata?.pdf?.info?.Title ?? '').trim() || 'desconhecido',
                author:checkMetadataValue(item.metadata?.pdf?.info?.Author ?? '').trim() || 'desconhecido',
                page:`${checkMetadataValue(item.metadata?.loc?.pageNumber ?? '').trim()}` || 'desconhecido',                
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
            
            // item.metadata
            const page = {...item} as PdfParsedData[0];
            console.log(`page: ${JSON.stringify(page)}`)
            const { page:oi, ...info } = data[0].info
            const metadata = {
                ...info,
                page:page.metadata?.loc?.pageNumber,
                lines:page.metadata?.loc?.lines?.from ? `${page.metadata.loc.lines.from}-${page.metadata.loc.lines.to}` : '',
                vectorID:`${data[0].info.docId}-${i}`,
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
            
        console.log(`lendo o pdf...${docId}`);   
        const { data, metadata } = await this.readPdf({url, filePath, genres, blob, docId});   
        console.log('dividindo o pdf...');   
        console.log(`data[0].info: ${JSON.stringify(data[0].info)}`);   
        const splittedPdf:PdfParsedData = await this.pdfSplitter({data, splitterOptions:{encodingName:'cl100k_base', chunkSize:600, chunkOverlap:0}})
        
        const price = ((splittedPdf.length * 600) * (0.13 / 1_000_000) * (await (new UpdateDollarPrice({}).priceOnBackEnd())).dollarPrice.brl.price) * 2
        
        console.log('fazendo os logs...');   
        this.logInfoPdfPreload({metadata, splittedPdf});
        
        console.log('inserindo no banco de dados vetorial...');   
        await this.pineconeAddPdf({ splittedPdf });

        return { data, metadata, price };
    };

    /**
     * Busca por namespaces e não por filters
     * @param question pergunta do usuário
     * @param docId namespace
     * @returns resposta do GPT
     */
    async search(question:string, docId:string, vectorIndex:string, chunksAmount?:number) {
        
        console.log(`iniciando...`);       
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(vectorIndex);

        const embeddings = new OpenAIEmbeddings({openAIApiKey:envs.OPENAI_API_KEY});
        const vectorStore = await PineconeStore.fromExistingIndex(
            embeddings,
        { pineconeIndex, namespace:docId }
        );

        console.log(`query: ${question}`);       

        const response = await this.askGpt(question, vectorStore, chunksAmount);        
        return response;

    };

    async getNamespacesAmount(index:string) {
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(index);
        const stats = await pineconeIndex.describeIndexStats()
        const namespaces = stats.namespaces;
        const ids = Object.keys(namespaces ?? {})
        const amount = Object.values(namespaces ?? {}).length;
        
        return { amount, ids };
    }

    async checkNamespacesAmount(index:string) {
        const { amount } = await this.getNamespacesAmount(index);      
        if (amount > 9990)   {
            const resp = await admin_firestore.collection('control').doc('vectorStore').get();
            const vectorStore = (resp.exists ? resp.data() : null) as Control['vectorStore'] | null;
            if(!vectorStore) throw new Error("Vector Store não encontrada");

            const newVectorStoreIndexes = Object.entries(vectorStore.indexes).reduce((acc:Control['vectorStore']['indexes'], item) => {
                acc[item[0]] = false;
                return acc;
            }, {} as Control['vectorStore']['indexes']);

            vectorStore.indexes = newVectorStoreIndexes;

            const pinecone = new Pinecone();
            const indexId = `${index}-${new Date().getTime()}`
            await pinecone.createIndex({
                dimension:1536,
                name:indexId,
                spec:{
                    serverless:{
                        region:'us-east-1',
                        cloud:'aws',
                    },
                },
                waitUntilReady:true,
            });
            vectorStore.indexes[indexId] = true;
            await admin_firestore.collection('control').doc('vectorStore').update(vectorStore);
            return indexId
        };
        
        return index;
    };

    async createPod() {
        const pinecone = new Pinecone();
        const indexName = 'search-by-pod';
        await pinecone.createIndex({
            dimension:1536,
            name:indexName,
            spec:{
                pod:{
                    environment:'us-east1-gcp',                    
                    podType:'p1.x1',
                    pods:1,
                }                
            },
            waitUntilReady:true,
        });

        return indexName;
    };


    protected async calculateGptPrice(tokens:number) {

        const updateDollarPrice = new UpdateDollarPrice({});
        const dollarPrice = await updateDollarPrice.priceOnBackEnd();

        const inputPrice = tokens * (0.5 / 1_000_000);
        const outputPrice = tokens * (1.5 / 1_000_000);
        const sum = inputPrice + outputPrice;
        const totalDollar = sum * 2;

        const totalReal = totalDollar * dollarPrice.dollarPrice.brl.price;
        return totalReal;
    };


    protected async askGpt(question:string, vectorStore:PineconeStore, chunksAmount?:number) {

        const openAiChat = new ChatOpenAI({
            openAIApiKey:envs.OPENAI_API_KEY,
            modelName:'gpt-3.5-turbo',
            temperature:.3,     
            maxTokens:-1,       
        });

        const template = `
        Você responde perguntas e passa informações.
        O usuário enviou um arquivo em pdf.
        Use estes trechos do conteúdo para sanar a necessidade do usuário.
        Se os trechos não respondem o pedido  do usuário, responda que você não sabe, não tente inventar uma resposta.

        Se possível adicione mais contexto para a resposta.

        trechos:
        {context}

        pergunta:
        {question}
        `.trim();
        const prompt = new PromptTemplate({
            template,
            inputVariables:['context', 'question'],            
        });

        const chain = RetrievalQAChain.fromLLM(openAiChat, vectorStore.asRetriever(chunksAmount ?? 5), { 
            prompt, 
            returnSourceDocuments:true,
            verbose:true,            
         });   
        const tokens = Math.ceil(template.split('').length / 3.5) + (600 * (chunksAmount ?? 5))
         const price = await this.calculateGptPrice(tokens)
         const response = (await chain._call({query:question})) as VectorStoreProcessSearchResponse;
         return { response, price };

    };


};