"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  PlusCircle,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Campaign, CampaignActivity } from "@/lib/db/schema";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type FilterTab = "all" | "active" | "awaiting" | "completed";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");

  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive live statistics strictly from data (NO hardcoded fake numbers!)
  const activeCampaignsCount = campaigns.filter(
    (c) => c.status !== "completed" && c.status !== "cancelled"
  ).length;

  const totalProcurementValue = campaigns.reduce(
    (acc, c) => acc + (c.target_budget || 0),
    0
  );

  const totalCollectedPayments = campaigns.reduce((acc, c) => {
    const collectedInCampaign = c.members.reduce(
      (mAcc, m) => mAcc + (m.amount_paid || 0),
      0
    );
    return acc + collectedInCampaign;
  }, 0);

  const pendingContributions = Math.max(
    0,
    totalProcurementValue - totalCollectedPayments
  );

  // Derive estimated savings: based on supplier discounts logged across campaigns
  const estimatedSavings = campaigns.reduce((acc, c) => {
    const selectedQuote =
      c.supplier_quotes.find((q) => q.id === c.selected_supplier_id) ||
      c.supplier_quotes[0];
    return acc + (selectedQuote ? selectedQuote.discount_amount || 0 : 0);
  }, 0);

  // Aggregate recent activities across all campaigns
  const allActivities: CampaignActivity[] = campaigns
    .flatMap((c) => c.activities || [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return c.status === "open" || c.status === "collecting";
    if (activeTab === "awaiting") {
      const collected = c.members.reduce(
        (mAcc, m) => mAcc + (m.amount_paid || 0),
        0
      );
      return collected < c.target_budget && c.status !== "completed";
    }
    if (activeTab === "completed") return c.status === "completed";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Procurement Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of active purchasing campaigns, supplier quotations, and PayPal Sandbox payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/campaign/new">
            <Button variant="emerald" size="md" className="font-bold shadow-glow text-xs gap-2">
              <PlusCircle className="h-4 w-4" />
              New AI Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Derived Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Campaigns</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {activeCampaignsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {campaigns.length} total organized
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Target Value</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {formatCurrency(totalProcurementValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Aggregate procurement
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Total Collected</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {formatCurrency(totalCollectedPayments)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">
            Via PayPal Sandbox
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Contributions</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {formatCurrency(pendingContributions)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Awaiting member checkout
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Negotiated Savings</span>
            <TrendingDown className="h-4 w-4 text-lime-400" />
          </div>
          <div className="text-2xl font-extrabold text-lime-400 mt-2">
            {formatCurrency(estimatedSavings)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Via supplier comparisons
          </div>
        </div>
      </div>

      {/* Main Grid: Campaign List & Recent Activity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs Filter */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: "all", label: "All Campaigns" },
                  { id: "active", label: "Active" },
                  { id: "awaiting", label: "Awaiting Payments" },
                  { id: "completed", label: "Completed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-navy-800 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Showing {filteredCampaigns.length} {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
            </span>
          </div>

          {/* Campaigns Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-navy-900/60 animate-pulse border border-slate-800"
                />
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 space-y-3">
              <Layers className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                No campaigns match this filter
              </div>
              <p className="text-xs text-slate-500">
                Create a new purchasing campaign with our conversational AI agent.
              </p>
              <Link href="/campaign/new">
                <Button variant="emerald" size="sm" className="mt-2 text-xs">
                  Create First Campaign
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right 1 Column: Activity Feed & Quick Actions */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Recent Activity</span>
              </h3>
              <Link
                href="/transactions"
                className="text-[11px] text-emerald-400 hover:underline"
              >
                View Ledger
              </Link>
            </div>

            <div className="space-y-3">
              {allActivities.length > 0 ? (
                allActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-navy-850/80 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-200">
                        {act.actor_name}
                      </span>
                      <span>{formatDate(act.created_at)}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{act.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-4">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Invite Code Joiner Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-850 border border-emerald-500/20 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Have an Invite Code?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an organizer invited you, jump directly to participant checkout with code{" "}
              <code className="text-emerald-400 font-mono font-semibold">TECH26</code>.
            </p>
            <Link href="/join/TECH26">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-slate-700 hover:bg-navy-800">
                <span>Join with Code TECH26</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
