import { Control } from "@/src/config/firebase-admin/collectionTypes/control";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import PlansRestrictions from "../PlansRestrictions";

export default class PdfPricing {

    /**
     * Preço em reais de cada serviço.
     */
    protected _data:Control['pricing']['readPdf'] = {        
        actionsValue: {            
            pdfUpload:4,
            questions:0.35,
            coverGenerationForPrivateDocs:6.7,
            quizGeneration:{
                privateDocs:7,
                publicDocs:7,
            },
        },
        plansValue:{
            free:0,
            standard:25,
            enterprise:70,
        }           
    }


    /**
     * Preço em reais de cada serviço.
     */
    get data() {
        return this._data;
    };


    async update() {

        const update:Control['pricing'] = {
            readPdf:this.data
        }
        await admin_firestore.collection('control').doc('pricing').set(update);
        const plans = new PlansRestrictions();
        await plans.createreadPdfFreePlan(this.data.plansValue.free * 100 );
        await plans.createreadPdfStandardPlan(this.data.plansValue.standard * 100 );
        await plans.createreadPdfEnterprisePlan(this.data.plansValue.enterprise * 100 );
    };

    async get() {
        const resp = await admin_firestore.collection('control').doc('pricing').get();
        const pricing = (resp.exists ? resp.data() : null) as Control['pricing'] | null;
        return pricing?.readPdf ?? null;
    };

}