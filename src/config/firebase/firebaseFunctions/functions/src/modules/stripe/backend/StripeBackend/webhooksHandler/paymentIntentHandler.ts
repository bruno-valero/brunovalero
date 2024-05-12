import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import Stripe from "stripe";



export const paymentIntentHandler = async(event: Stripe.Event) => {

    const userFinancials = new UserFinancialData();  
    const stripe = userFinancials.stripe.stripe;

    if (event.type === 'payment_intent.amount_capturable_updated') {
        const paymentIntentAmountCapturableUpdated = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      } else if (event.type === 'payment_intent.canceled') {
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
      } else if (event.type === 'payment_intent.created') {
        const paymentIntentCreated = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
      } else if (event.type === 'payment_intent.partially_funded') {
        const paymentIntentPartiallyFunded = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntentPaymentFailed = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
      } else if (event.type === 'payment_intent.processing') {
        const paymentIntentProcessing = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
      } else if (event.type === 'payment_intent.requires_action') {
        const paymentIntentRequiresAction = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
      } else if (event.type === 'payment_method.attached') {
        // Handle payment_method.attached event
      } else if (event.type === 'payment_method.detached') {
        // Handle payment_method.detached event
      } else if (event.type === 'payment_intent.succeeded') {
        // Handle payment_intent.succeeded event
      } else {
        return true;
      }

}