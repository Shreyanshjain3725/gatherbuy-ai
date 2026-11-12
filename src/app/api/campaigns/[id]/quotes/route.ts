import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/db/demo-store";
import { compareSupplierQuotes } from "@/lib/suppliers/comparator";

const AddQuoteSchema = z.object({
  supplier_name: z.string().min(2, "Supplier name is required"),
  contact_email: z.string().email().optional().or(z.literal("")),
  item_quotes: z.array(
    z.object({
      item_id: z.string().min(1),
      unit_price: z.number().nonnegative(),
      minimum_order_quantity: z.number().int().nonnegative().default(0),
    })
  ),
  shipping_cost: z.number().nonnegative().default(0),
  tax_rate_percent: z.number().nonnegative().default(0),
  discount_amount: z.number().nonnegative().default(0),
  estimated_delivery_days: z.number().int().positive().default(7),
  notes: z.string().optional().default(""),
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
    const parsed = AddQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const res = demoStore.addSupplierQuote(campaignId, {
      ...parsed.data,
      campaign_id: campaignId,
    });
    if (!res) {
      return NextResponse.json(
        { error: "Failed to add quotation" },
        { status: 500 }
      );
    }

    const comparison = compareSupplierQuotes(res.campaign);

    return NextResponse.json({
      success: true,
      data: {
        campaign: res.campaign,
        quote: res.quote,
        comparison,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save quotation", message: error.message },
      { status: 500 }
    );
  }
}
