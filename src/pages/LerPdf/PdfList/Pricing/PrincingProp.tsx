import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollComponent } from "@/src/components/structural/ScrollComponent";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import moneyMask from "@/utils/functions/masks/moneyMask";
import { twMerge } from "tailwind-merge";



export default function PrincingProp({ bonus, paid, desc }:{ bonus:{ amount:number, desc:string }, paid:{ amount:number, desc:string, amount2?:number, desc2?:string, disabled?:boolean }, desc:string  }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { height, width } = globalState.dimensions ?? {};

    return (
        width &&
        <Popover >
            <PopoverTrigger className="flex flex-col w-full rounded shadow p-3" >
                <div className="flex gap-2 py-1 text-left" >
                    <span className="font-semibold" >
                        {bonus.amount}
                    </span>
                    <span>
                        {bonus.desc}                
                    </span>
                </div>
                <Separator />
                <div className="flex gap-2 text-sm py-1 text-left" >
                    {paid.disabled ? (
                        <span className="font-bold" >
                            Recurso indisponível para este plano
                        </span>
                    ) : (
                       <div className="flex flex-col">
                        <span className="" >
                            <span className="font-semibold" >
                            {moneyMask(paid.amount)}
                            </span>{` `}
                            <span>
                            {paid.desc}
                            </span>
                        </span>
                        {paid.amount2 && paid.desc2 && (
                            <span className="flex gap-2">
                                <span className="font-semibold" >
                                {moneyMask(paid.amount2)}
                                </span>
                                <span>
                                {paid.desc2}
                                </span>
                            </span>
                        )}
                       </div> 
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-1" style={{width:width > 500 ? width / 4.8 : width * 0.75, backgroundColor:colors.valero()}} >
                <ScrollComponent className={twMerge("h-[300px] px-2 pr-3 w-full text-white", width < 500 && 'h-[300px]')} style={{backgroundColor:colors.valero()}} >
                    {desc.split('\n').map(item => <span>{item}<br /></span>)}
                </ScrollComponent>
            </PopoverContent>
        </Popover>
    );

};