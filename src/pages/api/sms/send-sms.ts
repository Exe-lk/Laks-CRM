import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { to, body } = req.body || {};
    if (!to || !body) {
      return res.status(400).json({ error: "Missing 'to' or 'body'" });
    }

    const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
    const SUPABASE_FN_SECRET = process.env.SUPABASE_FN_SECRET;

    if (!SUPABASE_FUNCTION_URL || !SUPABASE_FN_SECRET) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const resp = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_FN_SECRET}`
      },
      body: JSON.stringify({ to, body })
    });

    const data = await resp.json().catch(() => ({}));
    return res.status(resp.status).json(data);

  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
