"use client"

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useMemo, useRef } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { twMerge } from 'tailwind-merge';
import { NavigationMenuCustom } from '../NavigationMenuCustom/index';

import colors from '@/src/constants/colors';
import brand from '@/src/images/brand.png';
import Social from '@/src/modules/Social';
import { useGlobalProvider } from '@/src/providers/GlobalProvider';
import { Alert } from '../../Alert';
import { AlertBuyPoints } from '../../AlertBuyPoints';

const side = 'left';

interface SheetCustomProps {
  children:ReactNode;
};

export function SheetCustom({ children }:SheetCustomProps) {
  const router = useRouter();
  const path = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const globalState = useGlobalProvider();
  const [, setResetedState] = globalState.resetedState;
  const globalUser = globalState.globalUser;
  const { width } = globalState.dimensions ?? {};
  const financialData = globalState.financialData;

  

  const components: { title: string; href?: string; action?:() => void; description: string }[] = [
    {
      title: globalUser.data ? "Sair" : "Login com Google",
      // href: "/carteirinha",
      description:
      globalUser.data ? "Faça o logout da plataforma" : "Faça login para poder testar algumas funcionalidades da plataforma.",
        action:async() => globalUser.data ? await globalUser.userAuth.logout() : await globalUser.createWithLogin(),
    },    
    {
      title: "Entre em contato",
      // href: "/carteirinha",
      description:
        "Saiba mais sobre os serviços, dê sugestões ou apresente novas ideias.",
        action:() => (new Social({whatsapp:'11960609211'})).whatsapp({message:`Olá, tudo bem?
        
        Gostaria de saber mais sobre os seus serviços.`}),
    },    
  ];

  const comps = useMemo(() => {
    if (typeof financialData?.credits !== 'undefined') {
      const comp = [...components];
      comp.splice(1, 0, {
        title: `Créditos: R$${financialData?.credits ?? 0},00`,
        // href: "/carteirinha",
        description:"Utilize os Créditos para acessar recursos pagos.",
          action:async() => globalUser.data ? await globalUser.userAuth.logout() : await globalUser.createWithLogin(),
      },)
      return comp;
    } else {
      return components;
    }
  }, [financialData, components])

  return (
    <div ref={wrapperRef} className="grid grid-cols-2 gap-2 h-[100vh] w-[100vw] relative overflow-hidden">
      <Sheet key={side} >
        <div className='absolute right-0 top-0 w-full flex justify-around items-center shadow-md h-[80px] px-2 z-50' >
          <SheetTrigger asChild>
            <Button variant="ghost" ><GiHamburgerMenu size={width < 500 ? 28 : 35} /></Button>
          </SheetTrigger>
          <button className=' h-[100%] flex items-center justify-center' onClick={() => router.push('/')} >
            <div className='flex items-center justify-center gap-2 h-[75%] px-3 rounded-full' >
              <img src={brand.src} alt="Bruno Valero" className={twMerge('h-[95%] object-cover rounded-full', width < 500 && 'h-[60%]')} />
              <span className={twMerge('text-3xl font-semibold text-white', width < 500 && 'text-base')} style={{color:colors.valero()}} >
                Bruno Valero
              </span>
            </div>
          </button>
          <NavigationMenuCustom {...{components:comps}} />
            {/* <Button variant='default' onClick={() => {}} >Teste</Button> */}
        </div>

        <div className='absolute z-0 top-[80px] w-[100vw] overflow-x-hidden overflow-y-auto flex min-h-screen' style={{height:((wrapperRef.current?.offsetHeight ?? 0) - 80)}} >
          <Alert />
          <AlertBuyPoints />
          {children}
        </div>

        <SheetContent side={side}  >
          <SheetHeader>
            <SheetTitle className='text-xl text-center' >Bruno Valero</SheetTitle>
            <SheetDescription className='text-base text-center' >
              Organize, Agilize e Simplifique o seu Negócio
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-1 py-4 mt-5">
            <div className={twMerge("flex items-start justify-start")}>
              <Button variant="ghost" className={twMerge('w-[100%] flex items-center justify-start text-xl', /^\/$/i.test(path ?? '') && 'bg-gray-400 text-white')} onClick={() => router.push('/')} >Home</Button>
            </div>
            <div className={twMerge("flex items-start justify-start")}>
              <Button variant="ghost" className={twMerge('w-[100%] flex items-center justify-start text-xl', /formulario/i.test(path ?? '') && 'bg-gray-400 text-white')} onClick={() => router.push('/formulario')} >Formulario</Button>
            </div>            
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
