"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Share2,
  Copy,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  TrendingDown,
  Layers,
  ShoppingBag,
  ExternalLink,
  Sliders,
  Bot,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  Campaign,
  FairShareSummary,
  LandedCostBreakdown,
  CampaignStatus,
} from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/campaign/progress-bar";
import { CampaignStatusBadge } from "@/components/campaign/campaign-status-badge";
import { FairShareBreakdown } from "@/components/campaign/fairshare-breakdown";
import { WhatIfCalculator } from "@/components/campaign/what-if-calculator";
import { AIChatAssistant } from "@/components/campaign/ai-chat-assistant";
import { ExportReportButton } from "@/components/campaign/export-report-button";

type CockpitTab = "fairshare" | "ai_advisor" | "whatif" | "activity";

export default function CampaignCockpitPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [fairShare, setFairShare] = React.useState<FairShareSummary | null>(null);
  const [comparison, setComparison] = React.useState<{
    breakdowns: LandedCostBreakdown[];
    bestOverall: LandedCostBreakdown | null;
  } | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<CockpitTab>("fairshare");
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);

  React.useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCampaign(data.data.campaign);
        setFairShare(data.data.fairShare);
        setComparison(data.data.comparison);
      }
    } catch (err) {
      console.error("Failed to load campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!campaign) return;
    const url = `${window.location.origin}/join/${campaign.invite_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaign || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCampaign(data.data.campaign);
        setFairShare(data.data.fairShare);
        setComparison(data.data.comparison);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading || !campaign || !fairShare) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-emerald-500 border-t-transparent" />
        <div className="text-xs text-slate-400">Loading campaign cockpit...</div>
      </div>
    );
  }

  const activeSupplier =
    campaign.supplier_quotes.find((q) => q.id === campaign.selected_supplier_id) ||
    campaign.supplier_quotes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cockpit Header Card */}
      <Card className="glass-panel p-6 border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                {campaign.category}
              </span>
              <CampaignStatusBadge status={campaign.status} />
              <span className="text-xs text-slate-500 font-mono">
                ID: {campaign.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {campaign.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInviteLink}
              className="text-xs gap-1.5 border-slate-700 bg-navy-850 hover:bg-navy-800"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Invite Link ({campaign.invite_code})</span>
                </>
              )}
            </Button>

            <Link href={`/join/${campaign.invite_code}`}>
              <Button
                variant="emerald"
                size="sm"
                className="w-full sm:w-auto text-xs font-bold gap-1.5 shadow-glow"
              >
                <span>Participant View</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <ExportReportButton campaign={campaign} summary={fairShare} />
          </div>
        </div>

        {/* Campaign Lifecycle Status Switcher */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Lifecycle Stage:</span>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  "open",
                  "collecting",
                  "ready_to_order",
                  "ordered",
                  "completed",
                ] as CampaignStatus[]
              ).map((st) => (
                <button
                  key={st}
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    campaign.status === st
                      ? "bg-emerald-500 text-navy-950 font-bold shadow-glow"
                      : "bg-navy-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "open"
                    ? "1. Open"
                    : st === "collecting"
                    ? "2. Collecting"
                    : st === "ready_to_order"
                    ? "3. Ready"
                    : st === "ordered"
                    ? "4. Ordered"
                    : "5. Completed"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Deadline: <strong className="text-white ml-0.5">{formatDate(campaign.deadline)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Organizer: <strong className="text-white ml-0.5">{campaign.organizer_name}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Progress & Supplier Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment progress */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">PayPal Sandbox Collection Status</span>
            <span className="font-bold text-white">
              {formatCurrency(fairShare.total_collected_amount, campaign.currency)} /{" "}
              <span className="text-slate-400">
                {formatCurrency(fairShare.total_campaign_amount, campaign.currency)}
              </span>
            </span>
          </div>
          <ProgressBar
            value={fairShare.total_collected_amount}
            max={fairShare.total_campaign_amount}
            showLabel={false}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>
              {fairShare.paid_members_count} of {fairShare.members_count} participants have paid their share
            </span>
            <span className="text-amber-400 font-semibold">
              {formatCurrency(fairShare.total_remaining_amount, campaign.currency)} pending
            </span>
          </div>
        </div>

        {/* Selected Supplier Card */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Supplier</span>
              <Badge variant="emerald" size="sm">
                Selected
              </Badge>
            </div>
            <h4 className="text-base font-bold text-white">
              {activeSupplier ? activeSupplier.supplier_name : "No supplier chosen yet"}
            </h4>
            <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-emerald-400" />
                {activeSupplier ? `${activeSupplier.estimated_delivery_days} days delivery` : "—"}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {activeSupplier ? `-$${activeSupplier.discount_amount} volume disc` : ""}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              href={`/campaign/${campaign.id}/suppliers`}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Compare {campaign.supplier_quotes.length} Quotes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cockpit Navigation Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("fairshare")}
            className={`py-3 px-1 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "fairshare"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>FairShare Engine & Allocations</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_advisor")}
            className={`py-3 px-1 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "ai_advisor"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>AI Procurement Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab("whatif")}
            className={`py-3 px-1 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "whatif"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>What-If Simulator</span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "fairshare" && (
          <FairShareBreakdown summary={fairShare} currency={campaign.currency} />
        )}

        {activeTab === "ai_advisor" && <AIChatAssistant campaign={campaign} />}

        {activeTab === "whatif" && <WhatIfCalculator campaign={campaign} />}
      </div>
    </div>
  );
}
