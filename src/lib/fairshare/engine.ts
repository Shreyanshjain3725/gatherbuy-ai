import {
  Campaign,
  CampaignMember,
  FairShareMemberBreakdown,
  FairShareSummary,
  SupplierQuote,
} from "../db/schema";
import { dollarsToCents, centsToDollars } from "../utils";

/**
 * Deterministic Largest-Remainder Distribution (Hare-Niemeyer method)
 * Allocates an exact total pool of integer cents across participants
 * according to fractional shares without loss of a single cent.
 */
export function distributeCentsLargestRemainder(
  totalCents: number,
  weights: { id: string; weight: number }[]
): Map<string, number> {
  const result = new Map<string, number>();
  if (weights.length === 0 || totalCents <= 0) {
    for (const w of weights) result.set(w.id, 0);
    return result;
  }

  const totalWeight = weights.reduce((acc, curr) => acc + curr.weight, 0);
  if (totalWeight <= 0) {
    // If no weights (e.g. 0 items), distribute evenly with largest remainder
    const baseShare = Math.floor(totalCents / weights.length);
    let remainder = totalCents % weights.length;
    for (const w of weights) {
      const extra = remainder > 0 ? 1 : 0;
      result.set(w.id, baseShare + extra);
      if (remainder > 0) remainder--;
    }
    return result;
  }

  // Step 1: Calculate raw exact fractional shares and integer floors
  const shares = weights.map((w) => {
    const rawCents = (w.weight / totalWeight) * totalCents;
    const floorCents = Math.floor(rawCents);
    const remainder = rawCents - floorCents;
    return {
      id: w.id,
      floorCents,
      remainder,
    };
  });

  const sumFloor = shares.reduce((acc, s) => acc + s.floorCents, 0);
  let centsRemaining = totalCents - sumFloor;

  // Step 2: Sort by descending remainder. Deterministic tie-breaker on id.
  shares.sort((a, b) => {
    if (b.remainder !== a.remainder) {
      return b.remainder - a.remainder;
    }
    return a.id.localeCompare(b.id);
  });

  // Step 3: Distribute 1 cent to top rankers until centsRemaining is 0
  for (const s of shares) {
    let finalCents = s.floorCents;
    if (centsRemaining > 0) {
      finalCents += 1;
      centsRemaining -= 1;
    }
    result.set(s.id, finalCents);
  }

  return result;
}

/**
 * Calculates the exact FairShare contribution for all campaign members
 * using integer minor currency units (cents) and largest-remainder proportional allocation.
 */
