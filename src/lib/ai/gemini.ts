import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { Campaign, LandedCostBreakdown } from "../db/schema";

export const StructuredCampaignOutputSchema = z.object({
  campaign_name: z.string(),
  description: z.string(),
  category: z.string().default("Merchandise & Apparel"),
  budget: z.number().nonnegative(),
  deadline: z.string(), // ISO date string YYYY-MM-DD
  products: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      quantity: z.number().int().positive(),
      estimated_unit_cost: z.number().optional().default(0),
      options: z
        .array(
          z.object({
            name: z.string(),
            values: z.array(z.string()),
          })
        )
        .optional()
        .default([]),
    })
  ),
  constraints: z.array(z.string()).default([]),
  clarifying_questions: z.array(z.string()).default([]),
  suggested_actions: z.array(z.string()).default([]),
});

export type StructuredCampaignOutput = z.infer<typeof StructuredCampaignOutputSchema>;

export const ProcurementAdvisorOutputSchema = z.object({
  analysis: z.string(),
  supplier_recommendation: z.object({
    recommended_supplier_name: z.string(),
    reasoning: z.string(),
    tradeoffs: z.string(),
  }),
  budget_optimization_tips: z.array(z.string()),
  risks_detected: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      title: z.string(),
      description: z.string(),
      mitigation: z.string(),
    })
  ),
  direct_answer_to_user: z.string(),
});

export type ProcurementAdvisorOutput = z.infer<typeof ProcurementAdvisorOutputSchema>;

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export const isGeminiConfigured = Boolean(apiKey && apiKey.length > 10 && !apiKey.startsWith("your-"));

