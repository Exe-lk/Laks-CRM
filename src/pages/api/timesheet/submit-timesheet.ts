import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import FormData from 'form-data';

// Helper function to send payment receipt email
async function sendPaymentReceiptEmail(params: {
  recipientEmail: string;
  recipientName: string;
  receiptUrl: string;
  amount: number;
  bookingId: string;
  locumName: string;
  totalHours: number;
  hourlyRate: number;
  chargedEntity: string;
}) {
  console.log(`[EMAIL STEP 1] Starting to send payment receipt email`);
  console.log(`[EMAIL STEP 1.1] Email params:`, {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    receiptUrl: params.receiptUrl,
    amount: params.amount,
    bookingId: params.bookingId
  });
  
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
            .detail-label { font-weight: bold; display: inline-block; width: 150px; }
            .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; 
                      display: inline-block; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Payment Receipt - Booking Completed</h2>
            </div>
            <div class="content">
              <p>Dear ${params.recipientName},</p>
              <p>Your payment has been processed successfully for the completed booking.</p>
              
              <h3>Payment Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Amount Charged:</span>
                <span>£${params.amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span>${params.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Locum Name:</span>
                <span>${params.locumName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Hours:</span>
                <span>${params.totalHours} hours</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hourly Rate:</span>
                <span>£${params.hourlyRate.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Charged To:</span>
                <span>${params.chargedEntity === 'branch' ? 'Branch' : 'Practice'}</span>
              </div>
              
              <div style="text-align: center;">
                <a href="${params.receiptUrl}" class="button" target="_blank">
                  View Receipt
                </a>
              </div>
              
              <p style="margin-top: 20px;">
                Click the button above to view and download your payment receipt from Stripe.
              </p>
              
              <p>If you have any questions about this payment, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Laks CRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Use form-data package for multipart/form-data (compatible with server-side)
    console.log(`[EMAIL STEP 2] Creating form data for email`);
    const formData = new FormData();
    formData.append('to', params.recipientEmail);
    formData.append('subject', `Payment Receipt - Booking ${params.bookingId}`);
    formData.append('html', emailHtml);
    formData.append('text', `Payment processed successfully. Amount: £${params.amount.toFixed(2)}. View receipt: ${params.receiptUrl}`);
    console.log(`[EMAIL STEP 2.1] Form data created with recipient: ${params.recipientEmail}`);

    const emailApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send-email`;
    console.log(`[EMAIL STEP 3] Calling email API: ${emailApiUrl}`);
    console.log(`[EMAIL STEP 3.1] NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL}`);
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: formData.getHeaders(),
      body: formData as any
    });

    console.log(`[EMAIL STEP 4] Email API response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EMAIL STEP 5] Failed to send payment receipt email:', errorText);
      console.error('[EMAIL STEP 5.1] Response status:', response.status);
      console.error('[EMAIL STEP 5.2] Response headers:', Object.fromEntries(response.headers.entries()));
      return false;
    }

    const responseData = await response.json().catch(() => ({}));
    console.log(`[EMAIL STEP 6] Payment receipt email sent successfully to ${params.recipientEmail}`);
    console.log(`[EMAIL STEP 6.1] Response data:`, responseData);
    return true;
  } catch (error) {
    console.error('[EMAIL STEP 7] Error sending payment receipt email:', error);
    console.error('[EMAIL STEP 7.1] Error details:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

    const { timesheetId, staffSignature } = req.body;

    if (!timesheetId || !staffSignature) {
      return res.status(400).json({ 
        error: "timesheetId and staffSignature are required" 
      });
    }

    // Get the timesheet with jobs
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        timesheetJobs: true,
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    console.log('Timesheet found:', { 
      id: timesheet.id, 
      status: timesheet.status, 
      jobCount: timesheet.timesheetJobs.length 
    });

    // Check if timesheet is in DRAFT status
    if (timesheet.status !== 'DRAFT') {
      console.log('Timesheet status validation failed:', timesheet.status);
      return res.status(400).json({ 
        error: `Timesheet is already ${timesheet.status.toLowerCase()}` 
      });
    }

    // Validate that the job has complete start/end times
    const incompleteJobs = timesheet.timesheetJobs.filter(job => 
      !job.startTime || !job.endTime
    );

    if (incompleteJobs.length > 0) {
      console.log('Incomplete jobs found:', incompleteJobs.map(j => ({
        id: j.id,
        startTime: j.startTime,
        endTime: j.endTime
      })));
      return res.status(400).json({ 
        error: "Job must have complete start and end times before submission",
        incompleteJobsCount: incompleteJobs.length,
        incompleteJobs: incompleteJobs.map(j => ({
          jobId: j.id,
          hasStartTime: !!j.startTime,
          hasEndTime: !!j.endTime
        }))
      });
    }

    // For single-job timesheets, ensure at least one job exists
    if (timesheet.timesheetJobs.length === 0) {
      console.log('No jobs in timesheet');
      return res.status(400).json({ 
        error: "Timesheet must have at least one job" 
      });
    }

    // Calculate and update total hours and pay from the job(s)
    const totalHours = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
    const totalPay = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalPay || 0), 0);

    console.log('Calculated totals:', { totalHours, totalPay });

    // Validate that total hours is greater than 0
    if (totalHours <= 0) {
      console.log('Total hours validation failed:', { 
        totalHours,
        jobs: timesheet.timesheetJobs.map(j => ({
          id: j.id,
          totalHours: j.totalHours,
          startTime: j.startTime,
          endTime: j.endTime
        }))
      });
      return res.status(400).json({ 
        error: "Total hours must be greater than 0",
        details: "Please ensure all jobs have start time, end time, and calculated hours",
        totalHours: totalHours,
        jobsData: timesheet.timesheetJobs.map(j => ({
          jobId: j.id,
          totalHours: j.totalHours,
          hasStartTime: !!j.startTime,
          hasEndTime: !!j.endTime
        }))
      });
    }

    // Use transaction for atomicity - update timesheet, complete booking, and charge payment
    console.log('[STEP 1] Starting transaction to update timesheet and process payments');
    const result = await prisma.$transaction(async (tx) => {
      // Update timesheet with staff signature, totals, and change status to SUBMITTED
      console.log('[STEP 2] Updating timesheet with signature and totals');
      const updatedTimesheet = await tx.timesheet.update({
        where: { id: timesheetId },
        data: {
          staffSignature: staffSignature,
          staffSignatureDate: new Date(),
          totalHours: totalHours,
          totalPay: totalPay,
          status: 'SUBMITTED',
          submittedAt: new Date()
        },
        include: {
          timesheetJobs: {
            include: {
              practice: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  location: true,
                  paymentMode: true
                }
              },
              branch: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  location: true,
                  paymentMode: true
                }
              },
              booking: {
                select: {
                  id: true,
                  status: true,
                  bookingUniqueid: true,
                  practice_id: true,
                  branch_id: true
                }
              }
            }
          },
          locumProfile: {
            select: {
              fullName: true,
              emailAddress: true
            }
          }
        }
      });

      const now = new Date();
      const paymentResults: any[] = [];

      console.log(`[STEP 3] Processing ${updatedTimesheet.timesheetJobs.length} job(s) for payment`);
      
      // Process each job - complete booking and charge payment
      for (const job of updatedTimesheet.timesheetJobs) {
        console.log(`[STEP 4] Processing job ${job.id} for booking ${job.bookingId}`);
        console.log(`[STEP 4.1] Job details:`, {
          jobId: job.id,
          bookingId: job.bookingId,
          totalPay: job.totalPay,
          totalHours: job.totalHours,
          hourlyRate: job.hourlyRate,
          branchId: job.branchId,
          practiceId: job.practiceId,
          branchPaymentMode: job.branch?.paymentMode,
          practicePaymentMode: job.practice?.paymentMode
        });
        
        // Mark booking as COMPLETED
        console.log(`[STEP 4.2] Marking booking ${job.bookingId} as COMPLETED`);
        await tx.booking.update({
          where: { id: job.bookingId },
          data: {
            status: 'COMPLETED',
            completed_at: now
          }
        });
        console.log(`[STEP 4.3] Booking ${job.bookingId} marked as COMPLETED`);

        let shouldCharge = false;
        let chargeEntity: 'branch' | 'practice' | null = null;
        let stripeCustomer: any = null;

        console.log(`[STEP 4.4] Checking if payment should be charged for job ${job.id}`);
        console.log(`[STEP 4.4.1] Job totalPay: ${job.totalPay}, is > 0: ${job.totalPay && job.totalPay > 0}`);

        if (job.totalPay && job.totalPay > 0) {
          console.log(`[STEP 4.5] Job has totalPay > 0, checking payment mode`);
          console.log(`[STEP 4.5.1] Branch ID: ${job.branchId}, Branch payment mode: ${job.branch?.paymentMode}`);
          console.log(`[STEP 4.5.2] Practice payment mode: ${job.practice?.paymentMode}`);
          
          // If booking created by BRANCH → charge branch
          if (job.branchId && job.branch?.paymentMode === 'AUTO') {
            console.log(`[STEP 4.6] Branch payment mode is AUTO, will charge branch`);
            shouldCharge = true;
            chargeEntity = 'branch';
            console.log(`[STEP 4.6.1] Looking up Stripe customer for branch ${job.branchId}`);
            stripeCustomer = await tx.branchStripeCustomer.findUnique({
              where: { branchId: job.branchId }
            });
            console.log(`[STEP 4.6.2] Stripe customer found:`, stripeCustomer ? { 
              id: stripeCustomer.id, 
              stripeCustomerId: stripeCustomer.stripeCustomerId 
            } : 'NOT FOUND');
          }
          // If booking created by PRACTICE (no branch) → charge practice
          else if (!job.branchId && job.practice.paymentMode === 'AUTO') {
            console.log(`[STEP 4.7] No branch, practice payment mode is AUTO, will charge practice`);
            shouldCharge = true;
            chargeEntity = 'practice';
            console.log(`[STEP 4.7.1] Looking up Stripe customer for practice ${job.practiceId}`);
            stripeCustomer = await tx.stripeCustomer.findUnique({
              where: { practiceId: job.practiceId }
            });
            console.log(`[STEP 4.7.2] Stripe customer found:`, stripeCustomer ? { 
              id: stripeCustomer.id, 
              stripeCustomerId: stripeCustomer.stripeCustomerId 
            } : 'NOT FOUND');
          } else {
            console.log(`[STEP 4.8] Payment will NOT be charged. Reasons:`, {
              hasBranchId: !!job.branchId,
              branchPaymentMode: job.branch?.paymentMode,
              practicePaymentMode: job.practice?.paymentMode,
              reason: job.branchId 
                ? `Branch payment mode is ${job.branch?.paymentMode} (not AUTO)`
                : `Practice payment mode is ${job.practice?.paymentMode} (not AUTO)`
            });
          }
        } else {
          console.log(`[STEP 4.9] Payment will NOT be charged - totalPay is ${job.totalPay} (must be > 0)`);
        }

        console.log(`[STEP 4.10] Payment decision summary:`, {
          shouldCharge,
          chargeEntity,
          hasStripeCustomer: !!stripeCustomer,
          totalPay: job.totalPay
        });

        if (shouldCharge && stripeCustomer && job.totalPay !== null) {
          console.log(`[STEP 5] Attempting to charge payment for job ${job.id}`);
          console.log(`[STEP 5.1] Payment details:`, {
            amount: Math.round((job.totalPay || 0) * 100),
            currency: 'gbp',
            customerId: stripeCustomer.stripeCustomerId,
            chargeEntity,
            bookingUniqueid: job.booking.bookingUniqueid,
            off_session: true
          });
          
          try {
            // Get default payment method for the customer (if set)
            let defaultPaymentMethodId: string | undefined = undefined;
            try {
              const customerDetailsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/get-customer-details?${chargeEntity}_id=${chargeEntity === 'branch' ? job.branchId : job.practiceId}`,
                { method: 'GET' }
              );
              if (customerDetailsResponse.ok) {
                const customerDetails = await customerDetailsResponse.json();
                if (customerDetails.default_payment_method) {
                  defaultPaymentMethodId = customerDetails.default_payment_method;
                }
              }
            } catch (pmError) {
              // If we can't get default payment method, continue without it
              // Stripe will use customer's default or first available card
              console.warn('Could not fetch default payment method, using Stripe default:', pmError);
            }

            const paymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/create-payment`;
            console.log(`[STEP 5.2] Calling payment API: ${paymentUrl}`);
            
            const paymentPayload: any = {
              amount: Math.round((job.totalPay || 0) * 100),
              currency: 'gbp',
              description: `Booking ${job.booking.bookingUniqueid} - ${updatedTimesheet.locumProfile.fullName}${job.branch ? ` (${job.branch.name})` : ''} - ${chargeEntity}`,
              metadata: {
                booking_id: job.bookingId,
                timesheet_job_id: job.id,
                timesheet_id: updatedTimesheet.id,
                locum_name: updatedTimesheet.locumProfile.fullName,
                practice_id: job.practiceId,
                branch_id: job.branchId || null,
                branch_name: job.branch?.name || null,
                total_hours: job.totalHours,
                hourly_rate: job.hourlyRate,
                charged_entity: chargeEntity
              },
              customer_id: stripeCustomer.stripeCustomerId,
              confirm: true,
              off_session: true // Enable automatic charging using customer's default payment method
            };

            // Include payment method ID if available
            if (defaultPaymentMethodId) {
              paymentPayload.payment_method_id = defaultPaymentMethodId;
            }
            
            console.log(`[STEP 5.3] Payment payload:`, JSON.stringify(paymentPayload, null, 2));
            
            const paymentResponse = await fetch(paymentUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentPayload)
            });

            console.log(`[STEP 5.4] Payment API response status: ${paymentResponse.status} ${paymentResponse.statusText}`);
            const paymentData = await paymentResponse.json();
            console.log(`[STEP 5.5] Payment API response data:`, JSON.stringify(paymentData, null, 2));

            if (paymentResponse.ok && paymentData.id) {
              console.log(`[STEP 6] Payment successful! Charge ID: ${paymentData.id}`);
              // Extract receipt URL from Stripe response
              const receiptUrl = paymentData.receipt_url || paymentData.charges?.data?.[0]?.receipt_url || '';
              console.log(`[STEP 6.1] Receipt URL: ${receiptUrl || 'NOT FOUND'}`);
              
              console.log(`[STEP 6.2] Creating booking payment record`);
              await tx.bookingPayment.create({
                data: {
                  bookingId: job.bookingId,
                  timesheetJobId: job.id,
                  practiceId: job.practiceId,
                  amount: job.totalPay || 0,
                  currency: 'gbp',
                  stripeChargeId: paymentData.id,
                  stripePaymentIntent: paymentData.payment_intent || paymentData.id,
                  paymentStatus: 'SUCCESS',
                  paymentMethod: 'AUTO',
                  chargedAt: now,
                  chargedBy: user.id, // Locum user who submitted
                  metadata: {
                    total_hours: job.totalHours,
                    hourly_rate: job.hourlyRate,
                    booking_uniqueid: job.booking.bookingUniqueid,
                    locum_name: updatedTimesheet.locumProfile.fullName,
                    branch_id: job.branchId || null,
                    branch_name: job.branch?.name || null,
                    charged_entity: chargeEntity,
                    receipt_url: receiptUrl
                  },
                  notes: `Auto-charged ${chargeEntity} on timesheet submission`
                }
              });
              
              // Prepare email data
              const recipientEmail = chargeEntity === 'branch' ? job.branch?.email : job.practice.email;
              const recipientName = chargeEntity === 'branch' ? job.branch?.name : job.practice.name;
              
              console.log(`[STEP 6.3] Email recipient prepared:`, {
                recipientEmail,
                recipientName,
                chargeEntity,
                receiptUrl
              });
              
              paymentResults.push({ 
                bookingId: job.bookingId, 
                status: 'SUCCESS', 
                chargeId: paymentData.id,
                receiptUrl: receiptUrl,
                recipientEmail: recipientEmail,
                recipientName: recipientName,
                jobDetails: {
                  totalPay: job.totalPay,
                  totalHours: job.totalHours,
                  hourlyRate: job.hourlyRate,
                  bookingUniqueid: job.booking.bookingUniqueid,
                  locumName: updatedTimesheet.locumProfile.fullName,
                  chargedEntity: chargeEntity
                }
              });
            } else {
              console.log(`[STEP 7] Payment failed! Response not OK or missing ID`);
              console.log(`[STEP 7.1] Response OK: ${paymentResponse.ok}, Has ID: ${!!paymentData.id}`);
              console.log(`[STEP 7.2] Error details:`, paymentData);
              
              await tx.bookingPayment.create({
                data: {
                  bookingId: job.bookingId,
                  timesheetJobId: job.id,
                  practiceId: job.practiceId,
                  amount: job.totalPay || 0,
                  currency: 'gbp',
                  paymentStatus: 'FAILED',
                  paymentMethod: 'AUTO',
                  errorMessage: paymentData.error || 'Payment failed',
                  metadata: {
                    total_hours: job.totalHours,
                    hourly_rate: job.hourlyRate,
                    booking_uniqueid: job.booking.bookingUniqueid,
                    locum_name: updatedTimesheet.locumProfile.fullName,
                    branch_id: job.branchId || null,
                    branch_name: job.branch?.name || null,
                    charged_entity: chargeEntity
                  },
                  notes: 'Auto-charge failed on timesheet submission'
                }
              });
              paymentResults.push({ bookingId: job.bookingId, status: 'FAILED', error: paymentData.error });
            }
          } catch (paymentError: any) {
            console.error(`[STEP 8] Payment error caught for job ${job.id}:`, paymentError);
            console.error(`[STEP 8.1] Error message:`, paymentError.message);
            console.error(`[STEP 8.2] Error stack:`, paymentError.stack);
            
            await tx.bookingPayment.create({
              data: {
                bookingId: job.bookingId,
                timesheetJobId: job.id,
                practiceId: job.practiceId,
                amount: job.totalPay || 0,
                currency: 'gbp',
                paymentStatus: 'FAILED',
                paymentMethod: 'AUTO',
                errorMessage: paymentError.message || 'Payment error',
                metadata: {
                  total_hours: job.totalHours,
                  hourly_rate: job.hourlyRate,
                  booking_uniqueid: job.booking.bookingUniqueid,
                  locum_name: updatedTimesheet.locumProfile.fullName,
                  branch_id: job.branchId || null,
                  branch_name: job.branch?.name || null,
                  charged_entity: chargeEntity
                },
                notes: 'Auto-charge error on timesheet submission'
              }
            });
            paymentResults.push({ bookingId: job.bookingId, status: 'ERROR', error: paymentError.message });
          }
        } else if (shouldCharge && !stripeCustomer) {
          console.log(`[STEP 9] Payment should be charged but no Stripe customer found`);
          console.log(`[STEP 9.1] Details:`, {
            shouldCharge,
            hasStripeCustomer: !!stripeCustomer,
            chargeEntity,
            branchId: job.branchId,
            practiceId: job.practiceId
          });
          
          await tx.bookingPayment.create({
            data: {
              bookingId: job.bookingId,
              timesheetJobId: job.id,
              practiceId: job.practiceId,
              amount: job.totalPay || 0,
              currency: 'gbp',
              paymentStatus: 'FAILED',
              paymentMethod: 'AUTO',
              errorMessage: `No Stripe customer for ${chargeEntity}`,
              metadata: {
                total_hours: job.totalHours,
                hourly_rate: job.hourlyRate,
                booking_uniqueid: job.booking.bookingUniqueid,
                locum_name: updatedTimesheet.locumProfile.fullName,
                branch_id: job.branchId || null,
                branch_name: job.branch?.name || null,
                charged_entity: chargeEntity
              },
              notes: 'No Stripe customer found'
            }
          });
          paymentResults.push({ bookingId: job.bookingId, status: 'FAILED', error: 'No Stripe customer' });
        } else {
          console.log(`[STEP 10] Payment skipped for job ${job.id} - conditions not met:`, {
            shouldCharge,
            hasStripeCustomer: !!stripeCustomer,
            totalPay: job.totalPay
          });
        }
        
        console.log(`[STEP 11] Finished processing job ${job.id}`);
      }

      console.log(`[STEP 12] Transaction completed. Payment results:`, paymentResults);
      return { timesheet: updatedTimesheet, payments: paymentResults };
    });
    
    console.log(`[STEP 13] Transaction result received:`, {
      timesheetId: result.timesheet.id,
      paymentCount: result.payments.length,
      paymentStatuses: result.payments.map((p: any) => ({ bookingId: p.bookingId, status: p.status }))
    });

    const failedPayments = result.payments.filter((p: any) => p.status !== 'SUCCESS');
    console.log(`[STEP 14] Payment results analysis:`, {
      totalPayments: result.payments.length,
      successfulCount: result.payments.filter((p: any) => p.status === 'SUCCESS').length,
      failedCount: failedPayments.length
    });
    
    if (failedPayments.length > 0) {
      console.warn('[STEP 14.1] Some auto-payments failed on timesheet submission:', failedPayments);
    }

    // Send payment receipt emails for successful payments (async, don't block response)
    console.log(`[STEP 15] Filtering successful payments for email sending`);
    const successfulPayments = result.payments.filter((p: any) => p.status === 'SUCCESS' && p.receiptUrl && p.recipientEmail);
    console.log(`[STEP 15.1] Successful payments found:`, successfulPayments.length);
    console.log(`[STEP 15.2] Successful payment details:`, successfulPayments.map((p: any) => ({
      bookingId: p.bookingId,
      hasReceiptUrl: !!p.receiptUrl,
      hasRecipientEmail: !!p.recipientEmail,
      recipientEmail: p.recipientEmail
    })));
    
    if (successfulPayments.length > 0) {
      console.log(`[STEP 16] Starting to send ${successfulPayments.length} payment receipt email(s)`);
      // Send emails asynchronously without blocking the response
      Promise.all(
        successfulPayments.map((payment: any, index: number) => {
          console.log(`[STEP 16.${index + 1}] Preparing email for payment:`, {
            bookingId: payment.bookingId,
            recipientEmail: payment.recipientEmail,
            recipientName: payment.recipientName,
            receiptUrl: payment.receiptUrl,
            amount: payment.jobDetails.totalPay
          });
          return sendPaymentReceiptEmail({
            recipientEmail: payment.recipientEmail,
            recipientName: payment.recipientName || 'Customer',
            receiptUrl: payment.receiptUrl,
            amount: payment.jobDetails.totalPay,
            bookingId: payment.jobDetails.bookingUniqueid,
            locumName: payment.jobDetails.locumName,
            totalHours: payment.jobDetails.totalHours,
            hourlyRate: payment.jobDetails.hourlyRate,
            chargedEntity: payment.jobDetails.chargedEntity
          });
        })
      ).then((emailResults) => {
        const successCount = emailResults.filter(Boolean).length;
        console.log(`[STEP 17] Email sending completed: ${successCount}/${successfulPayments.length} emails sent successfully`);
        emailResults.forEach((result, index) => {
          if (!result) {
            console.error(`[STEP 17.${index + 1}] Email ${index + 1} failed to send`);
          }
        });
      }).catch((error) => {
        console.error('[STEP 18] Error sending payment receipt emails:', error);
        console.error('[STEP 18.1] Error details:', error.message, error.stack);
      });
    } else {
      console.log(`[STEP 19] No emails to send - no successful payments with receipt URL and recipient email`);
      console.log(`[STEP 19.1] All payment results:`, result.payments);
    }

    console.log(`[STEP 20] Sending success response to client`);
    console.log(`[STEP 20.1] Final summary:`, {
      timesheetId: result.timesheet.id,
      status: result.timesheet.status,
      totalPayments: result.payments.length,
      successfulPayments: result.payments.filter((p: any) => p.status === 'SUCCESS').length,
      failedPayments: result.payments.filter((p: any) => p.status !== 'SUCCESS').length
    });
    
    res.status(200).json({
      success: true,
      message: "Timesheet submitted successfully, booking(s) completed, and payment(s) processed",
      data: {
        timesheetId: result.timesheet.id,
        status: result.timesheet.status,
        staffSignatureDate: result.timesheet.staffSignatureDate,
        totalHours: result.timesheet.totalHours,
        totalPay: result.timesheet.totalPay,
        month: result.timesheet.month,
        year: result.timesheet.year,
        locumName: result.timesheet.locumProfile.fullName,
        totalJobs: result.timesheet.timesheetJobs.length,
        paymentResults: result.payments
      }
    });

  } catch (error) {
    console.error("[ERROR] Submit timesheet error:", error);
    console.error("[ERROR 1] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[ERROR 2] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[ERROR 3] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: "Failed to submit timesheet" });
  }
}
