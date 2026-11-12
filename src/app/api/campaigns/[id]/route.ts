import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { calculateFairShare } from "@/lib/fairshare/engine";
import { compareSupplierQuotes } from "@/lib/suppliers/comparator";

const PatchSchema = z.object({
  status: z
    .enum([
      "draft",
      "open",
      "collecting",
      "ready_to_order",
      "ordered",
      "completed",
      "cancelled",
    ])
    .optional(),
  selected_supplier_id: z.string().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  target_budget: z.number().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const campaign = demoStore.getCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const fairShare = calculateFairShare(campaign);
    const comparison = compareSupplierQuotes(campaign);

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        fairShare,
        comparison,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch campaign details", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const campaign = demoStore.getCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid patch data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.status && data.status !== campaign.status) {
      const oldStatus = campaign.status;
      campaign.status = data.status;
      campaign.activities.unshift({
        id: `act-${Date.now()}`,
        campaign_id: campaign.id,
        actor_name: campaign.organizer_name,
        action_type: "status_changed",
        message: `Campaign status changed from '${oldStatus}' to '${data.status}'.`,
        created_at: new Date().toISOString(),
      });
    }

    if (data.selected_supplier_id !== undefined) {
      campaign.selected_supplier_id = data.selected_supplier_id;
    }

    if (data.title) campaign.title = data.title;
    if (data.description) campaign.description = data.description;
    if (data.deadline) campaign.deadline = data.deadline;
    if (data.target_budget !== undefined) campaign.target_budget = data.target_budget;

    campaign.updated_at = new Date().toISOString();
    demoStore.saveCampaign(campaign);

    const fairShare = calculateFairShare(campaign);
    const comparison = compareSupplierQuotes(campaign);

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        fairShare,
        comparison,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update campaign", message: error.message },
      { status: 500 }
    );
  }
}
