"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import colors from "@/src/constants/colors";
import Post from "@/src/modules/Request/Post";
import { PaymentMethodsResponse } from "@/src/modules/projectExclusive/UserManagement";
import StripeFrontEnd from "@/src/modules/stripe/frontend/StripeFrontEnd";
import CardSetup from "@/src/modules/stripe/frontend/StripeFrontEnd/tsx/CardSetup";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { useCallback, useState } from "react";
import { FaCreditCard, FaPlus } from "react-icons/fa6";
import { IoStar } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import PricingSection from "../LerPdf/PdfList/Pricing/PricingSection";
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
    const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints ?? [];

    const [pmList, setPmList] = useState<PaymentMethodsResponse[]>([]);
    const [loadPmList, setLoadPmList] = useState(false);
    const [loadDeleteCard, setLoadDeleteCard] = useState(false);
    const [loadMainCard, setLoadMainCard] = useState(false);

    const [SettingNewCard, setSettingNewCard] = useState(false);

    const [showPlans, setShowPlans] = useState(false);


    const stripe = new StripeFrontEnd(envs);
    const stripeJs = stripe.useLoadStripe();
    const { clientSecret, requestSetupIntent } = stripe.useSetupIntent();

    const hasCards = (financialData?.paymentMethods ?? 0) > 0;
    const cardListLoaded = pmList.length > 0;


    // useEffect(() => {

    //     if (SettingNewCard) {

    //         fetchPmList().then(resp => {
    //             setSettingNewCard(false);
    //         })
    //     }

    // }, [SettingNewCard, financialData?.paymentMethods])

    const isLogged = useCallback(() => {
        if (!globalUser.data) {
            setPublicError({ title:'É necessário Login', message:`Faça login antes de prosseguir.`, action:() => globalUser.createWithLogin() });
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
    };

    async function setDefaultCard({ userData, hashedPmId }:{ userData:Omit<UsersUser, 'control'>, hashedPmId:string }) {        
        setLoadMainCard(true);
        const post = new Post('/api/stripe/set-default-card');
        post.addData({ userData, hashedPmId })
        const resp = await post.send();
        const respData = (await resp?.json()) as { data:boolean } | undefined;
        await fetchPmList();
        setLoadMainCard(false);
    };

    async function deleteCard({ userData, hashedPmId }:{ userData:Omit<UsersUser, 'control'>, hashedPmId:string }) {
        setLoadDeleteCard(true);
        const post = new Post('/api/stripe/delete-card');
        post.addData({ userData, hashedPmId })
        const resp = await post.send();
        const respData = (await resp?.json()) as { data:boolean } | undefined;
        await fetchPmList();
        setLoadDeleteCard(false);
    };


    
    async function cardRegister() {
        const log = isLogged()
        if (!log) return;

        setSettingNewCard(true);

        const post = new Post('/api/stripe/getStripeId');
        post.addData({ userData:globalUser.data });
        const resp = await post.send();
        const cus = (await resp?.json()) as { data:string } | undefined;
        if (!cus?.data) throw new Error("Usuário inválido");
        const customer = cus.data;
        const metadata = {
            uid:globalUser.data?.uid ?? '',
        }
        // alert(JSON.stringify(cus, null, 2))
        await requestSetupIntent({ customer, metadata });
    };

    const hasPaymentMethods = useCallback(() => {
        const paymentMethods = (financialData?.paymentMethods ?? 0);
        if(paymentMethods > 0) return true;
        setPublicError({ title:`Método de pagamento`, message:`Para realizar esta ação é necessário possuir um cartão de crédito cadastrado.` });
        return false;

        
    }, [setPublicError, financialData]);
    

    const functions = {
        hasPaymentMethods,
        isLogged,
    }

    return (
        <div className="w-full min-h-[100vh] flex flex-col items-center justify-start" >
            {globalUser?.data ? (
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

                    <Separator className="my-7" />

                    <div className="w-full flex gap-2" >
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
                                {hasCards && (
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

                    <div className="w-full flex flex-col gap-2 items-center justify-center mt-2" >
                        <button onClick={() => !cardListLoaded ? fetchPmList() : {}} disabled={loadPmList || pmList.length > 0 || (financialData?.paymentMethods ?? 0) === 0} className={twMerge("p-3 w-full", cardListLoaded && 'font-semibold text-2xl')} >
                            {!hasCards ? `Você não possui cartões cadastrados` : (loadPmList ? `Aguarde...` : (!cardListLoaded ? `Carregar Informações dos Cartões` : `Seus Cartões`))}                            
                        </button>
                        {cardListLoaded && (
                            <div className="w-full flex flex-col gap-3" >
                                {pmList.map(item => (
                                    <div className={twMerge("w-full rounded shadow p-3 flex flex-col items-start justify-start gap-2", !item.isDefaultPm && 'p-4')} style={{backgroundColor:item.isDefaultPm ? colors.valero() : 'white', color:item.isDefaultPm ? 'white' : colors.valero()}} >
                                        {item.isDefaultPm && (
                                            <div className="my-4 w-full">
                                                <span className="w-full flex gap-2 items-center justify-center text-lg font-semibold" ><IoStar size={28} /> Cartão Principal</span>
                                                <Separator className="bg-white mt-4" />
                                            </div>
                                        )}
                                        <div className="w-full flex items-start justify-between gap-2" >
                                            <div className="flex flex-col items-start justify-start gap-2 px-3">
                                                
                                                <span>
                                                    Cartão {item.card.brand}
                                                </span>
                                                <span>
                                                    ****{item.card.last4}
                                                </span>
                                                <span>
                                                    Expira em {item.card.exp_month}/{item.card.exp_year}
                                                </span>                                        
                                            </div>

                                            <div className="flex flex-col items-stretch justify-end gap-3" >
                                                <button onClick={() => deleteCard({ userData:globalUser.data as any, hashedPmId:item.id })} disabled={loadDeleteCard} className="p-3 rounded flex flex-1 gap-2 items-center justify-start" style={{backgroundColor:item.isDefaultPm ? 'white' : 'rgba(200,50,50,1)', color:item.isDefaultPm ? colors.valero() : 'white'}} >
                                                    {loadDeleteCard && `Aguarde...`}
                                                    {!loadDeleteCard && (
                                                        <>
                                                            <RiDeleteBin6Fill />
                                                            <span>
                                                                Excluir Cartão
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                                {!item.isDefaultPm && (
                                                    <button onClick={() => setDefaultCard({ userData:globalUser.data as any, hashedPmId:item.id })} disabled={loadMainCard} className="p-3 rounded flex gap-2 items-center justify-start" style={{backgroundColor:item.isDefaultPm ? 'white' : colors.valero(), color:item.isDefaultPm ? colors.valero() : 'white'}} >
                                                        {loadMainCard && `Aguarde...`}
                                                        {!loadMainCard && (
                                                            <>
                                                                <IoStar />
                                                                <span>
                                                                    Tornar Principal
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="my-7" />
                    
                    <div className="w-full flex flex-col gap-1 items-center justify-center" >
                        <span className="font-normal text-lg" >
                            Plano de Assinatura atual: 
                        </span>
                        <span className="font-bold text-xl" >
                            {financialData?.activePlan.readPdf === 'free' ? 'Básico' : (financialData?.activePlan.readPdf === 'standard' ? 'Empreendedor' : 'Prêmium')}
                        </span>
                        <button onClick={() => setShowPlans(prev => !prev)} className="p-3 px-6 rounded shadow mt-4 mb-2" >
                            {showPlans ? `Ocultar Planos` : `Mostrar Planos`}
                        </button>
                        {showPlans && <PricingSection functions={functions} />}
                    </div>

                    <Separator className="my-7" />

                    <div className="min-h-[400px]" />

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