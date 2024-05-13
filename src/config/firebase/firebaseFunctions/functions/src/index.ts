/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import readPdfAddCoverRoute from "./routes/readPdf/readPdfAddCoverRoute";
import readPdfAddQuizRoute from "./routes/readPdf/readPdfAddQuizRoute";
import readPdfAddQuizTryRoute from "./routes/readPdf/readPdfAddQuizTryRoute";
import readPdfBuyCreditsRoute from "./routes/readPdf/readPdfBuyCreditsRoute";
import readPdfSendQuestionRoute from "./routes/readPdf/readPdfSendQuestionRoute";
import readPdfSwitchPlanRoute from "./routes/readPdf/readPdfSwitchPlanRoute";
import readPdfUploadRoute from "./routes/readPdf/readPdfUploadRoute";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// @ts-ignore

export const readPdfAddCover = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfAddCoverRoute(req)
  res.send(resp);
});

export const readPdfAddQuiz = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfAddQuizRoute(req)
  res.send(resp);
});

export const readPdfAddQuizTry = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfAddQuizTryRoute(req)
  res.send(resp);
});

export const readPdfBuyCredits = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfBuyCreditsRoute(req)
  res.send(resp);
});

export const readPdfSendQuestion = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfSendQuestionRoute(req)
  res.send(resp);
});

export const readPdfSwitchPlan = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfSwitchPlanRoute(req)
  res.send(resp);
});

export const readPdfUpload = onRequest(
  { region:'southamerica-east1', timeoutSeconds:300, cors:['http://localhost:3000', 'http://192.168.100.86:3000', 'https://brunovalero.com', 'https://brunovalero.com.br']},
  async (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  const resp = await readPdfUploadRoute(req)
  res.send(resp);
});
