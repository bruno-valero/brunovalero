
import colors from '@/src/constants/colors';
import { SetState } from '@/utils/common.types';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { ClipLoader } from 'react-spinners';
import SubmitSetupButton from './SubmitSetupButton';


interface CardSetupProps {
  stripe:Stripe | null,
  clientSecret:string | null,
  addCard:boolean,
  setAddCard:SetState<boolean>,
  background:boolean,
}

export default function CardSetup({ stripe, clientSecret, addCard, setAddCard, background }:CardSetupProps) {
  
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
  if (!clientSecret) return;
  
    const time = setTimeout(() => {
      setShowButton(true);
    }, 1000);
    
    return () => {
      clearTimeout(time);
    };

  }, [clientSecret]);

  return (
    <div className='w-full h-full bg-white ' style={{}} >
        {clientSecret && (
            <Elements stripe={stripe} options={{clientSecret}} >
            <div className='w-[90%] flex flex-col self-center items-center justify-center pt-4' >
                <div className='h-[50px] w-[100%] flex items-center justify-end' >                    
                <button className='h-[100%] w-[50px] flex items-center justify-center' onClick={() => setAddCard(false)} >
                    <IoMdClose color='rgba(0,0,0,.4)' size={30} />
                </button>
                </div>
                <span className='text-black text-2xl mb-3' >
                    Adicione seu Cartão
                </span>
                <PaymentElement />
                {showButton && (
                <SubmitSetupButton />
                )}

                <div className='h-[100px] w-[100vw] my-3' />

            </div>
            </Elements>
        )}
        {!clientSecret && (
            <div className='flex items-center justify-center h-[80%]' >
            <ClipLoader color={colors.valero()} size={150} className='self-center inline-block' speedMultiplier={.3} />
            </div>
        )}
    </div>
  );
};