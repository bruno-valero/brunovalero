import PrincingProp from "../PrincingProp";



export default function StandardPlanProps() {


    return (
        <div className="mt-3 flex flex-col gap-3 w-full" >
            <PrincingProp { ...{bonus:{amount:60, desc:`Perguntas gratuitas por Mês`}, paid:{amount:0.05, desc:`por perguntas adicionais`}, desc:'Quando as perguntas gratuitas se se esgotarem, somente será possível fazer perguntas com créditos.\n\nCada pergunta adicional custará R$0,05 centavos dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.'} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Perguntas para mais de um documentos ao mesmo tempo gratuitas por Mês`}, paid:{amount:0.08, desc:`por perguntas adicionais`, disabled:true}, desc:'Realizar perguntas para mais de um documento ao mesmo tempo é útil para adicionar mais contexto à sua resposta.\n\nPor exemplo, você pode selecionar um livro voltado para finanças, e outro voltado para questões legislativas, neste caso será possível saber quais leis dão suporte à um determinado recurso financeiro.\n\nNeste plano não será possível realizar perguntas para mais de um documento ao mesmo tempo.\n\nConsulte os demais planos disponíveis'} }  />
            <PrincingProp { ...{bonus:{amount:5, desc:`Upload de PDf gratuito por Mês`}, paid:{amount:0.29, desc:`a cada 100.000 palavras, por PDFs adicionais`}, desc:'Quando os uploads de PDFs gratuitos se esgotarem, somente será possível fazer uploads com créditos.\n\nCada upload adicional custará R$0,29 centavos dos créditos a cada 100.000 palavras que o PDF possuir (um documento de 500.000 palavras custaria R$1,45 créditos).\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.'} }  />
            <PrincingProp { ...{bonus:{amount:3, desc:`Gerações de Capas gratuitas por Mês`}, paid:{amount:0.80, desc:`por capas adicionais`}, desc:'Quando as gerações de capas gratuitas se se esgotarem, somente será possível gerar novas capas com créditos.\n\nCada geração de capa adicional custará R$0,80 centavos dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.'} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Gerações de Quizzes Públicos gratuitos por Mês`}, paid:{amount:2, desc:`por quizzes públicos adicionais`}, desc:'Essas são as gerações de quizzes em documentos públicos.\n\nQuando as gerações de quizzes gratuitos se se esgotarem, somente será possível gerar novos quizzes com créditos.\n\nCada geração de quiz adicional custará R$2,00 reais dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.'} }  />
            <PrincingProp { ...{bonus:{amount:3, desc:`Gerações de Quizzes Privados gratuitos por Mês`}, paid:{amount:2, desc:`por quizzes privados adicionais`}, desc:'Essas são as gerações de quizzes em documentos privados (aqueles que você fez upload).\n\nQuando as gerações de quizzes gratuitos se se esgotarem, somente será possível gerar novos quizzes com créditos.\n\nCada geração de quiz adicional custará R$2,00 reais dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.'} }  />
        </div>
    );
};