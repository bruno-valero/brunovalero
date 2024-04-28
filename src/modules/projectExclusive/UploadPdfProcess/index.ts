import envs from "@/envs";
import FileForge from "../../FileForge";
import VectorStoreProcess from "../../VectorStoreProcess";
import PdfGenres from "../PdfGenres";

import { ChatOpenAI, ChatOpenAICallOptions, DallEAPIWrapper } from "@langchain/openai";



export default class UploadPdfProcess {

    protected fileForge:FileForge;
    protected vectorStore:VectorStoreProcess;
    protected openaiChat:ChatOpenAI<ChatOpenAICallOptions>
    protected dalle3_slim:DallEAPIWrapper
    protected dalle3_wide:DallEAPIWrapper

    constructor({ file }:{ file:File }) {
        this.fileForge = new FileForge({ file });        
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

    async run() {
        const { docId, blob } = await this.uploadToStorage();
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
        const resp = await this.vectorStore.search('se o conteúdo for um livro, qual gênero seria adequado para classificá-lo?', docId);
        const textResponse = resp.text;        

        const model = this.openaiChat;
        
        const allGenres = (new PdfGenres()).genres.map(item => item.genre).join(', ')
        
        
        const content = await this.chat(`
        esta é a lista de gêneros.
        ${allGenres}
        leia o trecho a seguir e responda separado por vírgulas quais gêneros da lista são os gêneros do conteúdo. 
        responda apenas os gêneros que também estiverem na lista. 

        ${textResponse}
        `);
        const genres = content.split(',').map(item => item.trim());
        return genres;
    };    

    protected async generateDescription(docId:string) {
        const resp = await this.vectorStore.search('qual é o objetivo do conteúdo?', docId);
        const textResponse = resp.text as string;
        return textResponse;
    };

    async generateImage(text:string) {
        console.log('generate image: resumindo texto...');
        const phase = await this.chat(`
        resuma em 1 frase.

        ${text}
        `);

        console.log('generate image: traduzindo o resumo para inglês...');
        const content = await this.chat(`
        traduza para o inglês.


        Uma capa bonita para o seguinte conteudo:
        ${phase}
        `);

        console.log('generate image: generando a imagem...');
        const imageURL = await this.dalle3_slim.invoke(content);

        console.log(imageURL);
        console.log(`imagem gerada:

        ${imageURL}

        `);
        return imageURL;

    }

    protected async chat(text:string) {
        const model = this.openaiChat;
                
        const chatResp = await model.invoke(text);

        const content = chatResp.content;
        if (typeof content !== 'string') throw new Error("Houve um problema com a resosta.");
        return content;
    };    


};