import envs from "@/envs";
import FileForge from "../../FileForge";
import VectorStoreProcess from "../../VectorStoreProcess";
import PdfGenres from "../PdfGenres";

import { ChatOpenAI, ChatOpenAICallOptions, DallEAPIWrapper } from "@langchain/openai";
import UpdateDollarPrice from "../UpdateDollarPrice";



export default class UploadPdfProcess {

    protected fileForge:FileForge;
    protected vectorStore:VectorStoreProcess;
    protected openaiChat:ChatOpenAI<ChatOpenAICallOptions>
    protected dalle3_slim:DallEAPIWrapper
    protected dalle3_wide:DallEAPIWrapper

    constructor({ pdf }:{ pdf:File | Blob }) {
        if (pdf instanceof File) {
            this.fileForge = new FileForge({ file:pdf });        
        } else {
            this.fileForge = new FileForge({ blob:pdf }); 
        };
        this.vectorStore = new VectorStoreProcess();  

        const model = new ChatOpenAI({
            openAIApiKey:envs.OPENAI_API_KEY,
            model:'gpt-3.5-turbo',
            temperature:.3, 
        });  
        this.openaiChat = model;

        const dalle3_slim = new DallEAPIWrapper({
            n: 1, // Default
            model: "dall-e-3", // Default
            apiKey: envs.OPENAI_API_KEY,// Default   
            size:'1024x1792',
        });
        const dalle3_wide = new DallEAPIWrapper({
            n: 1, // Default
            model: "dall-e-3", // Default
            apiKey: envs.OPENAI_API_KEY,// Default   
            size:'1792x1024',
        });
        this.dalle3_slim = dalle3_slim;
        this.dalle3_wide = dalle3_wide;
          
    };

    
    async completeUpload() {
        const { docId, blob } = await this.uploadToStorage();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
        const { genres, price:genrePrice } = await this.generateGenres(docId);
        const { textResponse:description, price:descriptionPrice } = await this.generateDescription(docId);
        const { imageURL, inputContent, descriptionSummary, price:imagePrice } = await this.generateImageFromDescription(description, 'slim');
        const price = genrePrice + descriptionPrice + imagePrice;
        
    };

    async partialUpload() {
        const { docId, blob } = await this.uploadToStorage();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
    };
    
    protected async uploadToStorage() {
        const docId = String(new Date().getTime());
        const blob = await this.fileForge.blob();
        // ....
        return { docId, blob };
    };

    protected async uploadToVectorStore({ docId, blob }:{ docId:string, blob:Blob }) {
        const { data, metadata } = await this.vectorStore.PDFloader({ blob, docId });
        return { data, metadata };
    };

    protected async generateGenres(docId:string) {
        const { response:resp, price } = await this.vectorStore.search('se o conteúdo for um livro, qual gênero seria adequado para classificá-lo?', docId);
        const textResponse = resp.text;        

        const model = this.openaiChat;
        
        const allGenres = (new PdfGenres()).genres.map(item => item.genre).join(', ');
        
        
        const content = await this.chat(`
        esta é a lista de gêneros.
        ${allGenres}
        leia o trecho a seguir e responda separado por vírgulas quais gêneros da lista são os gêneros do conteúdo. 
        responda apenas os gêneros que também estiverem na lista. 

        ${textResponse}
        `);
        const genres = content.split(',').map(item => item.trim());
        return { genres, price };
    };

    protected async generateDescription(docId:string) {
        const { response:resp, price } = await this.vectorStore.search('qual é o objetivo do conteúdo?', docId);
        const textResponse = resp.text as string;
        return { textResponse, price };
    };

    protected async summaryDescription(text:string) {
        console.log('generate image: resumindo texto...');
        const phrase = await this.chat(`
        resuma em 1 frase.

        ${text}
        `);

        console.log('generate image: traduzindo o resumo para inglês...');
        const content = await this.chat(`
        traduza para o inglês.


        Uma capa bonita para o seguinte conteudo:
        ${phrase}
        `);

        return {content, summary:phrase};
    };

    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.summaryDescription(text);

        console.log('generate image: generando a imagem...');
        let dale3:DallEAPIWrapper;
        if (size === 'slim') {
            dale3 = this.dalle3_slim;
        } else {
            dale3 = this.dalle3_wide;
        }
        const imageURL = await dale3.invoke(content);

        console.log(imageURL);
        console.log(`imagem gerada:

        ${imageURL}

        `);

        const dollarPrice = (await (new UpdateDollarPrice({})).priceOnBackEnd()).dollarPrice.brl.price;
        const price = 0.08 * 2 * dollarPrice;
        return {imageURL, inputContent:content, descriptionSummary:summary, price};

    };

    protected async chat(text:string) {
        const model = this.openaiChat;
                
        const chatResp = await model.invoke(text);

        const content = chatResp.content;
        if (typeof content !== 'string') throw new Error("Houve um problema com a resosta.");
        return content;
    };    


};