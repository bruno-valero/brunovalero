import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import Stripe from "stripe";



export const customerHandler = async(event: Stripe.Event) => {

    const userFinancials = new UserFinancialData();  
    const stripe = userFinancials.stripe.stripe;

    if (event.type === 'customer.created') {
      const customer = event.data.object;
      // Handle customer.created event
    } else if (event.type === 'customer.deleted') {
      const customer = event.data.object;
      // Handle customer.deleted event
    } else if (event.type === 'customer.updated') {
      const customer = event.data.object;
      // Handle customer.updated event
    } else if (event.type === 'customer.discount.created') {
      const discount = event.data.object;
      // Handle customer.discount.created event
    } else if (event.type === 'customer.discount.deleted') {
      const discount = event.data.object;
      // Handle customer.discount.deleted event
    } else if (event.type === 'customer.discount.updated') {
      const discount = event.data.object;
      // Handle customer.discount.updated event
    } else if (event.type === 'customer.source.created') {
      const source = event.data.object;
      // Handle customer.source.created event
    } else if (event.type === 'customer.source.deleted') {
      const source = event.data.object;
      // Handle customer.source.deleted event
    } else if (event.type === 'customer.source.expiring') {
      const source = event.data.object;
      // Handle customer.source.expiring event
    } else if (event.type === 'customer.source.updated') {
      const source = event.data.object;
      // Handle customer.source.updated event
    } else if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      // Handle customer.subscription.created event
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;

      console.log(`Subscription canceled... metadata: ${JSON.stringify(subscription.metadata, null, 2)}`);
      if (subscription.metadata && (!subscription.metadata.canceledToCreateOther)) {
        console.log(`Subscribing to Free plan...`);
        await userFinancials.subscribeToFreePlan(subscription.metadata.uid);
        console.log(`Free plan enabled`);
      }

      // Handle customer.subscription.deleted event
    } else if (event.type === 'customer.subscription.paused') {
      const subscription = event.data.object;
      // Handle customer.subscription.paused event
    } else if (event.type === 'customer.subscription.pending_update_applied') {
      const subscription = event.data.object;
      // Handle customer.subscription.pending_update_applied event
    } else if (event.type === 'customer.subscription.pending_update_expired') {
      const subscription = event.data.object;
      // Handle customer.subscription.pending_update_expired event
    } else if (event.type === 'customer.subscription.resumed') {
      const subscription = event.data.object;
      // Handle customer.subscription.resumed event
    } else if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = event.data.object;
      // Handle customer.subscription.trial_will_end event
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      // Handle customer.subscription.updated event
    } else if (event.type === 'customer.tax_id.created') {
      const taxId = event.data.object;
      // Handle customer.tax_id.created event
    } else if (event.type === 'customer.tax_id.deleted') {
      const taxId = event.data.object;
      // Handle customer.tax_id.deleted event
    } else if (event.type === 'customer.tax_id.updated') {
      const taxId = event.data.object;
      // Handle customer.tax_id.updated event
    } else {
      return true;
    }
    

}