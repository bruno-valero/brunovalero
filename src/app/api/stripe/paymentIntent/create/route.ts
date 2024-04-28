// import { isProduction } from "@/envs";
// import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
// import { NextResponse } from "next/server"



// export async function POST(req:Request) {

//     try {
//         const { customer, metadata, amount, currency } = await req.json() as { customer: string; metadata: Record<string, string>; amount: number; currency: string; };
//         const stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
//         const response = await stripeBackend.createPaymentIntent({ customer, metadata, amount, currency });
//         const data = response.client_secret;
//         return NextResponse.json({data});
//     } catch (e:any) {
//         return NextResponse.json({error:`Houver um erro: ${e.message}`});
//     }
    
// };