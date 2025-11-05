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

    const { timesheetId, managerSignature, managerId, action } = req.body;

    if (!timesheetId || !managerSignature || !managerId || !action) {
      return res.status(400).json({ 
        error: "timesheetId, managerSignature, managerId, and action are required" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action. Must be 'approve' or 'reject'" 
      });
    }

    // Get the timesheet with jobs
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
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
            booking: {
              select: {
                id: true,
                status: true,
                bookingUniqueid: true
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

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Check if timesheet is in SUBMITTED status
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: `Timesheet is not submitted. Current status: ${timesheet.status}` 
      });
    }

    let updatedTimesheet;
    let newStatus;

    if (action === 'approve') {
      // Use transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // Approve and lock the timesheet
        const approved = await tx.timesheet.update({
          where: { id: timesheetId },
          data: {
            managerSignature: managerSignature,
            managerSignatureDate: new Date(),
            managerId: managerId,
            status: 'LOCKED',
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

        // Process each job in the timesheet
        for (const job of approved.timesheetJobs) {
          // Mark booking as COMPLETED
          await tx.booking.update({
            where: { id: job.bookingId },
            data: {
              status: 'COMPLETED',
              completed_at: now
            }
          });

          // Determine who to charge: branch (if AUTO) or practice (if AUTO)
          let shouldCharge = false;
          let chargeEntity: 'branch' | 'practice' | null = null;
          let stripeCustomer: any = null;

          // Priority 1: Check if branch has AUTO payment mode
          if (job.branchId && job.branch?.paymentMode === 'AUTO' && job.totalPay && job.totalPay > 0) {
            shouldCharge = true;
            chargeEntity = 'branch';
            stripeCustomer = await tx.branchStripeCustomer.findUnique({
              where: { branchId: job.branchId }
            });
          }
          // Priority 2: Fall back to practice if no branch or branch not AUTO
          else if (job.practice.paymentMode === 'AUTO' && job.totalPay && job.totalPay > 0) {
            shouldCharge = true;
            chargeEntity = 'practice';
            stripeCustomer = await tx.stripeCustomer.findUnique({
              where: { practiceId: job.practiceId }
            });
          }

          if (shouldCharge && stripeCustomer) {
              try {
                // Call payment API to charge the booking
                const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/create-payment`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    amount: Math.round(job.totalPay * 100), // Convert to cents
                    currency: 'gbp',
                    description: `Booking ${job.booking.bookingUniqueid} - ${approved.locumProfile.fullName}${job.branch ? ` (${job.branch.name})` : ''} - Charged to ${chargeEntity}`,
                    metadata: {
                      booking_id: job.bookingId,
                      timesheet_job_id: job.id,
                      timesheet_id: approved.id,
                      locum_name: approved.locumProfile.fullName,
                      practice_id: job.practiceId,
                      branch_id: job.branchId || null,
                      branch_name: job.branch?.name || null,
                      total_hours: job.totalHours,
                      hourly_rate: job.hourlyRate
                    },
                    practice_id: job.practiceId,
                    customer_id: stripeCustomer.stripeCustomerId,
                    confirm: true // Auto-confirm the payment
                  })
                });

                const paymentData = await paymentResponse.json();

                if (paymentResponse.ok && paymentData.id) {
                  // Payment successful - log it
                  await tx.bookingPayment.create({
                    data: {
                      bookingId: job.bookingId,
                      timesheetJobId: job.id,
                      practiceId: job.practiceId,
                      amount: job.totalPay,
                      currency: 'gbp',
                      stripeChargeId: paymentData.id,
                      stripePaymentIntent: paymentData.payment_intent || paymentData.id,
                      paymentStatus: 'SUCCESS',
                      paymentMethod: 'AUTO',
                      chargedAt: now,
                      chargedBy: managerId,
                      metadata: {
                        total_hours: job.totalHours,
                        hourly_rate: job.hourlyRate,
                        booking_uniqueid: job.booking.bookingUniqueid,
                        locum_name: approved.locumProfile.fullName,
                        branch_id: job.branchId || null,
                        branch_name: job.branch?.name || null,
                        charged_entity: chargeEntity
                      },
                      notes: `Auto-charged ${chargeEntity} on timesheet approval`
                    }
                  });

                  paymentResults.push({
                    bookingId: job.bookingId,
                    status: 'SUCCESS',
                    amount: job.totalPay,
                    chargeId: paymentData.id
                  });
                } else {
                  // Payment failed - log the failure
                  await tx.bookingPayment.create({
                    data: {
                      bookingId: job.bookingId,
                      timesheetJobId: job.id,
                      practiceId: job.practiceId,
                      amount: job.totalPay,
                      currency: 'gbp',
                      paymentStatus: 'FAILED',
                      paymentMethod: 'AUTO',
                      errorMessage: paymentData.error || 'Payment failed',
                      metadata: {
                        total_hours: job.totalHours,
                        hourly_rate: job.hourlyRate,
                        booking_uniqueid: job.booking.bookingUniqueid,
                        locum_name: approved.locumProfile.fullName,
                        branch_id: job.branchId || null,
                        branch_name: job.branch?.name || null
                      },
                      notes: `Auto-charge failed on timesheet approval`
                    }
                  });

                  paymentResults.push({
                    bookingId: job.bookingId,
                    status: 'FAILED',
                    amount: job.totalPay,
                    error: paymentData.error || 'Payment failed'
                  });
                }
              } catch (paymentError: any) {
                // Log payment error
                await tx.bookingPayment.create({
                  data: {
                    bookingId: job.bookingId,
                    timesheetJobId: job.id,
                    practiceId: job.practiceId,
                    amount: job.totalPay,
                    currency: 'gbp',
                    paymentStatus: 'FAILED',
                    paymentMethod: 'AUTO',
                    errorMessage: paymentError.message || 'Payment processing error',
                    metadata: {
                      total_hours: job.totalHours,
                      hourly_rate: job.hourlyRate,
                      booking_uniqueid: job.booking.bookingUniqueid,
                      locum_name: approved.locumProfile.fullName,
                      branch_id: job.branchId || null,
                      branch_name: job.branch?.name || null
                    },
                    notes: `Auto-charge error on timesheet approval`
                  }
                });

                paymentResults.push({
                  bookingId: job.bookingId,
                  status: 'ERROR',
                  amount: job.totalPay,
                  error: paymentError.message
                });
              }
            } else if (shouldCharge && !stripeCustomer) {
              // No Stripe customer found - log as pending
              await tx.bookingPayment.create({
                data: {
                  bookingId: job.bookingId,
                  timesheetJobId: job.id,
                  practiceId: job.practiceId,
                  amount: job.totalPay,
                  currency: 'gbp',
                  paymentStatus: 'FAILED',
                  paymentMethod: 'AUTO',
                  errorMessage: `No Stripe customer found for ${chargeEntity}`,
                  metadata: {
                    total_hours: job.totalHours,
                    hourly_rate: job.hourlyRate,
                    booking_uniqueid: job.booking.bookingUniqueid,
                    locum_name: approved.locumProfile.fullName,
                    branch_id: job.branchId || null,
                    branch_name: job.branch?.name || null,
                    charged_entity: chargeEntity
                  },
                  notes: `Stripe customer not found for ${chargeEntity}`
                }
              });

              paymentResults.push({
                bookingId: job.bookingId,
                status: 'FAILED',
                amount: job.totalPay,
                error: `No Stripe customer found for ${chargeEntity}`
              });
            }
          }
        }

        return { timesheet: approved, payments: paymentResults };
      });

      updatedTimesheet = result.timesheet;
      newStatus = 'LOCKED';

      // Check if any payments failed
      const failedPayments = result.payments.filter((p: any) => p.status !== 'SUCCESS');
      if (failedPayments.length > 0) {
        console.warn(`Some automatic payments failed:`, failedPayments);
      }
    } else {
      // Reject and return to DRAFT status
      updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: {
          status: 'DRAFT',
          staffSignature: null,
          staffSignatureDate: null
        },
        include: {
          timesheetJobs: {
            include: {
              practice: {
                select: {
                  name: true,
                  location: true
                }
              },
              branch: {
                select: {
                  name: true,
                  location: true
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
      newStatus = 'DRAFT';
    }

    res.status(200).json({
      success: true,
      message: `Timesheet ${action === 'approve' ? 'approved and locked' : 'rejected and returned to draft'}`,
      data: {
        timesheetId: updatedTimesheet.id,
        status: newStatus,
        managerSignatureDate: action === 'approve' ? updatedTimesheet.managerSignatureDate : null,
        submittedAt: action === 'approve' ? updatedTimesheet.submittedAt : null,
        totalHours: updatedTimesheet.totalHours,
        totalPay: updatedTimesheet.totalPay,
        month: updatedTimesheet.month,
        year: updatedTimesheet.year,
        locumName: updatedTimesheet.locumProfile.fullName,
        totalJobs: updatedTimesheet.timesheetJobs.length
      }
    });

  } catch (error) {
    console.error("Approve timesheet error:", error);
    res.status(500).json({ error: "Failed to process timesheet approval" });
  }
}
