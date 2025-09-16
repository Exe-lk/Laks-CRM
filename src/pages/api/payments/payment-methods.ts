import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { practice_id } = req.query;

        if (!practice_id) {
            return res.status(400).json({ error: "Practice ID is required" });
        }

        switch (req.method) {
            case "GET":
                // Get saved payment methods for a practice
                const customer = await prisma.stripeCustomer.findUnique({
                    where: { practiceId: practice_id as string }
                });

                if (!customer) {
                    return res.status(404).json({ error: "Customer not found" });
                }

                const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
                const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

                if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
                    return res.status(500).json({ error: "Server not configured for customer management" });
                }

                const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "list_payment_methods",
                        customer_id: customer.stripeCustomerId
                    })
                });

                const json = await resp.json().catch(() => ({}));
                return res.status(resp.status).json(json);

            case "DELETE":
                // Delete a payment method
                const { payment_method_id } = req.body;

                if (!payment_method_id) {
                    return res.status(400).json({ error: "Payment method ID is required" });
                }

                const SUPABASE_FUNCTION_URL_DELETE = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
                const FUNCTION_SECRET_DELETE = process.env.CUSTOMER_FUNCTION_SECRET;

                if (!SUPABASE_FUNCTION_URL_DELETE || !FUNCTION_SECRET_DELETE) {
                    return res.status(500).json({ error: "Server not configured" });
                }

                const deleteResp = await fetch(SUPABASE_FUNCTION_URL_DELETE, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${FUNCTION_SECRET_DELETE}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "detach_payment_method",
                        payment_method_id
                    })
                });

                const deleteJson = await deleteResp.json().catch(() => ({}));
                return res.status(deleteResp.status).json(deleteJson);

            default:
                res.setHeader("Allow", ["GET", "DELETE"]);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}