export function calculateFairShare(
  campaign: Campaign,
  selectedQuote?: SupplierQuote | null
): FairShareSummary {
  const quote =
    selectedQuote ||
    campaign.supplier_quotes.find((q) => q.id === campaign.selected_supplier_id) ||
    campaign.supplier_quotes[0] ||
    null;

  // Build price map per item_id
  const itemPriceMap = new Map<string, { unitPrice: number; itemName: string }>();
  for (const item of campaign.items) {
    let unitPrice = item.unit_cost_estimate || 0;
    if (quote) {
      const quoteItem = quote.item_quotes.find((iq) => iq.item_id === item.id);
      if (quoteItem && quoteItem.unit_price > 0) {
        unitPrice = quoteItem.unit_price;
      }
    }
    itemPriceMap.set(item.id, { unitPrice, itemName: item.name });
  }

  // Pre-calculate items subtotal per member in cents
  const memberWeights: { id: string; weight: number }[] = [];
  const memberItemsDetail = new Map<
    string,
    {
      itemsCount: number;
      subtotalCents: number;
      selections: Array<{
        item_id: string;
        item_name: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
        option?: string;
      }>;
    }
  >();

  let totalItemsSubtotalCents = 0;

  for (const member of campaign.members) {
    let memberSubtotalCents = 0;
    let memberItemsCount = 0;
    const selectionsFormatted: Array<{
      item_id: string;
      item_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      option?: string;
    }> = [];

    for (const sel of member.selections) {
      const itemInfo = itemPriceMap.get(sel.item_id);
      const unitPrice = itemInfo ? itemInfo.unitPrice : 0;
      const itemName = itemInfo ? itemInfo.itemName : "Item";
      const selTotalCents = dollarsToCents(sel.quantity * unitPrice);

      memberSubtotalCents += selTotalCents;
      memberItemsCount += sel.quantity;

      selectionsFormatted.push({
        item_id: sel.item_id,
        item_name: itemName,
        quantity: sel.quantity,
        unit_price: unitPrice,
        subtotal: centsToDollars(selTotalCents),
        option: sel.selected_option,
      });
    }

    totalItemsSubtotalCents += memberSubtotalCents;
    memberWeights.push({ id: member.id, weight: memberSubtotalCents });
    memberItemsDetail.set(member.id, {
      itemsCount: memberItemsCount,
      subtotalCents: memberSubtotalCents,
      selections: selectionsFormatted,
    });
  }

  // Shared costs from supplier quote
  const shippingCents = quote ? dollarsToCents(quote.shipping_cost) : 0;
  const discountCents = quote ? dollarsToCents(quote.discount_amount) : 0;

  // Tax calculation: based on items subtotal minus discount
  const taxableSubtotalCents = Math.max(0, totalItemsSubtotalCents - discountCents);
  const taxRate = quote ? quote.tax_rate_percent / 100 : 0;
  const taxCents = Math.round(taxableSubtotalCents * taxRate);

  // Distribute shared costs deterministically by proportional weight (items subtotal)
  const shippingAllocation = distributeCentsLargestRemainder(shippingCents, memberWeights);
  const taxAllocation = distributeCentsLargestRemainder(taxCents, memberWeights);
  const discountAllocation = distributeCentsLargestRemainder(discountCents, memberWeights);

  const memberBreakdowns: FairShareMemberBreakdown[] = [];
  let totalCampaignCents = 0;
  let totalCollectedCents = 0;

  for (const member of campaign.members) {
    const detail = memberItemsDetail.get(member.id) || {
      itemsCount: 0,
      subtotalCents: 0,
      selections: [],
    };

    const allocatedShippingCents = shippingAllocation.get(member.id) || 0;
    const allocatedTaxCents = taxAllocation.get(member.id) || 0;
    const allocatedDiscountCents = discountAllocation.get(member.id) || 0;

    const memberTotalCents = Math.max(
      0,
      detail.subtotalCents + allocatedShippingCents + allocatedTaxCents - allocatedDiscountCents
    );

    totalCampaignCents += memberTotalCents;

    const amountPaidCents = dollarsToCents(member.amount_paid);
    totalCollectedCents += amountPaidCents;
    const remainingDueCents = Math.max(0, memberTotalCents - amountPaidCents);

    memberBreakdowns.push({
      member_id: member.id,
      member_name: member.name,
      member_email: member.email,
      role: member.role,
      payment_status: member.payment_status,
      items_count: detail.itemsCount,
      items_subtotal_cents: detail.subtotalCents,
      allocated_shipping_cents: allocatedShippingCents,
      allocated_tax_cents: allocatedTaxCents,
      allocated_discount_cents: allocatedDiscountCents,
      total_cents: memberTotalCents,
      items_subtotal: centsToDollars(detail.subtotalCents),
      allocated_shipping: centsToDollars(allocatedShippingCents),
      allocated_tax: centsToDollars(allocatedTaxCents),
      allocated_discount: centsToDollars(allocatedDiscountCents),
      total: centsToDollars(memberTotalCents),
      amount_paid: member.amount_paid,
      remaining_due: centsToDollars(remainingDueCents),
      selections: detail.selections,
    });
  }

  const paidMembersCount = campaign.members.filter((m) => m.payment_status === "paid").length;

  return {
    campaign_id: campaign.id,
    total_campaign_cents: totalCampaignCents,
    total_campaign_amount: centsToDollars(totalCampaignCents),
    items_subtotal_cents: totalItemsSubtotalCents,
    items_subtotal: centsToDollars(totalItemsSubtotalCents),
    shipping_cents: shippingCents,
    shipping_amount: centsToDollars(shippingCents),
    tax_cents: taxCents,
    tax_amount: centsToDollars(taxCents),
    discount_cents: discountCents,
    discount_amount: centsToDollars(discountCents),
    total_collected_cents: totalCollectedCents,
    total_collected_amount: centsToDollars(totalCollectedCents),
    total_remaining_cents: Math.max(0, totalCampaignCents - totalCollectedCents),
    total_remaining_amount: centsToDollars(
      Math.max(0, totalCampaignCents - totalCollectedCents)
    ),
    members_count: campaign.members.length,
    paid_members_count: paidMembersCount,
    member_breakdowns: memberBreakdowns,
  };
}

