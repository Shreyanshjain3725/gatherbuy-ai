"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { formatCurrency } from "@/lib/utils";

interface PayPalCheckoutButtonProps {
  campaignId: string;
  memberId: string;
  campaignTitle: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  className?: string;
}

export function PayPalCheckoutButton({
  campaignId,
  memberId,
  campaignTitle,
  amount,
  currency = "USD",
  onSuccess,
  className,
}: PayPalCheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showSandboxModal, setShowSandboxModal] = React.useState(false);
  const [sandboxOrderId, setSandboxOrderId] = React.useState<string | null>(null);
  const [isDemo, setIsDemo] = React.useState(true);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isRealClientConfigured = Boolean(
    paypalClientId &&
      paypalClientId.length > 10 &&
      !paypalClientId.startsWith("your-")
  );

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10B981", "#84CC16", "#0070BA", "#FFC439"],
    });
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Call server to create authoritative order
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, memberId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to create order");
      }

      setSandboxOrderId(data.orderId);
      setIsDemo(Boolean(data.isDemoSimulated));
      setShowSandboxModal(true);
    } catch (err: any) {
      console.error("Initiate payment error:", err);
      setErrorMessage(err.message || "Could not initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureSandboxPayment = async () => {
    if (!sandboxOrderId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: sandboxOrderId,
          campaignId,
          memberId,
          isDemoSimulated: isDemo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Payment capture failed");
      }

      setPaymentSuccess(true);
      triggerCelebration();

      setTimeout(() => {
        setShowSandboxModal(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("Capture payment error:", err);
      setErrorMessage(err.message || "Failed to capture payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={className}>
      {errorMessage && (
        <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        variant="paypal"
        size="lg"
        onClick={handleInitiatePayment}
        isLoading={isProcessing}
        className="w-full text-base font-bold flex items-center justify-center gap-2 shadow-paypal-glow"
      >
        <span>Pay {formatCurrency(amount, currency)} with</span>
        <span className="font-extrabold italic text-[#003087]">
          PayPal <span className="text-[#0070BA]">Sandbox</span>
        </span>
      </Button>

      {/* Sandbox Confirmation & Capture Modal */}
      <Modal
        isOpen={showSandboxModal}
        onClose={() => !isProcessing && setShowSandboxModal(false)}
        title="PayPal Sandbox Checkout"
        description="PayPal Orders API v2 • Secure Server-Side Capture"
        maxWidth="md"
      >
        <div className="space-y-4">
          {paymentSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="text-lg font-bold text-white">Payment Verified & Captured!</h4>
              <p className="text-xs text-slate-300">
                PayPal Sandbox Order #{sandboxOrderId} was successfully captured on the server. Your campaign contribution has been recorded.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-navy-800/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Merchant / Campaign</span>
                  <span className="font-medium text-slate-200 truncate max-w-[200px]">
                    {campaignTitle}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Sandbox Order ID</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {sandboxOrderId}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Sandbox Buyer Account</span>
                  <span className="text-slate-300">sb-buyer-demo@personal.example.com</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Total Contribution</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              </div>

              {isDemo && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sandbox Simulator Mode:</strong> Ready to capture. Configure your live PayPal Sandbox client credentials in .env.local anytime.
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSandboxModal(false)}
                  disabled={isProcessing}
                  className="w-1/3"
                >
                  Cancel
                </Button>
                <Button
                  variant="paypal"
                  onClick={handleCaptureSandboxPayment}
                  isLoading={isProcessing}
                  className="w-2/3 font-bold"
                >
                  Confirm & Capture
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
