'use client';

import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useState } from "react";
import { CiCircleCheck } from "react-icons/ci";
import FormClientForm from "../FormClientForm";
import FormClientPresentation from "../FormClientPresentation";


export default function FormClientWrapper() {

    const globalState = useGlobalProvider();
    const [, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;

    const [done, setDone] = useState(false);

    function handleSubmit() {
        setDone(true);
    };

    return (
        dimensions &&
        <div className="flex items-center justify-center flex-col bg-white shadow rounded px-[50px] py-[25px] my-5" >

            {!done ? (
                <>
                    <FormClientPresentation />
                    <FormClientForm handleSubmit={handleSubmit} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center" >
                    <CiCircleCheck size={70} color="rgba(40, 167, 69, .7)" />
                    <p className="font-light text-lg text-[rgba(40, 167, 69, .7)] text-center" >
                        Envio realizado com sucesso! <br /> <span className="font-semibold" >Muito obrigado pela colaboração.</span>
                    </p>
                </div>
            )}
            
        </div>
    );

};