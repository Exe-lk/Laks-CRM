import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    const { penalty_id } = req.query;

    if (!penalty_id || typeof penalty_id !== 'string') {
      return res.status(400).json({ error: "penalty_id is required" });
    }

    const penalty = await prisma.cancellationPenalty.findUnique({
      where: { id: penalty_id }
    });

    if (!penalty) {
      return res.status(404).json({ error: "Penalty not found" });
    }

    res.status(200).json({
      success: true,
      data: penalty
    });

  } catch (error) {
    console.error("Get penalty by ID error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch penalty" });
  }
}

