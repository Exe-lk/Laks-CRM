import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

    // Check if timesheet is in DRAFT status
    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({ 
        error: `Timesheet is already ${timesheet.status.toLowerCase()}` 
      });
    }

    // Validate that the job has complete start/end times
    const incompleteJobs = timesheet.timesheetJobs.filter(job => 
      !job.startTime || !job.endTime
    );

    if (incompleteJobs.length > 0) {
      return res.status(400).json({ 
        error: "Job must have complete start and end times before submission",
        incompleteJobsCount: incompleteJobs.length
      });
    }

    // For single-job timesheets, ensure at least one job exists
    if (timesheet.timesheetJobs.length === 0) {
      return res.status(400).json({ 
        error: "Timesheet must have at least one job" 
      });
    }

    // Calculate and update total hours and pay from the job(s)
    const totalHours = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
    const totalPay = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalPay || 0), 0);

    // Validate that total hours is greater than 0
    if (totalHours <= 0) {
      return res.status(400).json({ 
        error: "Total hours must be greater than 0" 
      });
    }

    // Use transaction for atomicity - update timesheet, complete booking, and charge payment
    const result = await prisma.$transaction(async (tx) => {
      // Update timesheet with staff signature, totals, and change status to SUBMITTED
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
                  location: true,
                  paymentMode: true
                }
              },
              branch: {
                select: {
                  id: true,
                  name: true,
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

      // Process each job - complete booking and charge payment
      for (const job of updatedTimesheet.timesheetJobs) {
        // Mark booking as COMPLETED
        await tx.booking.update({
          where: { id: job.bookingId },
          data: {
            status: 'COMPLETED',
            completed_at: now
          }
        });

        let shouldCharge = false;
        let chargeEntity: 'branch' | 'practice' | null = null;
        let stripeCustomer: any = null;

        if (job.totalPay && job.totalPay > 0) {
          // If booking created by BRANCH → charge branch
          if (job.branchId && job.branch?.paymentMode === 'AUTO') {
            shouldCharge = true;
            chargeEntity = 'branch';
            stripeCustomer = await tx.branchStripeCustomer.findUnique({
              where: { branchId: job.branchId }
            });
          }
          // If booking created by PRACTICE (no branch) → charge practice
          else if (!job.branchId && job.practice.paymentMode === 'AUTO') {
            shouldCharge = true;
            chargeEntity = 'practice';
            stripeCustomer = await tx.stripeCustomer.findUnique({
              where: { practiceId: job.practiceId }
            });
          }
        }

        if (shouldCharge && stripeCustomer && job.totalPay !== null) {
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

            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/create-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
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
                payment_method_id: defaultPaymentMethodId, // Use default payment method if set
                confirm: true
              })
            });

            const paymentData = await paymentResponse.json();

            if (paymentResponse.ok && paymentData.id) {
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
                    charged_entity: chargeEntity
                  },
                  notes: `Auto-charged ${chargeEntity} on timesheet submission`
                }
              });
              paymentResults.push({ bookingId: job.bookingId, status: 'SUCCESS', chargeId: paymentData.id });
            } else {
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
        }
      }

      return { timesheet: updatedTimesheet, payments: paymentResults };
    });

    const failedPayments = result.payments.filter((p: any) => p.status !== 'SUCCESS');
    if (failedPayments.length > 0) {
      console.warn('Some auto-payments failed on timesheet submission:', failedPayments);
    }

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
    console.error("Submit timesheet error:", error);
    res.status(500).json({ error: "Failed to submit timesheet" });
  }
}
