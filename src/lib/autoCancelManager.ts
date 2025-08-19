import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store active timeouts to allow cancellation if needed
const activeTimeouts = new Map<string, NodeJS.Timeout>();

export const scheduleAutoCancellation = (requestId: string, delayMs: number = 15 * 60 * 1000) => {
  // Clear any existing timeout for this request
  if (activeTimeouts.has(requestId)) {
    clearTimeout(activeTimeouts.get(requestId)!);
  }

  const timeoutId = setTimeout(async () => {
    try {
      console.log(`Checking auto-cancellation for request: ${requestId}`);
      
      await prisma.$transaction(async (tx) => {
        // First, check if the request still exists and is PENDING
        const request = await tx.appointmentRequest.findUnique({
          where: { request_id: requestId },
          include: {
            responses: {
              where: { status: 'ACCEPTED' }
            }
          }
        });

        if (!request) {
          console.log(`Request ${requestId} not found - may have been deleted`);
          return;
        }

        if (request.status !== 'PENDING') {
          console.log(`Request ${requestId} is no longer PENDING (status: ${request.status})`);
          return;
        }

        // Check if anyone has accepted the appointment
        if (request.responses.length > 0) {
          console.log(`Request ${requestId} has ${request.responses.length} applicants - not cancelling`);
          return;
        }

        // No applicants - cancel the request
        await tx.appointmentRequest.update({
          where: { request_id: requestId },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        console.log(`Auto-cancelled appointment request ${requestId} - no applicants within 15 minutes`);
      });

    } catch (error) {
      console.error(`Error in auto-cancellation for request ${requestId}:`, error);
    } finally {
      // Clean up the timeout reference
      activeTimeouts.delete(requestId);
    }
  }, delayMs);

  activeTimeouts.set(requestId, timeoutId);
  console.log(`Scheduled auto-cancellation for request ${requestId} in ${delayMs}ms`);
};

export const cancelAutoCancellation = (requestId: string) => {
  if (activeTimeouts.has(requestId)) {
    clearTimeout(activeTimeouts.get(requestId)!);
    activeTimeouts.delete(requestId);
    console.log(`Cancelled auto-cancellation timer for request ${requestId}`);
  }
};

export const isWithin24Hours = (appointmentDate: Date): boolean => {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return appointmentDate <= twentyFourHoursFromNow;
}; 