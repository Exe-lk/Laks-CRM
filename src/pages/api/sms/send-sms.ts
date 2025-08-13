import { NextApiRequest, NextApiResponse } from "next";
import { json } from "stream/consumers";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    if(req.method !== "POST"){
        return res.status(405).json({error:"Method not allowed"})
    }
    try {
        const {to, message } = req.body;
        if(!to || !message){
            return res.status(400).json({error: "Missing Recipient or Message"});
        }
        
        const SUPABASE_FN_URL = process.env.SUPABASE_SEND_SMS_FN_URL!;
        const SMS_FUNCTION_SECRET = process.env.SMS_FUNCTION_SECRET!;

        if(!SUPABASE_FN_URL || !SMS_FUNCTION_SECRET){
            return res.status(500).json({error: "Server not configured"});
        }

        const response = await fetch(SUPABASE_FN_URL,{
            method:'POST',
            headers:{
                'content-type':'application/json',
                'x-functions-secret':SMS_FUNCTION_SECRET
            },
            body:JSON.stringify({to, message})
        });

        const data = await response.json().catch(() => null);
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Send SMS error:", error);
        res.status(500).json({ error: "Failed to send SMS" });
    }
}