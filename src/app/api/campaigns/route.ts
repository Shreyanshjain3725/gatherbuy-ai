import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { Campaign } from "@/lib/db/schema";
import { generateInviteCode } from "@/lib/utils";

const CreateCampaignSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().default(""),
  category: z.string().optional().default("General"),
  target_budget: z.number().nonnegative(),
  deadline: z.string(),
  organizer_name: z.string().min(2, "Organizer name required"),
  organizer_email: z.string().email("Valid organizer email required"),
  currency: z.string().default("USD"),
  items: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      target_quantity: z.number().int().positive(),
      unit_cost_estimate: z.number().nonnegative().default(0),
      options: z
        .array(
          z.object({
            name: z.string(),
            values: z.array(z.string()),
          })
        )
        .optional()
        .default([]),
    })
  ),
});

export async function GET() {
  try {
    const campaigns = demoStore.listCampaigns();
    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch campaigns", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const campaignId = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = generateInviteCode(6);

    const items = data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      campaign_id: campaignId,
      name: item.name,
      description: item.description,
      target_quantity: item.target_quantity,
      unit_cost_estimate: item.unit_cost_estimate,
      options: item.options,
    }));

    const organizerMemberId = `member-org-${Date.now()}`;
    const newCampaign: Campaign = {
      id: campaignId,
      organizer_id: `user-${Date.now()}`,
      organizer_name: data.organizer_name,
      organizer_email: data.organizer_email,
      title: data.title,
      description: data.description,
      category: data.category,
      target_budget: data.target_budget,
      deadline: data.deadline,
      status: "open",
      selected_supplier_id: null,
      invite_code: inviteCode,
      currency: data.currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items,
      members: [
        {
          id: organizerMemberId,
          campaign_id: campaignId,
          name: `${data.organizer_name} (Organizer)`,
          email: data.organizer_email,
          role: "organizer",
          payment_status: "pending",
          allocated_amount: 0,
          amount_paid: 0,
          joined_at: new Date().toISOString(),
          selections: [],
        },
      ],
      supplier_quotes: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          campaign_id: campaignId,
          actor_name: data.organizer_name,
          action_type: "created",
          message: `Created campaign '${data.title}' with target budget of $${data.target_budget.toFixed(2)}.`,
          created_at: new Date().toISOString(),
        },
      ],
      ai_insights: [],
    };

    demoStore.saveCampaign(newCampaign);

    return NextResponse.json({
      success: true,
      data: newCampaign,
    });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign", message: error.message },
      { status: 500 }
    );
  }
}
