"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Truck,
  Plus,
  ArrowLeft,
  Award,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Campaign, LandedCostBreakdown } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SupplierComparisonTable } from "@/components/campaign/supplier-comparison-table";

export default function SupplierManagementPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [breakdowns, setBreakdowns] = React.useState<LandedCostBreakdown[]>([]);
  const [bestOverall, setBestOverall] = React.useState<LandedCostBreakdown | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Add Quote Modal State
  const [addQuoteOpen, setAddQuoteOpen] = React.useState(false);
  const [supplierName, setSupplierName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [shippingCost, setShippingCost] = React.useState(30);
  const [taxRate, setTaxRate] = React.useState(6.5);
  const [discountAmount, setDiscountAmount] = React.useState(20);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = React.useState(7);
  const [notes, setNotes] = React.useState("");
  const [itemPrices, setItemPrices] = React.useState<Record<string, number>>({});
  const [itemMoqs, setItemMoqs] = React.useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchSupplierData();
  }, [campaignId]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCampaign(data.data.campaign);
        if (data.data.comparison) {
          setBreakdowns(data.data.comparison.breakdowns || []);
          setBestOverall(data.data.comparison.bestOverall || null);
        }

        // Initialize default prices from campaign items
        const defaultPrices: Record<string, number> = {};
        const defaultMoqs: Record<string, number> = {};
        for (const item of data.data.campaign.items) {
          defaultPrices[item.id] = item.unit_cost_estimate || 20;
          defaultMoqs[item.id] = 10;
        }
        setItemPrices(defaultPrices);
        setItemMoqs(defaultMoqs);
      }
    } catch (err) {
      console.error("Failed to load supplier quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !supplierName.trim()) return;

    setIsSubmitting(true);
    try {
      const item_quotes = campaign.items.map((item) => ({
        item_id: item.id,
        unit_price: itemPrices[item.id] || item.unit_cost_estimate || 0,
        minimum_order_quantity: itemMoqs[item.id] || 0,
      }));

      const res = await fetch(`/api/campaigns/${campaign.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: supplierName,
          contact_email: contactEmail || undefined,
          shipping_cost: Number(shippingCost) || 0,
          tax_rate_percent: Number(taxRate) || 0,
          discount_amount: Number(discountAmount) || 0,
          estimated_delivery_days: Number(estimatedDeliveryDays) || 7,
          notes,
          item_quotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAddQuoteOpen(false);
        fetchSupplierData();
      }
    } catch (err) {
      console.error("Add quote failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <div className="text-xs text-slate-400">Loading supplier quotes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/campaign/${campaign.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Campaign Cockpit</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Supplier Quotations & Landed Cost Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Compare unit rates, ground freight, sales taxes, MOQ thresholds, and turnaround speeds across suppliers.
          </p>
        </div>

        <div>
          <Button
            variant="emerald"
            size="md"
            onClick={() => setAddQuoteOpen(true)}
            className="text-xs font-bold gap-1.5 shadow-glow"
          >
            <Plus className="h-4 w-4" />
            <span>Log Supplier Quotation</span>
          </Button>
        </div>
      </div>

      {/* AI Recommendation Summary Box */}
      {bestOverall && (
        <Card className="glass-panel p-6 border-emerald-500/40 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                AI Recommendation: {bestOverall.supplier_name}
              </h3>
            </div>
            <Badge variant="emerald" size="sm">
              Score: {bestOverall.score} / 100
            </Badge>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {bestOverall.recommendation_reason}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Total Landed Cost</span>
              <strong className="text-white text-sm">
                {formatCurrency(bestOverall.total_landed_cost, campaign.currency)}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Delivery Lead Time</span>
              <strong className="text-emerald-400 text-sm">
                {bestOverall.estimated_delivery_days} days turnaround
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Freight & Tax</span>
              <strong className="text-slate-200 text-sm">
                +{formatCurrency(bestOverall.shipping_cost + bestOverall.tax_amount, campaign.currency)}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Volume Discount</span>
              <strong className="text-lime-400 text-sm">
                -{formatCurrency(bestOverall.discount_amount, campaign.currency)}
              </strong>
            </div>
          </div>
        </Card>
      )}

      {/* Side-by-side Quotations Comparison Grid */}
      <SupplierComparisonTable
        campaign={campaign}
        breakdowns={breakdowns}
        onSelectSupplier={() => fetchSupplierData()}
      />

      {/* Add Quotation Modal */}
      <Modal
        isOpen={addQuoteOpen}
        onClose={() => setAddQuoteOpen(false)}
        title="Add Supplier Quotation"
        description={`Record quote details for ${campaign.title}`}
        maxWidth="lg"
      >
        <form onSubmit={handleAddQuote} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-medium text-slate-300">Supplier / Company Name</label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Apex Custom Merch Co."
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-300">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sales@supplier.com"
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-300">Shipping Cost ($ USD)</label>
              <input
                type="number"
                step="5"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-300">Tax Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-300">Discount Amount ($ USD)</label>
              <input
                type="number"
                step="5"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-medium text-slate-300">Estimated Delivery Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={estimatedDeliveryDays}
                onChange={(e) => setEstimatedDeliveryDays(parseInt(e.target.value, 10) || 7)}
                className="w-full h-9 px-3 rounded-lg bg-navy-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Item unit price inputs */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block">
              Unit Prices & Minimum Order Quantities (MOQ):
            </span>
            <div className="space-y-2">
              {campaign.items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-navy-850 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <span className="font-medium text-slate-200 truncate max-w-[180px]">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">$</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={itemPrices[item.id] || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItemPrices((prev) => ({ ...prev, [item.id]: val }));
                        }}
                        className="w-20 h-7 px-2 rounded bg-navy-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">MOQ:</span>
                      <input
                        type="number"
                        min="0"
                        value={itemMoqs[item.id] || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setItemMoqs((prev) => ({ ...prev, [item.id]: val }));
                        }}
                        className="w-16 h-7 px-2 rounded bg-navy-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddQuoteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold text-xs"
            >
              Save Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
