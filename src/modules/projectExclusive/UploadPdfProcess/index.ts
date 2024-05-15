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
import sharp from 'sharp';
import StripeBackend from "../../stripe/backend/StripeBackend";
import PlansRestrictions from "../PlansRestrictions";
import UserActions from "../UserActions";
import UserManagement from "../UserManagement";
import UserFinancialData from "../UserManagement/UserFinancialData";
import AiFeatures from "./AiFeatures";
import CheckPrivileges from "./CheckPrivileges";
import Description from "./Description";
import Payment from "./Payment";
import PdfPricing from "./Pricing";
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
    userActions:UserActions;
    plansRestrictions:PlansRestrictions;

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
        this.userActions = new UserActions();
        this.plansRestrictions = new PlansRestrictions();
    };

    
    async completeUpload({ pdfUrl, docId, userId, vectorIndex }:{ pdfUrl:string, docId:string, userId?:string, vectorIndex:string }) {        
        userId = userId ?? 'public';
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata, price:pricePdfLoader } = await this.uploadToVectorStore({ docId, blob });
        let realGenres:string[]
        let realGenresPrice = 0;
        const { genres, price:genrePrice } = await this.generateGenres(docId, vectorIndex);
        realGenres = genres;
        const allGenres = (new PdfGenres()).genres.map(item => item.genre)
        if (realGenres.some(item => !allGenres.includes(item as any))) {
            const { genres:regenerated, price:regeneratedPrice } = await this.regenerateGenres(docId, vectorIndex) 
            realGenresPrice = regeneratedPrice;
            realGenres = regenerated;
        }
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId, vectorIndex);
        const { imageURL, inputContent, descriptionSummary, price:imagePrice } = await this.generateImageFromDescription(description, 'slim');

        
        const quiz = await this.quiz.generateQuiz({docId, isPublic:true, quizFocus:`Qual o objetivo desse conteúdo`, userId, vectorIndex});        
        const price = pricePdfLoader + genrePrice + descriptionPrice + imagePrice + quiz.price;
        
        const fileName = `${docId}`;
        const { blob:imageBlob, path, url, sizes } = await this.uploadImageToStorage({ userId, fileName, imageURL, uploadContent:'cover', width:'1024', height:'1792' });
        
        metadata.genres = realGenres;

        const newDoc:Partial<CollectionTypes['services']['readPdf']['data'][0]> = {
            id:docId,
            userId,
            description,
            public:true,
            price,
            imageCover:[{url, active:true, storagePath:path, sizes}],
            metadata,
            dateOfCreation:String(new Date().getTime()),
        };
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').doc(quiz.id).set(quiz);        
    };

    async partialUpload({ pdfUrl, docId, user, autoBuy, minCredits, vectorIndex }:{ pdfUrl:string, docId:string, user:Partial<UsersUser>, autoBuy?:boolean, minCredits?:number, vectorIndex:string }) {
        const userId = user.uid!;        
        
        console.log('checando privilégios...')
        const { isFree } = await this.checkPrivileges.check({ currentAction:'pdfUpload', userId });
        if (!isFree) {

            const hasPermission = await this.plansRestrictions.hasPermission({ uid:userId, action:'pdfUploads', service:'readPdf', docId });
            if (!hasPermission) throw new Error("Sem permissão para realizar esta ação");

            await this.financialData.checkMinCredits({ uid:userId, autoBuy, minCredits });
        }
        
        const blob = await (await fetch(pdfUrl)).blob();
        const { data, metadata } = await this.uploadToVectorStore({ docId, blob });
        let realGenres:string[]
        let realGenresPrice = 0;
        const { genres, price:genrePrice } = await this.generateGenres(docId, vectorIndex);
        realGenres = genres;
        const allGenres = (new PdfGenres()).genres.map(item => item.genre)
        if (realGenres.some(item => !allGenres.includes(item as any))) {
            const { genres:regenerated, price:regeneratedPrice } = await this.regenerateGenres(docId, vectorIndex) 
            realGenresPrice = regeneratedPrice;
            realGenres = regenerated;
        }
        console.log('gerando descrição...')
        const { textResponse:description, price:descriptionPrice } = await this.description.generateDescription(docId, vectorIndex);
        
        const price = genrePrice + descriptionPrice + realGenresPrice;
        
        metadata.genres = realGenres;

        const newDoc:Pdf = {
            id:docId,
            vectorIndex,
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

        const pricing = new PdfPricing()
        const pricedata = await pricing.get();
        const defaultPrice = Math.ceil(Number(newDoc.metadata.totalWords) / 100_000) * (pricedata?.actionsValue.pdfUpload ?? 0)
        
        if (!isFree) {
            console.log('cobrando pagamento...')
            await this.financialData.spendCredits({ uid:userId, amount:defaultPrice, autoBuy, minCredits });
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        } else {
            console.log('atualizando o banco de dados...')
            await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).set(newDoc);
        };
        await this.userActions.addUserAction(userId, 'readPdf', 'pdfUploads', docId);

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
    async askQuestion({ question, docId, vectorIndex, user, autoBuy, minCredits }:{ question:string, docId:string, vectorIndex: string, user:Omit<UsersUser, 'control'>, autoBuy?:boolean, minCredits?:number }) {
        
        
        const uid = user.uid
        console.log('checando privilégios...')
        const { isFree } = await this.checkPrivileges.check({ currentAction:'questions', userId:uid });
        console.log(`A pergnta ${isFree ? 'não será cobrada :)' : 'será cobrada!'}`)
        
        if (!isFree) {  

            const hasPermission = await this.plansRestrictions.hasPermission({ uid:user.uid, action:'questions', service:'readPdf', docId });
            if (!hasPermission) throw new Error("Sem permissão para realizar esta ação");
            console.log(`Permissao: ${hasPermission}`) ;

            await this.financialData.checkMinCredits({ uid, autoBuy, minCredits });           
        };

        const docSnap = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
        const doc = (docSnap.exists ? docSnap.data() : null) as Pdf | null;
        if (!doc) throw new Error("documento inválido");
        

        const { response:resp, price } = await this.vectorStore.search(question, docId, vectorIndex);
        const textResponse = encodeURIComponent(resp.text as string);       
        const chunksRelated = resp.sourceDocuments;

        const pricing = new PdfPricing()
        const pricedata = await pricing.get();
        const defaultPrice = pricedata?.actionsValue.questions ?? 0;

        if (!isFree) {
            await this.financialData.spendCredits({ uid, amount:defaultPrice, autoBuy, minCredits });
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
        await this.userActions.addUserAction(uid, 'readPdf', 'questions', newQuestion.id)
        return update;
    }

    

    protected async uploadImageToStorage({ userId, fileName, imageURL, uploadContent, width, height }:{ userId:string, fileName:string, imageURL:string, uploadContent:'cover', width:'1024' | '1792', height:'1024' | '1792' }) {
        const { storage } = this.firebase;

        const imageId = new Date().getTime()
        const pathTypes = {
            cover:`services/readPdf/covers/${userId}/${fileName}/${imageId}`,
            min:`services/readPdf/covers/${userId}/${fileName}/${imageId}-min`,
            sm:`services/readPdf/covers/${userId}/${fileName}/${imageId}-sm`,
            md:`services/readPdf/covers/${userId}/${fileName}/${imageId}-md`
        };
        const path = pathTypes[uploadContent];

        const blob = await (await fetch(imageURL)).blob();

        const file = ref(storage!, path);
        await uploadBytes(file, blob);
        const url = await getDownloadURL(file);        

        async function resizeImage(inputFilePath:Buffer, width:number, height:number) {
            return await sharp(inputFilePath)
                .resize({ width, height })
                .toBuffer();
        };

        

        const md = {
            width:Math.ceil(Number(width) * .5),
            height:Math.ceil(Number(height) * .5),
        }
        const sm = {
            width:Math.ceil(Number(width) * .3),
            height:Math.ceil(Number(height) * .3),
        }
        const min = {
            width:Math.ceil(Number(width) * .1),
            height:Math.ceil(Number(height) * .1),
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        const minBlob = new Blob([await resizeImage(buffer, min.width, min.height)], { type:'image/png' });
        const smBlob = new Blob([await resizeImage(buffer, sm.width, sm.height)], { type:'image/png' });
        const mdBlob = new Blob([await resizeImage(buffer, md.width, md.height)], { type:'image/png' });
                
        const minRef = ref(storage!, pathTypes.min);
        const smRef = ref(storage!, pathTypes.sm);
        const mdRef = ref(storage!, pathTypes.md);

        await uploadBytes(minRef, minBlob);
        await uploadBytes(smRef, smBlob);
        await uploadBytes(mdRef, mdBlob);

        const minUrl = await getDownloadURL(minRef);
        const smUrl = await getDownloadURL(smRef);
        const mdUrl = await getDownloadURL(mdRef);

        const sizes = {
            min:{
                url:minUrl,
                storagePath:pathTypes.min,
            },
            sm:{
                url:smUrl,
                storagePath:pathTypes.sm,
            },
            md:{
                url:mdUrl,
                storagePath:pathTypes.md,
            },
        };

        return { blob, url, path:pathTypes[uploadContent], sizes };
    };    

    protected async uploadToVectorStore({ docId, blob }:{ docId:string, blob:Blob }) {
        const { data, metadata, price } = await this.vectorStore.PDFloader({ blob, docId });
        return { data, metadata, price };
    };

    protected async generateGenres(docId:string, vectorIndex:string) {
        const { response:resp, price } = await this.vectorStore.search('se o conteúdo for um livro, qual gênero seria adequado para classificá-lo?', docId, vectorIndex);
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
    
    async regenerateGenres(docId: string, vectorIndex:string) {

        const { genres, price } = await this.generateGenres(docId, vectorIndex);

        console.log(`genres: ${genres}`)

        return { genres, price }
    };

    protected async generateImageFromDescription(text:string, size:'slim' | 'wide') {

        const {content, summary} = await this.description.summaryDescription(text);

        const { imageURL, inputContent, price } = await this.aiFeatures.generateImage(content.content, size);
        
        return {imageURL, inputContent:content, descriptionSummary:summary, price};

    };   


};