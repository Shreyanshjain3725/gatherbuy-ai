"use client";

import * as React from "react";
import { Sliders, TrendingDown, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Campaign, FairShareSummary } from "@/lib/db/schema";
import { simulateWhatIfScenario } from "@/lib/fairshare/engine";
import { formatCurrency } from "@/lib/utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function WhatIfCalculator({ campaign }: { campaign: Campaign }) {
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<string>(
    campaign.selected_supplier_id || campaign.supplier_quotes[0]?.id || ""
  );
  const [extraQuantity, setExtraQuantity] = React.useState<number>(0);
  const [extraDiscount, setExtraDiscount] = React.useState<number>(0);
  const [excludeMemberId, setExcludeMemberId] = React.useState<string>("");

  const firstItem = campaign.items[0];

  const simulation = React.useMemo(() => {
    return simulateWhatIfScenario(campaign, {
      supplier_id: selectedSupplierId || undefined,
      additional_item_quantities:
        firstItem && extraQuantity > 0 ? { [firstItem.id]: extraQuantity } : undefined,
      extra_discount_dollars: extraDiscount > 0 ? extraDiscount : undefined,
      excluded_member_ids: excludeMemberId ? [excludeMemberId] : undefined,
    });
  }, [campaign, selectedSupplierId, extraQuantity, extraDiscount, excludeMemberId]);

  const handleReset = () => {
    setSelectedSupplierId(campaign.selected_supplier_id || campaign.supplier_quotes[0]?.id || "");
    setExtraQuantity(0);
    setExtraDiscount(0);
    setExcludeMemberId("");
  };

  const deltaCost = simulation.deltaCampaignAmount;
  const isSaving = deltaCost < 0;

  return (
    <Card className="glass-panel p-6 border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-lime-500/15 text-lime-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              Interactive What-If Scenario Simulator
            </h4>
            <p className="text-xs text-slate-400">
              Simulate volume shifts, alternative supplier pricing, and member drops in real time.
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Sliders
        </Button>
      </div>

      {/* Simulator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        {/* Supplier Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Compare Supplier</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            {campaign.supplier_quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.supplier_name}
              </option>
            ))}
          </select>
        </div>

        {/* Extra Product Units */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300">
              Add {firstItem?.name ? firstItem.name.split(" ")[0] : "Item"}s
            </span>
            <span className="font-bold text-emerald-400">+{extraQuantity} units</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={extraQuantity}
            onChange={(e) => setExtraQuantity(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Extra Supplier Discount */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300">Negotiated Discount</span>
            <span className="font-bold text-lime-400">${extraDiscount}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={extraDiscount}
            onChange={(e) => setExtraDiscount(parseInt(e.target.value, 10))}
            className="w-full accent-lime-500 cursor-pointer"
          />
        </div>

        {/* Exclude Member */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Simulate Member Leaving</label>
          <select
            value={excludeMemberId}
            onChange={(e) => setExcludeMemberId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">None (all members active)</option>
            {campaign.members.map((m) => (
              <option key={m.id} value={m.id}>
                Exclude {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instant Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
          <div className="text-xs text-slate-400">Simulated Total Order</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {formatCurrency(simulation.simulatedSummary.total_campaign_amount, campaign.currency)}
          </div>
          <div className="text-[11px] text-slate-500">
            Baseline: {formatCurrency(simulation.baseSummary.total_campaign_amount, campaign.currency)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
          <div className="text-xs text-slate-400">Net Campaign Cost Delta</div>
          <div
            className={`text-lg font-bold mt-0.5 flex items-center gap-1 ${
              isSaving ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {isSaving ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {isSaving ? "-" : "+"}
            {formatCurrency(Math.abs(deltaCost), campaign.currency)}
          </div>
          <div className="text-[11px] text-slate-500">
            {isSaving ? "Net campaign savings" : "Net budget increase"}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
          <div className="text-xs text-slate-400">Avg Member Share Change</div>
          <div className="text-lg font-bold text-lime-400 mt-0.5">
            {simulation.averageMemberSavings > 0 ? "-" : "+"}
            {formatCurrency(Math.abs(simulation.averageMemberSavings), campaign.currency)} / person
          </div>
          <div className="text-[11px] text-slate-500">
            Across {simulation.simulatedSummary.members_count} active members
          </div>
        </div>
      </div>
    </Card>
  );
}
