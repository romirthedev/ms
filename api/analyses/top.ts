import { storage } from "../../server/storage.ts";

export default async function handler(req: any, res: any) {
  try {
    const existing = await storage.getStockAnalyses(1);
    if (!existing || existing.length === 0) {
      await storage.initializeAsync();
    }

    const analyses = await storage.getTopRatedStockAnalyses(5);

    return res.status(200).json({ success: true, data: analyses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch top analyses", error: error?.message });
  }
}