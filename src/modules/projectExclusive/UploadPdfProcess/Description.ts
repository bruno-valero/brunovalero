import VectorStoreProcess from "../../VectorStoreProcess";
import AiFeatures from "./AiFeatures";


export default class Description {

    protected vectorStore:VectorStoreProcess;
    protected aiFeatures:AiFeatures;

    constructor() {
        this.vectorStore = new VectorStoreProcess();
        this.aiFeatures = new AiFeatures();
    };

    async generateDescription(docId:string) {
        const { response:resp, price } = await this.vectorStore.search('qual é o objetivo do conteúdo?', docId);
        const textResponse = resp.text as string;
        return { textResponse, price };
    };

    async summaryDescription(text:string) {
        console.log('generate image: resumindo texto...');
        const phrase = await this.aiFeatures.gpt3(`
        resuma em 1 frase.

        ${text}
        `);

        console.log('generate image: traduzindo o resumo para inglês...');
        const content = await this.aiFeatures.gpt3(`
        traduza para o inglês.


        Uma capa bonita para o seguinte conteudo:
        ${phrase}
        `);

        return {content, summary:phrase};
    };

}