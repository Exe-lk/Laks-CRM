import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { practice_id, branch_id, locum_id } = req.query;

        // Determine entity type and ID
        const entityId = practice_id || branch_id || locum_id;
        const entityType = practice_id ? 'practice' : 
                          branch_id ? 'branch' : 
                          locum_id ? 'locum' : null;

        if (!entityId || !entityType) {
            return res.status(400).json({ 
                error: "One of practice_id, branch_id, or locum_id is required" 
            });
        }

        // Get Stripe customer based on entity type
        let stripeCustomerId: string | null = null;

        switch (entityType) {
            case 'practice':
                const practiceCustomer = await prisma.stripeCustomer.findUnique({
                    where: { practiceId: entityId as string }
                });
                if (!practiceCustomer) {
                    // Return empty array instead of error if customer doesn't exist yet
                    return res.status(200).json({ data: [] });
                }
                stripeCustomerId = practiceCustomer.stripeCustomerId;
                break;

            case 'branch':
                const branchCustomer = await prisma.branchStripeCustomer.findUnique({
                    where: { branchId: entityId as string }
                });
                if (!branchCustomer) {
                    // Return empty array instead of error if customer doesn't exist yet
                    return res.status(200).json({ data: [] });
                }
                stripeCustomerId = branchCustomer.stripeCustomerId;
                break;

            case 'locum':
                const locumCustomer = await prisma.locumStripeCustomer.findUnique({
                    where: { locumId: entityId as string }
                });
                if (!locumCustomer) {
                    // Return empty array instead of error if customer doesn't exist yet
                    return res.status(200).json({ data: [] });
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

        // Get saved payment methods for the entity
        const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "list_payment_methods",
                customer_id: stripeCustomerId
            })
        });

        const json = await resp.json().catch(() => ({}));
        
        // If successful and has payment methods, return them
        if (json.success && json.payment_methods) {
            return res.status(200).json({
                data: json.payment_methods
            });
        }
        
        // If successful but no payment methods, return empty array
        if (json.success && !json.payment_methods) {
            return res.status(200).json({ data: [] });
        }
        
        // If there's an error from Supabase, return it
        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}

