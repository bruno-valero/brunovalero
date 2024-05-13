import SetLoadingFalse from "@/src/components/structural/SetLoadingFalse";
import Formulario from "@/src/pages/Formulario";



export default function Formularios() {

    return (
        <div className="w-full max-h-screen flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto">      
        <SetLoadingFalse />
        <Formulario />

        </div>
    )
}