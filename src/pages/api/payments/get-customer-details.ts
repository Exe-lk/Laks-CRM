import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { applyCors } from "@/lib/api-cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(applyCors(req, res)) return;
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { practice_id, branch_id, locum_id } = req.query;
        const entityId = practice_id || branch_id || locum_id;
        const entityType = practice_id ? 'practice' : 
                          branch_id ? 'branch' : 
                          locum_id ? 'locum' : null;

        if (!entityId || !entityType) {
            return res.status(400).json({ 
                error: "One of practice_id, branch_id, or locum_id is required" 
            });
        }
        let stripeCustomerId: string | null = null;

        switch (entityType) {
            case 'practice':
                const practiceCustomer = await prisma.stripeCustomer.findUnique({
                    where: { practiceId: entityId as string }
                });
                if (!practiceCustomer) {
                    return res.status(404).json({ error: "Practice customer not found" });
                }
                stripeCustomerId = practiceCustomer.stripeCustomerId;
                break;

            case 'branch':
                const branchCustomer = await prisma.branchStripeCustomer.findUnique({
                    where: { branchId: entityId as string }
                });
                if (!branchCustomer) {
                    return res.status(404).json({ error: "Branch customer not found" });
                }
                stripeCustomerId = branchCustomer.stripeCustomerId;
                break;

            case 'locum':
                const locumCustomer = await prisma.locumStripeCustomer.findUnique({
                    where: { locumId: entityId as string }
                });
                if (!locumCustomer) {
                    return res.status(404).json({ error: "Locum customer not found" });
                }
                stripeCustomerId = locumCustomer.stripeCustomerId;
                break;

            default:
                return res.status(400).json({ error: "Invalid entity type" });
        }

        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured for customer management" });
        }

        // Get customer details including default payment method
        const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "get_customer",
                customer_id: stripeCustomerId
            })
        });

        const json = await resp.json().catch(() => ({}));
        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}

