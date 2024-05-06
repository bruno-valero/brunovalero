import { Pdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import fromCollection from "@/src/config/firebase/firestore";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { UseState } from "@/utils/common.types";
import { where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function usePdfList() {


    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db } = globalState.firebase;

    const [pdfList, setPdfList] = useState<Pdf[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

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

    const genres = useMemo(() => {
        const gen = pdfList.map(item => item.metadata.genres);
        const uniqueGenres =  gen.reduce((acc, item) => [...acc, ...item], []).reduce((acc:Record<string, any>, item) => {
            acc[item] = '';
            return acc;
        },{});

        return Object.keys(uniqueGenres);
    }, [pdfList]);


    const filteredList = useMemo(() => {
        // alert(selectedGenres)
        console.log(selectedGenres);
        const list = pdfList.filter(item => selectedGenres.length > 0 ? (item.metadata.genres.filter(g => selectedGenres.includes(g)).length > 0) : true);
        console.log(list)
        return list
    }, [pdfList, selectedGenres])


    return {
        pdfList:[pdfList, setPdfList] as UseState<Pdf[]>,
        selectedGenres:[selectedGenres, setSelectedGenres] as UseState<string[]>,
        filteredList,
        genres,
    };


}