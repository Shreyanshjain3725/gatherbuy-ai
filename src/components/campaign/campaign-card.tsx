import Link from "next/link";
import { Users, Calendar, ArrowRight, ShoppingCart } from "lucide-react";
import { Campaign } from "@/lib/db/schema";
import { Card } from "../ui/card";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { ProgressBar } from "./progress-bar";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  // Derive live statistics directly from campaign data
  const totalCollected = campaign.members.reduce(
    (acc, m) => acc + (m.amount_paid || 0),
    0
  );

  const productSummary = campaign.items
    .slice(0, 2)
    .map((item) => `${item.target_quantity}x ${item.name}`)
    .join(", ") + (campaign.items.length > 2 ? ` +${campaign.items.length - 2} more` : "");

  return (
    <Card className="glass-panel glass-panel-hover flex flex-col justify-between p-6 transition-all border-slate-800/90 hover:border-emerald-500/40">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            {campaign.category || "General Procurement"}
          </span>
          <CampaignStatusBadge status={campaign.status} />
        </div>

        <Link href={`/campaign/${campaign.id}`} className="group block">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {campaign.title}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
          <ShoppingCart className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{productSummary || "Items being specified"}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Payment Progress</span>
            <span className="font-semibold text-white">
              {formatCurrency(totalCollected, campaign.currency)} /{" "}
              <span className="text-slate-400">
                {formatCurrency(campaign.target_budget, campaign.currency)}
              </span>
            </span>
          </div>
          <ProgressBar
            value={totalCollected}
            max={campaign.target_budget}
            showLabel={false}
          />
        </div>

        {/* Footer info: participants, deadline, CTA */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {campaign.members.length} {campaign.members.length === 1 ? "participant" : "participants"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(campaign.deadline)}
            </span>
          </div>

          <Link
            href={`/campaign/${campaign.id}`}
            className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Manage</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
