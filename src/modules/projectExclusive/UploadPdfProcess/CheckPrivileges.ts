import { QuizPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { UsersControl } from "@/src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "@/src/config/firebase-admin/config";

export default class CheckPrivileges {


    // userId:string;
    // currentAction:(keyof UsersControl['PrivilegesFreeServices'][0]['privilegeData']['readPdf']);
    // quiz:QuizPdf;

    constructor() {

        // this.userId = userId;
        // this.currentAction = currentAction;
        // this.quiz = quiz;

    };


    private recursiveSum(data: Record<string, any>):number {
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


    async check({ quiz, currentAction, userId }:{ quiz?:QuizPdf, userId:string, currentAction:(keyof UsersControl['PrivilegesFreeServices'][0]['privilegeData']['readPdf']); }) {                

        const privilegesResponse = await admin_firestore.collection('users').doc(userId).collection('control').doc('PrivilegesFreeServices').get();
        const privileges = (privilegesResponse.exists ? privilegesResponse.data() : null) as UsersControl['PrivilegesFreeServices'] | null;        
        console.log(`userId: ${userId}`)
        console.log(`Buscando os privilégios: ${privileges}`)
        let  hasSubtracted = false;
        
        if (Object.values(privileges ?? {}).length > 1) {
            let activePrivileges:string[];
            if (currentAction === 'quizGeneration') {
                activePrivileges = Object.values(privileges ?? {}).filter(item => item.privilegeData.readPdf[currentAction as 'quizGeneration'][quiz?.public ? 'publicDocs': 'privateDocs'] > 0).map(item => item.id);
            }
            else {
                activePrivileges = Object.values(privileges ?? {}).filter(item => item.privilegeData.readPdf[currentAction as 'questions'] > 0).map(item => item.id);
            };
            
            const activeId = (activePrivileges[0]) as string | null;
            if (activeId) {
                if (currentAction === 'quizGeneration') {
                    privileges![activeId].privilegeData.readPdf[currentAction as 'quizGeneration'][quiz?.public ? 'publicDocs': 'privateDocs'] -= 1;
                } else {
                    privileges![activeId].privilegeData.readPdf[currentAction as 'questions'] -= 1;
    
                };

                hasSubtracted = true;
            };


            const privilegesToDelete = Object.values(privileges ?? {}).filter(item => this.recursiveSum(item.privilegeData.readPdf) === 0)
            privilegesToDelete.map(item => {
                delete privileges?.[item.id];
            })

        } else if (Object.values(privileges ?? {}).length === 1) {
            const key = Object.keys(privileges ?? {})[0];
            
            if (currentAction === 'quizGeneration') {
                if (privileges![key].privilegeData.readPdf[currentAction][quiz?.public ? 'publicDocs': 'privateDocs'] > 0) {
                    privileges![key].privilegeData.readPdf[currentAction][quiz?.public ? 'publicDocs': 'privateDocs'] -= 1
                    hasSubtracted = true;
                }
            } else {
                if (privileges![key].privilegeData.readPdf[currentAction] > 0) {
                    privileges![key].privilegeData.readPdf[currentAction] -= 1
                    hasSubtracted = true;
                }
            }


            const sum = this.recursiveSum(privileges![key].privilegeData.readPdf);

            if (sum === 0) {
                delete privileges![key];
            };
            

        };

        console.log(`Atualizando privilégios: ${privileges}`)
        await admin_firestore.collection('users').doc(userId).collection('control').doc('PrivilegesFreeServices').update(privileges ?? {});

        return { isFree:hasSubtracted }

    };

};