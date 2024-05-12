import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import tsToMask from "@/utils/functions/dateTime/tsToMask";
import { twMerge } from "tailwind-merge";
import Pricing from "..";



export default function PricingSection({ functions }:{ functions:{isLogged: () => boolean, hasPaymentMethods: () => boolean} }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { width } = globalState.dimensions ?? {};
    const financialData = globalState.financialData;
    const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints ?? [];

    return (
        width &&
        <div className={twMerge("flex gap-6 flex-col justify-start items-center w-full bg-white min-h-screen")}>

            {financialData?.upcomingPlans?.readPdf.plan && (
                <div className={twMerge("w-[769px] rounded shadow p-5 flex flex-col gap-2", width < 800 && 'w-[90%]')} style={{backgroundColor:colors.valero()}} >
                    <span className="text-white text-base font-light" >
                        Você solicitou a mundança de assinatura para o plano{` `} 
                        <span className="font-bold" >
                        {
                            financialData?.upcomingPlans?.readPdf.plan  === 'free' ? 'Básico' :
                            (financialData?.upcomingPlans?.readPdf.plan === 'standard' ? 'Empreendedor' : 'Prêmium')
                        }
                        </span>. Ele entrá em vigor no final do período vigente do plano atual, na data {tsToMask({ts:Number(financialData?.upcomingPlans?.readPdf.takeEffectDate ?? 0), format:['day', 'month', 'year'], seps:['/', '/']})}.
                    </span>
                    <span className="text-white text-lg font-semibold" >
                        Faltam {Math.round((Number(financialData?.upcomingPlans?.readPdf.takeEffectDate ?? 0) - new Date().getTime()) / 1000 / 60 / 60 / 24)} dias para a mudança.
                    </span>
                </div>
            )}
            <div className={twMerge("flex gap-6 justify-center items-start w-full bg-white min-h-screen", width < 500 && 'flex-col px-0 justify-start items-center')} >
                <Pricing plan="free" moPrice={0} functions={functions} />
                <Pricing plan="standard" moPrice={20} functions={functions} />
                <Pricing plan="enterprise" moPrice={50} functions={functions} />
            </div>
        </div>
    );

};