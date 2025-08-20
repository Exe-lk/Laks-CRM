import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { to, body, message } = req.body || {};
    const smsBody = body || message; 
    
    if (!to || !smsBody) {
      return res.status(400).json({ error: "Missing 'to' or SMS content ('body' or 'message')" });
    }

    const SUPABASE_FUNCTION_URL = process.env.SUPABASE_SEND_SMS_FN_URL;
    const SUPABASE_FN_SECRET = process.env.SMS_FUNCTION_SECRET?.trim(); 

    if (!SUPABASE_FUNCTION_URL || !SUPABASE_FN_SECRET) {
      return res.status(500).json({ 
        error: "Server misconfigured",
        details: {
          hasUrl: !!SUPABASE_FUNCTION_URL,
          hasSecret: !!SUPABASE_FN_SECRET
        }
      });
    }

    console.log("Calling Supabase function:", SUPABASE_FUNCTION_URL);
    console.log("Using secret (first 10 chars):", SUPABASE_FN_SECRET.substring(0, 10) + "...");
    console.log("Full secret length:", SUPABASE_FN_SECRET.length);
    console.log("Full secret (for debugging):", JSON.stringify(SUPABASE_FN_SECRET));
    console.log("Authorization header being sent:", `Bearer ${SUPABASE_FN_SECRET.substring(0, 10)}...`);

    const resp = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${SUPABASE_FN_SECRET}` 
      },
      body: JSON.stringify({ to, body: smsBody })
    });

    const data = await resp.json().catch(() => ({}));
    
    if (!resp.ok) {
      console.error("Supabase function error:", {
        status: resp.status,
        statusText: resp.statusText,
        data
      });
    }
    
    return res.status(resp.status).json(data);

  } catch (err: any) {
    console.error("SMS API error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}