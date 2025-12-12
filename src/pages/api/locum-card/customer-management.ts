import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        let { action, locum_id, email, name, payment_method_id, customer_id } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        // Validate required fields for create_customer action
        // Note: email and name can be fetched from locum if not provided
        if (action === "create_customer") {
            if (!locum_id) {
                return res.status(400).json({ 
                    error: "Missing required field: locum_id",
                    received: { locum_id: !!locum_id }
                });
            }
        }

        // Validate required fields for attach_payment_method action
        if (action === "attach_payment_method") {
            if (!customer_id || !payment_method_id) {
                console.error('Missing required fields for attach_payment_method:', { 
                    customer_id: !!customer_id, 
                    payment_method_id: !!payment_method_id 
                });
                return res.status(400).json({ 
                    error: "Missing required fields: customer_id, payment_method_id",
                    received: { customer_id: !!customer_id, payment_method_id: !!payment_method_id }
                });
            }
            console.log('Attaching payment method:', { customer_id, payment_method_id });
        }

        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (!SUPABASE_CUSTOMER_FUNCTION_URL || !CUSTOMER_FUNCTION_SECRET) {
            return res.status(500).json({ error: "Server not configured for customer management" });
        }

        // For create_customer action, verify locum exists and get email/name if not provided
        if (action === "create_customer" && locum_id) {
            const locum = await prisma.locumProfile.findUnique({
                where: { id: locum_id },
                select: {
                    id: true,
                    fullName: true,
                    emailAddress: true
                }
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

            // If email/name not provided, use locum details
            if (!email && locum.emailAddress) {
                email = locum.emailAddress;
            }
            if (!name && locum.fullName) {
                name = locum.fullName;
            }

            // Fallback if still no email/name
            if (!email) {
                email = `locum-${locum_id}@example.com`;
            }
            if (!name) {
                name = locum.fullName || `Locum ${locum_id}`;
            }
        }

        // Pass all fields including locum_id and set_as_default
        const requestBody: any = {
            action,
            email,
            name,
            payment_method_id,
            customer_id,
            set_as_default: req.body.set_as_default
        };

        // Pass locum_id as-is
        if (locum_id) {
            requestBody.locum_id = locum_id;
        }

        console.log('Sending request to Supabase function:', requestBody);

        const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const json = await resp.json().catch(() => ({}));
        
        console.log('Supabase function response:', { 
            status: resp.status, 
            ok: resp.ok, 
            data: json 
        });

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
