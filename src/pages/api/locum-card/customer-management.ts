import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const { action, locum_id, email, name, payment_method_id, customer_id } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured for customer management" });
        }

        // For create_customer action, verify locum exists
        if (action === "create_customer" && locum_id) {
            const locum = await prisma.locumProfile.findUnique({
                where: { id: locum_id }
            });

            if (!locum) {
                return res.status(404).json({ error: "Locum not found" });
            }

            // Check if customer already exists for this locum
            const existingCustomer = await prisma.locumStripeCustomer.findUnique({
                where: { locumId: locum_id }
            });

            if (existingCustomer) {
                return res.status(200).json({
                    success: true,
                    customer: {
                        id: existingCustomer.stripeCustomerId,
                        email: existingCustomer.email,
                        name: existingCustomer.name
                    }
                });
            }
        }

        const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action,
                locum_id,
                email,
                name,
                payment_method_id,
                customer_id
            })
        });

        const json = await resp.json().catch(() => ({}));

        // If customer creation was successful, store in database
        if (resp.ok && action === "create_customer" && json.customer && locum_id) {
            try {
                await prisma.locumStripeCustomer.create({
                    data: {
                        locumId: locum_id,
                        stripeCustomerId: json.customer.id,
                        email: json.customer.email,
                        name: json.customer.name
                    }
                });
            } catch (dbError) {
                console.error("Failed to save locum customer to database:", dbError);
            }
        }

        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}

