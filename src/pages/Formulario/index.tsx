import colors from "@/src/constants/colors";
import adiministrarFormulario from '@/src/images/adiministrarFormulario.png';
import servicoCustomizavel from '@/src/images/servicoCustomizavel.png';
import ContactAboutForms from "./ContactAboutForms";
import { Forms } from "./Forms";


interface CardFormProps {
    imageSrc:string, 
    text:string
};

function CardForm({ imageSrc, text }:CardFormProps) {

    return (
        <div className="rounded shadow p-4 w-[250px] max-sm:min-w-[250px]  flex flex-col items-center justify-start flex-1 gap-3" >
            <img src={imageSrc} alt="serviço customizável" className="w-full object-cover rounded" />
            <p className="text-lg font-light text-start" style={{color:colors.valero()}} >
                {text}
            </p>
        </div>
    )
}


export default function Formulario() {

    
    return (
        <div className="w-full flex items-center justify-center flex-col" >
            <div className="flex items-center justify-center flex-col gap-6 p-6 rounded max-sm:w-[90%]" style={{}} >
                <h2 className="text-6xl font-black text-gray-100" style={{color:colors.valero()}} >Formulário</h2>
                <p className="text-lg leading-7 font-light text-start text-gray-100" style={{color:colors.valero()}} >
                    Abaixo está disponível um exemplo do funcionamento do formulário.
                </p>
                <div className="flex items-stretch justify-start gap-5 max-sm:max-w-[400px] max-sm:overflow-x-auto max-sm:px-[10px]" >
                    <CardForm imageSrc={servicoCustomizavel.src} text="Este é um serviço personalizável, ou seja, os campos a serem preenchidos serão escolhidos por você." />                    
                    <CardForm imageSrc={adiministrarFormulario.src} text={`Em um cenário real, a sessão administrativa só poderá ser acessada pelo contratante do serviço.`} />                    
                </div>
            </div>
            <Forms.FormsWrapper />
            <div className="flex justify-center items-center flex-col w-full bg-white min-h-[50vh]" >

                <ContactAboutForms />

            </div>
        </div>
    );
};