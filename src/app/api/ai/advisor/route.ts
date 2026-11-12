import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { askProcurementAdvisor } from "@/lib/ai/gemini";
import { demoStore } from "@/lib/db/demo-store";
import { compareSupplierQuotes } from "@/lib/suppliers/comparator";

const AdvisorRequestSchema = z.object({
  query: z.string().min(2, "Query cannot be empty"),
  campaignId: z.string().min(1, "Campaign ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AdvisorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const campaign = demoStore.getCampaign(parsed.data.campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const comparisonData = compareSupplierQuotes(campaign);

    const { result, isFallback } = await askProcurementAdvisor(
      parsed.data.query,
      campaign,
      comparisonData
    );

    return NextResponse.json({
      success: true,
      data: result,
      isFallback,
      message: isFallback
        ? "Advisor analyzed using deterministic rule engine (GEMINI_API_KEY not configured)."
        : "Advisor analyzed using Google Gemini API.",
    });
  } catch (error: any) {
    console.error("Error in /api/ai/advisor:", error);
    return NextResponse.json(
      { error: "Failed to run procurement advisor", message: error.message },
      { status: 500 }
    );
  }
}
