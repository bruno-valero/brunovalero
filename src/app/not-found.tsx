'use client'

import { useRouter } from 'next/navigation';
import colors from '../constants/colors';


export default function Page404() {
  const router = useRouter()
  return (
    <div className='flex h-[100vh] w-[100vw] items-center justify-center px-5' style={{backgroundColor:colors.valero()}} >
      <div className='flex flex-col gap-1' >
        <h2 className='text-white text-2xl inline-block' >
          Página não encontrada
        </h2>
        <button className='bg-white rounded-md py-2 px-4 mt-1' onClick={() => router.push('/')} >
          <p className='text-black font-semibold' >
            Voltar ao Início
          </p>
        </button>
      </div>
    </div>
  );
};