import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { twMerge } from "tailwind-merge";

export default function DetailsCard({ text, image, buttonText, buttonAction }:{ text:string, image:string, buttonText?:string, buttonAction:() => void }) {

    const globalState = useGlobalProvider();
    const resetedState = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { storage } = globalState.firebase ?? {};
    const { width } = globalState.dimensions ?? {};
    const publicError = globalState.publicError;

    return (
        width &&
        <div className={twMerge("rounded shadow p-2 flex flex-1 gap-3 items-center justify-between flex-col max-w-[250px]", width < 500 && 'w-[150px] text-sm')} >
            <div className="flex flex-col gap-3 items-center justify-center" >
                <img src={image} alt="Pergunte qualquer coisa" className='w-full object-cover rounded' />
                <span>
                    {text}
                </span>
            </div>

            <button onClick={buttonAction} className="w-full p-2 flex items-center justify-center rounded text-white" style={{backgroundColor:colors.pdf()}} >
                {buttonText ?? 'Começar'}
            </button>
        </div>
    );

};