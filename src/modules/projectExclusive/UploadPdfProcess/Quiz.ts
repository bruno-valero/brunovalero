import { QuizPdf } from "@/src/config/firebase-admin/collectionTypes";
import firebaseInit from "@/src/config/firebase/init";
import { randomBytes } from "crypto";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Database } from "firebase/database";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import VectorStoreProcess, { VectorStoreProcessSearchResponse } from "../../VectorStoreProcess";
import AiFeatures from "./AiFeatures";

import envs from "@/envs";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

type UploadImageToStorage = ({ userId, fileName, imageURL, uploadContent }:{ userId:string, fileName:string, imageURL:string, uploadContent:'cover' | 'quizSlim' | 'quizWide' }) => Promise<{ blob: Blob; url: string; path: string; }>;
export default class Quiz {

    protected vectorStore:VectorStoreProcess;
    protected aiFeatures:AiFeatures;
    protected firebase:{
        app: null;
        auth: null;
        database: null;
        db: null;
        storage: null;
    } | {
        app: FirebaseApp;
        auth: Auth;
        database: Database;
        db: Firestore;
        storage: FirebaseStorage;
    }

    constructor() {
        this.vectorStore = new VectorStoreProcess();
        this.aiFeatures = new AiFeatures();

        this.firebase = firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps })
    };

    protected async summaryDescription(text:string) {
        console.log('generate image: resumindo texto...');
        const { content:phrase, price:phrasePrice } = await this.aiFeatures.gpt3(`
        resuma em 1 frase.

        ${text}
        `);

        console.log('generate image: traduzindo o resumo para inglês...');
        const { content, price:contentPrice } = await this.aiFeatures.gpt3(`
        traduza para o inglês.


        Uma capa bonita para o seguinte conteudo:
        ${phrase}
        `);

        const price = phrasePrice + contentPrice;

        return {content, summary:phrase, price};
    };

    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.summaryDescription(text);

        const { imageURL, inputContent, price } = await this.aiFeatures.generateImage(text, size);
        
        return {imageURL, inputContent:content, descriptionSummary:summary, price};

    };

    protected async generateQuestions({ quizFocus, docId }:{ quizFocus:string, docId:string }) {
        const { response, price:priceVectorSearch } = await this.vectorStore.search(quizFocus, docId, 8);
        const {content:questions, price:priceQuestions} = await this.aiFeatures.gpt3(`
        Com base no trecho abaixo, gere 30 questoes sobre "${quizFocus}". 
        Gere 5 alternativas (a, b, c, d, e) para cada questao, onde a penas a alternativa "a" contém a resposta verdadeira.

        ${response}
        `);

        const {content:questionAndAlternatives, price:priceQuestionsAndAlternatives} = await this.aiFeatures.gpt3(`
        retorne as questões nesse formato:
        [["questao 1", alternativas], ["questao 2", alternativas], ...]

        questões:
        ${questions}
        `);

        const data = JSON.parse(questionAndAlternatives) as [string, string[]][];
        const price = priceVectorSearch + priceQuestions + priceQuestionsAndAlternatives;

        return { data, price, vectorSearchResponse:response };
    };
    
    protected async generateDescription({ vectorSearchResponse }:{ vectorSearchResponse:VectorStoreProcessSearchResponse }) {
        const {content:description, price} = await this.aiFeatures.gpt3(`
        leia os trechos abaixo e faça um resumo sobre o conteúdo.
        se possível, deixe eviente qual o objetivo do conteúdo.

        trechos:
        ${vectorSearchResponse.sourceDocuments.map(item => item.pageContent).join('\n\n')}
        `);

        return { description, price };
    };

    protected async generateImages({ description }:{ description:string }) {
        const { 
            imageURL:imageSlimURL, 
            inputContent:imageSlimInputContent, 
            descriptionSummary:imageSlimDescriptionSummary, 
            price:imageSlimPrice,            
         } = await this.generateImageFromDescription(description, 'slim');
        const { 
            imageURL:imageWideURL, 
            inputContent:imageWideInputContent, 
            descriptionSummary:imageWideDescriptionSummary, 
            price:imageWidePrice,            
         } = await this.generateImageFromDescription(description, 'wide');

         return { 
            imageSlim:{ 
                imageSlimURL, 
                imageSlimInputContent, 
                imageSlimDescriptionSummary, 
                imageSlimPrice,            
             }, 
            imageWide:{ 
                imageWideURL, 
                imageWideInputContent, 
                imageWideDescriptionSummary, 
                imageWidePrice,            
             },
             price:imageSlimPrice + imageWidePrice,
         };
    };

    protected async uploadImageToStorage({ userId, fileName, imageURL, uploadContent }:{ userId:string, fileName:string, imageURL:string, uploadContent:'quizSlim' | 'quizWide' }) {
        const { storage } = this.firebase;

        const pathTypes = {
            quizSlim:`services/readPdf/quiz/${userId}/${fileName}/${uploadContent}`,
            quizWide:`services/readPdf/quiz/${userId}/${fileName}/${uploadContent}`,
        };
        const path = pathTypes[uploadContent];

        const blob = await (await fetch(imageURL)).blob();

        const file = ref(storage!, path);
        await uploadBytes(file, blob);
        const url = await getDownloadURL(file);
        return { blob, url, path:pathTypes[uploadContent] };
    };    

    protected async uploadImages({ userId, quizId, imageSlimURL, imageWideURL }: { userId: string, quizId:string, imageSlimURL:string, imageWideURL:string }) {
        const { blob:imageSlimBlob, path:pathSlim, url:urlSlim } = await this.uploadImageToStorage({ userId, fileName:quizId, imageURL:imageSlimURL, uploadContent:'quizSlim' });
        const { blob:imageWideBlob, path:pathWide, url:urlWide } = await this.uploadImageToStorage({ userId, fileName:quizId, imageURL:imageWideURL, uploadContent:'quizWide' });

        return { 
            imageSlim:{
                imageSlimBlob,
                pathSlim,
                urlSlim
            }, 
            imageWide:{
                imageWideBlob,
                pathWide,
                urlWide
            }
         }
    };        

    async generateQuiz({ quizFocus, docId, isPublic, userId }:{ quizFocus:string, docId:string, isPublic:boolean, userId:string }) {
        const { price:questionsPrice, data, vectorSearchResponse } = await this.generateQuestions({ quizFocus, docId });

        
        const {description, price:priceDescription} = await this.generateDescription({ vectorSearchResponse });

        const { price:imagesPrice, ...images } = await this.generateImages({ description })
        const { imageSlimURL, imageWideURL } = { imageSlimURL: images.imageSlim.imageSlimURL, imageWideURL:images.imageWide.imageWideURL}
        
        const quizId = String(new Date().getTime());
        const { imageSlim, imageWide } = await this.uploadImages({ userId, quizId, imageSlimURL, imageWideURL });
        
        const { imageSlimBlob, pathSlim, urlSlim } = imageSlim;
        const { imageWideBlob, pathWide, urlWide } = imageWide;
        

        const price = questionsPrice + priceDescription + imagesPrice;

        const regExp = new RegExp(/[a-z]\)/, 'i');
        const quiz:QuizPdf = {
            public:isPublic,
            price,
            chunksRelated:vectorSearchResponse.sourceDocuments,
            title:quizFocus,
            description,
            id:quizId,
            imageBackground:{
                slim:{url:urlSlim, path:pathSlim},
                wide:{url:urlWide, path:pathWide},
            },
            questions:data.reduce((acc:QuizPdf['questions'], item) => {
                const options = item[1].map(item => item.replace(regExp, '').trim())                    
                const question:QuizPdf['questions'][0] = {
                    id:randomBytes(32).toString('hex'),
                    answer:item[1][0],
                    options:{
                        a:options[0],
                        b:options[1],
                        c:options[2],
                        d:options[3],
                        e:options[4],
                    },
                    question:item[0],
                }
                acc[question.id] = question;
                return acc;
            }, {}),            
        };

        return quiz;

    };

    async addQuiz({ quiz, isPublic,  }:{ quiz:QuizPdf, isPublic:boolean,  }) {

    };

};