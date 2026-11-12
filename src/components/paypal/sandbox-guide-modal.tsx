"use client";

import * as React from "react";
import { Modal } from "../ui/modal";
import { CheckCircle2, Copy, ExternalLink, ShieldCheck, Key } from "lucide-react";
import { Button } from "../ui/button";

export function SandboxGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PayPal Sandbox Developer Guide"
      description="Connect real PayPal Sandbox credentials to process live test payments."
      maxWidth="lg"
    >
      <div className="space-y-4 text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
        <div className="p-3.5 rounded-xl bg-navy-800/80 border border-slate-700/70 space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
              1
            </span>
            <span>Get Sandbox API Credentials</span>
          </div>
          <p className="text-xs text-slate-400">
            Log in to the{" "}
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
            >
              PayPal Developer Dashboard <ExternalLink className="h-3 w-3" />
            </a>
            , select <strong>Apps & Credentials</strong> &gt; <strong>Sandbox</strong>, and copy your <em>Client ID</em> and <em>Secret</em>.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-navy-800/80 border border-slate-700/70 space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
              2
            </span>
            <span>Configure Environment Variables in .env.local</span>
          </div>
          <p className="text-xs text-slate-400">
            Add these keys to your local <code className="text-emerald-400">.env.local</code> file:
          </p>
          <div className="relative p-2.5 rounded-lg bg-navy-950 font-mono text-xs text-slate-300 border border-slate-800">
            <div>NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-client-id</div>
            <div>PAYPAL_CLIENT_SECRET=your-secret</div>
            <div>PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com</div>
            <div>PAYPAL_CURRENCY=USD</div>
            <button
              onClick={() =>
                copyToClipboard(
                  `NEXT_PUBLIC_PAYPAL_CLIENT_ID=\nPAYPAL_CLIENT_SECRET=\nPAYPAL_BASE_URL=https://api-m.sandbox.paypal.com\nPAYPAL_CURRENCY=USD`,
                  "env"
                )
              }
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              {copiedKey === "env" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-navy-800/80 border border-slate-700/70 space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
              3
            </span>
            <span>Use a Sandbox Buyer Account to Pay</span>
          </div>
          <p className="text-xs text-slate-400">
            In the PayPal Developer Dashboard under <strong>Testing Tools &gt; Sandbox Accounts</strong>, use the pre-generated <em>Personal (Buyer)</em> test account email and password to log in when the PayPal checkout window pops up.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Built-in Instant Demo Mode</span>
          </div>
          <p className="text-xs text-slate-300">
            If you do not configure Sandbox keys right now, GatherBuy AI automatically activates <strong>Full-Fidelity Demo Simulation</strong> with sample verified captures, audit trails, and zero breakages!
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
}
