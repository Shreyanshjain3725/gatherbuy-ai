import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { calculateFairShare } from "@/lib/fairshare/engine";
import {
  capturePayPalOrder,
  isPayPalConfigured,
  verifyCaptureData,
  PAYPAL_CURRENCY,
} from "@/lib/paypal/client";

const CaptureOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  isDemoSimulated: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CaptureOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, campaignId, memberId, isDemoSimulated } = parsed.data;

    const campaign = demoStore.getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const member = campaign.members.find((m) => m.id === memberId);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found in campaign" },
        { status: 404 }
      );
    }

    // Check for duplicate capture request (Idempotency protection)
    const existingTransactions = demoStore.listTransactions();
    const existingTx = existingTransactions.find(
      (tx) => tx.paypal_order_id === orderId && tx.status === "completed"
    );

    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: "Payment order has already been captured and verified (Idempotent response).",
        transaction: existingTx,
        alreadyProcessed: true,
      });
    }

    // Authoritative server-side amount check
    const fairShare = calculateFairShare(campaign);
    const memberBreakdown = fairShare.member_breakdowns.find(
      (b) => b.member_id === memberId
    );

    if (!memberBreakdown) {
      return NextResponse.json(
        { error: "Unable to calculate member share." },
        { status: 400 }
      );
    }

    const expectedAmount = memberBreakdown.remaining_due > 0
      ? memberBreakdown.remaining_due
      : memberBreakdown.total;

    const expectedCurrency = campaign.currency || PAYPAL_CURRENCY;

    // REAL PAYPAL SANDBOX FLOW
    if (isPayPalConfigured && !isDemoSimulated) {
      try {
        const captureResponse = await capturePayPalOrder(orderId);

        const verification = verifyCaptureData(
          captureResponse,
          expectedAmount,
          expectedCurrency
        );

        if (!verification.verified) {
          // Log failed transaction attempt
          demoStore.recordPayment(campaignId, memberId, {
            paypal_order_id: orderId,
            amount: expectedAmount,
            currency: expectedCurrency,
            status: "failed",
          });

          return NextResponse.json(
            {
              error: "Payment verification failed",
              details: verification.errorMessage,
            },
            { status: 400 }
          );
        }

        // Successfully verified real PayPal capture
        const result = demoStore.recordPayment(campaignId, memberId, {
          paypal_order_id: orderId,
          paypal_capture_id: verification.captureId,
          amount: expectedAmount,
          currency: expectedCurrency,
          payer_email: verification.payerEmail || member.email,
          payer_name: verification.payerName || member.name,
          status: "completed",
        });

        return NextResponse.json({
          success: true,
          verified: true,
          isSandboxLive: true,
          isDemoSimulated: false,
          transaction: result?.transaction,
          campaign: result?.campaign,
          message: `Successfully verified and captured $${expectedAmount.toFixed(2)} on PayPal Sandbox!`,
        });
      } catch (paypalError: any) {
        console.error("PayPal Capture error:", paypalError);
        return NextResponse.json(
          {
            error: "PayPal Sandbox capture failed",
            message: paypalError.message,
          },
          { status: 502 }
        );
      }
    }

    // DEMO MODE SIMULATION FLOW (Clearly labelled!)
    const simulatedCaptureId = `DEMO-CAPTURE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const result = demoStore.recordPayment(campaignId, memberId, {
      paypal_order_id: orderId,
      paypal_capture_id: simulatedCaptureId,
      amount: expectedAmount,
      currency: expectedCurrency,
      payer_email: member.email,
      payer_name: member.name,
      status: "completed",
    });

    return NextResponse.json({
      success: true,
      verified: true,
      isSandboxLive: false,
      isDemoSimulated: true,
      transaction: result?.transaction,
      campaign: result?.campaign,
      message: `[DEMO MODE] Simulated payment of $${expectedAmount.toFixed(2)} recorded. (Configure PAYPAL_CLIENT_ID & PAYPAL_CLIENT_SECRET in .env.local to test real PayPal Sandbox).`,
    });
  } catch (error: any) {
    console.error("Capture order server error:", error);
    return NextResponse.json(
      { error: "Internal server error capturing payment", message: error.message },
      { status: 500 }
    );
  }
}
