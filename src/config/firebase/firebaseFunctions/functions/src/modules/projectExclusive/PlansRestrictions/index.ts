import { ControlPlanReadPdfPlans } from "@/src/config/firebase-admin/collectionTypes/control";
import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import UserActions from "../UserActions";
import UserFinancialData from "../UserManagement/UserFinancialData";


export default class PlansRestrictions {

    userActions:UserActions;
    userFinancialData:UserFinancialData;

    constructor() {
        this.userActions = new UserActions();
        this.userFinancialData = new UserFinancialData();
    };

    async create(service:'readPdf', planType:'free' | 'standard' | 'enterprise', planData:ControlPlanReadPdfPlans) {

        await admin_firestore.collection('control').doc('plans').collection(service).doc(planType).set(planData, { merge:true });

    };

    async createreadPdfFreePlan() {

        const stripePrice = await this.userFinancialData.stripe.stripe.prices.create({
            unit_amount:0,
            recurring:{
                interval:'month',                
            },
            currency:'brl',      
            nickname:'free',
            metadata:{
                name:'free',
                service:'readPdf',
            },
            product_data:{
                name:'free',
                metadata:{
                    service:'readPdf',
                }           
            }
        })

        const data:ControlPlanReadPdfPlans = {
            stripePrice,
            customName:'Básico',
            questionsPerMonth:{
                amount:'unlimited',
                price:0.06
            },
            pdfUploadsPerMonth:{
                amount:'unlimited',
                chunkOfWords:100_000,
                pricePerChunkOfWords:0.29,
            },
            coverPerDoc:{
                amount:'unlimited',
                price:0.8,
            },
            docsPeruser:50,
            multiDocsQuestions:{
                upToThreeDocs:{
                    amount:0,
                    price:0.12,
                },
                moreThanThreeDocs:{
                    amount:0,
                    price:0.18,
                },
            },
            quizPerDoc:{
                publicDoc:{
                    amount:'unlimited',
                    generations:{
                        amount:'unlimited',
                        price:2,
                    },                
                },
                privateDoc:{
                    amount:'unlimited',
                    generations:{
                        amount:'unlimited',
                        price:2,
                    }
                }
            }
        }        

        await this.create('readPdf', 'free', data)
    }

    async createreadPdfStandardPlan() {

        const stripePrice = await this.userFinancialData.stripe.stripe.prices.create({
            unit_amount:2000,
            recurring:{
                interval:'month',                
            },
            currency:'brl',   
            nickname:'standard',
            metadata:{
                name:'standard',
                service:'readPdf',
            },         
            product_data:{
                name:'standard',
                metadata:{
                    service:'readPdf',
                }                
            }
        })

        const data:ControlPlanReadPdfPlans = {
            customName:'Empreendedor',
            stripePrice,
            questionsPerMonth:{
                amount:'unlimited',
                price:0.06
            },
            pdfUploadsPerMonth:{
                amount:'unlimited',
                chunkOfWords:100_000,
                pricePerChunkOfWords:0.29,
            },
            coverPerDoc:{
                amount:'unlimited',
                price:0.8,
            },
            docsPeruser:'unlimited',
            multiDocsQuestions:{
                upToThreeDocs:{
                    amount:0,
                    price:0.12,
                },
                moreThanThreeDocs:{
                    amount:0,
                    price:0.18,
                },
            },
            quizPerDoc:{
                publicDoc:{
                    amount:1,
                    generations:{
                        amount:'unlimited',
                        price:2,
                    },                
                },
                privateDoc:{
                    amount:1,
                    generations:{
                        amount:'unlimited',
                        price:2,
                    }
                }
            }
        };

        await this.create('readPdf', 'standard', data)
    }

