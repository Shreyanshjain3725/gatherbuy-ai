import Link from "next/link";
import { ShoppingBag, ShieldCheck, Cpu, Code2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-navy-950 font-bold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white">
                GatherBuy <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent agent for collaborative purchasing and payments. Buy together. Save together. Pay fairly.
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Intelligent Agent for Group Commerce.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/campaign/new" className="hover:text-emerald-400 transition-colors">
                  AI Procurement Agent
                </Link>
              </li>
              <li>
                <Link href="/campaign/camp-techfest-2026/suppliers" className="hover:text-emerald-400 transition-colors">
                  Supplier Landed Cost Engine
                </Link>
              </li>
              <li>
                <Link href="/campaign/camp-techfest-2026" className="hover:text-emerald-400 transition-colors">
                  FairShare Proportional Engine
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="hover:text-emerald-400 transition-colors">
                  PayPal Sandbox Verification
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform & Tech
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span>Google Gemini 1.5 / 2.0 SDK</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>PayPal Orders API v2</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Hare-Niemeyer Allocation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Supabase PostgreSQL + RLS</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Security & Compliance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Authoritative monetary computations are strictly deterministic on the backend. Card and sensitive credentials are never stored. Payments captured through PayPal Sandbox.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Non-Escrow Direct Settlement</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 GatherBuy AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/transactions" className="hover:text-slate-300">Audit Trail</Link>
            <Link href="/settings" className="hover:text-slate-300">Environment & Keys</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
