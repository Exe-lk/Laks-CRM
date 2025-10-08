import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const { action, practice_id, email, name, payment_method_id, customer_id } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured for customer management" });
        }

        // For create_customer action, verify practice exists
        if (action === "create_customer" && practice_id) {
            const practice = await prisma.practice.findUnique({
                where: { id: practice_id }
            });

            if (!practice) {
                return res.status(404).json({ error: "Practice not found" });
            }

            // Check if customer already exists for this practice
            const existingCustomer = await prisma.stripeCustomer.findUnique({
                where: { practiceId: practice_id }
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
                practice_id,
                email,
                name,
                payment_method_id,
                customer_id
            })
        });

        const json = await resp.json().catch(() => ({}));

        // If customer creation was successful, store in database
        if (resp.ok && action === "create_customer" && json.customer && practice_id) {
            try {
                await prisma.stripeCustomer.create({
                    data: {
                        practiceId: practice_id,
                        stripeCustomerId: json.customer.id,
                        email: json.customer.email,
                        name: json.customer.name
                    }
                });
            } catch (dbError) {
                console.error("Failed to save customer to database:", dbError);
                // Don't fail the request if DB save fails, customer still created in Stripe
            }
        }

        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}
