import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";

const app = express();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await ensureInitialized();
  const slHandler = serverless(app);
  return slHandler(req, res);
}