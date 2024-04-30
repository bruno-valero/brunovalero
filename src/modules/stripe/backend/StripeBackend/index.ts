import envs from "@/envs";
import Stripe from "stripe";


export default class StripeBackend {

    stripe:Stripe

    constructor(type:'production' | 'test') {
        const { stripe } = this.connectStripe(type);
        this.stripe = stripe;
    };


    protected connectStripe(type:'production' | 'test') {

        const secretKey = type === 'production' ? envs.STRIPE_PRODUCTION_SECRET_KEY! : envs.STRIPE_SECRET_KEY!;
        const stripe = new Stripe(secretKey, {
          apiVersion: '2023-10-16',
        });
      
        return { stripe };
    };

    async createSetupIntent({customer, metadata, moreParams}:{customer:string, metadata:Record<string, string>, moreParams?:Partial<Stripe.SetupIntentCreateParams>}) {
        if (!customer) throw new Error('Id do customer não enviado');
        if (!metadata) throw new Error('metadata não enviado');
        const si = await this.stripe.setupIntents.create({
            ...moreParams,
            customer,
            metadata,
        });
        return si;
    };

    async createPaymentIntent({customer, metadata, amount, currency, moreParams}:{customer:string, metadata:Record<string, string>, amount:number, currency:string, moreParams?:Partial<Stripe.PaymentIntentCreateParams>}) {
        if (!amount) throw new Error('amount não enviado');
        if (!currency) throw new Error('currency não enviado');
        if (!customer) throw new Error('Id do customer não enviado');
        if (!metadata) throw new Error('metadata não enviado');
        const pi = await this.stripe.paymentIntents.create({
            ...moreParams,
            amount,
            currency,
            customer,
            metadata,            
        });
        return pi;
    };

    /**
     * Cria uma subscrição agendada para finalizar ao se findar o número de parcelas desejado.
     * 
     * @param installments - [number] O número de parcelas da compra
     * @param productId - [string] o Id do produto do Stripe
     * @param customer - [string] o Id do customer do Stripe
     * @param quantity - [number?] a quantidade de itens que será comprada (o valor padrã é 1)
     *  
     */
    async createInstallments({installments, productId, customer, quantity, moreParams}:{installments:number, productId:string, customer:string, quantity?:number, moreParams?:Partial<Stripe.SubscriptionCreateParams>}) {
        // pega dados do produto
        const product = await this.stripe.products.retrieve(productId);
        if (!product.id) throw new Error('Produto não encontrado');
        if (!product.default_price) throw new Error('Produto não possui preço padrão');
        const defaultPrice = typeof product.default_price === 'string' ? await this.stripe.prices.retrieve(product.default_price) : product.default_price;
        if (!defaultPrice.unit_amount) throw new Error('Preço do Produto não possui unit_amount');

        // busca o preço relacionado a este installment
        const queryData = (await (this.stripe.prices.search({query:`metadata[productId]:${productId} AND metadata[installments]:${installments}`}))).data;
        const queryResult = queryData.length > 0 ? queryData[0] : null;
        let price:Stripe.Price
        if (!queryResult) {
            price = (await this.stripe.prices.create({currency:'brl', active:true, unit_amount:Math.ceil(defaultPrice.unit_amount / installments), recurring:{interval:'month', interval_count:1}}))
        } else {
            price = queryResult;
        };

        // cria a Subscrição
        function calcCancelAt(installments:number) {
            const date = new Date();
            return Math.floor(date.setMonth(date.getMonth() + installments) / 1000);
        }
        const subscription =  await this.stripe.subscriptions.create({
            ...moreParams,
            customer,
            items:[{price:price.id, quantity:quantity ?? 1}],
            cancel_at:calcCancelAt(installments),       
        });

        return subscription;
    };


    async createProduct({ name, metadata, unit_amount, moreParams }:{ name:string, metadata:Record<string, string>, unit_amount:number, moreParams?:Partial<Stripe.ProductCreateParams> }) {
        if (!name) throw new Error('Nome do produto não enviado');
        if (!metadata) throw new Error('metadata não enviado');
        if (!unit_amount) throw new Error('unit_amount não enviado');
        const product = await this.stripe.products.create({
            ...moreParams,
            name,
            active:true,
            metadata,
            default_price_data:{
                currency:'brl',
                unit_amount,                
            },
        });
        return product;
    };    

};