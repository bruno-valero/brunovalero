import { PdfParsedData, PdfParsedMetadata } from "@/src/modules/VectorStoreProcess";
import { Cotacao } from "../../modules/projectExclusive/UpdateDollarPrice";

type PlanValue = number | 'unlimited';
type AmountAndPrice ={
    amount:number | 'unlimited',
    price:number,
};
type QuizDocs = {
    amount:PlanValue,
    generations:{
        amount:PlanValue,
        price:number
    },
}

type Plan = {
    questionsPerMonth:AmountAndPrice,
    pdfUploadsPerMonth:AmountAndPrice,
    docsPeruser:PlanValue,
    quizPerDoc:{
        privateDoc:QuizDocs,
        publicDoc:QuizDocs,
    },
    coverPerDoc:{
        amount:PlanValue,
        price:number
    },
    multiDocsQuestions:{
        upToThreeDocs:AmountAndPrice,
        moreThanThreeDocs:AmountAndPrice,
    },
}

export type CollectionTypes = {
    control:{
        variables:{
            dollarPrice:{
                brl:{
                    price:number,
                    updateTime:number,
                    metadata:Cotacao,
                }
            }
        },
        plans:{
            readPdf:{
                free:Plan,
                standard:Plan,
                enterprise:Plan,
            },
        },
        
    },
    users:Record<string, {
        // new collection
        control:{
            PrivilegesFreeServices:{
                privilegeTitle:string,
                privilegeDescription:string,
                privilegeData: {
                    readPdf:{
                        questions:number,
                        pdfUpload:number,
                        quizGeneration:{
                            privateDocs:number,
                            publicDocs:number,
                        },
                        coverGenerationForPrivateDocs:number,
                    },
                }
            },
        }
    }>,
    services:{
        readPdf:{
            // data on doc
            plans:{
                current:'free' | 'standard' | 'enterprise',

            },
            // new collection
            data:Record<string, {
                id:string,
                public:boolean,
                price:number,
                description:string,
                dateOfCreation:string,
                metadata:PdfParsedMetadata,
                imageCover:{url:string, active:boolean, storagePath:string}[],
                // new collection
                questions:Record<string, {
                    id:string,
                    question:string,
                    response:{
                        chunksRelated:PdfParsedData[],
                        text:string,
                    },
                }>,
                // new collection
                quiz:Record<string, {
                    id:string,
                    title:string,
                    description:string,
                    public:boolean,
                    price:number,
                    imageBackground:{
                        wide:{url:string, path:string},
                        slim:{url:string, path:string},
                    },
                    chunksRelated:{pageContent:string, metadata:PdfParsedData[0]['info']}[],
                    questions:Record<string, {
                        id:string,
                        question:string,
                        answer:string,
                        options:{
                            a:string,
                            b:string,
                            c:string,
                            d:string,
                            e:string,
                        },
                    }>,
                    tries?:Record<string, {
                        id:string,
                        questions:Record<string, {
                            id:string,
                            timeAnswering:number,
                            rightOption:'a' | 'b' | 'c' | 'd' | 'e',
                            answer:'a' | 'b' | 'c' | 'd' | 'e',
                        }>,
                        score:number,
                        performanceObservation:string,
                        tip:string,
                    }>,
                }>,                
            }>
        }
    }
}

export type QuizPdf = CollectionTypes['services']['readPdf']['data']['']['quiz'][0];