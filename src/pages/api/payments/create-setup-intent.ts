import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const { customer_id } = req.body;

        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

        if (!STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: "Stripe not configured" });
        }

        // Create Setup Intent for saving payment method
        const basicAuth = "Basic " + Buffer.from(`${STRIPE_SECRET_KEY}:`).toString('base64');

        const params = new URLSearchParams();
        params.append("payment_method_types[]", "card");
        if (customer_id) {
            params.append("customer", customer_id);
        }
        params.append("usage", "off_session"); // For future payments

        console.log('Creating Setup Intent with Stripe...');

        const response = await fetch("https://api.stripe.com/v1/setup_intents", {
            method: "POST",
            headers: {
                "Authorization": basicAuth,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const json = await response.json();

        console.log('Stripe Setup Intent response:', { 
            status: response.status, 
            ok: response.ok,
            hasId: !!json.id 
        });

        if (!response.ok) {
            console.error('Stripe Setup Intent error:', json);
            return res.status(response.status).json({
                error: "Failed to create setup intent",
                details: json.error?.message || JSON.stringify(json)
            });
        }

        return res.status(200).json({
            success: true,
            setup_intent: json,
            client_secret: json.client_secret
        });
    } catch (error: any) {
        console.error('Error creating setup intent:', error);
        return res.status(500).json({ 
            error: error?.message || String(error) 
        });
    }
}

