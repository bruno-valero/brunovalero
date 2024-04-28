import z from 'zod';

export const customerDataSchema = z.object({
  name:z.string().min(3), 
  email:z.string().email(),
  uid:z.string(),  
  stripeId:z.string().optional(),
  stripeIdDev:z.string().optional(),
});

export type CustomerData  = z.infer<typeof customerDataSchema>;