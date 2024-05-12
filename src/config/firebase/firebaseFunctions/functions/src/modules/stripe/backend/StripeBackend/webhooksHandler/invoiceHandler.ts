import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import Stripe from "stripe";



export const invoiceHandler = async(event: Stripe.Event) => {
  
  const userFinancials = new UserFinancialData();  
  const stripe = userFinancials.stripe.stripe;

  if (event.type === 'invoice.created') {
    const invoice = event.data.object;
    // Handle invoice.created event
  } else if (event.type === 'invoice.deleted') {
    const invoice = event.data.object;
    // Handle invoice.deleted event
  } else if (event.type === 'invoice.finalization_failed') {
    const invoice = event.data.object;
    // Handle invoice.finalization_failed event
  } else if (event.type === 'invoice.finalized') {
    const invoice = event.data.object;
    // Handle invoice.finalized event
  } else if (event.type === 'invoice.marked_uncollectible') {
    const invoice = event.data.object;
    // Handle invoice.marked_uncollectible event
  } else if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    // Handle invoice.paid event
  } else if (event.type === 'invoice.payment_action_required') {
    const invoice = event.data.object;
    // Handle invoice.payment_action_required event
  } else if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    // Handle invoice.payment_failed event
  } else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    console.log(`invoice.payment_succeeded  >>>>  ${invoice.id}`)
    if (invoice.subscription) {
      let sub:Stripe.Subscription;
      const s = invoice.subscription;
      if (typeof s !== 'string' && !!s) {
        sub = s;
      } else if (typeof s === 'string') {
        sub = await stripe.subscriptions.retrieve(s);
      } else {
        return true;
      };

      const plan = sub.metadata.plan as 'free' | 'standard' | 'enterprise';
      const uid = sub.metadata.uid;
      await userFinancials.payment.createMoneyTransaction({ invoiceId:invoice.id, uid, type:"subscription" });
      await userFinancials.updateUserActivePdfPlanFirebase(uid, plan);
      
    } else if (invoice.payment_intent) {
      let pi:Stripe.PaymentIntent;
      if (typeof invoice.payment_intent === 'string') {
        pi = await stripe.paymentIntents.retrieve(invoice.payment_intent);
      } else {
        pi = invoice.payment_intent;
      };

      await userFinancials.updatePointsAmount(pi, Number(pi.metadata.amount));
    }
    // Handle invoice.payment_succeeded event


  } else if (event.type === 'invoice.sent') {
    const invoice = event.data.object;
    // Handle invoice.sent event
  } else if (event.type === 'invoice.upcoming') {
    const invoice = event.data.object;

    if (invoice.subscription) {
      let sub:Stripe.Subscription;
      const s = invoice.subscription;
      if (typeof s !== 'string' && !!s) {
        sub = s;
      } else if (typeof s === 'string') {
        sub = await stripe.subscriptions.retrieve(s);
      } else {
        return true;
      };

      const uid = sub.metadata.uid;
      const switchToFreeSubscription = sub.metadata.switchToFreeSubscription;
      const switchToStandardSubscription = sub.metadata.switchToStandardSubscription;
      const switchToEnterpriseSubscription = sub.metadata.switchToEnterpriseSubscription;
      if (!!switchToFreeSubscription) {
        await userFinancials.subscribeToFreePlan(uid);
        await userFinancials.updateUpcomingPlan({ uid, upcomingPlanData:null });
      } else if (!!switchToStandardSubscription) {
        await userFinancials.subscribeToStandardPlan(uid);
        await userFinancials.updateUpcomingPlan({ uid, upcomingPlanData:null });
      } else if (!!switchToEnterpriseSubscription) {
        await userFinancials.subscribeToEnterprisePlan(uid);
        await userFinancials.updateUpcomingPlan({ uid, upcomingPlanData:null });
      }
      
    } 

    // Handle invoice.upcoming event
  } else if (event.type === 'invoice.updated') {
    const invoice = event.data.object;
    // Handle invoice.updated event
  } else if (event.type === 'invoice.voided') {
    const invoice = event.data.object;
    // Handle invoice.voided event
  } else {
    return true;
  }
  

}