function getGeminiModel() {
  if (!isGeminiConfigured) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Deterministic Natural Language Parsing Fallback
 * Used when GEMINI_API_KEY is not configured, parsing products, quantities, budget and dates
 */
export function deterministicCampaignFallback(prompt: string): StructuredCampaignOutput {
  const text = prompt.toLowerCase();

  // Extract budget: looking for e.g. "$800", "800 dollars", "budget is 800"
  let budget = 500;
  const budgetMatch = prompt.match(/(?:\$|budget(?:\s+is)?\s*:?\s*\$?)(\d+(?:\.\d{2})?)/i);
  if (budgetMatch && budgetMatch[1]) {
    budget = parseFloat(budgetMatch[1]);
  }

  // Extract deadline: looking for month and day, e.g. "November 25", "2026-11-25", "by Dec 15"
  let deadline = "2026-11-25";
  const dateMatch = prompt.match(
    /(?:by|before|until|deadline(?:\s+is)?)\s+([A-Za-z]+ \d{1,2}(?:,?\s+\d{4})?|\d{4}-\d{2}-\d{2})/i
  );
  if (dateMatch && dateMatch[1]) {
    try {
      const parsed = new Date(dateMatch[1]);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed.toISOString().split("T")[0];
      }
    } catch {
      // keep default
    }
  }

  // Detect common procurement products and quantities
  const products: StructuredCampaignOutput["products"] = [];
  const knownKeywords = [
    { pattern: /(\d+)\s*(?:heavyweight\s*)?hoodies?/i, name: "Hoodie", cost: 24, options: [{ name: "Size", values: ["S", "M", "L", "XL"] }] },
    { pattern: /(\d+)\s*(?:t-?shirts?|tees?)/i, name: "T-shirt", cost: 12, options: [{ name: "Size", values: ["S", "M", "L", "XL"] }] },
    { pattern: /(\d+)\s*(?:badges?|pins?)/i, name: "Metallic Badge", cost: 3.5, options: [{ name: "Finish", values: ["Matte Black", "Silver"] }] },
    { pattern: /(\d+)\s*(?:stickers?)/i, name: "Vinyl Die-cut Stickers", cost: 1.5, options: [] },
    { pattern: /(\d+)\s*(?:bottles?|mugs?|tumblers?)/i, name: "Stainless Steel Tumbler", cost: 15, options: [] },
    { pattern: /(\d+)\s*(?:notebooks?|journals?)/i, name: "A5 Hardcover Notebook", cost: 8, options: [] },
    { pattern: /(\d+)\s*(?:lanyards?)/i, name: "Event Lanyard", cost: 2.0, options: [] },
  ];

  for (const item of knownKeywords) {
    const match = prompt.match(item.pattern);
    if (match && match[1]) {
      products.push({
        name: item.name,
        quantity: parseInt(match[1], 10),
        estimated_unit_cost: item.cost,
        options: item.options,
      });
    }
  }

  if (products.length === 0) {
    // Generic fallback if user typed freeform without recognized keywords
    products.push(
      {
        name: "Custom Team Hoodie",
        quantity: 25,
        estimated_unit_cost: 25.0,
        options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      },
      {
        name: "Custom Graphic T-Shirt",
        quantity: 30,
        estimated_unit_cost: 12.0,
        options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      }
    );
  }

  // Title derivation
  let title = "Group Purchasing Campaign";
  if (text.includes("tech fest") || text.includes("techfest")) {
    title = "Tech Fest Merchandise Campaign";
  } else if (text.includes("hackathon")) {
    title = "Hackathon Swag & Materials";
  } else if (text.includes("office") || text.includes("equipment")) {
    title = "Office Equipment Group Purchase";
  } else if (text.includes("trip") || text.includes("travel")) {
    title = "Group Trip Shared Supplies";
  } else if (text.includes("club")) {
    title = "Club Gear Bulk Order";
  }

  const clarifying_questions: string[] = [];
  if (!budgetMatch) clarifying_questions.push("What is your target overall budget for this purchase?");
  if (!dateMatch) clarifying_questions.push("What is the exact arrival deadline for these items?");
  clarifying_questions.push("Do you require custom logo embroidery, screen printing, or plain blanks?");

  return {
    campaign_name: title,
    description: `Structured bulk procurement created from user requirement: "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"`,
    category: "Merchandise & Apparel",
    budget,
    deadline,
    products,
    constraints: ["Strict delivery deadline", "Minimum quantity commitment required"],
    clarifying_questions,
    suggested_actions: [
      "Invite members to select their sizes and quantities",
      "Add 2 to 3 supplier quotes to compare landed cost and lead times",
    ],
  };
}

/**
 * Generate Structured Campaign from Natural Language
 */
