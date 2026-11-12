"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  Campaign,
  FairShareMemberBreakdown,
  FairShareSummary,
} from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/campaign/progress-bar";
import { PayPalCheckoutButton } from "@/components/paypal/paypal-checkout-button";

export default function ParticipantJoinPage() {
  const params = useParams();
  const inviteCode = (params.code as string) || "TECH26";

  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [fairShare, setFairShare] = React.useState<FairShareSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Participant form inputs
  const [participantName, setParticipantName] = React.useState("Marcus Vance");
  const [participantEmail, setParticipantEmail] = React.useState("marcus.v@acm-club.org");
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const [activeMemberBreakdown, setActiveMemberBreakdown] =
    React.useState<FairShareMemberBreakdown | null>(null);
  const [isSavingSelections, setIsSavingSelections] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    fetchCampaignByCode();
  }, [inviteCode]);

  const fetchCampaignByCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/campaigns/${inviteCode}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Campaign not found");
      }

      const camp: Campaign = data.data.campaign;
      setCampaign(camp);
      setFairShare(data.data.fairShare);

      // Check if participant already in members list
      const existing = camp.members.find(
        (m) => m.email.toLowerCase() === participantEmail.toLowerCase()
      );

      const initQty: Record<string, number> = {};
      const initOpts: Record<string, string> = {};

      if (existing) {
        for (const sel of existing.selections) {
          initQty[sel.item_id] = sel.quantity;
          if (sel.selected_option) initOpts[sel.item_id] = sel.selected_option;
        }
        const b = data.data.fairShare.member_breakdowns.find(
          (x: FairShareMemberBreakdown) => x.member_id === existing.id
        );
        setActiveMemberBreakdown(b || null);
      } else {
        // Defaults: 1 of first item
        if (camp.items.length > 0) {
          initQty[camp.items[0].id] = 1;
        }
      }

      setQuantities(initQty);
      setSelectedOptions(initOpts);
    } catch (err: any) {
      console.error("Fetch campaign by code error:", err);
      setError(err.message || "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSelections = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!campaign || !participantName.trim() || !participantEmail.trim()) return;

    setIsSavingSelections(true);
    setSavedSuccess(false);

    try {
      const selections = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, qty]) => ({
          item_id: itemId,
          quantity: qty,
          selected_option: selectedOptions[itemId] || "",
          notes: notes[itemId] || "",
        }));

      const res = await fetch(`/api/campaigns/${campaign.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: participantName,
          email: participantEmail,
          selections,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not save selections");
      }

      setCampaign(data.data.campaign);
      setFairShare(data.data.fairShare);
      setActiveMemberBreakdown(data.data.memberBreakdown || null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save selections error:", err);
    } finally {
      setIsSavingSelections(false);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <div className="text-xs text-slate-400">Loading campaign invitation...</div>
      </div>
    );
  }

  if (error || !campaign || !fairShare) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Campaign Not Found</h2>
        <p className="text-xs text-slate-400">
          The invite code "{inviteCode}" is not active or could not be loaded.
        </p>
        <Link href="/join/TECH26">
          <Button variant="emerald" size="sm" className="text-xs">
            Open TechFest 2026 Demo (TECH26)
          </Button>
        </Link>
      </div>
    );
  }

  const isCurrentMemberPaid = activeMemberBreakdown?.payment_status === "paid";
  const amountToPay = activeMemberBreakdown
    ? activeMemberBreakdown.remaining_due > 0
      ? activeMemberBreakdown.remaining_due
      : activeMemberBreakdown.total
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Campaign Details Banner */}
      <Card className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                Invite Code: {campaign.invite_code}
              </Badge>
              <span className="text-xs text-slate-400">
                Organizer: <strong className="text-white">{campaign.organizer_name}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {campaign.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Deadline to Join & Pay</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(campaign.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Group Progress */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Group Collection:{" "}
              <strong className="text-white">
                {formatCurrency(fairShare.total_collected_amount, campaign.currency)}
              </strong>{" "}
              collected of {formatCurrency(fairShare.total_campaign_amount, campaign.currency)}
            </span>
            <span className="text-emerald-400 font-semibold">
              {fairShare.paid_members_count} of {fairShare.members_count} members contributed
            </span>
          </div>
          <ProgressBar
            value={fairShare.total_collected_amount}
            max={fairShare.total_campaign_amount}
            showLabel={false}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Select Items & Quantities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel p-6 border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              1. Your Participant Details & Product Selections
            </h3>

            {/* Name & Email inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full h-10 px-3 rounded-xl bg-navy-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Your Email Address</label>
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="marcus.v@example.com"
                  className="w-full h-10 px-3 rounded-xl bg-navy-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Products Picker */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Choose Items & Quantities
              </span>

              <div className="space-y-3">
                {campaign.items.map((item) => {
                  const qty = quantities[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl transition-all border ${
                        qty > 0
                          ? "bg-navy-850 border-emerald-500/50 shadow-sm"
                          : "bg-navy-900/60 border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <p className="text-xs text-slate-400 max-w-md">
                            {item.description}
                          </p>
                          <div className="text-xs text-emerald-400 font-semibold font-mono">
                            ~{formatCurrency(item.unit_cost_estimate, campaign.currency)} est. base
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-xl bg-navy-800 border border-slate-700 p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={qty <= 0}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700 disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-xs text-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Options selector (e.g. Size, Color) if qty > 0 */}
                      {qty > 0 && item.options && item.options.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-3 text-xs">
                          {item.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="text-slate-400 text-[11px] font-medium">
                                {opt.name}:
                              </span>
                              <select
                                value={selectedOptions[item.id] || opt.values[0]}
                                onChange={(e) =>
                                  setSelectedOptions((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="h-7 px-2 rounded-lg bg-navy-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                              >
                                {opt.values.map((val) => (
                                  <option key={val} value={val}>
                                    {val}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Click update to calculate your exact FairShare contribution.
              </span>
              <Button
                type="button"
                variant="emerald"
                size="md"
                onClick={() => handleUpdateSelections()}
                isLoading={isSavingSelections}
                className="font-bold text-xs gap-1.5"
              >
                <span>Update Selections</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Selections updated! FairShare contribution recalculated below.</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: FairShare Contribution & PayPal Sandbox Checkout */}
        <div className="space-y-6">
          <Card className="glass-panel p-6 border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              2. Your FairShare Breakdown
            </h3>

            {activeMemberBreakdown ? (
              <div className="space-y-4 text-xs">
                {/* Itemized selections */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                    Your Items:
                  </span>
                  {activeMemberBreakdown.selections.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300">
                      <span>
                        <strong className="text-white">{s.quantity}x</strong> {s.item_name}
                      </span>
                      <span className="font-mono">{formatCurrency(s.subtotal, campaign.currency)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Products Subtotal</span>
                    <span className="text-slate-200 font-mono">
                      {formatCurrency(activeMemberBreakdown.items_subtotal, campaign.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Proportional Freight Share</span>
                    <span className="text-slate-200 font-mono">
                      +{formatCurrency(activeMemberBreakdown.allocated_shipping, campaign.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Proportional Tax Share</span>
                    <span className="text-slate-200 font-mono">
                      +{formatCurrency(activeMemberBreakdown.allocated_tax, campaign.currency)}
                    </span>
                  </div>

                  {activeMemberBreakdown.allocated_discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Volume Discount Applied</span>
                      <span className="font-mono">
                        -{formatCurrency(activeMemberBreakdown.allocated_discount, campaign.currency)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                    <span className="font-bold text-white text-sm">Total FairShare</span>
                    <span className="font-extrabold text-emerald-400 text-xl font-mono">
                      {formatCurrency(activeMemberBreakdown.total, campaign.currency)}
                    </span>
                  </div>
                </div>

                {/* Status or Checkout Button */}
                {isCurrentMemberPaid ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-sm">
                      Your Share is Paid in Full!
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PayPal Sandbox capture confirmed (${activeMemberBreakdown.amount_paid.toFixed(2)}). You are all set!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Direct non-escrow payment via PayPal Sandbox</span>
                    </div>

                    <PayPalCheckoutButton
                      campaignId={campaign.id}
                      memberId={activeMemberBreakdown.member_id}
                      campaignTitle={campaign.title}
                      amount={amountToPay}
                      currency={campaign.currency}
                      onSuccess={() => fetchCampaignByCode()}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <ShoppingBag className="h-8 w-8 text-slate-600 mx-auto" />
                <p>Pick items on the left and click "Update Selections" to calculate your contribution.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
