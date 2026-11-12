"use client";

import * as React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { FairShareSummary } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/badge";

export function FairShareBreakdown({
  summary,
  currency = "USD",
}: {
  summary: FairShareSummary;
  currency?: string;
}) {
  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Items Subtotal</div>
          <div className="text-lg font-bold text-white mt-1">
            {formatCurrency(summary.items_subtotal, currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sum of all member picks</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Shared Shipping</div>
          <div className="text-lg font-bold text-white mt-1">
            {formatCurrency(summary.shipping_amount, currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Proportionally divided</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Taxes & Discounts</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            +{formatCurrency(summary.tax_amount, currency)}{" "}
            <span className="text-slate-400 font-normal">
              (-{formatCurrency(summary.discount_amount, currency)})
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Shared fee allocation</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-medium">Total FairShare Pool</div>
          <div className="text-xl font-bold text-white mt-1">
            {formatCurrency(summary.total_campaign_amount, currency)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">
            {summary.paid_members_count} of {summary.members_count} paid
          </div>
        </div>
      </div>

      {/* Transparent Allocation Methodology Note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-800/60 border border-slate-800 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>
          <strong>FairShare Engine Guarantee:</strong> All contributions computed in integer minor cents using the Hare-Niemeyer largest-remainder method. The sum of all member shares strictly equals the total landed campaign order.
        </span>
      </div>

      {/* Members Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-navy-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-850/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Items Selected</th>
              <th className="py-3 px-4 text-right">Base Items</th>
              <th className="py-3 px-4 text-right">Shipping</th>
              <th className="py-3 px-4 text-right">Tax / Disc</th>
              <th className="py-3 px-4 text-right font-bold text-white">Total Share</th>
              <th className="py-3 px-4 text-right">Amount Paid</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {summary.member_breakdowns.map((member) => {
              const isPaid = member.payment_status === "paid";
              return (
                <tr key={member.member_id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{member.member_name}</div>
                    <div className="text-[11px] text-slate-400">{member.member_email}</div>
                  </td>
                  <td className="py-3 px-4">
                    {member.selections.length > 0 ? (
                      <div className="space-y-0.5 max-w-[220px]">
                        {member.selections.map((sel, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 truncate">
                            <span className="font-semibold text-emerald-400">{sel.quantity}x</span>{" "}
                            {sel.item_name}{" "}
                            {sel.option ? (
                              <span className="text-slate-500">({sel.option})</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No selections</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 font-mono">
                    {formatCurrency(member.items_subtotal, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono">
                    {formatCurrency(member.allocated_shipping, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono">
                    +{formatCurrency(member.allocated_tax, currency)}
                    {member.allocated_discount > 0 ? (
                      <span className="text-emerald-400 block text-[10px]">
                        -{formatCurrency(member.allocated_discount, currency)}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400 font-mono text-sm">
                    {formatCurrency(member.total, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(member.amount_paid, currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isPaid ? (
                      <Badge variant="emerald" size="sm" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" className="gap-1">
                        <Clock className="h-3 w-3" /> Due {formatCurrency(member.remaining_due, currency)}
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
