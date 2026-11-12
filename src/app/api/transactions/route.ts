import { NextResponse } from "next/server";
import { demoStore } from "@/lib/db/demo-store";

export async function GET() {
  try {
    const transactions = demoStore.listTransactions();
    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transactions", message: error.message },
      { status: 500 }
    );
  }
}
