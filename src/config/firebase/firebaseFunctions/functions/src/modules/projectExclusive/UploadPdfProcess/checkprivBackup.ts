import { QuizPdf } from "../../../../src/config/firebase-admin/collectionTypes/pdfReader";
import { UsersControl, UsersControlPrivileges } from "../../../../src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "../../../../src/config/firebase-admin/config";


type Item = (typeof checkPrivileges.prototype.actionList)[0]

export default class checkPrivileges {


    userId:string;
    actionList:(keyof UsersControl['PrivilegesFreeServices'][0]['privilegeData']['readPdf'])[];
    quiz:QuizPdf;

    constructor({ userId, actionList, quiz }:{ userId:string, quiz:QuizPdf, actionList:(keyof UsersControl['PrivilegesFreeServices'][0]['privilegeData']['readPdf'])[]}) {

        this.userId = userId;
        this.actionList = actionList;
        this.quiz = quiz;

    };


    recursiveSum(data: Record<string, any>):number {
        const sum = Object.values(data).reduce((acc:number, item) => {
            if (typeof item === 'number') {
                return acc + item;
            } else if (item instanceof Object && !(item instanceof Array)) {
                return this.recursiveSum(item);
            } else {
                return acc;
            }
        }, 0);

        return sum;
    }


    protected async getPrivileges() {
        const privilegesResponse = await admin_firestore.collection('users').doc(this.userId).collection('control').doc('PrivilegesFreeServices').get();
        const privileges = (privilegesResponse.exists ? privilegesResponse.data() : null) as UsersControl['PrivilegesFreeServices'] | null;
        return privileges;
    };

    protected createActionsRemaining() {
        const actionsRemaining = this.actionList.reduce((acc:Partial<{[key in Item]:boolean}>, item) => {
            acc[item] = true;
            return acc;
        }, {} as Partial<{[key in Item]:boolean}>);

        return actionsRemaining;
    };

    protected listActivesProvileges(privileges:Record<string, UsersControlPrivileges> | null) {
        const list = this.actionList.reduce((acc:{[key in Item]:{id:string, action:string}[]}, action) => {
            if (action === 'quizGeneration') {                    
                acc[action] = Object.values(privileges ?? {}).filter(item => item.privilegeData.readPdf[action][this.quiz.public ? 'publicDocs': 'privateDocs'] > 0).map(priv => ({id:priv.id, action}));
            } else {
                acc[action] = Object.values(privileges ?? {}).filter(item => item.privilegeData.readPdf[action] > 0).map(priv => ({id:priv.id, action}));
            }
            return acc;
        }, {} as {[key in Item]:{id:string, action:string}[]});

        return list;
    }

    protected getActivesPrivilegesIds(list:{
        pdfUpload: { id: string; action: string; }[];
        questions: { id: string; action: string; }[];
        quizGeneration: { id: string; action: string; }[];
        coverGenerationForPrivateDocs: { id: string; action: string; }[]; }) {

        type IdList = typeof list.questions[0];
        const coverId = (list.coverGenerationForPrivateDocs[0] ?? null) as IdList | null;
        const pdfUploadId = (list.pdfUpload[0] ?? null) as IdList | null;
        const questionsId = (list.questions[0] ?? null) as IdList | null;
        const quizGenerationId = (list.quizGeneration[0] ?? null) as IdList | null;


        return { coverId, pdfUploadId, questionsId, quizGenerationId }
    }


    protected subtractPrivilegesAmount({ privOptions, privileges, actionsRemaining }:{
        privOptions:{ [key in 'coverId' | 'pdfUploadId' | 'questionsId' | 'quizGenerationId']:{ id: string; action: string; } | null},
        privileges: Record<string, UsersControlPrivileges> | null,
        actionsRemaining: Partial<{ questions: boolean; pdfUpload: boolean; quizGeneration: boolean; coverGenerationForPrivateDocs: boolean; }>
    }) {

        const { coverId, pdfUploadId, questionsId, quizGenerationId } = privOptions;
        if (coverId) {
            if (privileges![coverId.id].privilegeData.readPdf['coverGenerationForPrivateDocs'] > 0) {
                privileges![coverId.id].privilegeData.readPdf['coverGenerationForPrivateDocs'] -= 1;
                delete actionsRemaining['coverGenerationForPrivateDocs']
            }
        } else if (pdfUploadId) {
            if (privileges![pdfUploadId.id].privilegeData.readPdf['pdfUpload'] > 0) {
                privileges![pdfUploadId.id].privilegeData.readPdf['pdfUpload'] -= 1;
                delete actionsRemaining['pdfUpload']
            }
        } else if (questionsId) {
            if (privileges![questionsId.id].privilegeData.readPdf['questions'] > 0) {
                privileges![questionsId.id].privilegeData.readPdf['questions'] -= 1;
                delete actionsRemaining['questions']
            }
        } else if (quizGenerationId) {
            if (privileges![quizGenerationId.id].privilegeData.readPdf['quizGeneration'][this.quiz.public ? 'publicDocs': 'privateDocs'] > 0) {
                privileges![quizGenerationId.id].privilegeData.readPdf['quizGeneration'][this.quiz.public ? 'publicDocs': 'privateDocs'] -= 1;
                delete actionsRemaining['quizGeneration']
            }
        };

        return { privileges, actionsRemaining }
    }

    protected async checkPrivileges() {                

        let actionsRemaining = this.createActionsRemaining();
        
        let privileges = await this.getPrivileges();
           
        
        if (Object.values(privileges ?? {}).length > 1) {

            const list = this.listActivesProvileges(privileges);

            const { coverId, pdfUploadId, questionsId, quizGenerationId } = this.getActivesPrivilegesIds(list);
            
            const { privileges:privileges1, actionsRemaining:actionsRemaining1 } = this.subtractPrivilegesAmount({ privOptions:{ coverId, pdfUploadId, questionsId, quizGenerationId }, privileges, actionsRemaining })
            actionsRemaining = actionsRemaining1;
            privileges = privileges1;
            
            const privilegesToDelete = Object.values(privileges ?? {}).filter(item => this.recursiveSum(item.privilegeData.readPdf) === 0)
            privilegesToDelete.map(item => {
                delete privileges?.[item.id];
            })

        } else if (Object.values(privileges ?? {}).length === 1) {
            const key = Object.keys(privileges ?? {})[0]
            this.actionList.map(item => {
                if (item === 'quizGeneration') {
                    if (privileges![key].privilegeData.readPdf[item][this.quiz.public ? 'publicDocs': 'privateDocs'] > 0) {
                        privileges![key].privilegeData.readPdf[item][this.quiz.public ? 'publicDocs': 'privateDocs'] -= 1
                        delete actionsRemaining[item];
                    }
                } else {
                    if (privileges![key].privilegeData.readPdf[item] > 0) {
                        privileges![key].privilegeData.readPdf[item] -= 1
                        delete actionsRemaining[item];
                    }
                }
            });

            const sum = this.recursiveSum(privileges![key].privilegeData.readPdf);

            if (sum === 0) {
                delete privileges![key];
            };
            

        };

        await admin_firestore.collection('users').doc(this.userId).collection('control').doc('PrivilegesFreeServices').update(privileges ?? {});

    }

};