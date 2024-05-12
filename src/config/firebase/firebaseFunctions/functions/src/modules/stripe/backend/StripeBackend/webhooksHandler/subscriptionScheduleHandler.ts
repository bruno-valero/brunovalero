import UserFinancialData from "@/src/modules/projectExclusive/UserManagement/UserFinancialData";
import Stripe from "stripe";



export const subscriptionScheduleHandler = async(event: Stripe.Event) => {

    const userFinancials = new UserFinancialData();  
    const stripe = userFinancials.stripe.stripe;

    if (event.type === 'subscription_schedule.aborted') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.aborted event
    } else if (event.type === 'subscription_schedule.canceled') {
      const subscriptionSchedule = event.data.object;
      // calceledTocreateOther
      console.log(`Subscription canceled... metadata: ${subscriptionSchedule.metadata}`);
      if (subscriptionSchedule.metadata && (!subscriptionSchedule.metadata.canceledToCreateOther)) {
        console.log(`Subscribing to Free plan...`);
        await userFinancials.subscribeToFreePlan(subscriptionSchedule.metadata.uid);
        console.log(`Free plan enabled`);
      }
      // Handle subscription_schedule.canceled event
    } else if (event.type === 'subscription_schedule.completed') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.completed event
    } else if (event.type === 'subscription_schedule.created') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.created event
    } else if (event.type === 'subscription_schedule.expiring') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.expiring event
    } else if (event.type === 'subscription_schedule.released') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.released event
    } else if (event.type === 'subscription_schedule.updated') {
      const subscriptionSchedule = event.data.object;
      // Handle subscription_schedule.updated event
    } else {
      return true;
    }

}