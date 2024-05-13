// import {  } from 'firebase-admin'
import SetLoadingFalse from "@/src/components/structural/SetLoadingFalse";
import UserAdmData from "@/src/pages/UserAdmData";



export default async function AdmData() {

    return (
        <div id="Formularios" className="w-full max-h-screen flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto">      
        
        <SetLoadingFalse />
        <UserAdmData />

        </div>
    )
}