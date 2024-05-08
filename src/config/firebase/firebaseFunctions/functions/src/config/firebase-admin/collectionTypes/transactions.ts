


export type Transactions = Record<string, {
    /** **Nova Coleção** Lista as transações realizadas com dinheiro
     * 
     * Cada documento representa um mês do ano, contendo todas as transações daquele mês.
     * 
     * **[Formato] -** o ID do documento deve estar no formato **dd-mm-yyyy**
     * 
     * As transações com dinheiro podem ser realizadas para compra de créditos ou para pagar uma subscrição de um plano mensal
     */
    money:MonthlyMoneyTransactions,
    /** **Nova Coleção** Lista as transações realizadas com créditos
     * 
     * Cada documento representa um mês do ano, contendo todas as transações daquele mês.
     * 
     * **[Formato] -** o ID do documento deve estar no formato **dd-mm-yyyy**
     * 
     * As transações com créditos podem ser realizadas para usufruir de algum serviço, como leitura de PDfs por exemplo.
     */
    credits:MonthlyCreditTransactions,
}>


/** **Nova Coleção** Lista as transações realizadas com dinheiro
 * 
 * Cada documento representa um mês do ano, contendo todas as transações daquele mês.
 * 
 * **[Formato] -** o ID do documento deve estar no formato **dd-mm-yyyy**
 * 
 * As transações com dinheiro podem ser realizadas para compra de créditos ou para pagar uma subscrição de um plano mensal
 */
export type MonthlyMoneyTransactions = Record<string, TransactionWithMoney>;
/**
 * As transações com dinheiro podem ser realizadas para compra de créditos ou para pagar uma subscrição de um plano mensal
 * 
 * Este objeto representa uma das transações de um determinado mês.
 * 
 * **[key] -** Cada chave desse documento é um identificador do PaymentIntent fornecido pelo Stripe
 * 
 * **[value] -** O valor do documento é um objeto contendo algumas informações sobre a transação.
 */
export type TransactionWithMoney = Record<string, {
    /** ID único do pagamento fornecido pelo stripe. */
    stripeId:string,
    /** Indica se o pagamento foi devilvido. */
    devolution?:{
        /** ID único da devolução fornecido pelo stripe. */
        stripeId:string,
    },
    /** Tipo da transação */
    type:TransactionWithMoneyType,
}>
/** Tipo da transação */
export type TransactionWithMoneyType = 'subscription' | 'payment';



/** **Nova Coleção** Lista as transações realizadas com créditos
 * 
 * Cada documento representa um mês do ano, contendo todas as transações daquele mês.
 * 
 * **[Formato] -** o ID do documento deve estar no formato **dd-mm-yyyy**
 * 
 * As transações com créditos podem ser realizadas para usufruir de algum serviço, como leitura de PDfs por exemplo.
 */
export type MonthlyCreditTransactions = Record<string, TransactionWithCredits>
/**
 * As transações com créditos podem ser realizadas para usufruir de algum serviço, como leitura de PDfs por exemplo.
 * 
 * Este objeto representa uma das transações de um determinado mês.
 * 
 * **[key] -** Cada chave desse documento é um identificador gerado no momento da transação, ele deve ser em formato timestamp, porém transformado para string.
 * 
 * **[value] -** O valor do documento é um objeto contendo algumas informações sobre a transação.
 */
export type TransactionWithCredits = Record<string, {
    /** ID único da transação (deve ser em formato timestamp, porém transformado para string). */
    id:string,    
    /** Quantidade transacionada */
    amount:number, 
    /** Natureza da transação, ou seja, se foi aquisição ou subtração de créditos */   
    nature:TransactionWithCreditsNature,    
    /**PaymentIntent (pi) relacionado com a tranzação.
     * 
     * Caso a natureza da transação seja de aquisição, aqui ficará o PaymentIntent fornecido pelo Stripe com status "succeeded" utilizado para realizar a aquisição dos créditos.
     * 
     * Porém, se a natureza for de subtração, o valor será **null**
     */
    piRelated:TransactionWithCreditsPiRelated,
    /** Serviço  disponibilizado pelo modelo de negócio */
    service:TransactionWithCreditsService,
    /** Tipo de ação disponibilizado pelo serviço que foi usufruido para gerar esta transação */
    type:TransactionWithCreditsType,
}>
/** Natureza da transação, ou seja, se foi aquisição ou subtração de créditos */
export type TransactionWithCreditsNature = 'aquisition' | 'subtraction'; 
/**PaymentIntent (pi) relacionado com a tranzação.
 * 
 * Caso a natureza da transação seja de aquisição, aqui ficará o PaymentIntent fornecido pelo Stripe com status "succeeded" utilizado para realizar a aquisição dos créditos.
 * 
 * Porém, se a natureza for de subtração, o valor será **null**
 */
export type TransactionWithCreditsPiRelated = string | null; 
/** Serviço  disponibilizado pelo modelo de negócio */
export type TransactionWithCreditsService = 'readPdf' | 'none';
/** Tipo de ação disponibilizado pelo serviço que foi usufruido para gerar esta transação */
export type TransactionWithCreditsType = 'uploadPdf' | 'askQuestion' | 'quizGeneration' | 'coverGeneration' | 'none';