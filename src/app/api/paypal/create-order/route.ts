import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { calculateFairShare } from "@/lib/fairshare/engine";
import {
  createPayPalOrder,
  isPayPalConfigured,
  PAYPAL_CURRENCY,
} from "@/lib/paypal/client";

const CreateOrderSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { campaignId, memberId } = parsed.data;

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

    // CRITICAL SECURITY RULE: Calculate authoritative payable amount on server
    const fairShare = calculateFairShare(campaign);
    const memberBreakdown = fairShare.member_breakdowns.find(
      (b) => b.member_id === memberId
    );

    if (!memberBreakdown || memberBreakdown.remaining_due <= 0) {
      return NextResponse.json(
        { error: "No outstanding contribution balance due for this member." },
        { status: 400 }
      );
    }

    const payableAmount = memberBreakdown.remaining_due;

    // Check if real PayPal Sandbox credentials are configured
    if (isPayPalConfigured) {
      try {
        const orderData = await createPayPalOrder({
          amount: payableAmount,
          currency: campaign.currency || PAYPAL_CURRENCY,
          campaignId: campaign.id,
          memberId: member.id,
          campaignTitle: campaign.title,
          description: `Contribution for ${member.name} (${campaign.title})`,
          breakdown: {
            itemTotal: memberBreakdown.items_subtotal,
            shipping: memberBreakdown.allocated_shipping,
            taxTotal: memberBreakdown.allocated_tax,
            discount: memberBreakdown.allocated_discount,
          },
        });

        return NextResponse.json({
          success: true,
          orderId: orderData.id,
          amount: payableAmount,
          currency: campaign.currency || PAYPAL_CURRENCY,
          isSandboxLive: true,
          isDemoSimulated: false,
        });
      } catch (err: any) {
        console.error("PayPal API Order creation error:", err);
        return NextResponse.json(
          {
            error: "Failed to create order on PayPal Sandbox",
            message: err.message,
            hint: "Check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET credentials.",
          },
          { status: 502 }
        );
      }
    }

    // DEMO MODE FALLBACK:
    // Generate a clearly identified demo order id so judges can test the full UI flow
    const demoOrderId = `DEMO-PAYPAL-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      orderId: demoOrderId,
      amount: payableAmount,
      currency: campaign.currency || PAYPAL_CURRENCY,
      isSandboxLive: false,
      isDemoSimulated: true,
      demoNotice:
        "DEMO MODE: PayPal Sandbox credentials are not configured in .env.local. A simulated test order was generated.",
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error creating order", message: error.message },
      { status: 500 }
    );
  }
}
