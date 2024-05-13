// import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
// import Stripe from "stripe";



// export const setupIntentHandler = async(event: Stripe.Event) => {

//     const userFinancials = new UserFinancialData();  
//     const stripe = userFinancials.stripe.stripe;

//     if (event.type === 'setup_intent.canceled') {
//       const setupIntent = event.data.object;
//       // Handle setup_intent.canceled event
//     } else if (event.type === 'setup_intent.created') {
//       const setupIntent = event.data.object;
//       console.log(`webhook --- setup_intent.created  >>> ${setupIntent.id}`)
//       // Handle setup_intent.created event
//     } else if (event.type === 'setup_intent.requires_action') {
//       const setupIntent = event.data.object;
//       // Handle setup_intent.requires_action event
//     } else if (event.type === 'setup_intent.setup_failed') {
//       const setupIntent = event.data.object;
//       // Handle setup_intent.setup_failed event
//     } else if (event.type === 'setup_intent.succeeded') {
//       const setupIntent = event.data.object;
//       console.log(`webhook --- setup_intent.succeeded  >>> ${setupIntent.id}`)
//       // Handle setup_intent.succeeded event
//     } else {
//       return true;
//     }
    

// }