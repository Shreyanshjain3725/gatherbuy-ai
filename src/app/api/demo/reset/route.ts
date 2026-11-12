import { NextResponse } from "next/server";
import { demoStore } from "@/lib/db/demo-store";

export async function POST() {
  try {
    demoStore.reset();
    return NextResponse.json({
      success: true,
      message: "Demo dataset reset successfully to initial state.",
      campaignId: "camp-techfest-2026",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to reset demo dataset", message: error.message },
      { status: 500 }
    );
  }
}
