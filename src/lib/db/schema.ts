export type CampaignStatus =
  | 'draft'
  | 'open'
  | 'collecting'
  | 'ready_to_order'
  | 'ordered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'awaiting_capture'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface CampaignItemOption {
  name: string;
  values: string[];
}

export interface CampaignItem {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  target_quantity: number;
  unit_cost_estimate: number;
  options?: CampaignItemOption[];
}

export interface MemberSelection {
  id: string;
  member_id: string;
  item_id: string;
  quantity: number;
  selected_option?: string;
  notes?: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  role: 'organizer' | 'member';
  payment_status: PaymentStatus;
  allocated_amount: number;
  amount_paid: number;
  joined_at: string;
  selections: MemberSelection[];
}

export interface SupplierItemQuote {
  item_id: string;
  item_name?: string;
  unit_price: number;
  minimum_order_quantity: number;
}

export interface SupplierQuote {
  id: string;
  campaign_id: string;
  supplier_name: string;
  contact_email?: string;
  item_quotes: SupplierItemQuote[];
  shipping_cost: number;
  tax_rate_percent: number;
  discount_amount: number;
  estimated_delivery_days: number;
  notes?: string;
  is_verified?: boolean;
  created_at: string;
}

export interface LandedCostBreakdown {
  supplier_id: string;
  supplier_name: string;
  items_subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_landed_cost: number;
  effective_unit_cost_avg: number;
  estimated_delivery_days: number;
  moq_satisfied: boolean;
  moq_warnings: string[];
  is_cheapest: boolean;
  is_fastest: boolean;
  is_recommended: boolean;
  score: number;
  recommendation_reason: string;
}

export interface FairShareMemberBreakdown {
  member_id: string;
  member_name: string;
  member_email: string;
  role: 'organizer' | 'member';
  payment_status: PaymentStatus;
  items_count: number;
  items_subtotal_cents: number;
  allocated_shipping_cents: number;
  allocated_tax_cents: number;
  allocated_discount_cents: number;
  total_cents: number;
  items_subtotal: number;
  allocated_shipping: number;
  allocated_tax: number;
  allocated_discount: number;
  total: number;
  amount_paid: number;
  remaining_due: number;
  selections: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    option?: string;
  }>;
}

export interface FairShareSummary {
  campaign_id: string;
  total_campaign_cents: number;
  total_campaign_amount: number;
  items_subtotal_cents: number;
  items_subtotal: number;
  shipping_cents: number;
  shipping_amount: number;
  tax_cents: number;
  tax_amount: number;
  discount_cents: number;
  discount_amount: number;
  total_collected_cents: number;
  total_collected_amount: number;
  total_remaining_cents: number;
  total_remaining_amount: number;
  members_count: number;
  paid_members_count: number;
  member_breakdowns: FairShareMemberBreakdown[];
}

export interface PaymentTransaction {
  id: string;
  campaign_id: string;
  campaign_title?: string;
  member_id: string;
  member_name: string;
  member_email: string;
  paypal_order_id: string;
  paypal_capture_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payer_email?: string;
  payer_name?: string;
  created_at: string;
  verified_at?: string;
}

export interface CampaignActivity {
  id: string;
  campaign_id: string;
  actor_name: string;
  action_type: 'created' | 'member_joined' | 'item_selected' | 'quote_added' | 'payment_received' | 'status_changed';
  message: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIInsight {
  id: string;
  campaign_id: string;
  type: 'procurement_plan' | 'supplier_recommendation' | 'risk_assessment' | 'budget_optimization';
  title: string;
  content: string;
  score?: number;
  recommendations: string[];
  created_at: string;
}

export interface Campaign {
  id: string;
  organizer_id?: string;
  organizer_name: string;
  organizer_email: string;
  title: string;
  description: string;
  category: string;
  target_budget: number;
  deadline: string;
  status: CampaignStatus;
  selected_supplier_id?: string | null;
  invite_code: string;
  currency: string;
  created_at: string;
  updated_at: string;
  items: CampaignItem[];
  members: CampaignMember[];
  supplier_quotes: SupplierQuote[];
  activities: CampaignActivity[];
  ai_insights: AIInsight[];
}
