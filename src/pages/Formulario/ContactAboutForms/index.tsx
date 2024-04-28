'use client';

import Social from "@/src/modules/Social";

export default function ContactAboutForms() {

    const whatsappMessage = `Olá Bruno, tudo bem?
                
    Me interessei pelo seu serviço de criação de formulários personalizados. Gostaria de saber mais a respeito.`


    return (
        <button onClick={() => (new Social({whatsapp:'11960609211'}).whatsapp({message:whatsappMessage}))} className="max-sm:w-[90%] md:max-w-[480px] my-[70px] p-[25px] flex flex-col items-center justify-center gap-5 rounded shadow" >
            <div className="flex items-center justify-center flex-col gap-1" >
                <h2 className="text-2xl font-black" >Saiba Mais</h2>
                <p className="text-lg font-light text-start" >Entre em contato para saber mais sobre os formulários.</p>
            </div>
        </button>
    );
};