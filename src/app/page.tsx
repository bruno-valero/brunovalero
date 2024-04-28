import forms from '@/src/images/forms.png';
import landingPage from '@/src/images/landingPage.png';
import lerPDFs from '@/src/images/lerPDFs.png';
import sistemasPersonalizados from '@/src/images/sistemasPersonalizados.png';
import { HomePage } from '../pages/Home';
import { CardSection } from '../pages/Home/CardSection';
import { ContactSection } from '../pages/Home/ContactSection';

export default function Home() {

  return (
    <div className="w-full max-h-screen flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto">   
      <div className='w-full h-full flex flex-col items-start justify-start overflow-x-hidden overflow-y-auto' >
        <HomePage.MainSection />
        {/* <div className='bg-black text-white min-h-screen' >
          OIOIOIOII
        </div> */}
        
        <CardSection.Wrapper>
          <CardSection.Card 
          imageSrc={forms.src}
          title='Formulários'
          text={`Entenda seus clientes ou gerencie seus funcionárions com os Formulários Personalizados.`}
          path={'/formulario'}
          />        
          <CardSection.Card 
          imageSrc={lerPDFs.src}
          title='Leitura de PDFs'
          text={`Mais produtividade com leitura automática de PDFs, resumo do documento e perguntas sobre o conteúdo`}
          path={'/ler-pdf'}
          />        
          <CardSection.Card 
          imageSrc={landingPage.src}
          title='Landing Page'
          text={`Apresente seus produtos, adquira clientes, fortaleça sua marca e aumente as vendas com a Landing Page`}
          path={'/landing-page'}
          />                     
          <CardSection.Card 
          imageSrc={sistemasPersonalizados.src}
          title='Sistemas Personalizados'
          text={`Otimize os processos de sua empresa com um Sistema Personalizado para a sua necessidade.`}
          path={'/sistema-personalizado'}
          />                     
        </CardSection.Wrapper>  

        <ContactSection.Wrapper>
          <ContactSection.Form />
        </ContactSection.Wrapper>
      </div>   
      

    </div>
  );
}
