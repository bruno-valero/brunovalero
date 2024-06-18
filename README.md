# Meu Site

[![Typescript Badge](https://img.shields.io/badge/TypeScript-20232A?style=for-the-badge&logo=typescript&logoColor=007acd&link=https://gist.github.com/bruno-valero/302a8b36f8fb5749bd15866b523b315e)](https://gist.github.com/bruno-valero/302a8b36f8fb5749bd15866b523b315e)  
 [![ReactJS Badge](https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB&link=https://gist.github.com/bruno-valero/b8dbb94effca340b6dce62cfdf8edc24)](https://gist.github.com/bruno-valero/b8dbb94effca340b6dce62cfdf8edc24)
[![NextJS Badge](https://img.shields.io/badge/Next.js-20232A?style=for-the-badge&logo=next.js&logoColor=black&link=https://gist.github.com/bruno-valero/f8b574893e55c305bc4c5dc7d036d2ef)](https://gist.github.com/bruno-valero/f8b574893e55c305bc4c5dc7d036d2ef)

Para conferir o projeto rodando, visite [Meu Site.](https://www.brunovalero.com)

Este é um projeto [Next.js](https://nextjs.org/) iniciado com [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Utilizei o [Firebase](https://firebase.google.com/?hl=pt-br) como suporte:

- [Firebase Firestore](https://firebase.google.com/docs/firestore?hl=pt-br), como o banco de dados NoSQL.
- [Firebase Storage](https://firebase.google.com/docs/storage?hl=pt-br), como o banco de dados de Imagens/PDFs.
- [Firebase Functions](https://firebase.google.com/docs/functions?hl=pt-br), como endpoints para realizar requisições que duram acima de 5 segundos (tive que fazer isso, pois as lambda functions do Next.JS na versão gratuita somente duram atém cinco segundos ativas).
- [Firebase Auth](https://firebase.google.com/docs/auth?hl=pt-br), como autenticador, me provendo uma camada de segurança, pois me possibilita enviar tokens de autenticação em cada requisição e assim configurar corretamente as regras de segurança do **Firebase Firestore** e do **Firebase Storage**.

Utilizei o [Pinecone](https://www.pinecone.io) como **Banco de Dados Vetorial**, este novo tipo de banco de dados é voltado para a realização de busca semântica. Enquanto nos Banco e Dados convencionais (SQL e NoSQL) nós buscamos por valores, nos Banco de Dados Vetoriais, nós buscamos por **Significado**.

Utilizei o [Stripe](https://stripe.com/br) para configurar as transações financeiras e permitir que os clientes façam assinaturas mensais na plataforma.
