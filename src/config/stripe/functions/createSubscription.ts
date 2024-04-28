import connectStripe from '@/src/classes/SERVER_SIDE/StripeAdm/connectStripe';


export default async function createSubscription(type:'production' | 'test', price:string) {

  const { stripe } = connectStripe(type);
  // Criar uma sessão de checkout no Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price, // Substitua pelo ID do preço do produto ou plano no seu painel do Stripe
        quantity: 1,
      },
    ],
    mode: 'subscription', // Ou 'payment' se for um pagamento único
    success_url: 'URL_DE_SUCESSO',
    cancel_url: 'URL_DE_CANCELAMENTO',
  });

  // Obter o link de checkout da sessão
  const linkDoCheckout = session.url;
  console.log('Link do Checkout:', linkDoCheckout);

  return { session };

  // Agora você pode manipular o linkDoCheckout como quiser, por exemplo, enviá-lo para um aplicativo nativo

}

