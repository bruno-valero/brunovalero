import firebaseInit from "@/src/config/firebase/init";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Database } from "firebase/database";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage } from "firebase/storage";

import envs from "@/envs";
import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import UserFinancialData from "../UserManagement/UserFinancialData";
import AiFeatures from "./AiFeatures";
import CheckPrivileges from "./CheckPrivileges";
import Description from "./Description";


export default class Images {

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
    protected description:Description;
    protected aiFeatures:AiFeatures;
    checkPrivileges:CheckPrivileges;
    financialData:UserFinancialData;

    constructor() {

        this.firebase = firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps });
        this.description = new Description();
        this.aiFeatures = new AiFeatures();
        this.checkPrivileges = new CheckPrivileges();
        this.financialData = new UserFinancialData();
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


    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.description.summaryDescription(text);

        const { imageURL, inputContent, price } = await this.aiFeatures.generateImage(content.content, size);
        
        return {imageURL, inputContent:content, descriptionSummary:summary, price:price + summary.price};

    };   

    async addNewImage({ docId, userId, autoBuy, minCredits }:{ docId:string, userId:string, autoBuy?:boolean, minCredits?:number }) {

        const { isFree } = await this.checkPrivileges.check({ currentAction:'coverGenerationForPrivateDocs', userId });
        if (!isFree) {
            await this.financialData.checkMinCredits({ uid:userId, autoBuy, minCredits });
        }

        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId);
        const { imageURL, inputContent, descriptionSummary, price:imagePrice } = await this.generateImageFromDescription(description, 'slim');

        const { blob:imageBlob, path, url } = await this.uploadImageToStorage({ userId, fileName:docId, imageURL, uploadContent:'cover' });

        const doc = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
        const docContent = (doc.exists ? doc.data() : null) as Pdf | null;
        if (!docContent)throw new Error(`Error >> UploadPdfProcess.addNewImage: Documento ({docId}): ${docId} não encontrado.`);
        const covers = docContent.imageCover.map(item => {
            item.active = false;
            return item;
        });

        
        const newImage = {url, active:true, storagePath:path};

        const imageCover = [...covers, newImage];
        

        const price = descriptionPrice + imagePrice
        if (!isFree) {
            console.log('cobrando pagamento...');
            await this.financialData.spendCredits({ uid:userId, amount:price, autoBuy, minCredits });
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).update({ imageCover });
        } else {
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).update({ imageCover });
        };
        
        return { newImage, imageCover};
    };

    async changeCover({ docId, coverIndex }:{ docId:string, coverIndex:number }) {
        const doc = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
        const docContent = (doc.exists ? doc.data() : null) as Pdf | null;
        if (!docContent)throw new Error(`Error >> UploadPdfProcess.changeCover: Documento ({docId}): ${docId} não encontrado.`);

        const imageCover = docContent.imageCover.map((item, i) => {
            if (i === coverIndex) {
                item.active = true;
            } else {
                item.active = false;
            }
            return item;
        });

        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).update({ imageCover });

        return { imageCover };

    };


};