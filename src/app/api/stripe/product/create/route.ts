// import { isProduction } from "@/envs";
// import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
// import { NextResponse } from "next/server"



// export async function POST(req:Request) {

//     try {
//         const { name, metadata, unit_amount } = await req.json() as { name: string; metadata: Record<string, string>; unit_amount: number; };
//         const stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
//         const response = await stripeBackend.createProduct({ name, metadata, unit_amount })
//         return NextResponse.json({data:response});
//     } catch (e:any) {
//         return NextResponse.json({error:`Houver um erro: ${e.message}`});
//     }
    
// };