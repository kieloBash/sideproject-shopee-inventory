// pages/api/deleteOldInvoices.ts
import supabase from "@/utils/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Calculate the date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Query and delete old invoices
    const { data, error } = await supabase
      .from("invoices_transaction")
      .delete()
      .lt("created_at", oneWeekAgo.toISOString());

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, deletedCount: 0 });
  } catch (error: any) {
    console.error("Error deleting old invoices:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
