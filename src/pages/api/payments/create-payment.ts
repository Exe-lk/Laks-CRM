import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const body = req.body || {};

        if (!body?.amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        // Enhanced payment processing with customer support
        const { 
            amount, 
            currency, 
            description, 
            metadata, 
            practice_id, 
            customer_id, 
            payment_method_id, 
            confirm, 
            save_payment_method 
        } = body;

        const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
        const PAYMENT_FUNCTION_SECRET = process.env.PAYMENT_FUNCTION_SECRET;

        if (!SUPABASE_FUNCTION_URL || !PAYMENT_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured" });
        }

        // Prepare enhanced payload for payment intent
        const paymentPayload = {
            amount,
            currency,
            description,
            metadata: {
                ...metadata,
                practice_id: practice_id || metadata?.practice_id
            },
            customer_id,
            payment_method_id,
            confirm,
            save_payment_method
        };

        const resp = await fetch(SUPABASE_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYMENT_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentPayload)
        });

        const json = await resp.json().catch(() => ({}));
        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}