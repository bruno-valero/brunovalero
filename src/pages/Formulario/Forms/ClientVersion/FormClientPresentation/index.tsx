import logoDoCliente from '@/src/images/logoDoCliente.png';

export default function FormClientPresentation() {

    // const globalState = useGlobalProvider();
    // const [, setPublicError] = globalState.publicError ?? [];
    // const dimensions = globalState.dimensions;


    return (        
        <div className="mb-[35px]" >
            <div className="flex items-center justify-center gap-2 h-[80px]" >
                <img src={logoDoCliente.src} alt="Sua Logo" className="h-full object-cover rounded shadow" />
                <div className="flex flex-col items-start justify-center" >
                    <span className="text-lg font-bold text-left" >Sua Marca</span>
                    <span className="text-sm font-light text-left" >Seu Slogan</span>
                </div>
            </div>
            <div className="mt-[30px]" >
                <p className="text-gray-600" >
                    Nosso negócio é especializado em [sua especialização]. Por esse motivo precisaremos dessas informações para [motivo].
                </p>
                <br />
                <p className="text-gray-600" >
                    Por favor, pedimos que preencha os campos corretamente.
                </p>
            </div>
        </div>
    );

};