import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // disable body parser for form-data
  },
};

const FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL;
const FN_SECRET = process.env.SEND_EMAIL_FN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!FUNCTION_URL || !FN_SECRET) {
    return res.status(500).json({ error: "Server email configuration missing" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Form parsing failed" });
    }

    try {
      const payload: any = {
        to: fields.to?.[0],
        subject: fields.subject?.[0],
        text: fields.text?.[0],
      };

      // Read uploaded HTML file content if provided
      if (files.html && Array.isArray(files.html)) {
        const htmlFilePath = files.html[0].filepath;
        payload.html = fs.readFileSync(htmlFilePath, "utf-8");
      } else if (fields.html && Array.isArray(fields.html) && fields.html.length > 0) {
        payload.html = fields.html[0];
      }

      // Send request to Supabase Edge function
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FN_SECRET}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error?.message ?? String(error) });
    }
  });
}
