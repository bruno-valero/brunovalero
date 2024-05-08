/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import * as v2 from 'firebase-functions/v2';
// import { onRequest } from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest(
//   { region:'southamerica-east1', timeoutSeconds:120}, 
//   (request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const schedule = v2.scheduler.onSchedule({ region:'southamerica-east1', timeoutSeconds:120, schedule:'0 0 1 * *' }, () => {
  logger.info(`schedule haha: ===>  ${new Date().getTime()}`, {structuredData: true});
})
