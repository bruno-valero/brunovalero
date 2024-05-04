import envs, { isProduction } from "@/envs";
import VectorStoreProcess from "../../VectorStoreProcess";
import PdfGenres from "../PdfGenres";

import { CollectionTypes } from "@/src/config/firebase-admin/collectionTypes/collectionTypes";
import { admin_firestore } from "@/src/config/firebase-admin/config";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import firebaseInit from "@/src/config/firebase/init";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import StripeBackend from "../../stripe/backend/StripeBackend";
import UserManagement from "../UserManagement";
import UserFinancialData from "../UserManagement/UserFinancialData";
import AiFeatures from "./AiFeatures";
import CheckPrivileges from "./CheckPrivileges";
import Description from "./Description";
import Payment from "./Payment";
import Quiz from "./Quiz";



export default class UploadPdfProcess {

    protected vectorStore:VectorStoreProcess;
    // protected openaiChat:ChatOpenAI<ChatOpenAICallOptions>
    // protected dalle3_slim:DallEAPIWrapper
    // protected dalle3_wide:DallEAPIWrapper
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
    };
    protected aiFeatures:AiFeatures;
    protected description:Description;
    quiz:Quiz;
    checkPrivileges:CheckPrivileges;
    payment:Payment;
    stripeBackend:StripeBackend;
    userManagement:UserManagement;
    financialData:UserFinancialData;

    constructor() {
        this.vectorStore = new VectorStoreProcess();  
        this.aiFeatures = new AiFeatures();        
          
        this.firebase = firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps })
        this.description = new Description();
        this.quiz = new Quiz();
        this.checkPrivileges = new CheckPrivileges();
        this.payment = new Payment();
        this.stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
        this.userManagement = new UserManagement();
        this.financialData = new UserFinancialData();
    };

    
    async completeUpload({ pdfUrl, docId, userId }:{ pdfUrl:string, docId:string, userId?:string }) {        
        userId = userId ?? 'public';
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata, price:pricePdfLoader } = await this.uploadToVectorStore({ docId, blob });
        let realGenres:string[]
        let realGenresPrice = 0;
        const { genres, price:genrePrice } = await this.generateGenres(docId);
        realGenres = genres;
        const allGenres = (new PdfGenres()).genres.map(item => item.genre)
        if (realGenres.some(item => !allGenres.includes(item as any))) {
            const { genres:regenerated, price:regeneratedPrice } = await this.regenerateGenres(docId, userId) 
            realGenresPrice = regeneratedPrice;
            realGenres = regenerated;
        }
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId);
        const { imageURL, inputContent, descriptionSummary, price:imagePrice } = await this.generateImageFromDescription(description, 'slim');

        
        const quiz = await this.quiz.generateQuiz({docId, isPublic:true, quizFocus:`Qual o objetivo desse conteúdo`, userId});        
        const price = pricePdfLoader + genrePrice + descriptionPrice + imagePrice + quiz.price;
        
        const fileName = `${docId}`;
        const { blob:imageBlob, path, url } = await this.uploadImageToStorage({ userId, fileName, imageURL, uploadContent:'cover' });
        
        metadata.genres = realGenres;

        const newDoc:Partial<CollectionTypes['services']['readPdf']['data'][0]> = {
            id:docId,
            userId,
            description,
            public:true,
            price,
            imageCover:[{url, active:true, storagePath:path}],
            metadata,
            dateOfCreation:String(new Date().getTime()),
        };
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quiz.id).set(quiz);        
    };

    async partialUpload({ pdfUrl, docId, user, autoBuy, minCredits }:{ pdfUrl:string, docId:string, user:Partial<UsersUser>, autoBuy?:boolean, minCredits?:number }) {
        const userId = user.uid!

        console.log('checando privilégios...')
        const { isFree } = await this.checkPrivileges.check({ currentAction:'pdfUpload', userId });
        if (!isFree) {
            await this.financialData.checkMinCredits({ uid:userId, autoBuy, minCredits });
        }
        
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
        let realGenres:string[]
        let realGenresPrice = 0;
        const { genres, price:genrePrice } = await this.generateGenres(docId);
        realGenres = genres;
        const allGenres = (new PdfGenres()).genres.map(item => item.genre)
        if (realGenres.some(item => !allGenres.includes(item as any))) {
            const { genres:regenerated, price:regeneratedPrice } = await this.regenerateGenres(docId, user.uid!) 
            realGenresPrice = regeneratedPrice;
            realGenres = regenerated;
        }
        console.log('gerando descrição...')
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId);
        
        const price = genrePrice + descriptionPrice + realGenresPrice;
        
        metadata.genres = realGenres;

        const newDoc:Pdf = {
            id:docId,
            pdfUrl,
            userId,
            description,
            public:true,
            price,
            imageCover:[],
            metadata,
            questions:{},
            quiz:{},
            dateOfCreation:String(new Date().getTime()),
        };

        
        if (!isFree) {
            console.log('cobrando pagamento...')
            await this.financialData.spendCredits({ uid:userId, amount:price, autoBuy, minCredits });
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        } else {
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        };

    };


    /**
     * Faz uma checagem nos créditos do usuário para saber se estão dentro do valor mínimo estabelecido.
     * 
     * Caso não tenha o valor estipulado e não possuir a opção de "autoBuyCredits" habilitada e não tiver o argumento autoBuy = true, então retorna um erro.
     * 
     * Caso tenha permitido a compra automática, executa a compra e quando tiver o valor estipulado, continua o processo.    * 
     * 
     * Faz uma busca no banco de dados vetorial (Pinecone) baseando-se na pergunta do usuário. Em seguida apresenta alguns trechos encontrados para o chat gpt-3.5-turbo pedindo para responder a pergunta do usuário através dos trechos.
     * 
     * Após receber a resposta juntamente com o preço da requisição, cobra dos créditos do usuário, atualiza o banco de dados com a resposta e retorna o texto gerado pelo gpt.
     * 
     * @param question **string -** Texto da pergunta realizada pelo usuário.
     * @param docId **string -** ID único do documento ao qual receberá a pergunta.
     * @param user **Omit(UsersUser, 'control') -** Dados de usuário ppresentes no banco de dados (Firebase).
     * @param autoBuy **boolean -** Opção que, se for ativa, permite com que caso o usuário não possua créditos suficientes para realizar a pergunta
     * @param minCredits **number [opicional] -** Determinará qual o valor mínimo que o usuário deve ter reservado
     * @returns
     */
    async askQuestion({ question, docId, user, autoBuy, minCredits }:{ question:string, docId:string, user:Omit<UsersUser, 'control'>, autoBuy?:boolean, minCredits?:number }) {
        
        const docSnap = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
        const doc = (docSnap.exists ? docSnap.data() : null) as Pdf | null;
        if (!doc) throw new Error("documento inválido");
        
        const uid = user.uid
        console.log('checando privilégios...')
        const { isFree } = await this.checkPrivileges.check({ currentAction:'questions', userId:uid });
        console.log(`A pergnta ${isFree ? 'não será cobrada :)' : 'será cobrada!'}`)
        if (!isFree) {      
            await this.financialData.checkMinCredits({ uid, autoBuy, minCredits });           
        };

        const { response:resp, price } = await this.vectorStore.search(question, docId);
        const textResponse = encodeURIComponent(resp.text as string);       
        const chunksRelated = resp.sourceDocuments;

        if (!isFree) {
            await this.financialData.spendCredits({ uid, amount:price, autoBuy, minCredits });
        }

        // const oi:ReadPdf = '';
        // oi.data[''].questions['']
        const newQuestion:QuestionPdf = {
            id:String(new Date().getTime()),
            question,
            price,
            response:{
                text:textResponse,
                chunksRelated,
            },
            userId:user.uid,
        };

        const update = JSON.parse(JSON.stringify(newQuestion));

        console.log(`${JSON.stringify(update, null, 2)}`);
        console.log(`price: ${price})}`);
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('questions').doc(newQuestion.id).set(update);

        return update;
    }

    

    protected async uploadImageToStorage({ userId, fileName, imageURL, uploadContent }:{ userId:string, fileName:string, imageURL:string, uploadContent:'cover' }) {
        const { storage } = this.firebase;

        const pathTypes = {
            cover:`services/readPdf/covers/${userId}/${fileName}`,            
        };
        const path = pathTypes[uploadContent];

        const blob = await (await fetch(imageURL)).blob();

        const file = ref(storage!, path);
        await uploadBytes(file, blob);
        const url = await getDownloadURL(file);
        return { blob, url, path:pathTypes[uploadContent] };
    };    

    protected async uploadToVectorStore({ docId, blob }:{ docId:string, blob:Blob }) {
        const { data, metadata, price } = await this.vectorStore.PDFloader({ blob, docId });
        return { data, metadata, price };
    };

    protected async generateGenres(docId:string) {
        const { response:resp, price } = await this.vectorStore.search('se o conteúdo for um livro, qual gênero seria adequado para classificá-lo?', docId);
        const textResponse = resp.text; 
        
        const allGenres = (new PdfGenres()).genres.map(item => item.genre).join(', ');
        console.log(`possibleGenres: ${textResponse}`)
        
        const { content, price:priceGenre } = await this.aiFeatures.gpt3(`
        esta é a lista de gêneros.
        ${allGenres}
        leia o trecho a seguir e responda separado por vírgulas quais gêneros da lista são os gêneros do conteúdo. 
        responda apenas os gêneros que também estiverem na lista. 

        ${textResponse}
        `);
        console.log(`genres: ${content}`)
        const genres = content.split(',').map(item => item.trim());
        return { genres, price:priceGenre + price };
    };      
    
    async regenerateGenres(docId: string, uid:string) {

        const { genres, price } = await this.generateGenres(docId);

        console.log(`genres: ${genres}`)

        return { genres, price }
    };

    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.description.summaryDescription(text);

        const { imageURL, inputContent, price } = await this.aiFeatures.generateImage(content.content, size);
        
        return {imageURL, inputContent:content, descriptionSummary:summary, price};

    };   


};