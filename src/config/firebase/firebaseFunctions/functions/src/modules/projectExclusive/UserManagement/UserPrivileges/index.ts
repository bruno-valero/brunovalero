import { UsersUser } from "../../../../../src/config/firebase-admin/collectionTypes/users";
import { UsersControlPrivileges } from "../../../../../src/config/firebase-admin/collectionTypes/users/control";
import { admin_firestore } from "../../../../../src/config/firebase-admin/config";
import tsToMask from "../../../../../utils/functions/dateTime/tsToMask";

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

        const dateNow = new Date().getTime()
        const privileges:UsersControlPrivileges = {            
            id:String(dateNow),
            level:0,
            privilegeTitle:`Primeiro Login`,
            privilegeDescription,
            isMonthly:false,
            lastUpdate:String(dateNow),
            lastMonthUpdate:tsToMask({ ts:dateNow, format:['day', 'month', 'year'], seps:['-', '-'] }),
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
        `.trim().replaceAll(/  /g, ''));
        const dateNow = new Date().getTime()
        const privileges:UsersControlPrivileges = {
            id:String(dateNow),
            level:0,
            privilegeTitle:`Primeiro Login`,
            privilegeDescription,
            isMonthly:false,
            lastUpdate:String(dateNow),
            lastMonthUpdate:tsToMask({ ts:dateNow, format:['day', 'month', 'year'], seps:['-', '-'] }),
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

    async freePlanMonthlyPrivilege(uid:string) {

        const privilegeDescription = `
        Suas perguntas gratuitas foram renovadas!
        Seu upload e PDF gratuito foi renovado!

        Muito obrigado por permanecer na plataforma.

        
        `.trim().replaceAll(/  /g, '');
        const dateNow = new Date().getTime()
        const privileges:UsersControlPrivileges = {
            id:'plan-privileges',
            level:0,
            privilegeTitle:`Acessos Gratuitos Renovados`,
            privilegeDescription,
            isMonthly:true,
            lastUpdate:String(dateNow),
            lastMonthUpdate:tsToMask({ ts:dateNow, format:['day', 'month', 'year'], seps:['-', '-'] }),
            privilegeData:{
                readPdf:{                    
                    pdfUpload:0, // R$0,0
                    questions:5, // R$0,25
                    coverGenerationForPrivateDocs:0,
                    quizGeneration:{
                        privateDocs:0,
                        publicDocs:0,
                    },    
                },
            }
        };

        // const sumAll = (data:Record<string, any>) => {
        //     const sum:number = Object.values(data).reduce((acc:number, item) => {
        //         if (typeof item === 'number') return acc + item;
        //         if (item instanceof Array) return acc;
        //         if (typeof item === 'object') return sumAll(item);
        //         return acc;
        //     }, 0)

        //     return sum;
        // };

        // const resp = await admin_firestore
        // .collection('users').doc(uid)
        // .collection('control').doc('PrivilegesFreeServices').get();

        // const priv = resp?.data() as Record<string, UsersControlPrivileges> | null;
        // const lvl = priv?.[privileges.id]?.level ?? 0;
        // if ((sumAll(priv?.[privileges.id]?.privilegeData?.readPdf ?? {}) > sumAll(privileges.privilegeData?.readPdf)) && (lvl > privileges?.level)) return;
        // const ts = Number(priv?.[privileges.id]?.lastUpdate) ?? 0;
        // const dateMonth = tsToMask({ts, format:['day', 'month', 'year'], seps:['-', '-']});
        // if (lvl > privileges.level && (dateMonth === privileges.lastMonthUpdate)) return;

        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .set({ [privileges.id]:privileges }, {merge:true})            
    };

    async standardPlanMonthlyPrivilege(uid:string) {
        
        const privilegeDescription = `
        Suas perguntas gratuitas foram renovadas!
        Seu upload e PDF gratuito foi renovado!

        Muito obrigado por permanecer na plataforma.

        
        `.trim().replaceAll(/  /g, '');
        const dateNow = new Date().getTime()
        const privileges:UsersControlPrivileges = {
            id:'plan-privileges',
            level:1,
            privilegeTitle:`Acessos Gratuitos Renovados`,
            privilegeDescription,
            isMonthly:true,
            lastUpdate:String(dateNow),
            lastMonthUpdate:tsToMask({ ts:dateNow, format:['day', 'month', 'year'], seps:['-', '-'] }),
            privilegeData:{
                readPdf:{                    
                    pdfUpload:5, // R$3,00
                    questions:60, // R$3,00
                    coverGenerationForPrivateDocs:3, // R$2,40
                    quizGeneration:{
                        privateDocs:3, // R$6,00
                        publicDocs:0,
                    },    
                    // total = 14.4
                    // planValue = 20
                },
            }
        }
        
        
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .set({ [privileges.id]:privileges }, {merge:true})            
    };

    async enterprisePlanMonthlyPrivilege(uid:string) {

        const privilegeDescription = `
        Suas perguntas gratuitas foram renovadas!
        Seu upload e PDF gratuito foi renovado!

        Muito obrigado por permanecer na plataforma.

        
        `.trim().replaceAll(/  /g, '');
        const dateNow = new Date().getTime()
        const privileges:UsersControlPrivileges = {
            id:'plan-privileges',
            level:2,
            privilegeTitle:`Acessos Gratuitos Renovados`,
            privilegeDescription,
            isMonthly:true,
            lastUpdate:String(dateNow),
            lastMonthUpdate:tsToMask({ ts:dateNow, format:['day', 'month', 'year'], seps:['-', '-'] }),
            privilegeData:{
                readPdf:{                    
                    pdfUpload:10, // R$6,00
                    questions:200, // R$10,00
                    coverGenerationForPrivateDocs:10, // R$8,00
                    quizGeneration:{
                        privateDocs:3, // R$6,00
                        publicDocs:5, // R$10,00
                    },    
                    // total = 40
                    // planValue = 50
                },
            }
        }
        
        await admin_firestore
            .collection('users').doc(uid)
            .collection('control').doc('PrivilegesFreeServices')
            .set({ [privileges.id]:privileges }, {merge:true})            
    };

};