import { PdfParsedData, PdfParsedMetadata } from "@/src/modules/VectorStoreProcess";
import { Cotacao } from "@/src/modules/projectExclusive/UpdateDollarPrice";

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
        
    },
    users:Record<string, {
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
                free:Plan,
                standard:Plan,
                enterprise:Plan,
            },
            // new collection
            data:Record<string, {
                id:string,
                public:boolean,
                description:string,
                dateOfCreation:string,
                metadata:PdfParsedMetadata,
                imageCover:{url:string, active:boolean}[],
                questions:Record<string, {
                    id:string,
                    question:string,
                    response:{
                        chunksRelated:PdfParsedData[],
                        text:string,
                    },
                }>,
                quiz:Record<string, {
                    id:string,
                    title:string,
                    description:string,
                    imageBackground:string,
                    chunksRelated:PdfParsedData[],
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
                }>,                
            }>
        }
    }
}