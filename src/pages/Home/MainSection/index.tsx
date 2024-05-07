'use client'

import WaveDivision from '@/src/components/styles/WaveDivision/inddex';
import colors from '@/src/constants/colors';
import agilize from '@/src/images/brunovalero-agilize-seu-negocio.png';
import { useGlobalProvider } from '@/src/providers/GlobalProvider';
import { useRef } from 'react';

export default function HomePageMainSection() {

  const divRef = useRef<HTMLDivElement>(null);

    const globalState = useGlobalProvider();
    const dimensions = globalState.dimensions;

  const calcularNovoValorY = (valorY:number) => {
    return valorY * 1;
  };
  

  function handlePress() {
    divRef.current?.parentElement?.scrollTo({
        top:dimensions.height - (dimensions.height * .6),
        behavior:'smooth',
    })
  }

  return ( 
    dimensions && (
      <div ref={divRef} className="relative overflow-hidden flex items-start justify-center w-full min-h-[80vh]" style={{backgroundColor:colors.valero()}} >
          <div className="p-8 absolute z-10 h-[50%] flex items-center justify-center flex-col" >
              <h1 className="text-white text-4xl font-black">Organize, Agilize e Simplifique o seu Negócio</h1>
          </div>
          <button className="p-8 absolute z-10 bottom-0 h-[50%] flex items-center justify-center flex-col" onClick={handlePress} >
              <img src={agilize.src} alt="Agilize seu Negócio" className='h-full object-cover rounded shadow-lg' />
          </button>
          <div className="absolute inset-x-0 bottom-[-1px] z-0">
              <WaveDivision color='#fff' screenWidth={dimensions.width} />
          </div>
      </div>
    )
  );
}
