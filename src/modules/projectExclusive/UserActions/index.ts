import { UserActionsMonth } from "@/src/config/firebase-admin/collectionTypes/collectionTypes";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import tsToMask from "@/utils/functions/dateTime/tsToMask";


export default class UserActions {

    constructor() {

    };


    async getUserActions(uid:string, month:string) {
        const resp = await admin_firestore.collection('userActions').doc(uid).get();
        const months = (resp.exists ? resp.data() : null) as UserActionsMonth | null;
        if (!months) return null;
        const data = months[month]
        return data;
    };

    getDate(timestamp:number | string) {
        const time = new Date(timestamp).getTime();
        const date = tsToMask({ts:time, format:['day', 'month', 'year'], seps:['-', '-']});
        return date;
    };

    async addUserAction(uid:string, service:'readPdf', action:'coverGeneration' | 'pdfUploads' | 'questions' | 'quizGeneration', actionId:string) {
        const month = this.getDate(new Date().getTime());
        const ua = await this.getUserActions(uid, month);
        if(!ua) {
            await this.createUserAction(uid, [service, action, actionId])
        } else {
            ua[service][action].push(actionId);
            await admin_firestore.collection('userActions').doc(uid).update({ [month]:ua });
        }
    };

    async createUserAction(uid:string, addAction?:['readPdf', 'coverGeneration' | 'pdfUploads' | 'questions' | 'quizGeneration', string]) {
        const month = this.getDate(new Date().getTime());
        const ua:UserActionsMonth = {
            [month]:{
                readPdf:{
                    coverGeneration:[],
                    pdfUploads:[],
                    questions:[],
                    quizGeneration:[],
                }
            }
        }
        if (addAction) {
            ua[month][addAction[0]][addAction[1]].push(addAction[2]);
        }
        await admin_firestore.collection('userActions').doc(uid).set(ua)
    };

    async inOnActionLimit({ uid, action, service, limit }:{limit:number, uid: string, service:'readPdf', action:'coverGeneration' | 'pdfUploads' | 'questions' | 'quizGeneration'}) {
        const month = this.getDate(new Date().getTime());
        const actions = await this.getUserActions(uid, month);
        if (!actions) throw new Error("Ação do usuário não encontrada");        
        const actionService =  actions[service];
        return actionService[action].length >= limit;
    };

       
}