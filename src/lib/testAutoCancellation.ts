import { PrismaClient } from '@prisma/client';
import { scheduleAutoCancellation, isWithin24Hours } from './autoCancelManager';

const prisma = new PrismaClient();

// Test function for auto-cancellation (for development/testing purposes)
export const testAutoCancellation = async () => {
  console.log('Testing auto-cancellation functionality...');

  try {
    // Create a test appointment request within 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow

    console.log('1. Testing isWithin24Hours function...');
    console.log(`Appointment date: ${tomorrow}`);
    console.log(`Is within 24 hours: ${isWithin24Hours(tomorrow)}`);

    // Test with different dates
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    console.log(`Next week date: ${nextWeek}`);
    console.log(`Is within 24 hours: ${isWithin24Hours(nextWeek)}`);

    const in12Hours = new Date();
    in12Hours.setHours(in12Hours.getHours() + 12);
    console.log(`In 12 hours: ${in12Hours}`);
    console.log(`Is within 24 hours: ${isWithin24Hours(in12Hours)}`);

    console.log('\n2. Testing auto-cancellation timing...');
    
    // Create a mock appointment request
    const testRequest = await prisma.appointmentRequest.create({
      data: {
        practice_id: 'test-practice-id',
        request_date: in12Hours,
        request_start_time: '10:00',
        request_end_time: '11:00',
        location: 'Test Location',
        required_role: 'Nurse',
        status: 'PENDING'
      }
    });

    console.log(`Created test request: ${testRequest.request_id}`);

    // Schedule auto-cancellation with a short delay for testing (30 seconds instead of 15 minutes)
    scheduleAutoCancellation(testRequest.request_id, 30000); // 30 seconds

    console.log('Auto-cancellation scheduled for 30 seconds...');
    console.log('You can check the database to see if the request gets cancelled after 30 seconds');
    console.log(`Request ID to monitor: ${testRequest.request_id}`);

    return {
      requestId: testRequest.request_id,
      message: 'Test appointment created with auto-cancellation scheduled'
    };

  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
};

// Utility to check the status of a test request
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

// Cleanup test data
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