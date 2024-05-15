import { Control } from "@/src/config/firebase-admin/collectionTypes/control";
import moneyMask from "@/utils/functions/masks/moneyMask";
import PrincingProp from "../PrincingProp";



export default function BasicPlanProps({ pricing }:{ pricing?:Control['pricing']['readPdf'] }) {

    const questions = pricing?.actionsValue.questions ?? 0;
    const pdfUpload = pricing?.actionsValue.pdfUpload ?? 0;
    const cover = pricing?.actionsValue.coverGenerationForPrivateDocs ?? 0;
    const quizPublic = pricing?.actionsValue.quizGeneration.publicDocs ?? 0;
    const quizPrivate = pricing?.actionsValue.quizGeneration.privateDocs ?? 0;

    const questionsDesc =`Quando as perguntas gratuitas se se esgotarem, somente será possível fazer perguntas com créditos.\n\nCada pergunta adicional custará ${moneyMask(questions)} centavos dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.`;
    const questionsMultiDesc =`Realizar perguntas para mais de um documento ao mesmo tempo é útil para adicionar mais contexto à sua resposta.\n\nPor exemplo, você pode selecionar um livro voltado para finanças, e outro voltado para questões legislativas, neste caso será possível saber quais leis dão suporte à um determinado recurso financeiro.\n\nNeste plano não será possível realizar perguntas para mais de um documento ao mesmo tempo.\n\nConsulte os demais planos disponíveis`;
    const pdfUploadDesc = `Quando os uploads de PDFs gratuitos se esgotarem, somente será possível fazer uploads com créditos.\n\nCada upload adicional custará ${moneyMask(pdfUpload)} centavos dos créditos a cada 100.000 palavras que o PDF possuir (um documento de 500.000 palavras custaria 1,45 créditos).\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.`;
    const coverDesc = `Quando as gerações de capas gratuitas se se esgotarem, somente será possível gerar novas capas com créditos.\n\nCada geração de capa adicional custará ${moneyMask(cover)} centavos dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.`;
    const quizPublicDesc = `Essas são as gerações de quizzes em documentos públicos.\n\nQuando as gerações de quizzes gratuitos se se esgotarem, somente será possível gerar novos quizzes com créditos.\n\nCada geração de quiz adicional custará ${moneyMask(quizPublic)} reais dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.`;
    const quizPrivateDesc = `Essas são as gerações de quizzes em documentos privados (aqueles que você fez upload).\n\nQuando as gerações de quizzes gratuitos se se esgotarem, somente será possível gerar novos quizzes com créditos.\n\nCada geração de quiz adicional custará ${moneyMask(quizPrivate)} reais dos créditos.\n\nPara comprar créditos é necessário ter um cartão de crédito cadastrado.`;

    return (
        <div className="mt-3 flex flex-col gap-3 w-full" >
            <PrincingProp { ...{bonus:{amount:5, desc:`Perguntas gratuitas por Mês`}, paid:{amount:questions, desc:`por perguntas adicionais`}, desc:questionsDesc} }  />
            {/* <PrincingPropBlocked {...{text:`Não é possível fazer perguntas para mais de um documento ao mesmo tempo.`, desc:'Realizar perguntas para mais de um documento ao mesmo tempo é útil para adicionar mais contexto à sua resposta.\n\nPor exemplo, você pode selecionar um livro voltado para finanças, e outro voltado para questões legislativas, neste caso será possível saber quais leis dão suporte à um determinado recurso financeiro.\n\nNeste plano não será possível realizar perguntas para mais de um documento ao mesmo tempo.\n\nConsulte os demais planos disponíveis'}} /> */}
            <PrincingProp { ...{bonus:{amount:0, desc:`Perguntas para mais de um documentos ao mesmo tempo gratuitas por Mês`}, paid:{amount:0.08, desc:`por perguntas adicionais`, disabled:true}, desc:questionsMultiDesc} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Upload de PDf gratuito por Mês`}, paid:{amount:pdfUpload, desc:`a cada 100.000 palavras, por PDFs adicionais`}, desc:pdfUploadDesc} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Gerações de Capas gratuitas por Mês`}, paid:{amount:cover, desc:`por capas adicionais`}, desc:coverDesc} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Gerações de Quizzes Públicos gratuitos por Mês`}, paid:{amount:quizPublic, desc:`por quizzes públicos adicionais`}, desc:quizPublicDesc} }  />
            <PrincingProp { ...{bonus:{amount:0, desc:`Gerações de Quizzes Privados gratuitos por Mês`}, paid:{amount:quizPrivate, desc:`por quizzes privados adicionais`}, desc:quizPrivateDesc} }  />
        </div>
    );
};