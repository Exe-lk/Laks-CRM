import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

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

    const { penalty_id, notes } = req.body;

    if (!penalty_id || typeof penalty_id !== 'string') {
      return res.status(400).json({ error: "penalty_id is required" });
    }

    // Fetch penalty with all charged-party Stripe customer details
    const penalty = await prisma.cancellationPenalty.findUnique({
      where: { id: penalty_id },
      include: {
        booking: {
          select: {
            id: true,
            bookingUniqueid: true,
            booking_date: true,
          }
        },
        chargedPractice: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeCustomer: {
              select: {
                stripeCustomerId: true,
                email: true,
                name: true
              }
            }
          }
        },
        chargedLocum: {
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
            stripeCustomer: {
              select: {
                stripeCustomerId: true,
                email: true,
                name: true
              }
            }
          }
        },
        chargedBranch: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeCustomer: {
              select: {
                stripeCustomerId: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!penalty) {
      return res.status(404).json({ error: "Penalty not found" });
    }

    if (penalty.status === 'CHARGED') {
      return res.status(400).json({ error: "This penalty has already been charged" });
    }

    if (penalty.status === 'DISMISSED') {
      return res.status(400).json({ error: "This penalty has been dismissed and cannot be charged" });
    }

    // Determine who to charge and their Stripe customer ID
    let stripeCustomerId: string | null = null;
    let chargedPartyName: string = 'Unknown';

    if (penalty.chargedPracticeId && penalty.chargedPractice) {
      stripeCustomerId = penalty.chargedPractice.stripeCustomer?.stripeCustomerId ?? null;
      chargedPartyName = penalty.chargedPractice.name;
    } else if (penalty.chargedLocumId && penalty.chargedLocum) {
      stripeCustomerId = penalty.chargedLocum.stripeCustomer?.stripeCustomerId ?? null;
      chargedPartyName = penalty.chargedLocum.fullName;
    } else if (penalty.chargedBranchId && penalty.chargedBranch) {
      stripeCustomerId = penalty.chargedBranch.stripeCustomer?.stripeCustomerId ?? null;
      chargedPartyName = penalty.chargedBranch.name;
    }

    if (!stripeCustomerId) {
      // Log the failed attempt
      await prisma.penaltyPaymentLog.create({
        data: {
          penaltyId: penalty_id,
          action: 'CHARGE_FAILED',
          amount: penalty.penaltyAmount,
          performedBy: user.id,
          errorMessage: `No Stripe customer found for ${chargedPartyName}. They must add a payment method first.`,
          notes: notes || null,
        }
      });

      return res.status(400).json({
        error: `No payment method found for ${chargedPartyName}. They must add a payment card before a penalty can be charged.`
      });
    }

    const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
    const PAYMENT_FUNCTION_SECRET = process.env.PAYMENT_FUNCTION_SECRET;

    if (!SUPABASE_FUNCTION_URL || !PAYMENT_FUNCTION_SECRET) {
      return res.status(500).json({ error: "Payment service not configured on this server" });
    }

    // Charge in pence/cents (Stripe uses smallest currency unit)
    const amountInPence = Math.round(penalty.penaltyAmount * 100);

    const paymentPayload = {
      amount: amountInPence,
      currency: 'gbp',
      description: `Cancellation penalty – ${chargedPartyName} – Booking ${penalty.booking?.bookingUniqueid || penalty.booking?.id || penalty_id}`,
      customer: stripeCustomerId,
      confirm: true,
      off_session: true,
      metadata: {
        penalty_id,
        booking_id: penalty.bookingId,
        charged_party: penalty.cancelledPartyType,
        penalty_hours: String(penalty.penaltyHours),
        hourly_rate: String(penalty.hourlyRate),
      }
    };

    const stripeResp = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYMENT_FUNCTION_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    const stripeJson = await stripeResp.json().catch(() => ({}));

    if (!stripeResp.ok) {
      // Log the failed payment
      await prisma.penaltyPaymentLog.create({
        data: {
          penaltyId: penalty_id,
          action: 'CHARGE_FAILED',
          amount: penalty.penaltyAmount,
          performedBy: user.id,
          errorMessage: stripeJson?.error || stripeJson?.message || `Stripe returned status ${stripeResp.status}`,
          notes: notes || null,
          metadata: stripeJson,
        }
      });

      return res.status(stripeResp.status).json({
        error: stripeJson?.error || stripeJson?.message || 'Payment charge failed. Please try again.'
      });
    }

    const stripeChargeId: string | undefined =
      stripeJson?.payment_intent?.id ||
      stripeJson?.id ||
      stripeJson?.paymentIntentId ||
      undefined;

    // Update penalty to CHARGED and log the successful payment in a transaction
    await prisma.$transaction([
      prisma.cancellationPenalty.update({
        where: { id: penalty_id },
        data: {
          status: 'CHARGED',
          chargedAt: new Date(),
          chargedBy: user.id,
          stripeChargeId: stripeChargeId || null,
          notes: notes || null,
        }
      }),
      prisma.penaltyPaymentLog.create({
        data: {
          penaltyId: penalty_id,
          action: 'CHARGED',
          amount: penalty.penaltyAmount,
          stripePaymentIntent: stripeChargeId || null,
          performedBy: user.id,
          notes: notes || null,
          metadata: stripeJson,
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: `Penalty of £${penalty.penaltyAmount.toFixed(2)} successfully charged to ${chargedPartyName}`,
      data: {
        penalty_id,
        amount: penalty.penaltyAmount,
        charged_to: chargedPartyName,
        stripe_charge_id: stripeChargeId,
      }
    });

  } catch (error) {
    console.error("Charge penalty error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to charge penalty" });
  }
}
