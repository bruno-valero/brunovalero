import lerPDFs from '@/src/images/lerPDFs.png';
import SetLoadingFalse from '../components/structural/SetLoadingFalse';
import CardSectionCardPopOver from '../pages/Home/CardSection/CardPopOver';
import CardSectionWrapper from '../pages/Home/CardSection/Wrapper';
import ContactSectionForm from '../pages/Home/ContactSection/ContactForm';
import ContactSectionWrapper from '../pages/Home/ContactSection/ContactWrapper';
import HomePageMainSection from '../pages/Home/MainSection';

export default function Home() {

  return (
    <div className="w-full max-h-screen flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto">   
      <SetLoadingFalse />
      <div className='w-full h-full flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto' >
        <HomePageMainSection />
        {/* <div className='bg-black text-white min-h-screen' >
          OIOIOIOII
        </div> */}
        
        <CardSectionWrapper >
          {/* <CardSectionCard 
          imageSrc={forms.src}
          title='Formulários'
          text={`Entenda seus clientes ou gerencie seus funcionárions com os Formulários Personalizados.`}
          path={'/formulario'}
          />         */}
          {/* <CardSectionCard 
          imageSrc={lerPDFs.src}
          title='Leitura de PDFs'
          text={`Mais produtividade com leitura automática de PDFs, resumo do documento e perguntas sobre o conteúdo`}
          path={'/ler-pdf'}
          />         */}
          <CardSectionCardPopOver 
          imageSrc={lerPDFs.src}
          title='Leitura de PDFs'
          text={`Mais produtividade com leitura automática de PDFs, resumo do documento e perguntas sobre o conteúdo`}
          path={'/ler-pdf'}
          />        
          {/* <CardSectionCard 
          imageSrc={landingPage.src}
          title='Landing Page'
          text={`Apresente seus produtos, adquira clientes, fortaleça sua marca e aumente as vendas com a Landing Page`}
          path={'/landing-page'}
          />                     
          <CardSectionCard 
          imageSrc={sistemasPersonalizados.src}
          title='Sistemas Personalizados'
          text={`Otimize os processos de sua empresa com um Sistema Personalizado para a sua necessidade.`}
          path={'/sistema-personalizado'}
          />                      */}
        </CardSectionWrapper>  

        <ContactSectionWrapper >
          <ContactSectionForm />
        </ContactSectionWrapper>
      </div>   
      

    </div>
  );
}
