import { CollectionTypes } from "@/src/config/firebase-admin/collectionTypes";
import { admin_firestore } from "@/src/config/firebase-admin/config";
import fromCollection from "@/src/config/firebase/firestore";
import { Firestore } from "firebase/firestore";


export type Cotacao = {"code":"USD","codein":"BRL","name":string,"high":string,"low":string,"varBid":string,"pctChange":string,"bid":string,"ask":string,"timestamp":string,"create_date":string}[]


export default class UpdateDollarPrice {
    
    db?:Firestore;

    constructor({ db }:{ db?:Firestore }) {
        this.db = db;
    }


    /**
     * Método voltado para ser chamado no Front End
     * 
     * @returns Preços do dollar
     */
    async priceOnFrontEnd() {
        return await this.updatePriceOnFrontEnd();
    };

    /**
     * Método voltado para ser chamado no Back End
     * 
     * @returns Preços do dollar
     */
    async priceOnBackEnd() {
        return await this.updatePriceOnBackEnd();
    };

    
    protected async getPrice() {
        const data = await (await fetch('https://economia.awesomeapi.com.br/json/daily/USD')).json() as Cotacao;
        const price = Number(Number(data[0].ask).toFixed(2));
        return {price, data};
    };


    protected setPrice({price, data}:{price:number, data:Cotacao}) {
        return {
            dollarPrice:{
                brl:{
                    price:price,
                    metadata:data,
                    updateTime:new Date().getTime(),
                },
            }
        };
    };

    protected isEqualDate(date:string | number) {
        const todayDate = new Date(date);
        const updateDate = new Date();

        const [todayDay, todayMonth, todayYear] = [todayDate.getDate(), todayDate.getMonth(), todayDate.getFullYear()];
        const [updateDay, updateMonth, updateYear] = [updateDate.getDate(), updateDate.getMonth(), updateDate.getFullYear()];

        const equalDay = todayDay === updateDay;
        const equalMonth = todayMonth === updateMonth;
        const equalYear = todayYear === updateYear;

        return equalDay && equalMonth && equalYear;
    };

    protected async handlePrice(data:CollectionTypes['control']['variables'] | null) {
        let price:NonNullable<typeof data>;
        if (!data) {
            const { price:priceValue, data } = await this.getPrice();
            price = this.setPrice({ price:priceValue, data });
        } else {
            price = data;
        };

        return price;
    }

    protected async updatePriceOnFrontEnd() {
        if (!this.db) throw new Error("Fornça a variável db:Firestore do front end");        

        const data = await fromCollection('control', this.db).getDocById('variables').data() as CollectionTypes['control']['variables'] | null;
        let price = await this.handlePrice(data);

        // verifica e foi atualizado no dia atual, se nao foi, atualiza
        const equalDate = this.isEqualDate(price.dollarPrice.brl.updateTime);
        if (!equalDate) {
            const { price:priceValue, data } = await this.getPrice();
            price = this.setPrice({ price:priceValue, data });
            await fromCollection('control', this.db).getDocById('variables').update(price);
        };

        return price;
    };    

    protected async updatePriceOnBackEnd() {

        const resp = await admin_firestore.collection('control').doc('variables').get() 
        const data = (resp.exists ? resp.data() : null) as CollectionTypes['control']['variables'] | null;
        let price = await this.handlePrice(data);
        // verifica e foi atualizado no dia atual, se nao foi, atualiza
        const equalDate = this.isEqualDate(price.dollarPrice.brl.updateTime);
        if (!equalDate) {
            const { price:priceValue, data } = await this.getPrice();
            price = this.setPrice({ price:priceValue, data });
            await admin_firestore.collection('control').doc('variables').update(price);
        };

        return price;
    };



}