    async createreadPdfEnterprisePlan() {

        const stripePrice = await this.userFinancialData.stripe.stripe.prices.create({
            unit_amount:5000,
            recurring:{
                interval:'month',                
            },
            currency:'brl', 
            nickname:'enterprise',
            metadata:{
                name:'enterprise',
                service:'readPdf',
            },      
            product_data:{
                name:'enterprise',  
                metadata:{
                    service:'readPdf',
                }               
            }      
        })

        const data:ControlPlanReadPdfPlans = {
            customName:'Prêmium',
            stripePrice,
            questionsPerMonth:{
                amount:'unlimited',
                price:0.06
            },
            pdfUploadsPerMonth:{
                amount:'unlimited',
                chunkOfWords:100_000,
                pricePerChunkOfWords:0.29,
            },
            coverPerDoc:{
                amount:'unlimited',
                price:0.8,
            },
            docsPeruser:'unlimited',
            multiDocsQuestions:{
                upToThreeDocs:{
                    amount:'unlimited',
                    price:0.12,
                },
                moreThanThreeDocs:{
                    amount:'unlimited',
                    price:0.18,
                },
            },
            quizPerDoc:{
                publicDoc:{
                    amount:'unlimited',
                    generations:{
                        amount:'unlimited',
                        price:2,
                    },                
                },
                privateDoc:{
                    amount:'unlimited',
                    generations:{
                        amount:'unlimited',
                        price:2,
                    }
                }
            }
        };

        await this.create('readPdf', 'enterprise', data)
    };

    async getPlan(service:'readPdf', planType:'free' | 'standard' | 'enterprise') {
        const resp = await admin_firestore.collection('control').doc('plans').collection(service).doc(planType).get();
        const plan = (resp.exists ? resp.data() : null) as ControlPlanReadPdfPlans | null;
        return plan;
    }

    async hasPermission({ uid, action, service, docId }:{ uid:string, action: "coverGeneration" | "pdfUploads" | "questions" | "quizGeneration", service: "readPdf", docId:string}) {

        const fiancialData = await this.userFinancialData.getFinancialData({ uid });
        if (!fiancialData) return false;
        
        // console.log(`action: ${action}`);
        // console.log(`active Plan: ${fiancialData.activePlan.readPdf}`);
        const plan = await this.getPlan(service, fiancialData.activePlan.readPdf);
        // console.log(`Plan: ${JSON.stringify(plan, null, 2)}`);

        if (action === 'pdfUploads') {
            const planPerMonth = (plan?.pdfUploadsPerMonth)?.amount;
            const planTotal = plan?.docsPeruser
            if (typeof planPerMonth === 'undefined' || typeof planTotal === 'undefined') return false;
            if (planPerMonth === 'unlimited' && planTotal === 'unlimited') return true;
            // total de uploads
            const total = (await admin_firestore.collection('services').doc('readPdf').collection('data').count().get()).data().count;
            const numberOnTotal = typeof planTotal == 'number' 
            const numberOnMonth = typeof planPerMonth == 'number' 
            if (numberOnTotal && numberOnMonth) {
                const isOnActionLimit = await this.userActions.inOnActionLimit({ uid, action, service, limit:planPerMonth });
                if (planTotal <= total || isOnActionLimit) return false;
            };
        } else if(action === 'questions') {
            const planPerMonth = (plan?.questionsPerMonth)?.amount;
            if (typeof planPerMonth === 'undefined') return false;
            if (planPerMonth === 'unlimited') return true;
            const isOnActionLimit = await this.userActions.inOnActionLimit({ uid, action, service, limit:planPerMonth });
            return !isOnActionLimit;
        } else if (action === 'coverGeneration') {
            
            const planVal = plan?.coverPerDoc.amount;
            if(planVal === 'unlimited') return true;

            const resp = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
            const pdf = (resp.exists ? resp.data() : null) as Pdf | null;
            if (!pdf) return false;
            const images = pdf.imageCover.length;
            if (images >= (planVal ?? 0)) return false;
            return true;
        } else if (action === 'quizGeneration') {

            const planPrivate = plan?.quizPerDoc.privateDoc.amount;
            const planPublic = plan?.quizPerDoc.publicDoc.amount;

            if(planPrivate === 'unlimited' && planPublic === 'unlimited') return true;
            const resp = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).get();
            const pdf = (resp.exists ? resp.data() : null) as Pdf | null;
            if (!pdf) return false;
            const isPublic = pdf.userId === uid;
            const quizNumber = (await admin_firestore.collection('services').doc('readPdf').collection('data').doc(docId).collection('quiz').count().get()).data().count;
            if (isPublic) {
                if (planPublic === 'unlimited') return true;
                if (quizNumber >= (planPublic ?? 0)) return false;
                return true;
            } else {
                if (planPrivate === 'unlimited') return true;
                if (quizNumber >= (planPrivate ?? 0)) return false;
                return true;
            }
        }
        
        
    }


    
}