// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        return res.status(200).json({ name: "John Doee " });
    }
  } catch (error: any) {
    return res.status(400).json({
      error: "Email address already exists",
    });
  }
}
