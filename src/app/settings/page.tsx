"use client";

import * as React from "react";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Key,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SandboxGuideModal } from "@/components/paypal/sandbox-guide-modal";

export default function SettingsPage() {
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  // Read client-side environment visibility
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPayPalConfigured = Boolean(
    paypalClientId &&
      paypalClientId.length > 10 &&
      !paypalClientId.startsWith("your-")
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project")
  );

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-emerald-400" />
          <span>Platform Settings & API Diagnostics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect connection status for PayPal Sandbox, Google Gemini AI, and Supabase database.
        </p>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PayPal Sandbox Card */}
        <Card className="glass-panel p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              PayPal Sandbox
            </span>
            {isPayPalConfigured ? (
              <Badge variant="emerald" size="sm">
                Connected
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                Demo Mode
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isPayPalConfigured
              ? "Live PayPal Sandbox Orders API v2 active for order creation and capture."
              : "Demo simulation active with mock sandbox orders and instant capture verification."}
          </p>
          <button
            onClick={() => setGuideOpen(true)}
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium pt-1"
          >
            <span>Setup Sandbox Credentials</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </Card>

        {/* Gemini AI Card */}
        <Card className="glass-panel p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-400" />
              Google Gemini AI
            </span>
            <Badge variant="emerald" size="sm">
              Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Powers the Autonomous Procurement Agent. Includes deterministic rule engine fallback for zero-downtime demoing.
          </p>
          <div className="text-[11px] text-emerald-400 pt-1 font-mono">
            Model: gemini-1.5-flash
          </div>
        </Card>

        {/* Supabase PostgreSQL Card */}
        <Card className="glass-panel p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-400" />
              Supabase Storage
            </span>
            {isSupabaseConfigured ? (
              <Badge variant="emerald" size="sm">
                PostgreSQL
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                In-Memory Store
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isSupabaseConfigured
              ? "Connected to remote PostgreSQL instance with Row Level Security."
              : "Using high-performance in-memory singleton demo store with seed data."}
          </p>
          <div className="text-[11px] text-slate-500 pt-1 font-mono">
            schema.sql ready
          </div>
        </Card>
      </div>

      {/* Demo Dataset Controls */}
      <Card className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-emerald-400" />
              <span>Reset Built-in Demo Dataset</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Restores the default TechFest 2026 campaign, 3 supplier quotes, 5 members, and partial payments.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            isLoading={resetting}
            className="text-xs font-semibold border-slate-700 hover:bg-navy-800"
          >
            {resetSuccess ? "Reset Completed!" : "Reset Demo Data"}
          </Button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Demo dataset was reset to default state!</span>
          </div>
        )}
      </Card>

      {/* Environment Variable Reference Guide */}
      <Card className="glass-panel p-6 border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-slate-400" />
          <span>Environment Variable Reference (.env.local)</span>
        </h3>
        <p className="text-xs text-slate-400">
          To run live PayPal Sandbox and remote Gemini API, copy these entries into your <code className="text-emerald-400">.env.local</code>:
        </p>
        <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# PayPal Developer Platform (Sandbox)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CURRENCY=USD

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </Card>

      <SandboxGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
