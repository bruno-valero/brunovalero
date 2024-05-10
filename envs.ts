export const isProduction = false;

const envs:Envs = { 
  isProduction,
  // ------------------------------------------------------------------------------ 
  // FIREBASE 
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN, 
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL, 
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID, 
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID, 
  // ------------------------------------------------------------------------------
  // SUPRABASE
  SUPRABASE_PASSWORD:process.env.SUPRABASE_PASSWORD,
  SUPRABASE_URL:process.env.SUPRABASE_URL,
  SUPRABASE_API_KEY:process.env.SUPRABASE_API_KEY,
  // ------------------------------------------------------------------------------
  // OPENAI
  OPENAI_API_KEY:process.env.OPENAI_API_KEY,
  // ------------------------------------------------------------------------------
  // PINECONE
  PINECONE_API_KEY:process.env.PINECONE_API_KEY,
  // ------------------------------------------------------------------------------ 
  // STRIPE 
  // ----------- 
  // TEST 
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY, 
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY, 
  // ----------- 
  // PRODUCTION 
  STRIPE_PRODUCTION_PUBLIC_KEY: process.env.STRIPE_PRODUCTION_PUBLIC_KEY, 
  STRIPE_PRODUCTION_SECRET_KEY: process.env.STRIPE_PRODUCTION_SECRET_KEY, 
  // ----------- 
  // WEBHOOKS 
  WEBHOOK_KEY:process.env.STRIPE_WEBHOOK_KEY,
}; 
 

export default envs; 
 
export type Envs = { 
  isProduction:boolean,
  // ------------------------------------------------------------------------------ 
  // FIREBASE 
  FIREBASE_API_KEY: string | undefined, 
  FIREBASE_AUTH_DOMAIN: string | undefined, 
  FIREBASE_DATABASE_URL: string | undefined, 
  FIREBASE_PROJECT_ID: string | undefined, 
  FIREBASE_STORAGE_BUCKET: string | undefined, 
  FIREBASE_MESSAGING_SENDER_ID: string | undefined, 
  FIREBASE_APP_ID: string | undefined, 
  FIREBASE_MEASUREMENT_ID: string | undefined, 
  // ------------------------------------------------------------------------------
  // SUPRABASE
  SUPRABASE_PASSWORD:string | undefined,
  SUPRABASE_URL:string | undefined,
  SUPRABASE_API_KEY:string | undefined,
  // ------------------------------------------------------------------------------
  // OPENAI
  OPENAI_API_KEY:string | undefined,
  // ------------------------------------------------------------------------------
  // PINECONE
  // ------------------------------------------------------------------------------ 
  PINECONE_API_KEY:string | undefined,
  // STRIPE 
  // ----------- 
  // TEST 
  STRIPE_PUBLIC_KEY: string | undefined, 
  STRIPE_SECRET_KEY: string | undefined, 
  // ----------- 
  // PRODUCTION 
  STRIPE_PRODUCTION_PUBLIC_KEY: string | undefined, 
  STRIPE_PRODUCTION_SECRET_KEY: string | undefined, 
  // ----------- 
  // WEBHOOKS 
  WEBHOOK_KEY:string | undefined,
}; 