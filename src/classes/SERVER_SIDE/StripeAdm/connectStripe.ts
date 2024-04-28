import envs from '@/envs';
import Stripe from 'stripe';


export default function connectStripe(type:'production' | 'test') {

  const secretKey = type === 'production' ? envs.STRIPE_PRODUCTION_SECRET_KEY! : envs.STRIPE_SECRET_KEY!;
  console.log('secretKey: ', secretKey)
  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });

  return { stripe };
}