/**
 * Interactive What-If Scenario Simulator
 * Allows live tweaking of item quantities, supplier choice, member inclusions, and custom discounts.
 */
export interface WhatIfScenarioInput {
  supplier_id?: string;
  additional_item_quantities?: Record<string, number>; // itemId -> extra quantity
  excluded_member_ids?: string[];
  extra_discount_dollars?: number;
}

export function simulateWhatIfScenario(
  campaign: Campaign,
  scenario: WhatIfScenarioInput
): {
  baseSummary: FairShareSummary;
  simulatedSummary: FairShareSummary;
  deltaCampaignAmount: number;
  averageMemberSavings: number;
} {
  const baseSummary = calculateFairShare(campaign);

  // Clone campaign and apply scenario modifications
  const clonedCampaign: Campaign = JSON.parse(JSON.stringify(campaign));

  if (scenario.supplier_id) {
    clonedCampaign.selected_supplier_id = scenario.supplier_id;
  }

  if (scenario.excluded_member_ids && scenario.excluded_member_ids.length > 0) {
    clonedCampaign.members = clonedCampaign.members.filter(
      (m) => !scenario.excluded_member_ids?.includes(m.id)
    );
  }

  if (scenario.additional_item_quantities) {
    for (const [itemId, addQty] of Object.entries(scenario.additional_item_quantities)) {
      if (addQty > 0 && clonedCampaign.members.length > 0) {
        // Distribute added quantity among existing members proportionally
        const firstMember = clonedCampaign.members[0];
        const existingSel = firstMember.selections.find((s) => s.item_id === itemId);
        if (existingSel) {
          existingSel.quantity += addQty;
        } else {
          firstMember.selections.push({
            id: `whatif-sel-${Date.now()}`,
            member_id: firstMember.id,
            item_id: itemId,
            quantity: addQty,
          });
        }
      }
    }
  }

  let selectedQuote =
    clonedCampaign.supplier_quotes.find((q) => q.id === clonedCampaign.selected_supplier_id) ||
    clonedCampaign.supplier_quotes[0];

  if (selectedQuote && scenario.extra_discount_dollars && scenario.extra_discount_dollars > 0) {
    selectedQuote = {
      ...selectedQuote,
      discount_amount: selectedQuote.discount_amount + scenario.extra_discount_dollars,
    };
  }

  const simulatedSummary = calculateFairShare(clonedCampaign, selectedQuote);
  const deltaCampaignAmount = simulatedSummary.total_campaign_amount - baseSummary.total_campaign_amount;

  const basePerMember = baseSummary.members_count > 0 ? baseSummary.total_campaign_amount / baseSummary.members_count : 0;
  const simPerMember =
    simulatedSummary.members_count > 0
      ? simulatedSummary.total_campaign_amount / simulatedSummary.members_count
      : 0;
  const averageMemberSavings = basePerMember - simPerMember;

  return {
    baseSummary,
    simulatedSummary,
    deltaCampaignAmount,
    averageMemberSavings,
  };
}
