import envs from "@/envs";
import FileForge from "../../FileForge";
import VectorStoreProcess from "../../VectorStoreProcess";
import PdfGenres from "../PdfGenres";

import { CollectionTypes } from "@/src/config/firebase-admin/collectionTypes/collectionTypes";
import { admin_firestore } from "@/src/config/firebase-admin/config";

import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import firebaseInit from "@/src/config/firebase/init";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import AiFeatures from "./AiFeatures";
import CheckPrivileges from "./CheckPrivileges";
import Description from "./Description";
import Quiz from "./Quiz";



export default class UploadPdfProcess {

    protected fileForge:FileForge;
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

    constructor({ pdf }:{ pdf:File | Blob }) {
        if (pdf instanceof File) {
            this.fileForge = new FileForge({ file:pdf });        
        } else {
            this.fileForge = new FileForge({ blob:pdf }); 
        };
        this.vectorStore = new VectorStoreProcess();  
        this.aiFeatures = new AiFeatures();        
          
        this.firebase = firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps })
        this.description = new Description();
        this.quiz = new Quiz();
        this.checkPrivileges = new CheckPrivileges();
    };

    
    async completeUpload({ pdfUrl, docId, userId }:{ pdfUrl:string, docId:string, userId?:string }) {
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
        const { genres, price:genrePrice } = await this.generateGenres(docId);
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId);
        const { imageURL, inputContent, descriptionSummary, price:imagePrice } = await this.generateImageFromDescription(description, 'slim');

        userId = userId ?? 'public';
        const quiz = await this.quiz.generateQuiz({docId, isPublic:true, quizFocus:`Qual o objetivo desse conteúdo`, userId});        
        const price = genrePrice + descriptionPrice + imagePrice + quiz.price;
        
        const fileName = `${docId}`;
        const { blob:imageBlob, path, url } = await this.uploadImageToStorage({ userId, fileName, imageURL, uploadContent:'cover' });
        
        metadata.genres = genres;

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

    async partialUpload({ pdfUrl, docId, userId }:{ pdfUrl:string, docId:string, userId:string }) {
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
        const { genres, price:genrePrice } = await this.generateGenres(docId);
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId);

        const price = genrePrice + descriptionPrice;

        const newDoc:Pdf = {
            id:docId,
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
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        
        const { isFree } = await this.checkPrivileges.check({ currentAction:'pdfUpload', userId });
    };

    

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
        const { data, metadata } = await this.vectorStore.PDFloader({ blob, docId });
        return { data, metadata };
    };

    protected async generateGenres(docId:string) {
        const { response:resp, price } = await this.vectorStore.search('se o conteúdo for um livro, qual gênero seria adequado para classificá-lo?', docId);
        const textResponse = resp.text; 
        
        const allGenres = (new PdfGenres()).genres.map(item => item.genre).join(', ');
        
        
        const { content, price:priceGenre } = await this.aiFeatures.gpt3(`
        esta é a lista de gêneros.
        ${allGenres}
        leia o trecho a seguir e responda separado por vírgulas quais gêneros da lista são os gêneros do conteúdo. 
        responda apenas os gêneros que também estiverem na lista. 

        ${textResponse}
        `);
        const genres = content.split(',').map(item => item.trim());
        return { genres, price:priceGenre + price };
    };          

    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.description.summaryDescription(text);

        const { imageURL, inputContent, price } = await this.aiFeatures.generateImage(content.content, size);
        
        return {imageURL, inputContent:content, descriptionSummary:summary, price};

    };   


};