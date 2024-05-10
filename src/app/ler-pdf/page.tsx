// import {  } from 'firebase-admin'
import PlansRestrictions from "@/src/modules/projectExclusive/PlansRestrictions";
import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import LerPdf from "@/src/pages/LerPdf";



export default async function LerPdfComponent() {           
    // const { storage } = firebaseInit({ envs, initializeApp, getAuth, getDatabase, getFirestore, getStorage, getApps });

    // async function resizeImage(inputFilePath:Buffer, width:number, height:number) {
    //     return await sharp(inputFilePath)
    //         .resize({ width, height })
    //         .toBuffer();
    // };

    // const width = 1024;
    // const height = 1792;
    // const md = {
    //     width:Math.ceil(width * .5),
    //     height:Math.ceil(height * .5),
    // }
    // const sm = {
    //     width:Math.ceil(width * .3),
    //     height:Math.ceil(height * .3),
    // }
    // const min = {
    //     width:Math.ceil(width * .1),
    //     height:Math.ceil(height * .1),
    // }
    // // const originalRef = ref(storage!, `/services/readPdf/covers/W4cd8j5ZsUUI4akQ77csf0GORIv1/1714679445294`)
    // const docId = '1714729673165';
    // const id = `1714933567372`;
    // const path = `services/readPdf/covers/W4cd8j5ZsUUI4akQ77csf0GORIv1/${docId}/${id}`
    // const resp = await admin_storage.file(`${path}`).download();
    
    // const blob = new Blob([resp[0]], { type:'image/png' })
    // const buffer = Buffer.from(await blob.arrayBuffer());
    // const minBlob = new Blob([await resizeImage(buffer, min.width, min.height)], { type:'image/png' });
    // const smBlob = new Blob([await resizeImage(buffer, sm.width, sm.height)], { type:'image/png' });
    // const mdBlob = new Blob([await resizeImage(buffer, md.width, md.height)], { type:'image/png' });

    // // const Ref = ref(storage!, `${path}`);
    // const minRef = ref(storage!, `${path}-min`)
    // const smRef = ref(storage!, `${path}-sm`)
    // const mdRef = ref(storage!, `${path}-md`)

    // // await uploadBytes(Ref, blob);
    // await uploadBytes(minRef, minBlob);
    // await uploadBytes(smRef, smBlob);
    // await uploadBytes(mdRef, mdBlob);

    // // const Url = await getDownloadURL(Ref);
    // const minUrl = await getDownloadURL(minRef);
    // const smUrl = await getDownloadURL(smRef);
    // const mdUrl = await getDownloadURL(mdRef);

    // // console.log(`Url`, Url, '\n');
    // // console.log(`Path`, `${path}`, '\n');
    // console.log(`minUrl`, minUrl);
    // console.log(`minPath`, `${path}-min`, '\n');
    // console.log(`smUrl`, smUrl);
    // console.log(`smPath`, `${path}-sm`, '\n');
    // console.log(`mdUrl`, mdUrl);
    // console.log(`mdPath`, `${path}-md`, '\n');
    
    // const v = new VectorStoreProcess();

    // const { amount, ids } = await v.checkNamespacesAmount();
    // console.log(`amount: ${amount}`);
    // console.log(`ids: ${ids}`);
    const uf = new UserFinancialData();
    const plans = new PlansRestrictions();
    // await plans.createreadPdfFreePlan()
    console.log('iniciando subscrição...');
    await uf.subscribeToStandardPlan('W4cd8j5ZsUUI4akQ77csf0GORIv1');
    console.log('subscrição iniciada!');

    return (
        <div id="Formularios" className="w-full max-h-screen flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto">      
        
        <LerPdf />

        </div>
    )
}