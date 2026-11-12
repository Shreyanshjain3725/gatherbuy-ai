import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCampaignFromPrompt } from "@/lib/ai/gemini";

const RequestSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { result, isFallback } = await generateCampaignFromPrompt(
      parsed.data.prompt
    );

    return NextResponse.json({
      success: true,
      data: result,
      isFallback,
      message: isFallback
        ? "AI generated using built-in deterministic procurement engine (GEMINI_API_KEY not configured)."
        : "AI generated using Google Gemini API.",
    });
  } catch (error: any) {
    console.error("Error in /api/ai/campaign:", error);
    return NextResponse.json(
      { error: "Failed to process campaign requirement", message: error.message },
      { status: 500 }
    );
  }
}
