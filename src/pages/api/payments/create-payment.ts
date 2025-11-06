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

        // Universal payment processing - supports Practice, Branch, and Locum
        const { 
            amount, 
            currency, 
            description, 
            metadata, 
            customer_id, 
            payment_method_id, 
            confirm, 
            save_payment_method,
            off_session 
        } = body;

        const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
        const PAYMENT_FUNCTION_SECRET = process.env.PAYMENT_FUNCTION_SECRET;

        if (!SUPABASE_FUNCTION_URL || !PAYMENT_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured" });
        }

        if (!customer_id) {
            return res.status(400).json({ error: "customer_id is required" });
        }

        // Prepare universal payload for payment intent
        // Metadata can contain: practice_id, branch_id, locum_id, charged_entity, etc.
        // All entity-specific info should be in metadata, not hardcoded
        const paymentPayload = {
            amount,
            currency,
            description,
            metadata: metadata || {}, // Pass through all metadata as-is (practice_id, branch_id, locum_id, etc.)
            customer_id,
            payment_method_id,
            confirm,
            save_payment_method,
            off_session // For automatic charges, use customer's default payment method
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