
// import colors from '@/src/constants/colors';
// import { Elements, PaymentElement } from '@stripe/react-stripe-js';
// import { Stripe } from '@stripe/stripe-js';
// import { useEffect, useState } from 'react';
// import { ClipLoader } from 'react-spinners';
// import SubmitSetupButton from './SubmitSetupButton';


// interface CardSetupProps {
//   stripe:Stripe | null,
//   clientSecret:string | null,
// }

// export default function CardSetup({ stripe, clientSecret }:CardSetupProps) {
  
//   const [showButton, setShowButton] = useState(false);

//   useEffect(() => {
//   if (!clientSecret) return;
  
//     const time = setTimeout(() => {
//       setShowButton(true);
//     }, 1000);
    
//     return () => {
//       clearTimeout(time);
//     };

//   }, [clientSecret]);

//   return (
//     <div className='w-full h-full bg-white' style={{}} >
//         {clientSecret && (
//             <Elements stripe={stripe} options={{clientSecret}} >
//               <div className='w-[90%] flex flex-col self-center items-center justify-center pt-4' >                
//                   <span className='text-black text-lg mb-3' >
//                       Adicione seu Cartão
//                   </span>
//                   <PaymentElement />
//                   {showButton && (
//                   <SubmitSetupButton />
//                   )}                

//               </div>
//             </Elements>
//         )}
//         {!clientSecret && (
//             <div className='flex items-center justify-center h-[80%]' >
//             <ClipLoader color={colors.valero()} size={150} className='self-center inline-block' speedMultiplier={.3} />
//             </div>
//         )}
//     </div>
//   );
// };