// import { isProduction } from '@/envs';
// import { CustomerData } from '@/src/models/customerModel';
// import Stripe from 'stripe';
// import connectStripe from './connectStripe';
// import getStripeId from './getStripeId';

// export default class StripeAdm {

//   isProduction:boolean;
//   stripe:Stripe;

//   constructor() {
//     this.isProduction = isProduction;
//     const { stripe } = connectStripe(isProduction ? 'production' : 'test')
//     this.stripe = stripe;
//   };


//   async getStripeId(customer:CustomerData) {
//     const resp = await getStripeId({ isProduction, customer, stripe:this.stripe })
//     return resp;
//   }



// };