import { admin_firestore } from '@/src/config/firebase-admin/config';
import { CustomerData } from '@/src/models/customerModel';
import { StripeNewCustomer, stripeNewCustomerSchema } from '@/src/models/stripeModels';
import Stripe from 'stripe';

type GetStripeIdProps = {
  isProduction:boolean,
  customer:CustomerData,
  stripe:Stripe,
}

export default async function getStripeId({ isProduction, customer, stripe }:GetStripeIdProps):Promise<{stripeId?:string, error?:string}> {

  try {
    const stripeId = isProduction ? customer.stripeId : customer.stripeIdDev;
    let newStripeCus = '' as unknown as Stripe.Customer;
    if (!stripeId) {
      const newCus:StripeNewCustomer = {
        email:customer.email,
        name:customer.name,          
        metadata:{
          uid:customer.uid,
        },
      };
      const stripeNewCustomer = stripeNewCustomerSchema.parse(newCus)
      newStripeCus = await stripe.customers.create(stripeNewCustomer);
      const update = {
        [isProduction ? 'stripeId' : 'stripeIdDev']:newStripeCus,
      }
      await admin_firestore.collection('users').doc(customer.uid).update(update);
    }

    return {stripeId: stripeId ?? newStripeCus.id};
  } catch (e:any) {
    return {error:e.message as string}
  }

}