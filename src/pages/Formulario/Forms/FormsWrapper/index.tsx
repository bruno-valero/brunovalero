'use client';

import colors from "@/src/constants/colors";
import { useState } from "react";
import FormAdmWrapper from "../AdmVersion/FormAdmWrapper";
import { ClientVersion } from "../ClientVersion";

function TabsButton({active, onClick, text}:{active:boolean, onClick:(() => void), text:string}) {

    return (
        <button onClick={onClick} className="p-3 rounded" style={{backgroundColor:active ? colors.valero() : colors.valero(.4)}} >
            <span className="" style={{color:active ? 'white' : colors.valero()}}  >
                {text}
            </span>
        </button>
    );
};


export default function FormsWrapper() {
    

    const [client, setClient] = useState(true);

    function clientVersion() {
        setClient(true);
    };

    function admVersion() {
        setClient(false);
    };


    return (
        <div className="w-full min-h-screen flex items-center justify-center" style={{backgroundColor:colors.valero(.1)}} >
            <div className="max-sm:w-[90%] md:max-w-[480px] pt-[70px] flex flex-col items-center justify-center" >
                <div className="flex justify-around items-center flex-row w-full" >
                    <TabsButton active={client} onClick={clientVersion} text="Versão do Cliente" />
                    <TabsButton active={!client} onClick={admVersion} text="Versão do Adm" />                    
                </div>
                
                
                {client ? <ClientVersion /> : <FormAdmWrapper />}                

            </div>
        </div>
    );
};