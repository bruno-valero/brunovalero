import { isProduction } from "@/envs";
import StripeBackend from "@/src/modules/stripe/backend/StripeBackend";
import { NextResponse } from "next/server";



export async function POST(req:Request) {

    try {
        const { customer, metadata } = await req.json() as { customer: string; metadata: Record<string, string>; };
        const stripeBackend = new StripeBackend(isProduction ? 'production' : 'test');
        const response = await stripeBackend.createSetupIntent({ customer, metadata })
        return NextResponse.json({data:response.client_secret});
    } catch (e:any) {
        return NextResponse.json({error:`Houver um erro: ${e.message}`});
    }
    
};