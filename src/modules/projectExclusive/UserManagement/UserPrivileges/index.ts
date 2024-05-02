import { UsersUser } from "@/src/config/firebase-admin/collectionTypes/users";
import { UsersControlPrivileges } from "@/src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "@/src/config/firebase-admin/config";

export default class UserPrivileges {


    constructor() {



    };


    async firstLogin(uid:string) {

        const privilegeDescription = encodeURIComponent(`
        Seja bem vindo(a) à Plataforma:

        Os novos integrantes têm acesso a acesso gratuito para alguns recursos da platafroma, aproveite.

        Você podetá fazer 10 perguntas gratuitas para qualquer documento, seja público ou privado. Ela pode ser feita direcionada a qualquer parte do conteúdo, não importa a complexidade, você terá uma resposta certeira.

        Você poderá inserir 1 documento pdf, seja um livro para estudos, um contrato legislativo, entre outros. Seu documento será guardado de forma privada onde somente você terá acesso.
        `.trim().replaceAll(/  /g, ''));
        const privileges:UsersControlPrivileges = {
            id:String(new Date().getTime()),
            privilegeTitle:`Primeiro Login`,
            privilegeDescription,
            privilegeData:{
                readPdf:{                    
                    pdfUpload:1,
                    questions:10,
                    coverGenerationForPrivateDocs:0,
                    quizGeneration:{
                        privateDocs:0,
                        publicDocs:0,
                    },    
                },
            }
        };

        // const user = '' as unknown as UsersUser
        // user.control.PrivilegesFreeServices
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .set({ [privileges.id]:privileges }, {merge:true})
    };

    async firstPurchase(uid:string) {

        const privilegeDescription = encodeURIComponent(`
        Parabéns pela sua primeira compra de créditos na Plataforma!

        Agora, como membro premium, você desbloqueou uma gama ainda maior de recursos exclusivos para aprimorar sua experiência:

        Amplie suas consultas com 10 perguntas gratuitas em qualquer documento, sem restrições de acesso ou complexidade. Obtenha respostas precisas para suas dúvidas, independentemente do conteúdo.

        Armazene gratuitamente e com segurança até 1 documento PDF, seja um contrato crucial ou um livro de estudo valioso. Seu arquivo será mantido privado, acessível apenas por você, garantindo total confidencialidade e conveniência.

        Desfrute de uma geração de capa gratuita para um dos documentos PDFs enviados. Nossa inteligência artificial criará uma capa que representará fielmente o objetivo do conteúdo, adicionando uma apresentação profissional ao seu documento.

        Enriqueça sua experiência de aprendizado com a geração de um quiz personalizado sobre o conteúdo do seu documento. Com 30 perguntas direcionadas para qualquer tema ou assunto presente no documento PDF enviado, você receberá um feedback detalhado ao final, considerando tanto seus acertos quanto erros.

        Continue explorando e aproveitando ao máximo o que a plataforma tem a oferecer!
        `.trim().replaceAll(/ /g, ''));
        const privileges:UsersControlPrivileges = {
            id:String(new Date().getTime()),
            privilegeTitle:`Primeiro Login`,
            privilegeDescription,
            privilegeData:{
                readPdf:{                    
                    pdfUpload:1,
                    questions:10,
                    coverGenerationForPrivateDocs:1,
                    quizGeneration:{
                        privateDocs:1,
                        publicDocs:0,
                    },    
                },
            }
        }
        const user = '' as unknown as UsersUser
        user.control.PrivilegesFreeServices
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .set({ [privileges.id]:privileges }, {merge:true})            
    };

};