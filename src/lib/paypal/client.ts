const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
export const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";

export const isPayPalConfigured = Boolean(
  PAYPAL_CLIENT_ID &&
    PAYPAL_CLIENT_SECRET &&
    !PAYPAL_CLIENT_ID.startsWith("your-") &&
    !PAYPAL_CLIENT_SECRET.startsWith("your-") &&
    PAYPAL_CLIENT_ID.length > 10
);

/**
 * Obtain an OAuth2 access token from PayPal Sandbox
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured) {
    throw new Error(
      "PayPal Sandbox credentials are not configured in environment variables."
    );
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain PayPal OAuth token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export interface CreateOrderParams {
  amount: number; // e.g. 67.45
  currency?: string;
  campaignId: string;
  memberId: string;
  campaignTitle: string;
  description?: string;
  breakdown?: {
    itemTotal: number;
    shipping: number;
    taxTotal: number;
    discount: number;
  };
}

/**
 * Creates an authorized PayPal Order via PayPal Orders API v2
 */
export async function createPayPalOrder(params: CreateOrderParams) {
  const accessToken = await getPayPalAccessToken();

  const currency = params.currency || PAYPAL_CURRENCY;
  const formattedAmount = params.amount.toFixed(2);

  const purchaseUnit: Record<string, unknown> = {
    reference_id: `camp-${params.campaignId}-mem-${params.memberId}`,
    description: `GatherBuy AI: ${params.campaignTitle.slice(0, 80)}`,
    custom_id: JSON.stringify({
      campaign_id: params.campaignId,
      member_id: params.memberId,
    }),
    amount: {
      currency_code: currency,
      value: formattedAmount,
    },
  };

  // If breakdown is present and adds up accurately, include it
  if (params.breakdown) {
    const b = params.breakdown;
    const computedTotal = b.itemTotal + b.shipping + b.taxTotal - b.discount;
    if (Math.abs(computedTotal - params.amount) < 0.01) {
      (purchaseUnit.amount as Record<string, unknown>).breakdown = {
        item_total: { currency_code: currency, value: b.itemTotal.toFixed(2) },
        shipping: { currency_code: currency, value: b.shipping.toFixed(2) },
        tax_total: { currency_code: currency, value: b.taxTotal.toFixed(2) },
        discount: { currency_code: currency, value: b.discount.toFixed(2) },
      };
    }
  }

  const payload = {
    intent: "CAPTURE",
    purchase_units: [purchaseUnit],
    application_context: {
      brand_name: "GatherBuy AI",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(
      `PayPal Create Order API error: ${JSON.stringify(responseData)}`
    );
  }

  return responseData;
}

/**
 * Captures payment for an approved PayPal Order via PayPal Orders API v2
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(
      `PayPal Capture Order API error: ${JSON.stringify(responseData)}`
    );
  }

  return responseData;
}

/**
 * Verifies that the capture completed successfully and amounts match expected value
 */
export function verifyCaptureData(
  captureResponse: Record<string, any>,
  expectedAmount: number,
  expectedCurrency: string = "USD"
): {
  verified: boolean;
  captureId?: string;
  payerEmail?: string;
  payerName?: string;
  errorMessage?: string;
} {
  const status = captureResponse.status;
  if (status !== "COMPLETED") {
    return {
      verified: false,
      errorMessage: `Order capture returned non-completed status: '${status}'`,
    };
  }

  const purchaseUnits = captureResponse.purchase_units || [];
  if (purchaseUnits.length === 0) {
    return { verified: false, errorMessage: "Missing purchase units in capture data." };
  }

  const captures = purchaseUnits[0].payments?.captures || [];
  if (captures.length === 0) {
    return { verified: false, errorMessage: "Missing payment captures in capture data." };
  }

  const capture = captures[0];
  const capturedAmount = parseFloat(capture.amount?.value || "0");
  const capturedCurrency = capture.amount?.currency_code;

  if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
    return {
      verified: false,
      errorMessage: `Captured amount ($${capturedAmount}) did not match expected amount ($${expectedAmount}).`,
    };
  }

  if (capturedCurrency !== expectedCurrency) {
    return {
      verified: false,
      errorMessage: `Captured currency (${capturedCurrency}) did not match expected currency (${expectedCurrency}).`,
    };
  }

  const payer = captureResponse.payer || {};
  const payerName = payer.name
    ? `${payer.name.given_name || ""} ${payer.name.surname || ""}`.trim()
    : undefined;

  return {
    verified: true,
    captureId: capture.id,
    payerEmail: payer.email_address,
    payerName,
  };
}
