import envs from '@/envs';
import UserFinancialData from '@/src/modules/projectExclusive/UserManagement/UserFinancialData';
import { NextResponse } from 'next/server';





export async function POST(req:Request) {
  // const request = await req.json();
  // console.log('body', request);
  
  const userFinancials = new UserFinancialData()
  const secret = envs.WEBHOOK_KEY!;
  const event = await userFinancials.stripe.authenticateWebhook(req, secret);
  if (!event) {
    console.log('nao autenticado');
    return NextResponse.json({resp:'nao autenticado', status:400});
  };

  // const paymentMethodAttached = event.data.object;
  // console.log('paymentMethodAttached: ', paymentMethodAttached)
  // console.log('event.type: ', event.type)
  await userFinancials.stripe.handleWebhooks(event);

  return NextResponse.json({resp:'concluido', status:200});
}