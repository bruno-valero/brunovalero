// import { isProduction } from "@/envs";
// import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
// import { NextResponse } from "next/server"



// export async function POST(req:Request) {

//     try {
//         const { installments, productId, customer, quantity } = await req.json() as { installments: number; productId: string; customer: string; quantity?: number | undefined; };
//         const stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
//         const data = await stripeBackend.createInstallments({ installments, productId, customer, quantity })
//         return NextResponse.json({data});
//     } catch (e:any) {
//         return NextResponse.json({error:`Houver um erro: ${e.message}`});
//     }
    
// };