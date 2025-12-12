import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not allowed" });
    }

    try {
        const { cardNumber, expiryMonth, expiryYear, cvv, cardHolderName } = req.body;

        if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return res.status(400).json({ 
                error: "Missing required card fields",
                required: ["cardNumber", "expiryMonth", "expiryYear", "cvv"]
            });
        }

        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

        if (!STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: "Stripe not configured" });
        }

        // Remove spaces from card number
        const cleanCardNumber = cardNumber.replace(/\s/g, '');

        // Create payment method using Stripe API directly
        const basicAuth = "Basic " + Buffer.from(`${STRIPE_SECRET_KEY}:`).toString('base64');

        const params = new URLSearchParams();
        params.append("type", "card");
        params.append("card[number]", cleanCardNumber);
        params.append("card[exp_month]", expiryMonth);
        params.append("card[exp_year]", expiryYear);
        params.append("card[cvc]", cvv);
        
        if (cardHolderName) {
            params.append("billing_details[name]", cardHolderName);
        }

        console.log('Creating payment method with Stripe...');

        const response = await fetch("https://api.stripe.com/v1/payment_methods", {
            method: "POST",
            headers: {
                "Authorization": basicAuth,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const json = await response.json();

        console.log('Stripe payment method response:', { 
            status: response.status, 
            ok: response.ok,
            hasId: !!json.id 
        });

        if (!response.ok) {
            console.error('Stripe payment method error:', json);
            return res.status(response.status).json({
                error: "Failed to create payment method",
                details: json.error?.message || JSON.stringify(json)
            });
        }

        return res.status(200).json({
            success: true,
            payment_method: json
        });
    } catch (error: any) {
        console.error('Error creating payment method:', error);
        return res.status(500).json({ 
            error: error?.message || String(error) 
        });
    }
}

