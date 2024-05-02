import colors from "@/src/constants/colors";

export default function DetailsCard({ text, image, buttonText, buttonAction }:{ text:string, image:string, buttonText?:string, buttonAction:() => void }) {


    return (
        <div className="rounded shadow p-2 flex flex-1 gap-3 items-center justify-between flex-col max-w-[250px]" >
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