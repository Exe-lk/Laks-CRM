import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const { action, branch_id, email, name, payment_method_id, customer_id } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        // Validate required fields for create_customer action
        if (action === "create_customer") {
            if (!branch_id || !email || !name) {
                return res.status(400).json({ 
                    error: "Missing required fields: branch_id, email, name",
                    received: { branch_id: !!branch_id, email: !!email, name: !!name }
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

        // For create_customer action, verify branch exists
        if (action === "create_customer" && branch_id) {
            const branch = await prisma.branch.findUnique({
                where: { id: branch_id }
            });

            if (!branch) {
                return res.status(404).json({ error: "Branch not found" });
            }

            // Check if customer already exists for this branch
            const existingCustomer = await prisma.branchStripeCustomer.findUnique({
                where: { branchId: branch_id }
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

        // Map branch_id to practice_id for Supabase function compatibility
        const requestBody: any = {
            action,
            email,
            name,
            payment_method_id,
            customer_id
        };

        // The Supabase function uses 'practice_id' as the field name for all entity types
        if (branch_id) {
            requestBody.practice_id = branch_id;
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
        if (resp.ok && action === "create_customer" && json.customer && branch_id) {
            try {
                await prisma.branchStripeCustomer.create({
                    data: {
                        branchId: branch_id,
                        stripeCustomerId: json.customer.id,
                        email: json.customer.email,
                        name: json.customer.name
                    }
                });
            } catch (dbError) {
                console.error("Failed to save branch customer to database:", dbError);
            }
        }

        return res.status(resp.status).json(json);
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || String(error) });
    }
}

