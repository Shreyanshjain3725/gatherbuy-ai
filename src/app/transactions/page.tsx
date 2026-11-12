"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Search,
} from "lucide-react";
import { PaymentTransaction } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    return (
      tx.member_name.toLowerCase().includes(q) ||
      tx.paypal_order_id.toLowerCase().includes(q) ||
      (tx.payer_email && tx.payer_email.toLowerCase().includes(q)) ||
      (tx.campaign_title && tx.campaign_title.toLowerCase().includes(q))
    );
  });

  const totalCapturedAmount = transactions
    .filter((tx) => tx.status === "completed")
    .reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-400" />
            <span>PayPal Sandbox Payment Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of verified server-side PayPal Sandbox captures, orders, and timestamps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            className="text-xs gap-1.5 border-slate-700 bg-navy-850 hover:bg-navy-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh Ledger</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <div className="text-xs text-slate-400">Total Captured Volume</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {formatCurrency(totalCapturedAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Verified across all campaigns
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <div className="text-xs text-slate-400">Verified Transactions</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {transactions.filter((t) => t.status === "completed").length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            100% server verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
          <div className="text-xs text-slate-400">Settlement Destination</div>
          <div className="text-base font-bold text-slate-200 mt-1">
            Sandbox Receiving Account
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Direct Non-Escrow Transfer
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member, order ID, or campaign..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-navy-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
        <span className="text-xs text-slate-500">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Transactions Table */}
      <Card className="glass-panel p-0 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Campaign</th>
                <th className="py-3.5 px-4">PayPal Order / Capture ID</th>
                <th className="py-3.5 px-4 text-right">Captured Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading payment records...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{tx.member_name}</div>
                      <div className="text-[11px] text-slate-400">{tx.payer_email || tx.member_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium line-clamp-1 max-w-[220px]">
                        {tx.campaign_title || "Group Buy Campaign"}
                      </div>
                      <Link
                        href={`/campaign/${tx.campaign_id}`}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        View Campaign
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-200">{tx.paypal_order_id}</div>
                      {tx.paypal_capture_id && (
                        <div className="text-slate-500 text-[10px]">
                          Cap: {tx.paypal_capture_id}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.status === "completed" ? (
                        <Badge variant="emerald" size="sm" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </Badge>
                      ) : tx.status === "pending" ? (
                        <Badge variant="warning" size="sm" className="gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          {tx.status}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {formatDate(tx.verified_at || tx.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
