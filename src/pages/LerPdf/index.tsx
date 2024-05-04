import colors from "@/src/constants/colors";
import leitura from '@/src/images/leitura.png';
import trial from '@/src/images/trial.png';
import UploadPdfProcess from "@/src/modules/projectExclusive/UploadPdfProcess";
import ContactAboutLerPdf from "./ContactAboutForms";
import PdfList from "./PdfList";




interface CardFormProps {
    imageSrc:string, 
    text:string
};

function CardForm({ imageSrc, text }:CardFormProps) {

    return (
        <div className="rounded shadow p-4 w-[250px] max-sm:min-w-[250px]  flex flex-col items-center justify-start flex-1 gap-3" >
            <img src={imageSrc} alt="serviço customizável" className="w-full object-cover rounded" />
            <p className="text-lg font-light text-start" style={{color:colors.valero()}} >
                {text}
            </p>
        </div>
    )
}


export default function LerPdf() {
    
    const pdf = new UploadPdfProcess()
    // pdf.regenerateGenres('1714710089867', 'W4cd8j5ZsUUI4akQ77csf0GORIv1')
    // const vectorStore = new VectorStoreProcess();
    // Promise.all([
    //     '1714565595194', '1714564378253', 
    //     '1714140791133'
    // ].map(async(item) => {
    //     await vectorStore.pineconeDeletePdf(item);
    //     console.log(`${item} - deletado!`)
    // }))

    
    return (
        <div className="w-full flex items-center justify-center flex-col" >
            <div className="flex items-center justify-center flex-col gap-6 p-6 rounded max-sm:w-[90%]" style={{}} >
                <h2 className="text-6xl font-black text-gray-100" style={{color:colors.valero()}} >Leitura de PDFs</h2>
                <p className="text-lg leading-7 font-light text-start text-gray-100" style={{color:colors.valero()}} >
                    Abaixo está disponível um exemplo visual do sistema.
                </p>
                <div className="flex items-stretch justify-start gap-5 max-sm:max-w-[400px] max-sm:overflow-x-auto max-sm:px-[10px]" >
                    <CardForm imageSrc={leitura.src} text="Este é um serviço voltado para contratos, leis, estudos e similares. Insira PDFs com poucas imagens." />
                    <CardForm imageSrc={trial.src} text={`A extração de texto, resumo do conteúdo e realização de perguntas não está disponível para teste.`} />                    
                </div>
            </div>

            <PdfList />

            <div className="flex justify-center items-center flex-col w-full bg-white min-h-[50vh]" >

                <ContactAboutLerPdf />

            </div>
        </div>
    );
};