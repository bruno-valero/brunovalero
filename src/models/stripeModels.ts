import z from 'zod';

export const stripeNewCustomerSchema = z.object({
  email:z.string().email(),
  name:z.string().min(3),          
  metadata:z.object({
    uid:z.string(),
  }),
});

export type StripeNewCustomer  = z.infer<typeof stripeNewCustomerSchema>;