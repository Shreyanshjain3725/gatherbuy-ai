-- ====================================================================
-- GatherBuy AI - Supabase PostgreSQL Schema
-- Production Schema: Collaborative Purchasing and Payments Platform
-- ====================================================================

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  target_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'collecting', 'ready_to_order', 'ordered', 'completed', 'cancelled')),
  selected_supplier_id UUID,
  invite_code TEXT UNIQUE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campaign Items (Products needed in this group buy)
CREATE TABLE IF NOT EXISTS public.campaign_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_quantity INTEGER NOT NULL CHECK (target_quantity > 0),
  unit_cost_estimate NUMERIC(12, 2) DEFAULT 0.00,
  options JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "Size", "values": ["S", "M", "L", "XL"]}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Campaign Members (Participants who joined)
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'awaiting_capture', 'paid', 'failed', 'refunded')),
  allocated_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Member Selections (Items chosen by each member)
CREATE TABLE IF NOT EXISTS public.member_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.campaign_members(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.campaign_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  selected_option TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Supplier Quotations
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  contact_email TEXT,
  item_quotes JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ "item_id": "...", "unit_price": 15.00, "moq": 10 }]
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  estimated_delivery_days INTEGER NOT NULL DEFAULT 7,
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments Table (PayPal Sandbox Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.campaign_members(id) ON DELETE CASCADE,
  paypal_order_id TEXT UNIQUE NOT NULL,
  paypal_capture_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payer_email TEXT,
  payer_name TEXT,
  raw_paypal_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- 8. Campaign Activity Timeline
CREATE TABLE IF NOT EXISTS public.campaign_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'member_joined', 'item_selected', 'quote_added', 'payment_received', 'status_changed')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('procurement_plan', 'supplier_recommendation', 'risk_assessment', 'budget_optimization')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  score NUMERIC(3, 1),
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies for public reading of active campaigns via invite code or membership
CREATE POLICY "Public campaign access by invite or id" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Campaign items access" ON public.campaign_items
  FOR SELECT USING (true);

CREATE POLICY "Campaign members access" ON public.campaign_members
  FOR SELECT USING (true);

CREATE POLICY "Member selections access" ON public.member_selections
  FOR SELECT USING (true);

CREATE POLICY "Supplier quotes access" ON public.supplier_quotes
  FOR SELECT USING (true);

CREATE POLICY "Payments read by campaign" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Activity read" ON public.campaign_activity
  FOR SELECT USING (true);

CREATE POLICY "AI Insights read" ON public.ai_insights
  FOR SELECT USING (true);
