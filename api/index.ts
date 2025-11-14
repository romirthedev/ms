import express from "express";
import { registerRoutes } from "../server/routes";

// Dynamic import for serverless-http to handle potential import issues
let serverless: any = null;
try {
  serverless = require("serverless-http");
  console.log('[Vercel] serverless-http imported successfully');
} catch (error) {
  console.error('[Vercel] Failed to import serverless-http:', error);
}

const app = express();
let initialized = false;
let slHandler: any = null;

async function ensureInitialized() {
  if (!initialized) {
    console.log('[Vercel] Starting initialization...');
    
    // Check if serverless-http is available
    if (!serverless) {
      throw new Error('serverless-http module not available');
    }
    
    try {
      console.log('[Vercel] Setting up Express app...');
      
      // Basic Express configuration for serverless
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      console.log('[Vercel] Registering routes...');
      await registerRoutes(app);
      
      console.log('[Vercel] Creating serverless handler...');
      slHandler = serverless(app);
      
      initialized = true;
      console.log('[Vercel] API routes initialized successfully');
    } catch (error) {
      console.error('[Vercel] Failed to initialize API routes:', error);
      console.error('[Vercel] Error stack:', error.stack);
      throw error;
    }
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