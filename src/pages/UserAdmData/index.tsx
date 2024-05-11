"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { PaymentMethodsResponse } from "@/src/modules/projectExclusive/UserManagement";
import StripeFrontEnd from "@/src/modules/stripe/frontend/StripeFrontEnd";
import CardSetup from "@/src/modules/stripe/frontend/StripeFrontEnd/tsx/CardSetup";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { useCallback, useState } from "react";
import { FaCreditCard, FaPlus } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import BuyDefaultCreditsAmount from "./BuyDefaultCreditsAmount";

export default function UserAdmData() {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { width } = globalState.dimensions ?? {};
    const financialData = globalState.financialData;
    const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints;

    const [pmList, setPmList] = useState<PaymentMethodsResponse[]>([]);
    const [loadPmList, setLoadPmList] = useState(false);


    const stripe = new StripeFrontEnd(envs);
    const stripeJs = stripe.useLoadStripe();
    const { clientSecret, requestSetupIntent } = stripe.useSetupIntent();

    const isLogged = useCallback(() => {
        if (!globalUser.data) {
            setPublicError({ title:'É necessário Login', message:`Faça login antes de prosseguir.` });
            return false;
        }   
        return true;     
    }, [setPublicError]); 

    async function fetchPmList() {
        setLoadPmList(true);
        const url = `/api/stripe/get-cards-info`
        const post = new Post(url);
        post.addData({ userData:globalUser.data });
        const resp = await post.send();
        const pmsResp = await resp?.json() as { data?:PaymentMethodsResponse[], error?:string };
        // alert(JSON.stringify(pmsResp, null, 2))
        if (pmsResp.error) {
            setPublicError({ title:`Busca dos Cartões`, message:'Houve um erro ao buscar as informações dos seus cartões de crédito.' })
            setLoadPmList(false);
            return;
        }
        if (pmsResp.data) {
            // alert(JSON.stringify(pmsResp.data, null, 2))
            setPmList(pmsResp.data);
        }
        setLoadPmList(false);
    }

    async function cardRegister() {
        const log = isLogged()
        if (!log) return;

        const post = new Post('/api/stripe/getStripeId');
        post.addData({ userData:globalUser.data });
        const resp = await post.send();
        const cus = (await resp?.json()) as { data:string } | undefined;
        if (!cus?.data) throw new Error("Usuário inválido");
        const customer = cus.data;
        const metadata = {
            uid:globalUser.data?.uid ?? '',
        }
        await requestSetupIntent({ customer, metadata });
    }

    return (
        <div className="w-full min-h-[100vh] flex flex-col items-center justify-start" >
            {globalUser.data ? (
                <div className={twMerge("w-[768px] flex flex-col gap-4 items-center justify-center", width < 768 && 'w-[95%]')} >
                    <div className="mt-6" style={{color:colors.valero()}} >
                        <h1 className="text-2xl font-bold" >
                            Olá, {globalUser.data.name}
                        </h1>
                        <span>Gerencie suas informações administrativas aqui.</span>
                    </div>

                    <Separator className="my-7" />

                    <div className={twMerge("w-full flex gap-3", width < 768 && 'flex-col')} >
                        <Popover>
                            <PopoverTrigger className="flex flex-col items-center justify-center p-5 px-16 rounded shadow" >
                                <span className="text-gray-600 font-semibold text-sm" >Seus créditos</span>
                                <span className="text-xl font-bold" style={{color:colors.valero()}} >
                                    {moneyMask(financialData?.credits ?? 0)}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent>
                                Use seus créditos para asessar recursos pagos na plataforma.    
                            </PopoverContent>
                        </Popover>
                        <div className={twMerge("flex gap-3", width < 768 && 'overflow-x-auto overflow-y-hidden w-full')} >
                            <BuyDefaultCreditsAmount amount={5} />
                            <BuyDefaultCreditsAmount amount={15} />
                            <BuyDefaultCreditsAmount amount={30} />
                        </div>

                    </div>

                    <div className="w-full flex gap-2 mt-4" >
                        <Popover>
                            <PopoverTrigger className="flex flex-1 flex-col items-center justify-center p-5 px-8 rounded shadow" style={{color:colors.valero()}} >
                                <div className="flex gap-3" >
                                    <FaCreditCard size={28} />
                                    <span>Cartões de Crédito Cadastrados</span>
                                </div>
                                <span className="text-xl font-bold"  >
                                    {financialData?.paymentMethods ?? 0} {(financialData?.paymentMethods ?? 0) === 1 ? `Cartão` : 'Cartões'} 
                                </span>
                            </PopoverTrigger>
                            <PopoverContent>
                                <span>
                                    Use seus Cartões de crédito para aderir à uma plano de assinatura ou para comprar créditos.    
                                </span>
                                {(financialData?.paymentMethods ?? 0) > 0 && (
                                    <button onClick={() => fetchPmList()} disabled={loadPmList} className={twMerge("text-white text-base font-semibold p-2 rounded shadow mt-3", loadPmList && 'w-full')} style={{backgroundColor:colors.valero()}} >
                                        {loadPmList ? `Aguarde...` : `Carregar Informações dos Cartões`}
                                    </button>
                                )}
                            </PopoverContent>
                        </Popover>     

                        <Popover>
                            <PopoverTrigger onClick={() => cardRegister()} className="flex gap-3 items-center justify-center p-5 px-8 rounded shadow text-white" style={{backgroundColor:colors.valero()}} >
                                <FaPlus size={24} />
                                <span className="font-semibold text-sm" >Adicionar Cartão</span>
                            </PopoverTrigger>
                            <PopoverContent>
                                {clientSecret && (
                                    <CardSetup {...{clientSecret, stripe:stripeJs }} />
                                )}
                            </PopoverContent>
                        </Popover>                   

                    </div>

                    <div className="w-full flex gap-2 mt-2" >
                        {pmList.length > 0 && (
                            <div className="w-full rounded shadow p-3" >
                                {pmList.map(item => (
                                    <div>
                                        <span>
                                            {item.card.last4}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div>
                    <span className="text-xl font-bold w-screen h-screen flex items-center justify-center" >
                        É necessário estar logado para acessar esta sessão.
                    </span>
                </div>
            )}

        </div>
    );

};