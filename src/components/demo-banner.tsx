"use client";

import * as React from "react";
import { Info, ShieldCheck, Sparkles, Key, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SandboxGuideModal } from "./paypal/sandbox-guide-modal";

export function DemoBanner() {
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-emerald-500/20 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Enterprise Procurement Suite:</span>
            <span>
              Autonomous AI Sourcing + FairShare™ Deterministic Allocation + PayPal Verified Checkout.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuideOpen(true)}
              className="text-slate-300 hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              <Key className="h-3 w-3 text-emerald-400" />
              PayPal Sandbox Setup Guide
            </button>
            <span className="text-slate-600">|</span>
            <Link
              href="/settings"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              API Status
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-500 hover:text-slate-300 ml-1"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <SandboxGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </>
  );
}
