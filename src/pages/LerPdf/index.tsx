import colors from "@/src/constants/colors";
import leitura from '@/src/images/leitura.png';
import trial from '@/src/images/trial.png';
import VectorStoreProcess from "@/src/modules/VectorStoreProcess";
import ContactAboutLerPdf from "./ContactAboutForms";




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
    
    
    const vectorStore = new VectorStoreProcess();
    // const test = new UploadPdfProcess({ pdf:new File([new Blob()], 'oi') })
    // test.generateImage('O objetivo do conteúdo é abordar a importância do investimento em educação real em oposição à instrução formal, discutir as mudanças e tendências no cenário econômico e social, como a substituição de ações por equity tokens, moedas fiduciárias por cryptocurrency, e sistemas democráticos por democracias societárias e sistemas de consenso. Além disso, o texto também aborda a crise moral, financeira e demográfica nas sociedades ocidentais, a insustentabilidade dos Estados Sociais e a iminência de seu colapso, e a pirâmide de Maslow como uma forma de compreender as necessidades humanas hierarquicamente.')
    // test.chat('Com base nos trechos fornecidos, o conteúdo do arquivo em PDF parece abordar principalmente o tema do Bitcoin, sua história, funcionamento, segurança e investimento. Portanto, o gênero adequado para classificá-lo seria um livro de não ficção, mais especificamente um livro de finanças ou tecnologia, com foco em criptomoedas e blockchain.')
    // vectorStore.readPdf({url:'https://arquivos.sistemas.ufg.br/arquivos/202321203498502498549a4f0ecbaba5c/Aula1.pdf'});
    // vectorStore.search('se o conteudo for um livro, qual gênero seria adequado para classificá-lo?', '1714132407108').then(e => {
    //     const response = e.text;
    //     console.log(`\n\nresposta:\n${response}\n\n`);
    //     const sourceDocuments = e.sourceDocuments as {pageContent:string, metadata:PdfParsedData[0]['info']}[];
    //     console.log(`Trechos que contribuíram par a resposta:\n`)
    //     sourceDocuments.map((item, i) => {
    //         console.log(`Trecho - ${i+1} ---------------------------------------------------------------------`);
    //         console.log(`${item.pageContent}`);
    //         console.log(`------------------------------------`);
    //         console.log(`Título: ${item.metadata.title}`);
    //         console.log(`Autor: ${item.metadata.author}`);
    //         console.log(`Página: ${item.metadata.page}`);
    //         const lines = /-/ig.test(item.metadata.lines ?? '') ? item.metadata.lines?.split('-') : null
    //         console.log(lines && `trecho: da linha ${lines[0]} à linha ${lines[1]}`);
    //         console.log(`------------------------------------\n\n`);
            
    //     })
        
    // })
    // vectorStore.PDFloader().then(e => console.log('loaded'));
    // vectorStore.pineconeDeletePdf('1714139150768');

    
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

            <div className="flex justify-center items-center flex-col w-full bg-white min-h-[50vh]" >

                <ContactAboutLerPdf />

            </div>
        </div>
    );
};