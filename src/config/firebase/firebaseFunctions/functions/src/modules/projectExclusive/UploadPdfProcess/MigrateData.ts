import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { admin_firestore, admin_storage } from "@/src/config/firebase-admin/config";
import { getDownloadURL } from "firebase-admin/storage";


export default class MigrateData {


    constructor() {


    };


    async migratePdfToPublic({ pdfId, uid }:{ pdfId:string, uid:string }) {

        const pdfResp = await admin_firestore.collection('services').doc('readPdf').collection('data').doc(pdfId).get()
        const pdf = (pdfResp.exists ? pdfResp.data() : null) as Pdf | null;
        if (!pdf) return;
        pdf.userId = 'public';

         const move = async(item:{ storagePath:string, url:string }) => {

            await admin_storage.file(item.storagePath).move(item.storagePath.replace(uid, 'public'));
            item.storagePath = item.storagePath.replace(uid, 'public')
            const file = admin_storage.file(item.storagePath)
            const url = await getDownloadURL(file)
            item.url = url;
            return { storagePath:item.storagePath, url:item.url }
        }

        const imageCover = await Promise.all(pdf.imageCover.map(async(item, i) => {
            
            const { storagePath, url } = await move(item);
            item.storagePath = storagePath;
            item.url = url;

            const { storagePath:spMd, url:urlMd } = await move(item.sizes.md);
            item.sizes.md.storagePath = spMd
            item.sizes.md.url = urlMd

            const { storagePath:spmin, url:urlmin } = await move(item.sizes.min);
            item.sizes.min.storagePath = spmin
            item.sizes.min.url = urlmin;

            const { storagePath:spsm, url:urlsm } = await move(item.sizes.sm);
            item.sizes.sm.storagePath = spsm
            item.sizes.sm.url = urlsm

            return item;
        }))

        pdf.imageCover = imageCover;

        await admin_firestore.collection('services').doc('readPdf').collection('data').doc(pdfId).update({ imageCover:pdf.imageCover, userId:pdf.userId });

    }

};