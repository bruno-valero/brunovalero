import { Separator } from "@/components/ui/separator";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import Social from "@/src/modules/Social";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import BasicPlanProps from "./pansProps/BasicPlanProps";
import EnterprisePlanProps from "./pansProps/EnterprisePlanProps";
import StandardPlanProps from "./pansProps/StandardPlanProps";



export default function Pricing({ plan, moPrice, functions }:{ plan:'free' | 'standard' | 'enterprise', moPrice:number, functions:{isLogged: () => boolean, hasPaymentMethods: () => boolean} }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { height, width } = globalState.dimensions ?? {};
    const financialData = globalState.financialData;

    const [loadPlanSwitch, setLoadPlanSwitch] = useState(false);

    const planWidth = !width ? 0 : width > 500 ? width / 3.8 : width * 0.8;

    async function getPlan() {
        const log = functions.isLogged();
        if (!log || !globalUser.data) return;
        
        setLoadPlanSwitch(true)
        if (plan === 'enterprise') {
            const social = new Social({});
            social.whatsapp({ 
                whastsapp:`11960609211`, 
                message:`
                Olá Bruno tudo bem? Eu sou ${globalUser.data?.name}.
                
                Gostaria de saber como eu faço para ingressar no plano Prêmium do serviço de Leitura de PDFs.
                ` 
            });

            setLoadPlanSwitch(false);
            return;
        };

        const hasPaymentMethods = functions.hasPaymentMethods();
        if (!hasPaymentMethods) return true;

        const post = new Post(`/api/readPdf/switch-plan`);

        post.addData({ plan, uid:globalUser.data.uid });

        const resp = await post.send();
        const data = await resp?.json() as { data?:any, error?:string }
        
        if (data.data && plan === 'free') {
            setPublicError({ title:'Mudança de Plano', message:'Sua assinatura será trocada para o Plano básico assim que o período de vigor da assinatura atual expirar' })
        } else if (data.data && plan === 'standard') {
            setPublicError({ title:'Mudança de Plano', message:'Sua assinatura foi trocada para o Plano Empreendedor.' })
        }
        setLoadPlanSwitch(false);
    };

    return (
        width &&
        <div className={twMerge("rounded shadow-lg p-5 flex flex-col items-center justify-start", financialData?.activePlan.readPdf === plan && 'shadow-[#0E2639]')} style={{width:planWidth, color:colors.valero()}} >
            <h3 className="font-bold text-lg" >
                {`Plano ${plan === 'free' ? `Básico` : (plan === 'standard' ? `Empreendedor` : `Prêmium`)}`}
            </h3>
            <span className="font-normal text-lg" >
                {moneyMask(moPrice)}/mês
            </span>
            <Separator className="my-2 bg-gray-600" />
            {plan === 'free' && <BasicPlanProps />}
            {plan === 'standard' && <StandardPlanProps />}
            {plan === 'enterprise' && <EnterprisePlanProps />}
            
            {/* <Separator className="mt-4 bg-gray-600" /> */}
            <button onClick={() => getPlan()} disabled={loadPlanSwitch || financialData?.activePlan.readPdf === plan} className="rounded shadow mt-5 mb-2 w-full py-3 font-bold" style={{backgroundColor:financialData?.activePlan.readPdf === plan ? 'white': (plan === 'enterprise' ? colors.valero(.9) : colors.valero()), borderWidth:financialData?.activePlan.readPdf === plan ? 1 : 0, borderColor:colors.valero(), color:financialData?.activePlan.readPdf === plan ? colors.valero() : 'white'}} >
                {`${loadPlanSwitch ? `Aguarde...` : (financialData?.activePlan.readPdf === plan ? `Atual` : (plan === 'enterprise' ? `Entrar em Contato` : `Aderir ao Plano`))}`}
            </button>
        </div>
    );
};