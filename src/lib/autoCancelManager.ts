import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const activeTimeouts = new Map<string, NodeJS.Timeout>();

export const calculateAutoCancelDelay = (createdAt: Date, requestDate: Date, requestStartTime: string): number => {
  const [hours, minutes] = requestStartTime.split(':').map(Number);
  const appointmentDateTime = new Date(requestDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const timeDiff = appointmentDateTime.getTime() - createdAt.getTime();
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);

  if (hoursUntilAppointment < 24) {
    return 15 * 60 * 1000;
  } else if (hoursUntilAppointment >= 24 && hoursUntilAppointment <= 48) {
    return 60 * 60 * 1000;
  } else {
    return 2 * 60 * 60 * 1000;
  }
};

export const scheduleAutoCancellation = (requestId: string, createdAt: Date, requestDate: Date, requestStartTime: string) => {
  if (activeTimeouts.has(requestId)) {
    clearTimeout(activeTimeouts.get(requestId)!);
  }

  const delayMs = calculateAutoCancelDelay(createdAt, requestDate, requestStartTime);

  const timeoutId = setTimeout(async () => {
    try {
      console.log(`Checking auto-cancellation for request: ${requestId}`);
      
      await prisma.$transaction(async (tx) => {
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

        if (request.responses.length > 0) {
          console.log(`Request ${requestId} has ${request.responses.length} applicants - not cancelling`);
          return;
        }

        await tx.appointmentRequest.update({
          where: { request_id: requestId },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        const timeoutHours = delayMs / (1000 * 60 * 60);
        console.log(`Auto-cancelled appointment request ${requestId} - no applicants within ${timeoutHours} hours`);
      });

    } catch (error) {
      console.error(`Error in auto-cancellation for request ${requestId}:`, error);
    } finally {
      activeTimeouts.delete(requestId);
    }
  }, delayMs);

  activeTimeouts.set(requestId, timeoutId);
  const timeoutHours = delayMs / (1000 * 60 * 60);
  console.log(`Scheduled auto-cancellation for request ${requestId} in ${timeoutHours} hours (${delayMs}ms)`);
};

export const cancelAutoCancellation = (requestId: string) => {
  if (activeTimeouts.has(requestId)) {
    clearTimeout(activeTimeouts.get(requestId)!);
    activeTimeouts.delete(requestId);
    console.log(`Cancelled auto-cancellation timer for request ${requestId}`);
  }
};

 