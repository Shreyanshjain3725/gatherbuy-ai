import { Campaign, LandedCostBreakdown, SupplierQuote } from "../db/schema";
import { dollarsToCents, centsToDollars } from "../utils";

/**
 * Calculates total landed cost and comparative metrics for a supplier quote
 * against a campaign's total required item quantities.
 */
export function calculateSupplierLandedCost(
  campaign: Campaign,
  quote: SupplierQuote
): LandedCostBreakdown {
  // 1. Calculate items subtotal based on campaign's items or members' selections
  let itemsSubtotalCents = 0;
  let totalUnits = 0;
  const moqWarnings: string[] = [];

  for (const item of campaign.items) {
    // Find quantity demanded (sum of member selections or fallback to item target_quantity)
    const demandFromMembers = campaign.members.reduce((acc, member) => {
      const sel = member.selections.find((s) => s.item_id === item.id);
      return acc + (sel ? sel.quantity : 0);
    }, 0);

    const neededQuantity = Math.max(demandFromMembers, item.target_quantity);
    totalUnits += neededQuantity;

    const itemQuote = quote.item_quotes.find((iq) => iq.item_id === item.id);
    const unitPrice = itemQuote ? itemQuote.unit_price : item.unit_cost_estimate || 0;
    const moq = itemQuote ? itemQuote.minimum_order_quantity : 0;

    if (moq > 0 && neededQuantity < moq) {
      moqWarnings.push(
        `${item.name}: Demanded quantity (${neededQuantity}) is below MOQ (${moq}). Extra units may need to be ordered.`
      );
    }

    const itemTotalCents = dollarsToCents(neededQuantity * unitPrice);
    itemsSubtotalCents += itemTotalCents;
  }

  const shippingCents = dollarsToCents(quote.shipping_cost || 0);
  const discountCents = dollarsToCents(quote.discount_amount || 0);

  // Tax applied on taxable subtotal (items minus discount)
  const taxableCents = Math.max(0, itemsSubtotalCents - discountCents);
  const taxRate = (quote.tax_rate_percent || 0) / 100;
  const taxCents = Math.round(taxableCents * taxRate);

  const totalLandedCostCents = Math.max(
    0,
    itemsSubtotalCents + shippingCents + taxCents - discountCents
  );

  const totalLandedCost = centsToDollars(totalLandedCostCents);
  const effectiveUnitCostAvg = totalUnits > 0 ? totalLandedCost / totalUnits : 0;

  return {
    supplier_id: quote.id,
    supplier_name: quote.supplier_name,
    items_subtotal: centsToDollars(itemsSubtotalCents),
    shipping_cost: quote.shipping_cost,
    tax_amount: centsToDollars(taxCents),
    discount_amount: quote.discount_amount,
    total_landed_cost: totalLandedCost,
    effective_unit_cost_avg: Number(effectiveUnitCostAvg.toFixed(2)),
    estimated_delivery_days: quote.estimated_delivery_days,
    moq_satisfied: moqWarnings.length === 0,
    moq_warnings: moqWarnings,
    is_cheapest: false, // filled during comparison
    is_fastest: false,  // filled during comparison
    is_recommended: false, // filled during comparison
    score: 0,
    recommendation_reason: "",
  };
}

/**
 * Compares all supplier quotes for a campaign and generates rank, badges, and detailed reasons.
 */
export function compareSupplierQuotes(
  campaign: Campaign
): {
  breakdowns: LandedCostBreakdown[];
  bestOverall: LandedCostBreakdown | null;
  cheapest: LandedCostBreakdown | null;
  fastest: LandedCostBreakdown | null;
  withinBudget: LandedCostBreakdown[];
} {
  if (!campaign.supplier_quotes || campaign.supplier_quotes.length === 0) {
    return {
      breakdowns: [],
      bestOverall: null,
      cheapest: null,
      fastest: null,
      withinBudget: [],
    };
  }

  const breakdowns = campaign.supplier_quotes.map((q) =>
    calculateSupplierLandedCost(campaign, q)
  );

  // Identify minimum cost and minimum delivery
  let minCost = Infinity;
  let minDelivery = Infinity;

  for (const b of breakdowns) {
    if (b.total_landed_cost < minCost) minCost = b.total_landed_cost;
    if (b.estimated_delivery_days < minDelivery) minDelivery = b.estimated_delivery_days;
  }

  // Mark cheapest and fastest
  for (const b of breakdowns) {
    if (b.total_landed_cost === minCost) b.is_cheapest = true;
    if (b.estimated_delivery_days === minDelivery) b.is_fastest = true;
  }

  // Scoring Algorithm:
  // Weight 55% Cost Efficiency, 30% Delivery Speed, 15% MOQ & Compliance
  let bestScore = -1;
  let bestQuote: LandedCostBreakdown | null = null;

  for (const b of breakdowns) {
    const costRatio = minCost > 0 ? minCost / b.total_landed_cost : 1;
    const speedRatio = minDelivery > 0 ? minDelivery / b.estimated_delivery_days : 1;
    const moqScore = b.moq_satisfied ? 1.0 : 0.6;

    // Budget compliance bonus
    const budgetBonus =
      campaign.target_budget > 0 && b.total_landed_cost <= campaign.target_budget ? 1.1 : 0.9;

    const compositeScore =
      (costRatio * 55 + speedRatio * 30 + moqScore * 15) * budgetBonus;

    b.score = Number(compositeScore.toFixed(1));

    if (compositeScore > bestScore) {
      bestScore = compositeScore;
      bestQuote = b;
    }
  }

  if (bestQuote) {
    bestQuote.is_recommended = true;
  }

  // Generate clear explanations
  for (const b of breakdowns) {
    const reasons: string[] = [];
    if (b.is_recommended) {
      if (b.is_cheapest && b.is_fastest) {
        reasons.push("Optimal choice: lowest total landed cost and fastest shipping turnaround.");
      } else if (b.is_fastest && !b.is_cheapest) {
        const costDiff = b.total_landed_cost - minCost;
        reasons.push(
          `Recommended: Delivers in ${b.estimated_delivery_days} days (${b.estimated_delivery_days < minDelivery + 3 ? "rapid turnaround" : "on schedule"}). Premium over lowest quote is only $${costDiff.toFixed(2)}.`
        );
      } else if (b.is_cheapest) {
        reasons.push(
          `Recommended: Saves the group the most money with the lowest landed cost of $${b.total_landed_cost.toFixed(2)}.`
        );
      } else {
        reasons.push("Balanced choice between cost efficiency, reliable shipping, and MOQ compatibility.");
      }
    } else {
      if (b.total_landed_cost > minCost) {
        const diff = b.total_landed_cost - minCost;
        reasons.push(`$${diff.toFixed(2)} higher landed cost than the lowest quote.`);
      }
      if (b.estimated_delivery_days > minDelivery) {
        reasons.push(
          `${b.estimated_delivery_days - minDelivery} days slower delivery than fastest quote.`
        );
      }
      if (!b.moq_satisfied) {
        reasons.push("Has minimum order quantity restrictions that require purchasing extra inventory.");
      }
    }
    b.recommendation_reason = reasons.join(" ");
  }

  const cheapest = breakdowns.find((b) => b.is_cheapest) || null;
  const fastest = breakdowns.find((b) => b.is_fastest) || null;
  const withinBudget = breakdowns.filter(
    (b) => campaign.target_budget <= 0 || b.total_landed_cost <= campaign.target_budget
  );

  return {
    breakdowns,
    bestOverall: bestQuote,
    cheapest,
    fastest,
    withinBudget,
  };
}
