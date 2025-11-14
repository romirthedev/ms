import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";

const app = express();
let initialized = false;
let slHandler: any = null;

async function ensureInitialized() {
  if (!initialized) {
    console.log('Initializing API routes...');
    try {
      await registerRoutes(app);
      slHandler = serverless(app);
      initialized = true;
      console.log('API routes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API routes:', error);
      throw error;
    }
  }
}

export default async function handler(req: any, res: any) {
  try {
    console.log(`Handling request: ${req.method} ${req.url}`);
    await ensureInitialized();
    return slHandler(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}