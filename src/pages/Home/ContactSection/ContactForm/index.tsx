'use client';

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io";



export default function ContactSectionForm() {

    const globalState = useGlobalProvider();
    const dimensions = globalState.dimensions;

    const [sugestion, setSugestion] = useState('');
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');


    function makeMessage({sugestion, name}:{sugestion?:string, name?:string}) {
        const message = encodeURIComponent(`${name ? `Olá, eu sou ${name}.` : `Olá, tudo bem?`}

        Eu estava olhando seus serviços e decidi dar uma sugestão:

        ${sugestion??''}
        
        `.replace(/  /g, ''));

        const link = `https://wa.me/5511960609211?text=${message}`;
        return link;
    };


  return (
    dimensions && (
      <div className="flex flex-col items-center justify-center w-full" >


        <div className="lg:w-[30%] w-[90%] flex flex-col gap-3 bg-white rounded shadow border-[1px] border-gray-300 p-4" >
            <div className="flex flex-col items-center justify-center gap-5 w-full mb-8" >
                <h3 className="font-bold text-3xl" style={{color:colors.valero()}} >
                    Deixe uma sujestão.
                </h3>
                <p className="font-normal text-base text-center" style={{color:colors.valero()}} >
                    Compartilhe que serviço seria interessante para o seu negócio. <br /><br /> Futuramente, sua sujestão poderá ser adicionada como um dos serviços disponíveis.
                </p>
            </div>
            <Textarea placeholder="Digite sua sugestão..." value={sugestion} onChange={e => setSugestion(e.target.value)} className="w-full text-lg text-gray-600" />
            <Input placeholder="Digite seu nome (opcional)" value={name} onChange={e => setName(e.target.value)} className="w-full text-lg text-gray-600" />
            {/* <Input placeholder="Deixe seu contato (opcional)" value={contact} onChange={e => setContact(e.target.value)} className="w-full text-lg text-gray-600" /> */}

            <a href={makeMessage({sugestion, name})} target="_blank" className="rounded p-3 flex items-center gap-2 justify-center mt-3" style={{backgroundColor:colors.valero()}} >
                <IoLogoWhatsapp color="white" size={18} />
                <span className="text-white font-bold text-base" >Enviar</span>
            </a>
        </div>


      </div>
    )
  );
}
