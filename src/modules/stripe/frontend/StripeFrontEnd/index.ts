import { Envs, isProduction } from "@/envs";
import Post from "@/src/classes/Request/Post";
import { Stripe as StripeJs, loadStripe } from '@stripe/stripe-js';
import { useCallback, useEffect, useState } from "react";
import Stripe from "stripe";
import CardSetup from "./tsx/CardSetup";


export default class StripeFrontEnd {

    stripe:Stripe;
    envs: Envs

    constructor(envs: Envs) {
        const type = envs.isProduction ? 'production' : 'test'
        this.envs = envs;        
        const { stripe } = this.connectStripe(type);
        this.stripe = stripe;
    };


    protected connectStripe(type:'production' | 'test') {

        const secretKey = type === 'production' ? this.envs.STRIPE_PRODUCTION_SECRET_KEY! : this.envs.STRIPE_SECRET_KEY!;
        const stripe = new Stripe(secretKey, {
          apiVersion: '2023-10-16',
        });
      
        return { stripe };
    };

    async createSetupIntent({customer, metadata}:{customer:string, metadata:Record<string, string>}) {
        try {
            if (!customer) throw new Error('Id do customer não enviado');
            if (!metadata) throw new Error('metadata não enviado');
    
            const post = new Post(`/api/stripe/setupIntent/create`);
            post.addData({customer, metadata});
            const response =  (await post.send())?.json();
            
            if (!response) throw new Error('Sem resposta');
            const {error, data} = await response as {error?:string, data:any};
            return {error, data};
        } catch (e:any) {
            return {error:`Houver um Erro: ${e.message}`};
        };
    };

    async createPaymentIntent({customer, metadata, amount, currency}:{customer:string, metadata:Record<string, string>, amount:number, currency:string}) {
        try {
            if (!amount) throw new Error('amount não enviado');
            if (!currency) throw new Error('currency não enviado');
            if (!customer) throw new Error('Id do customer não enviado');
            if (!metadata) throw new Error('metadata não enviado');
    
            const post = new Post(`/api/stripe/paymentIntent/create`);
            post.addData({customer, metadata, amount, currency});
            const response =  (await post.send())?.json();
            
            if (!response) throw new Error('Sem resposta');
            const {error, data} = await response as {error?:string, data:any};
            return {error, data};
        } catch (e:any) {
            return {error:`Houver um Erro: ${e.message}`};
        };
    };
    
    async createInstallments({installments, productId, customer, quantity}:{installments:number, productId:string, customer:string, quantity?:number}) {
        try {
            if (!installments) throw new Error('installments não enviado');
            if (!productId) throw new Error('productId não enviado');
            if (!customer) throw new Error('customer não enviado');
    
            const post = new Post(`/api/stripe/installments/create`);
            post.addData({installments, productId, customer, quantity});
            const response =  (await post.send())?.json();
            
            if (!response) throw new Error('Sem resposta');
            const {error, data} = await response as {error?:string, data:any};
            return {error, data};
        } catch (e:any) {
            return {error:`Houver um Erro: ${e.message}`};
        };
    };


    async createProduct({ name, metadata, unit_amount }:{ name:string, metadata:Record<string, string>, unit_amount:number }) {
        try {
            if (!name) throw new Error('Nome do produto não enviado');
            if (!metadata) throw new Error('metadata não enviado');
            if (!unit_amount) throw new Error('unit_amount não enviado');
    
            const post = new Post(`/api/stripe/product/create`);
            post.addData({ name, metadata, unit_amount });
            const response =  (await post.send())?.json();
            
            if (!response) throw new Error('Sem resposta');
            const {error, data} = await response as {error?:string, data:any};
            return {error, data};

        } catch (e:any) {
            return {error:`Houver um Erro: ${e.message}`};
        };
    };    

    useLoadStripe() {
        const [stripe, setStripe] = useState<StripeJs | null>(null);
        useEffect(() => {
            const load = async() => {
                const apiKey = isProduction ? this.envs.STRIPE_PRODUCTION_PUBLIC_KEY! : this.envs.STRIPE_PUBLIC_KEY!
                const str = await loadStripe(apiKey);                
                setStripe(str);
            }
            load()
        }, [])

        return stripe;
    }

    useSetupIntent() {        
        const [clientSecret, setClientSecret] = useState<string | null>(null);
      
        const requestSetupIntent = useCallback(async ({ customer, metadata }:{customer:string, metadata:Record<string, string>}) => {
          const { error, data:cs } = await this.createSetupIntent({ customer, metadata });
          if (error) throw new Error(error);
          if (cs) {
            setClientSecret(cs);
          } else {
            throw new Error('A operação não pode ser realizada');
          };
        }, [setClientSecret]);
      
        return { requestSetupIntent, clientSecret, setClientSecret };      
    };

    JSX() {
        return {
            CardSetup,
        };
    };

};