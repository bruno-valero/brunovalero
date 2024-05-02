import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function usePdfList() {


    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db } = globalState.firebase;

    const [pdfList, setPdfList] = useState<Pdf[]>([]);

    useEffect(() => {
        const snaps = {} as Record<string, any>
        globalUser.userAuth.onAuthStateChanged(async(user) => {            
            
            if (user) {

                fromCollection('services', db!).getDocById('readPdf').getCollection('data').onSnapshotExecute((snap) => {
                    const pdfs = snap.map(item => item.data) as Pdf[];
                    setPdfList(pdfs);
                }, snaps, 'public-and-private-pdfs', undefined, [where('userId', 'in', [user.uid, 'public'])])
                // const snap = await fromCollection('services', db!).getDocById('readPdf').getCollection('data').docs([where('userId', '==', user.uid)])
                // const snapPublic = await fromCollection('services', db!).getDocById('readPdf').getCollection('data').docs([where('userId', '==', 'public')])
                // const privatePdfs = snap.map(doc => doc.data as Pdf);
                // const publicPdfs = snapPublic.map(doc => doc.data as Pdf);
                // const pdfs = [...privatePdfs, ...publicPdfs];
                // setPdfList(pdfs);
            } else {
                fromCollection('services', db!).getDocById('readPdf').getCollection('data').onSnapshotExecute((snap) => {
                    const pdfs = snap.map(item => item.data) as Pdf[];
                    setPdfList(pdfs);
                }, snaps, 'public-and-private-pdfs', undefined, [where('userId', 'in', ['public'])])
                // const snapPublic = await fromCollection('services', db!).getDocById('readPdf').getCollection('data').docs([where('userId', '==', 'public')])
                // const publicPdfs = snapPublic.map(doc => doc.data as Pdf);
                // setPdfList(publicPdfs);
            }
        });

        return () => {
            Object.values(snaps).map(item => item());
        }

    },[]);


    return [pdfList, setPdfList] as UseState<Pdf[]>;


}