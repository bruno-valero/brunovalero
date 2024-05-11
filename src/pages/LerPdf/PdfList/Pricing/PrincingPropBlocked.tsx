import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollComponent } from "@/src/components/structural/ScrollComponent";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { twMerge } from "tailwind-merge";



export default function PrincingPropBlocked({ text, desc }:{ text:string, desc:string  }) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const { envs } = globalState.fromServer ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const { height, width } = globalState.dimensions ?? {};

    return (
        width &&
        <Popover>
            <PopoverTrigger className="flex flex-col w-full rounded shadow p-3 bg-red-900" >
                <div className="flex gap-2 py-1 text-left text-white" >
                    {text}
                </div>                
            </PopoverTrigger>
            <PopoverContent className="p-1" style={{width:width > 500 ? width / 4.8 : width * 0.75}} >
                <ScrollComponent className={twMerge("h-[300px] px-2 pr-3 w-full", width < 500 && 'h-[300px]')} >
                    {desc.split('\n').map(item => <span>{item}<br /></span>)}
                </ScrollComponent>
            </PopoverContent>
        </Popover>
    );

};