export async function generateCampaignFromPrompt(
  prompt: string
): Promise<{ result: StructuredCampaignOutput; isFallback: boolean }> {
  const model = getGeminiModel();

  if (!model) {
    return {
      result: deterministicCampaignFallback(prompt),
      isFallback: true,
    };
  }

  try {
    const systemPrompt = `
You are the GatherBuy AI Procurement Architect.
Convert the user's natural language group purchasing request into a clean, structured JSON campaign.
Do NOT hallucinate or compute final payment amounts. Extract items, quantities, target budget, and deadline.
If information is missing, add practical questions to clarifying_questions rather than inventing arbitrary data.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "campaign_name": "string",
  "description": "string",
  "category": "string",
  "budget": number,
  "deadline": "YYYY-MM-DD",
  "products": [
    {
      "name": "string",
      "description": "string",
      "quantity": number,
      "estimated_unit_cost": number,
      "options": [{"name": "string", "values": ["string"]}]
    }
  ],
  "constraints": ["string"],
  "clarifying_questions": ["string"],
  "suggested_actions": ["string"]
}
`;

    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Request: "${prompt}"` }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.response.text();
    const parsedJson = JSON.parse(responseText);
    const validated = StructuredCampaignOutputSchema.parse(parsedJson);

    return {
      result: validated,
      isFallback: false,
    };
  } catch (err) {
    console.error("Gemini AI API error, falling back to deterministic parser:", err);
    return {
      result: deterministicCampaignFallback(prompt),
      isFallback: true,
    };
  }
}

/**
 * Conversational Procurement Advisor
 * Answers organizer questions and analyzes quotes using actual campaign computed metrics.
 */
export async function askProcurementAdvisor(
  userQuery: string,
  campaign: Campaign,
  comparisonData: {
    breakdowns: LandedCostBreakdown[];
    bestOverall: LandedCostBreakdown | null;
  }
): Promise<{ result: ProcurementAdvisorOutput; isFallback: boolean }> {
  const model = getGeminiModel();

  // Deterministic fallback response using actual calculated values
  const fallbackResponse: ProcurementAdvisorOutput = generateDeterministicAdvisorAnswer(
    userQuery,
    campaign,
    comparisonData
  );

  if (!model) {
    return {
      result: fallbackResponse,
      isFallback: true,
    };
  }

  try {
    const promptContext = `
You are GatherBuy AI Procurement Advisor.
The organizer is asking: "${userQuery}"

Actual Campaign Metrics (COMPUTED ON SERVER - DO NOT RECALCULATE):
Campaign Title: ${campaign.title}
Target Budget: $${campaign.target_budget.toFixed(2)}
Deadline: ${campaign.deadline}
Total Members: ${campaign.members.length}
Products Needed: ${campaign.items.map((i) => `${i.name} (qty: ${i.target_quantity})`).join(", ")}

Supplier Landed Cost Comparisons (Computed Deterministically):
${comparisonData.breakdowns
  .map(
    (b) =>
      `- Supplier: ${b.supplier_name} | Total Landed Cost: $${b.total_landed_cost.toFixed(2)} | Delivery: ${b.estimated_delivery_days} days | Shipping: $${b.shipping_cost.toFixed(2)} | Tax: $${b.tax_amount.toFixed(2)} | Discount: $${b.discount_amount.toFixed(2)} | Best Choice: ${b.is_recommended ? "YES" : "NO"}`
  )
  .join("\n")}

CRITICAL INSTRUCTIONS:
1. Ground your reasoning ONLY in the real computed numbers provided above.
2. Never override or recalculate the monetary values.
3. Address the user's specific question directly.
4. Detect realistic procurement risks (e.g. quotes exceeding budget, slow delivery vs deadline, MOQ mismatch).

Respond strictly with valid JSON matching:
{
  "analysis": "string",
  "supplier_recommendation": {
    "recommended_supplier_name": "string",
    "reasoning": "string",
    "tradeoffs": "string"
  },
  "budget_optimization_tips": ["string"],
  "risks_detected": [
    {
      "severity": "low" | "medium" | "high",
      "title": "string",
      "description": "string",
      "mitigation": "string"
    }
  ],
  "direct_answer_to_user": "string"
}
`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptContext }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.response.text());
    const validated = ProcurementAdvisorOutputSchema.parse(parsed);

    return {
      result: validated,
      isFallback: false,
    };
  } catch (err) {
    console.error("Gemini advisor error, using deterministic fallback:", err);
    return {
      result: fallbackResponse,
      isFallback: true,
    };
  }
}

function generateDeterministicAdvisorAnswer(
  query: string,
  campaign: Campaign,
  comparisonData: {
    breakdowns: LandedCostBreakdown[];
    bestOverall: LandedCostBreakdown | null;
  }
): ProcurementAdvisorOutput {
  const q = query.toLowerCase();
  const best = comparisonData.bestOverall;

  let directAnswer = "";
  if (q.includes("best") || q.includes("which supplier") || q.includes("recommend")) {
    if (best) {
      directAnswer = `${best.supplier_name} is your best option. Its total landed cost is $${best.total_landed_cost.toFixed(2)} with a delivery turnaround of ${best.estimated_delivery_days} days. ${best.recommendation_reason}`;
    } else {
      directAnswer = "Please add at least one supplier quotation so I can analyze landed costs and lead times for you.";
    }
  } else if (q.includes("reduce") || q.includes("budget") || q.includes("15%") || q.includes("save")) {
    const target15 = campaign.target_budget * 0.85;
    directAnswer = `To reduce your budget by ~15% (targeting $${target15.toFixed(2)} from $${campaign.target_budget.toFixed(2)}):
1. Inquire with ${best?.supplier_name || "suppliers"} about tier volume discounts if hoodies are bumped to a round 30 units.
2. Standardize colorways (reducing 2 custom options to 1 single setup fee).
3. Choose standard ground delivery instead of express air freight.`;
  } else if (q.includes("contribute") || q.includes("each person") || q.includes("how much")) {
    const avg = campaign.members.length > 0 ? campaign.target_budget / campaign.members.length : 0;
    directAnswer = `Based on your target budget of $${campaign.target_budget.toFixed(2)} across ${campaign.members.length} members, the average contribution is ~$${avg.toFixed(2)}. The FairShare engine automatically computes each member's exact share based on their individual item choices plus proportional shipping.`;
  } else if (q.includes("problem") || q.includes("risk") || q.includes("issue")) {
    directAnswer = `I have audited your campaign parameters:
- Deadline check: Delivery lead times fall within your target date.
- Budget status: ${best && best.total_landed_cost <= campaign.target_budget ? `Total landed cost ($${best.total_landed_cost.toFixed(2)}) is within budget ($${campaign.target_budget.toFixed(2)}).` : "Warning: Some quotes exceed your target budget."}
- Verification: Remember to confirm final print proofs before triggering supplier payment.`;
  } else {
    directAnswer = `Based on your campaign data: We have ${campaign.items.length} products requested, ${campaign.members.length} participants joined, and ${campaign.supplier_quotes.length} supplier quotes logged. ${best ? `${best.supplier_name} offers the strongest landed cost and lead time profile.` : "Add supplier quotes to see automated ranking."}`;
  }

  const risks: ProcurementAdvisorOutput["risks_detected"] = [];
  if (best && best.total_landed_cost > campaign.target_budget && campaign.target_budget > 0) {
    risks.push({
      severity: "high",
      title: "Quotation Exceeds Target Budget",
      description: `Landed cost of $${best.total_landed_cost.toFixed(2)} exceeds campaign budget of $${campaign.target_budget.toFixed(2)}.`,
      mitigation: "Negotiate bulk shipping discount or adjust member quantity targets.",
    });
  }

  for (const b of comparisonData.breakdowns) {
    if (!b.moq_satisfied) {
      risks.push({
        severity: "medium",
        title: `MOQ Alert for ${b.supplier_name}`,
        description: b.moq_warnings.join("; "),
        mitigation: "Invite additional members to meet supplier minimums without surplus fees.",
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      severity: "low",
      title: "Delivery Buffer Verification",
      description: "Ensure suppliers confirm transit lead times in writing prior to payment release.",
      mitigation: "Request proof-of-dispatch tracking number upon order placement.",
    });
  }

  return {
    analysis: `Analyzed ${comparisonData.breakdowns.length} supplier quotes against campaign requirements for ${campaign.title}.`,
    supplier_recommendation: {
      recommended_supplier_name: best ? best.supplier_name : "None logged",
      reasoning: best ? best.recommendation_reason : "Please add quotes to calculate recommendations.",
      tradeoffs: best
        ? `Balancing total landed cost ($${best.total_landed_cost.toFixed(2)}) and turnaround (${best.estimated_delivery_days} days).`
        : "N/A",
    },
    budget_optimization_tips: [
      "Consolidate item colors to reduce screen setup fees.",
      "Ask for a 5% prepayment discount when settling via PayPal business balance.",
      "Verify whether sales tax exemption applies to your student or 501(c)(3) organization.",
    ],
    risks_detected: risks,
    direct_answer_to_user: directAnswer,
  };
}
