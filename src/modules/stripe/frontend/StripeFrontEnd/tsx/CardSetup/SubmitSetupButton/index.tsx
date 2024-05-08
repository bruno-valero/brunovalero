'use client'


import colors from '@/src/constants/colors';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { useState } from 'react';

interface SubmitSetupButtonProps {

}

export default function SubmitSetupButton({  }:SubmitSetupButtonProps) {

  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  type SubmitProps = {
    stripe: Stripe | null,
    elements:StripeElements | null,
  }

  async function submit({ stripe, elements }:SubmitProps) {

    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmSetup({elements, confirmParams:{return_url:`${window.location.href}`}});
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className='w-[100vw] flex m-auto items-center justify-center' >
      <button className='mt-5 w-[90%] py-[10px] self-center rounded-md' style={{backgroundColor:colors.valero()}} onClick={async() => await submit({stripe, elements})} disabled={loading} >
        <span className='text-white text-lg font-bold' >
          {loading ? 'Enviando ...' : 'Confirmar'}
        </span>
      </button>
    </div>
  );
};