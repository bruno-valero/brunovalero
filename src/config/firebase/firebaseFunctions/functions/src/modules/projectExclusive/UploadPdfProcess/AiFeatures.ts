import { ChatOpenAI, ChatOpenAICallOptions, DallEAPIWrapper } from "@langchain/openai";
import envs from "../../../../envs";
import UpdateDollarPrice from "../UpdateDollarPrice";

import OpenAI from "openai";



export default class AiFeatures {

    protected openaiChat:ChatOpenAI<ChatOpenAICallOptions>;
    protected dalle3_slim:DallEAPIWrapper;
    protected dalle3_wide:DallEAPIWrapper;

    constructor() {

        const model = new ChatOpenAI({
            openAIApiKey:envs.OPENAI_API_KEY,
            model:'gpt-3.5-turbo',
            temperature:.3,    
            maxTokens:-1,
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


    async generateImage(text:string, size:'slim' | 'wide') {

        console.log('generate image: generando a imagem...');
        console.log(`descrição: ${text}`);
        let dale3:DallEAPIWrapper;
        if (size === 'slim') {
            dale3 = this.dalle3_slim;
        } else {
            dale3 = this.dalle3_wide;
        }
        const imageURL = await dale3.invoke(text);

        console.log(imageURL);

        const dollarPrice = (await (new UpdateDollarPrice({})).priceOnBackEnd()).dollarPrice.brl.price;
        const price = 0.08 * 2 * dollarPrice;
        return {imageURL, inputContent:text, price};

    };

    async gpt3(text:string, json?:boolean) {
        const model = this.openaiChat;
                
        let resp:string | null

        if (json) {  

            const openai = new OpenAI({apiKey:envs.OPENAI_API_KEY});
            const completion = await openai.chat.completions.create({
                messages: [
                  {
                    role: "system",
                    content: "Você é um assistente que responde em JSON.",
                  },
                  { role: "user", content: text },
                ],
                model: "gpt-3.5-turbo-0125",
                response_format: { type: "json_object" },
                temperature:.3,
                // max_tokens:16000,
              });
              resp = completion.choices[0].message.content
              console.log(`resp: ${resp}`);
        } else {
            const chatResp = await model.invoke(text);
            resp = chatResp.content as any;
        }


        const content = resp;
        if (typeof content !== 'string') throw new Error("Houve um problema com a resosta.");
        
        
        const dollarPrice = (await (new UpdateDollarPrice({})).priceOnBackEnd()).dollarPrice.brl.price;
        const tokens = text.split('').length;
        const inputPrice = tokens * (0.5 / 1_000_000);
        const outputPrice = tokens * (1.5 / 1_000_000);
        const price = ((inputPrice + outputPrice) * dollarPrice) * 2;
        return { content , price};
    };    


};