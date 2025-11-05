import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { payment_method_id, practice_id, branch_id, locum_id } = req.body;

        if (!payment_method_id) {
            return res.status(400).json({ error: "Payment method ID is required" });
        }

   
        const entityId = practice_id || branch_id || locum_id;
        const entityType = practice_id ? 'practice' : 
                          branch_id ? 'branch' : 
                          locum_id ? 'locum' : null;

        if (entityId && entityType) {
            let customerExists = false;

            switch (entityType) {
                case 'practice':
                    const practiceCustomer = await prisma.stripeCustomer.findUnique({
                        where: { practiceId: entityId as string }
                    });
                    customerExists = !!practiceCustomer;
                    break;

                case 'branch':
                    const branchCustomer = await prisma.branchStripeCustomer.findUnique({
                        where: { branchId: entityId as string }
                    });
                    customerExists = !!branchCustomer;
                    break;

                case 'locum':
                    const locumCustomer = await prisma.locumStripeCustomer.findUnique({
                        where: { locumId: entityId as string }
                    });
                    customerExists = !!locumCustomer;
                    break;
            }

            if (!customerExists) {
                return res.status(404).json({ 
                    error: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} customer not found` 
                });
            }
        }

        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured for customer management" });
        }

        const deleteResp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "detach_payment_method",
                payment_method_id
            })
        });

        const deleteJson = await deleteResp.json().catch(() => ({}));
        return res.status(deleteResp.status).json(deleteJson);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}

