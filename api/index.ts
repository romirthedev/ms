import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";

const app = express();
let initialized = false;
let slHandler: any = null;

async function ensureInitialized() {
  if (!initialized) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    await registerRoutes(app);
    slHandler = serverless(app);
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  console.log(`[Vercel] Handler invoked: ${req.method} ${req.url}`);
  
  try {
    console.log(`[Vercel] Ensuring initialization...`);
    await ensureInitialized();
    console.log(`[Vercel] Initialization complete, processing request`);
    return slHandler(req, res);
  } catch (error) {
    console.error('[Vercel] Fatal error in handler:', error);
    console.error('[Vercel] Error stack:', error.stack);
    
    // Ensure we have a valid response object
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Function invocation failed'
      });
    } else {
      // Fallback for when res is not properly initialized
      console.error('[Vercel] Response object not available');
      throw error; // Let Vercel handle the error
    }
  }
}