import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Post from "@/src/modules/Request/Post";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { useState } from "react";
import { twMerge } from "tailwind-merge";




export default function BuyDefaultCreditsAmount({ amount }:{ amount:number }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { width } = globalState.dimensions ?? {};
    const financialData = globalState.financialData;
    const [alertBuyPoints, setAlertBuyPoints] = globalState.alertBuyPoints;

    const [Loading, setLoading] = useState(false);

    async function buyCredits(amount:number) {

        setLoading(true);

        const url = '/api/readPdf/buy-credits'
        const post = new Post(url);
        post.addData({ uid:globalUser.data!.uid, amount });

        const resp = await post.send();
        const respData = await resp?.json() as { data?:boolean, error?:string };

        setLoading(false);

    }

    return (
        <Popover>
            <PopoverTrigger className={twMerge("flex flex-col gap-2 items-center justify-center p-5 px-7 rounded shadow bg-green-800 text-white", width < 768 && "p-4 px-4")} >
                <span className={twMerge("font-semibold text-sm text-nowrap", width < 768 && "text-wrap font-normal")} >Comprar créditos</span>
                <span className={twMerge("text-xl font-bold", width < 768 && "text-lg")} >
                    {moneyMask(amount)}
                </span>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-3" >
                <span>
                    Deseja comprar <span className="font-bold" >{moneyMask(amount)}</span> de Créditos?
                </span>

                <button onClick={() => buyCredits(amount)} disabled={Loading} className="w-full p-3 bg-green-800 text-white font-semibold text-lg rounded shadow mt-3" >
                    {Loading ? `Aguarde...` :`Confirmar`}
                </button>
            </PopoverContent>
        </Popover>
    );
};