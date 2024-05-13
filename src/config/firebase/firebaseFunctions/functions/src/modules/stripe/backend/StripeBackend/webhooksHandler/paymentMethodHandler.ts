// import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
// import Stripe from "stripe";



// export const paymentMethodHandler = async(event: Stripe.Event) => {

//   const userFinancials = new UserFinancialData();  
//   const stripe = userFinancials.stripe.stripe;

//   if (event.type === 'payment_method.attached') {

//     const paymentMethod = event.data.object;
//     console.log(`payment_method.attached  >>> ${paymentMethod.customer}`)
//     if (typeof paymentMethod.customer === 'string') {
//       const cus = await stripe.customers.retrieve(paymentMethod.customer);
//       if (cus.deleted) return;

//       const uid = cus.metadata.uid;

//       await stripe.paymentMethods.update(paymentMethod.id, { metadata:cus.metadata })

//       await userFinancials.updatePaymentMethodsAmount({ uid });
//     }
//     // Handle payment_method.attached event

//   } else if (event.type === 'payment_method.automatically_updated') {
//     const paymentMethod = event.data.object;
//     // Handle payment_method.automatically_updated event
//   } else if (event.type === 'payment_method.detached') {

//     const paymentMethod = event.data.object;
//     const uid = paymentMethod.metadata?.uid;
//     console.log(`payment_method.detached  >>> ${uid}`)
//     if (!uid) return;
//     await userFinancials.updatePaymentMethodsAmount({ uid });

//     // Handle payment_method.detached event
//   } else if (event.type === 'payment_method.updated') {
//     const paymentMethod = event.data.object;
//     // Handle payment_method.updated event
//   } else {
//     return true;
//   }

// }