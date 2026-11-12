import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { calculateFairShare, simulateWhatIfScenario } from "@/lib/fairshare/engine";

const CalculateRequestSchema = z.object({
  campaign_id: z.string().min(1),
  supplier_id: z.string().optional(),
  scenario: z
    .object({
      supplier_id: z.string().optional(),
      additional_item_quantities: z.record(z.number()).optional(),
      excluded_member_ids: z.array(z.string()).optional(),
      extra_discount_dollars: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CalculateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const campaign = demoStore.getCampaign(parsed.data.campaign_id);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (parsed.data.scenario) {
      const whatIfResult = simulateWhatIfScenario(campaign, parsed.data.scenario);
      return NextResponse.json({
        success: true,
        type: "what_if_simulation",
        data: whatIfResult,
      });
    }

    const selectedQuote = parsed.data.supplier_id
      ? campaign.supplier_quotes.find((q) => q.id === parsed.data.supplier_id)
      : null;

    const fairShare = calculateFairShare(campaign, selectedQuote);

    return NextResponse.json({
      success: true,
      type: "standard_fairshare",
      data: fairShare,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "FairShare calculation error", message: error.message },
      { status: 500 }
    );
  }
}
