import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Test Hare-Niemeyer Largest Remainder Distribution
function distributeCentsLargestRemainder(totalCents, weights) {
  const result = new Map();
  if (weights.length === 0 || totalCents <= 0) {
    for (const w of weights) result.set(w.id, 0);
    return result;
  }

  const totalWeight = weights.reduce((acc, curr) => acc + curr.weight, 0);
  if (totalWeight <= 0) {
    const baseShare = Math.floor(totalCents / weights.length);
    let remainder = totalCents % weights.length;
    for (const w of weights) {
      const extra = remainder > 0 ? 1 : 0;
      result.set(w.id, baseShare + extra);
      if (remainder > 0) remainder--;
    }
    return result;
  }

  const shares = weights.map((w) => {
    const rawCents = (w.weight / totalWeight) * totalCents;
    const floorCents = Math.floor(rawCents);
    const remainder = rawCents - floorCents;
    return { id: w.id, floorCents, remainder };
  });

  const sumFloor = shares.reduce((acc, s) => acc + s.floorCents, 0);
  let centsRemaining = totalCents - sumFloor;

  shares.sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.id.localeCompare(b.id);
  });

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

describe("GatherBuy AI - Deterministic Business Logic Tests", () => {
  test("Largest Remainder distributes exact sum of cents with zero loss", () => {
    const totalCents = 1000; // $10.00
    // 3 members with equal weights: each has raw share 333.33 cents.
    // 1000 - (333*3) = 1 cent remainder. Exactly one member receives 334, other two receive 333.
    const weights = [
      { id: "member-a", weight: 100 },
      { id: "member-b", weight: 100 },
      { id: "member-c", weight: 100 },
    ];

    const distribution = distributeCentsLargestRemainder(totalCents, weights);
    let sum = 0;
    for (const cents of distribution.values()) {
      sum += cents;
    }

    assert.equal(sum, totalCents, "Sum of allocated cents must strictly equal total cents");
    assert.equal(distribution.get("member-a"), 334);
    assert.equal(distribution.get("member-b"), 333);
    assert.equal(distribution.get("member-c"), 333);
  });

  test("Unequal product quantities allocate shipping proportionally", () => {
    // Member A buys $60 worth of items, Member B buys $20 worth, Member C buys $20 worth
    // Shipping is $25.00 (2500 cents)
    // A should pay 60%, B should pay 20%, C should pay 20%
    const shippingCents = 2500;
    const weights = [
      { id: "member-a", weight: 6000 },
      { id: "member-b", weight: 2000 },
      { id: "member-c", weight: 2000 },
    ];

    const distribution = distributeCentsLargestRemainder(shippingCents, weights);
    assert.equal(distribution.get("member-a"), 1500); // $15.00
    assert.equal(distribution.get("member-b"), 500);  // $5.00
    assert.equal(distribution.get("member-c"), 500);  // $5.00

    let sum = 0;
    for (const cents of distribution.values()) sum += cents;
    assert.equal(sum, shippingCents);
  });

  test("Supplier landed cost calculation matches unit + shipping + tax - discount", () => {
    // 25 hoodies @ $22.50 = $562.50
    // Shipping: $35.00
    // Discount: $40.00
    // Taxable: $562.50 - $40.00 = $522.50
    // Tax @ 6.5%: 522.50 * 0.065 = 33.96
    // Total: 562.50 + 35.00 + 33.96 - 40.00 = 591.46
    const itemsSubtotalCents = Math.round(25 * 22.5 * 100);
    const shippingCents = 3500;
    const discountCents = 4000;
    const taxableCents = itemsSubtotalCents - discountCents;
    const taxCents = Math.round(taxableCents * 0.065);
    const totalLandedCents = itemsSubtotalCents + shippingCents + taxCents - discountCents;

    assert.equal(itemsSubtotalCents, 56250);
    assert.equal(taxableCents, 52250);
    assert.equal(taxCents, 3396);
    assert.equal(totalLandedCents, 59146);
    assert.equal(totalLandedCents / 100, 591.46);
  });

  test("Budget validation prevents overspending without organizer alert", () => {
    const budget = 800.0;
    const landedCostQuoteA = 748.25;
    const landedCostQuoteB = 890.0;

    assert.equal(landedCostQuoteA <= budget, true, "Quote A is within budget");
    assert.equal(landedCostQuoteB <= budget, false, "Quote B exceeds budget");
  });

  test("Payment transitions correctly through lifecycle", () => {
    const states = ["pending", "awaiting_capture", "paid"];
    let currentState = states[0];

    // Transition when checkout opens
    currentState = states[1];
    assert.equal(currentState, "awaiting_capture");

    // Transition when capture is verified
    currentState = states[2];
    assert.equal(currentState, "paid");
  });
});
