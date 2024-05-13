'use client';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CardProps {
    imageSrc:string;
    title:string;
    text:string;
    path:string;
};

export default function CardSectionCardPopOver({ imageSrc, title, text, path }:CardProps) {
    
    const router = useRouter();

    const globalState = useGlobalProvider();
    const { changeRoute } = globalState.changingRoute ?? {};

    const cardRef = useRef<HTMLButtonElement>(null);
    const [cardHover, setCardHover] = useState(false);
    const [ms200, setMs200] = useState(false);

    function onHover() {
        setCardHover(true);
    };
    function outHover() {
        setCardHover(false);
    };

    useEffect(() => {
        let time:any
        if (cardHover) {
            time = setTimeout(() => {
                setMs200(true);
            }, 200);
        } else {
            if (ms200) {
                setMs200(false);
            }
        }
    }, [cardHover, ms200]);

  return (      
    <>
        <Popover>
            <PopoverTrigger className='shadow rounded relative flex items-start justify-center h-[170px] transition-all ease-in duration-200' >
            <img src={imageSrc} alt="Formulários" className='absolute z-10 top-[-15px] w-[50%] object-cover rounded transition-all ease-in duration-200' />
            <div className='p-4 opacity-0' >
                <h3 className='text-black font-bold' >{title}</h3>
                <p className='text-black ' >{text}</p>
            </div>
            <div className='p-4 absolute bottom-0 z-0 w-full' >
                <h3 className='text-gray-600 font-bold text-center' style={{marginBottom:0}} >{title}</h3>                
            </div>
            </PopoverTrigger>
            <PopoverContent className='shadow rounded relative flex flex-col items-center justify-start h-[480px] transition-all ease-in duration-200' >
                <img src={imageSrc} alt="Formulários" className='object-cover w-[90%] rounded' />
                
                <div className='p-4 w-full' >
                    <h3 className='text-gray-600 font-bold text-center' style={{marginBottom:5}} >{title}</h3>
                    <p className='text-gray-600 min-w-full transition-all ease-in duration-200' style={{display:'flex'}} >{text}</p>
                    <button onClick={() => changeRoute(path)} className="w-full rounded p-4 flex items-center justify-center text-white mt-4" style={{backgroundColor:colors.valero(), display:'flex'}} >
                        Fazer Teste
                    </button>
                </div>

            </PopoverContent>
        </Popover>        
    </>
  );
}
