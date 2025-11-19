import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from '@/lib/supabase';
import { applyCors } from '@/lib/api-cors';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token: fcmToken, userType, deviceInfo } = req.body;

    if (!fcmToken || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let userId: string | null = null;

    if (userType === 'locum') {
      const locum = await prisma.locumProfile.findUnique({
        where: { emailAddress: user.email || '' },
      });
      userId = locum?.id || null;
    } else if (userType === 'practice') {
      const practice = await prisma.practice.findUnique({
        where: { email: user.email || '' },
      });
      userId = practice?.id || null;
    } else if (userType === 'branch') {
      const branch = await prisma.branch.findUnique({
        where: { email: user.email || '' },
      });
      userId = branch?.id || null;
    }

    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.fCMToken.upsert({
      where: { token: fcmToken },
      update: {
        userId,
        userType,
        deviceInfo,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        userType,
        token: fcmToken,
        deviceInfo,
        isActive: true,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Register token error:', error);
    res.status(500).json({ error: 'Failed to register token' });
  } finally {
    await prisma.$disconnect();
  }
}