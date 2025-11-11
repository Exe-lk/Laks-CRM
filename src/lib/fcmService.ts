import { PrismaClient } from '@prisma/client';
import { NotificationPayload, UserType } from '@/types/notifications';
import admin from 'firebase-admin';

const prisma = new PrismaClient();

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

interface FCMResponse {
  success: number;
  failed: number;
  invalidTokens: string[];
}

export async function sendNotificationToUsers(
  userIds: string[],
  userType: UserType,
  payload: NotificationPayload
): Promise<FCMResponse> {
  const result: FCMResponse = { success: 0, failed: 0, invalidTokens: [] };

  if (userIds.length === 0) {
    console.log('⚠️ [FCM] No user IDs provided for notification');
    return result;
  }

  try {
    console.log(`🔔 [FCM] Sending "${payload.title}" to ${userIds.length} ${userType} users`);
    
    const tokens = await prisma.fCMToken.findMany({
      where: {
        userId: { in: userIds },
        userType,
        isActive: true,
      },
    });

    if (tokens.length === 0) {
      console.error(`❌ [FCM] NO TOKENS FOUND!`);
      console.error(`   - User Type: ${userType}`);
      console.error(`   - User IDs: ${JSON.stringify(userIds)}`);
      console.error(`   - These users need to log in and grant notification permission!`);
      return result;
    }

    console.log(`📤 [FCM] Found ${tokens.length} active tokens, sending...`);

    // Send in batches (FCM allows up to 500 per batch)
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      const messages = batch.map((tokenRecord) => ({
        token: tokenRecord.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: Object.fromEntries(
          Object.entries(payload.data).map(([k, v]) => [k, String(v)])
        ),
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
          },
          fcmOptions: {
            link: payload.data.url || '/',
          },
        },
      }));

      try {
        const response = await admin.messaging().sendEach(messages);
        
        response.responses.forEach((resp: any, idx: number) => {
          if (resp.success) {
            result.success++;
          } else {
            result.failed++;
            const error = resp.error;
            if (
              error?.code === 'messaging/invalid-registration-token' ||
              error?.code === 'messaging/registration-token-not-registered'
            ) {
              result.invalidTokens.push(batch[idx].token);
            }
            console.error(`Failed to send to token ${idx}:`, error?.message);
          }
        });
      } catch (error) {
        console.error('Batch send error:', error);
        result.failed += batch.length;
      }
    }

    if (result.invalidTokens.length > 0) {
      await prisma.fCMToken.updateMany({
        where: { token: { in: result.invalidTokens } },
        data: { isActive: false },
      });
      console.log(`Deactivated ${result.invalidTokens.length} invalid tokens`);
    }

    if (result.success > 0) {
      console.log(`✅ [FCM] Successfully sent ${result.success} notifications`);
    }
    if (result.failed > 0) {
      console.error(`❌ [FCM] Failed to send ${result.failed} notifications`);
    }
  } catch (error) {
    console.error('❌ [FCM] Error in sendNotificationToUsers:', error);
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

export async function sendNotificationToUser(
  userId: string,
  userType: UserType,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const result = await sendNotificationToUsers([userId], userType, payload);
    return result.success > 0;
  } catch (error) {
    console.error('❌ [FCM] sendNotificationToUser error:', error);
    return false;
  }
}