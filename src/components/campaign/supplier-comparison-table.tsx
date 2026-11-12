"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Zap,
  DollarSign,
  Award,
  AlertCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Campaign, LandedCostBreakdown } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface SupplierComparisonProps {
  campaign: Campaign;
  breakdowns: LandedCostBreakdown[];
  onSelectSupplier?: (supplierId: string) => void;
}

export function SupplierComparisonTable({
  campaign,
  breakdowns,
  onSelectSupplier,
}: SupplierComparisonProps) {
  const [selectingId, setSelectingId] = React.useState<string | null>(null);

  const handleSelect = async (supplierId: string) => {
    setSelectingId(supplierId);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_supplier_id: supplierId }),
      });
      if (res.ok && onSelectSupplier) {
        onSelectSupplier(supplierId);
      }
    } catch (err) {
      console.error("Failed to select supplier:", err);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards Grid for Top Ranked Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {breakdowns.map((b) => {
          const isSelected = campaign.selected_supplier_id === b.supplier_id;
          return (
            <div
              key={b.supplier_id}
              className={`p-5 rounded-2xl transition-all border ${
                isSelected
                  ? "bg-navy-850/90 border-emerald-500 shadow-glow"
                  : b.is_recommended
                  ? "bg-navy-900/90 border-emerald-500/50"
                  : "bg-navy-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap gap-1">
                  {b.is_recommended && (
                    <Badge variant="emerald" size="sm" className="gap-1">
                      <Award className="h-3 w-3" /> Recommended
                    </Badge>
                  )}
                  {b.is_cheapest && (
                    <Badge variant="lime" size="sm" className="gap-1">
                      <DollarSign className="h-3 w-3" /> Lowest Cost
                    </Badge>
                  )}
                  {b.is_fastest && (
                    <Badge variant="paypal" size="sm" className="gap-1">
                      <Zap className="h-3 w-3" /> Fastest Delivery
                    </Badge>
                  )}
                </div>

                {isSelected && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white mt-1 line-clamp-1">
                {b.supplier_name}
              </h4>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {formatCurrency(b.total_landed_cost, campaign.currency)}
                </span>
                <span className="text-xs text-slate-400">total landed</span>
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Avg ~{formatCurrency(b.effective_unit_cost_avg, campaign.currency)} / unit
              </div>

              {/* Delivery & MOQ summary */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Truck className="h-3.5 w-3.5 text-slate-400" /> Lead Time
                  </span>
                  <span className="font-medium text-white">{b.estimated_delivery_days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Freight & Tax</span>
                  <span className="text-slate-200">
                    +{formatCurrency(b.shipping_cost + b.tax_amount, campaign.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Volume Discount</span>
                  <span className="text-emerald-400">
                    -{formatCurrency(b.discount_amount, campaign.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {b.recommendation_reason}
                </p>
              </div>

              <div className="mt-4">
                <Button
                  variant={isSelected ? "secondary" : "emerald"}
                  size="sm"
                  onClick={() => handleSelect(b.supplier_id)}
                  isLoading={selectingId === b.supplier_id}
                  disabled={isSelected}
                  className="w-full text-xs font-semibold"
                >
                  {isSelected ? "Active Supplier" : "Select This Supplier"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
