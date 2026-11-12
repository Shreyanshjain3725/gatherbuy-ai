import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { calculateFairShare } from "@/lib/fairshare/engine";

const JoinSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  selections: z.array(
    z.object({
      item_id: z.string().min(1),
      quantity: z.number().int().min(0),
      selected_option: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(
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
    const parsed = JoinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if member already exists by email
    let member = campaign.members.find(
      (m) => m.email.toLowerCase() === data.email.toLowerCase()
    );

    if (member) {
      // Update existing member selections
      member.name = data.name;
      member.selections = data.selections.map((s, idx) => ({
        id: `sel-${member!.id}-${idx + 1}`,
        member_id: member!.id,
        item_id: s.item_id,
        quantity: s.quantity,
        selected_option: s.selected_option,
        notes: s.notes,
      }));

      campaign.activities.unshift({
        id: `act-${Date.now()}`,
        campaign_id: campaign.id,
        actor_name: member.name,
        action_type: "item_selected",
        message: `${member.name} updated their item selections.`,
        created_at: new Date().toISOString(),
      });
    } else {
      // Create new member
      const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newMemberSelections = data.selections.map((s, idx) => ({
        id: `sel-${memberId}-${idx + 1}`,
        member_id: memberId,
        item_id: s.item_id,
        quantity: s.quantity,
        selected_option: s.selected_option,
        notes: s.notes,
      }));

      member = {
        id: memberId,
        campaign_id: campaign.id,
        name: data.name,
        email: data.email,
        role: "member",
        payment_status: "pending",
        allocated_amount: 0,
        amount_paid: 0,
        joined_at: new Date().toISOString(),
        selections: newMemberSelections,
      };

      campaign.members.push(member);

      campaign.activities.unshift({
        id: `act-${Date.now()}`,
        campaign_id: campaign.id,
        actor_name: member.name,
        action_type: "member_joined",
        message: `${member.name} joined the campaign!`,
        created_at: new Date().toISOString(),
      });
    }

    // Recalculate FairShare to update member's allocated_amount in campaign
    const fairShare = calculateFairShare(campaign);
    for (const b of fairShare.member_breakdowns) {
      const m = campaign.members.find((x) => x.id === b.member_id);
      if (m) {
        m.allocated_amount = b.total;
      }
    }

    demoStore.saveCampaign(campaign);

    const memberBreakdown = fairShare.member_breakdowns.find(
      (b) => b.member_id === member!.id
    );

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        member,
        fairShare,
        memberBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Error joining campaign:", error);
    return NextResponse.json(
      { error: "Failed to join campaign", message: error.message },
      { status: 500 }
    );
  }
}
