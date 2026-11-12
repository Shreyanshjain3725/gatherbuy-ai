import {
  Campaign,
  CampaignActivity,
  CampaignMember,
  PaymentTransaction,
  SupplierQuote,
} from "./schema";
import {
  initialSeedCampaign,
  initialSeedTransactions,
  DEMO_CAMPAIGN_ID,
  DEMO_INVITE_CODE,
} from "./seed-data";

// In-memory server store for demo mode
class InMemoryDemoStore {
  private campaigns: Map<string, Campaign> = new Map();
  private transactions: PaymentTransaction[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.campaigns.clear();
    // Deep clone initial seed data
    const clone = JSON.parse(JSON.stringify(initialSeedCampaign)) as Campaign;
    this.campaigns.set(clone.id, clone);
    this.transactions = JSON.parse(JSON.stringify(initialSeedTransactions));
  }

  public listCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  public getCampaign(idOrInvite: string): Campaign | null {
    if (this.campaigns.has(idOrInvite)) {
      return this.campaigns.get(idOrInvite)!;
    }
    for (const camp of Array.from(this.campaigns.values())) {
      if (camp.invite_code.toUpperCase() === idOrInvite.toUpperCase()) {
        return camp;
      }
    }
    return null;
  }

  public saveCampaign(campaign: Campaign): Campaign {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  public addMember(
    campaignId: string,
    member: Omit<CampaignMember, "id" | "joined_at" | "payment_status" | "amount_paid">
  ): { campaign: Campaign; member: CampaignMember } | null {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const newMember: CampaignMember = {
      ...member,
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      joined_at: new Date().toISOString(),
      payment_status: "pending",
      amount_paid: 0,
    };

    campaign.members.push(newMember);

    // Record activity
    campaign.activities.unshift({
      id: `act-${Date.now()}`,
      campaign_id: campaign.id,
      actor_name: newMember.name,
      action_type: "member_joined",
      message: `${newMember.name} joined the campaign with ${newMember.selections.length} item selections.`,
      created_at: new Date().toISOString(),
    });

    this.saveCampaign(campaign);
    return { campaign, member: newMember };
  }

  public addSupplierQuote(
    campaignId: string,
    quote: Omit<SupplierQuote, "id" | "created_at" | "campaign_id"> & {
      campaign_id?: string;
    }
  ): { campaign: Campaign; quote: SupplierQuote } | null {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const newQuote: SupplierQuote = {
      ...quote,
      campaign_id: quote.campaign_id || campaignId,
      id: `quote-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    campaign.supplier_quotes.push(newQuote);

    // Record activity
    campaign.activities.unshift({
      id: `act-${Date.now()}`,
      campaign_id: campaign.id,
      actor_name: campaign.organizer_name,
      action_type: "quote_added",
      message: `Added supplier quotation from '${newQuote.supplier_name}'.`,
      created_at: new Date().toISOString(),
    });

    this.saveCampaign(campaign);
    return { campaign, quote: newQuote };
  }

  public selectSupplier(campaignId: string, supplierId: string): Campaign | null {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const quote = campaign.supplier_quotes.find((q) => q.id === supplierId);
    if (!quote) return null;

    campaign.selected_supplier_id = supplierId;

    campaign.activities.unshift({
      id: `act-${Date.now()}`,
      campaign_id: campaign.id,
      actor_name: campaign.organizer_name,
      action_type: "status_changed",
      message: `Selected '${quote.supplier_name}' as the active supplier for this campaign.`,
      created_at: new Date().toISOString(),
    });

    this.saveCampaign(campaign);
    return campaign;
  }

  public recordPayment(
    campaignId: string,
    memberId: string,
    paymentData: {
      paypal_order_id: string;
      paypal_capture_id?: string;
      amount: number;
      currency: string;
      payer_email?: string;
      payer_name?: string;
      status?: "pending" | "completed" | "failed" | "cancelled";
    }
  ): { campaign: Campaign; transaction: PaymentTransaction } | null {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const member = campaign.members.find((m) => m.id === memberId);
    if (!member) return null;

    const status = paymentData.status || "completed";

    // Update member payment record
    member.amount_paid += paymentData.amount;
    if (member.amount_paid >= member.allocated_amount) {
      member.payment_status = "paid";
    } else {
      member.payment_status = "awaiting_capture";
    }

    const tx: PaymentTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaign_id: campaign.id,
      campaign_title: campaign.title,
      member_id: member.id,
      member_name: member.name,
      member_email: member.email,
      paypal_order_id: paymentData.paypal_order_id,
      paypal_capture_id: paymentData.paypal_capture_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: status,
      payer_email: paymentData.payer_email || member.email,
      payer_name: paymentData.payer_name || member.name,
      created_at: new Date().toISOString(),
      verified_at: status === "completed" ? new Date().toISOString() : undefined,
    };

    this.transactions.unshift(tx);

    campaign.activities.unshift({
      id: `act-${Date.now()}`,
      campaign_id: campaign.id,
      actor_name: member.name,
      action_type: "payment_received",
      message: `Completed PayPal payment of $${paymentData.amount.toFixed(2)} (Order #${paymentData.paypal_order_id}).`,
      metadata: { order_id: paymentData.paypal_order_id, amount: paymentData.amount },
      created_at: new Date().toISOString(),
    });

    this.saveCampaign(campaign);
    return { campaign, transaction: tx };
  }

  public listTransactions(): PaymentTransaction[] {
    return this.transactions;
  }
}

// Global singleton instance across Next.js server invocations
const globalStore = global as unknown as { __gatherbuy_demo_store?: InMemoryDemoStore };
export const demoStore = globalStore.__gatherbuy_demo_store || new InMemoryDemoStore();
if (process.env.NODE_ENV !== "production") {
  globalStore.__gatherbuy_demo_store = demoStore;
}
