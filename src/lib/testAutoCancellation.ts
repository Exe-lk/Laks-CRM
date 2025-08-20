import { PrismaClient } from '@prisma/client';
import { scheduleAutoCancellation, calculateAutoCancelDelay } from './autoCancelManager';

const prisma = new PrismaClient();

export const testAutoCancellation = async () => {
  console.log('Testing auto-cancellation functionality...');

  try {
    const now = new Date();
        const in12Hours = new Date();
    in12Hours.setHours(in12Hours.getHours() + 12);
    
    const delay1 = calculateAutoCancelDelay(now, in12Hours, '10:00');
    console.log(`1. Appointment in 12 hours - Timeout: ${delay1 / (1000 * 60)} minutes`);

    const in30Hours = new Date();
    in30Hours.setHours(in30Hours.getHours() + 30);
    
    const delay2 = calculateAutoCancelDelay(now, in30Hours, '10:00');
    console.log(`2. Appointment in 30 hours - Timeout: ${delay2 / (1000 * 60 * 60)} hours`);

    const in72Hours = new Date();
    in72Hours.setHours(in72Hours.getHours() + 72);
    
    const delay3 = calculateAutoCancelDelay(now, in72Hours, '10:00');
    console.log(`3. Appointment in 72 hours - Timeout: ${delay3 / (1000 * 60 * 60)} hours`);

    console.log('\n4. Creating test appointment request...');
    
    const testRequest = await prisma.appointmentRequest.create({
      data: {
        practice_id: 'test-practice-id',
        request_date: in12Hours,
        request_start_time: '10:00',
        request_end_time: '11:00',
        location: 'Test Location',
        required_role: 'Nurse',
        address: 'Test Address',
        status: 'PENDING'
      }
    });

    console.log(`Created test request: ${testRequest.request_id}`);

    scheduleAutoCancellation(
      testRequest.request_id, 
      testRequest.createdAt, 
      in12Hours, 
      '10:00'
    );

    console.log('Auto-cancellation scheduled based on appointment timing...');
    console.log(`Request ID to monitor: ${testRequest.request_id}`);

    return {
      requestId: testRequest.request_id,
      message: 'Test appointment created with auto-cancellation scheduled',
      timeoutDelays: {
        twelveHours: `${delay1 / (1000 * 60)} minutes`,
        thirtyHours: `${delay2 / (1000 * 60 * 60)} hours`, 
        seventyTwoHours: `${delay3 / (1000 * 60 * 60)} hours`
      }
    };

  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
};

export const checkRequestStatus = async (requestId: string) => {
  try {
    const request = await prisma.appointmentRequest.findUnique({
      where: { request_id: requestId },
      include: {
        responses: true
      }
    });

    if (!request) {
      console.log('Request not found');
      return null;
    }

    console.log(`Request ${requestId} status: ${request.status}`);
    console.log(`Number of responses: ${request.responses.length}`);
    console.log(`Last updated: ${request.updatedAt}`);

    return request;
  } catch (error) {
    console.error('Error checking request status:', error);
    throw error;
  }
};

export const cleanupTestData = async () => {
  try {
    const deleted = await prisma.appointmentRequest.deleteMany({
      where: {
        practice_id: 'test-practice-id'
      }
    });

    console.log(`Cleaned up ${deleted.count} test appointment requests`);
    return deleted.count;
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
};