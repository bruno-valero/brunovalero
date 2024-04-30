
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
import { QuizPdf, QuizPdfTry } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import CheckPrivileges from "./CheckPrivileges";

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
    checkPrivileges:CheckPrivileges;

    constructor() {
        this.vectorStore = new VectorStoreProcess();
        this.aiFeatures = new AiFeatures();
        this.checkPrivileges = new CheckPrivileges();

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

        const data = JSON.parse(questionAndAlternatives) as [string, ('a' | 'b' | 'c' | 'd' | 'e')[]][];
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
            id:quizId,
            docId,
            userId,
            title:quizFocus,
            description,
            public:isPublic,
            price,
            chunksRelated:vectorSearchResponse.sourceDocuments,
            imageBackground:{
                slim:{url:urlSlim, path:pathSlim},
                wide:{url:urlWide, path:pathWide},
            },
            questions:data.reduce((acc:QuizPdf['questions'], questionData) => {
                const options = questionData[1].map(item => item.replace(regExp, '').trim())                    
                const question:QuizPdf['questions'][0] = {
                    id:randomBytes(32).toString('hex'),
                    answer:questionData[1][0],
                    options:{
                        a:options[0],
                        b:options[1],
                        c:options[2],
                        d:options[3],
                        e:options[4],
                    },
                    question:questionData[0],
                }
                acc[question.id] = question;
                return acc;
            }, {}),            
        };

        return quiz;

    };

    async addQuiz({ quiz, docId }:{ quiz:QuizPdf, docId:string }) {
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quiz.id).set(quiz);
        const { isFree } = await this.checkPrivileges.check({ currentAction:'pdfUpload', userId:quiz.userId });
        if (!isFree) {
            // payment process
            const price = quiz.price;
        }
    };

    async performanceAnalysis({ quizQuestions, quizTryQuestions }:{ quizQuestions:QuizPdf['questions'], quizTryQuestions:QuizPdfTry['questions'] }) {

        const performance = Object.values(quizQuestions).map((item, i) => {
            const id = item.id;
            const question = item.question;
            const tryAnswer = quizTryQuestions[id].answer;
            const isRightAnswer = tryAnswer === item.answer;
            const timeToAnswer = `${Math.ceil(quizTryQuestions[id].timeAnswering / 1000)} segundos`;

            return {
                objectReport:{
                    questionId:id,
                    isRightAnswer,
                },
                textReport:`
                Questão ${i+1}) ${question}
                Resultado: ${isRightAnswer ? 'acertou' : 'errou'}
                Tempo para responder: ${timeToAnswer}
                `.trim().replaceAll(/  /ig, ''),
            }
        }).reduce((acc:{ objectReport:{questionId:string, isRightAnswer:boolean}[], textReport:string[] }, item) => {
            acc.objectReport = [...acc.objectReport, item.objectReport];
            acc.textReport = [...acc.textReport, item.textReport];
            return acc;
        }, { objectReport:[], textReport:[] })

        const { content, price } = await this.aiFeatures.gpt3(`
            O usuário leu um conteúdo e com base nele respondeu um quiz.
            Abaixo estão listadas as perguntas do quiz. Para cada pergunta está indicando se ele acertou e quanto tempo demorou para responder.
            Com base nessas informações, faça uma análise de desempemho.

            questões:
            
            ${performance.textReport.join('\n\n')}
        `);

        return { content, performance:performance.objectReport, price };
    };

    async tipBasedOnPerformance({ performanceAnalysis, chunksRelated }:{ performanceAnalysis:string, chunksRelated:QuizPdf['chunksRelated'] }) {
        const { content, price } = await this.aiFeatures.gpt3(`
            O usuário respondeu um quiz relacionado a um conteúdo que ele leu.
            Ao finalizar o quiz, uma análize de performance foi gerada como formato de feedback.
            Para melhor ajudar o usuário, leia os trechos do conteúdo e com base neles fornceça algumas dicas sobre o que ele deveria fazer para ter um melhor entendimento do conteúdo.
            Se possível passe algum conhecimento com base nos trechos que aparentemente o usuário ainda não tenha captado.

            análize de performance:
            ${performanceAnalysis}

            terchos do conteúdo:
            ${chunksRelated.map((item, i) => {
                const pageContent = item.pageContent
                const { page, lines } = item.metadata;
                const linesData = lines?.split('-');
                const linesLoc = linesData ? `linha ${linesData[0]} à linha ${linesData[1]} ` : '';
                
                return `
                trecho ${i + 1} -----------------------------------------

                ${pageContent}

                Informações adicionais do trecho -----------------
                Página: ${page}
                Localização: ${linesLoc}
                `.trim().replaceAll(/  /ig, '')
            }).join('\n\n')}        
        `)

        return { content, price };
    }

    async newQuizTry({ quiz, quizTryQuestions, userId }:{ quiz:QuizPdf, quizTryQuestions:QuizPdfTry['questions'], userId:string }) {
        const quizQuestions = quiz.questions;
        const quizTries = quiz.tries;
        const chunksRelated = quiz.chunksRelated;

        const { content:performanceAnalysis, price:pricePerformanceAnalysis, performance } = await this.performanceAnalysis({ quizQuestions, quizTryQuestions });
        const { content:tipBasedOnPerformance, price:priceTipBasedOnPerformance } = await this.tipBasedOnPerformance({ performanceAnalysis, chunksRelated });
        const rightQuestions = performance.filter(item => item.isRightAnswer).length;
        const score = Number((rightQuestions / performance.length).toFixed(2));
        const newTry:QuizPdfTry = {
            id:String(new Date().getTime()),            
            quizId:quiz.id,
            questions:quizTryQuestions,
            performanceObservation:performanceAnalysis,
            tip:tipBasedOnPerformance,
            score,
            userId,
        };

        await admin_firestore
            .collection('services').doc('readPdf')
            .collection('data').doc(quiz.docId)
            .collection('quiz').doc(quiz.id)
            .collection('tries').doc(newTry.id).set(newTry);
        
        return newTry;


    };

};