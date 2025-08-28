import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
    if(req.method !== "POST"){
        return res.status(405).json({error:"Method Not allowed"})
    }

    try {
        const body = req.body || {};

        if(!body?.amount){
            return res.status(400).json({error:"Amount is required"})
        }

        const SUPABSE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
        const PAYMENT_FUNCTION_SECRET = process.env.PAYMENT_FUNCTION_SECRET;

        if(!SUPABSE_FUNCTION_URL || !PAYMENT_FUNCTION_SECRET){
            return res.status(400).json({error:"Server not configured"});
        }

        const resp = await fetch(SUPABSE_FUNCTION_URL,{
            method:"POST",
            headers:{
                Authorization:`Bearer ${PAYMENT_FUNCTION_SECRET}`,
                "Content-Type":"application/json"
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json().catch(() => ({}));
        return res.status(resp.status).json(json);
    } catch (error:any) {
        return res.status(500).json({error: error?.message || String(error)})
    }
}