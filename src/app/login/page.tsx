"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  User,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDemoLogin = (role: "organizer" | "participant") => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === "organizer") {
        router.push("/dashboard");
      } else {
        router.push("/join/TECH26");
      }
    }, 600);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-navy-950 font-bold shadow-glow">
            <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to GatherBuy AI</h2>
          <p className="text-xs text-slate-400">
            Collaborative purchasing, supplier landed comparison, and PayPal checkout.
          </p>
        </div>

        {/* 1-Click Sandbox Profiles */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Instant Sandbox Test Access (No Registration Needed)</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => handleDemoLogin("organizer")}
              disabled={isLoading}
              className="text-xs font-bold"
            >
              Organizer Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("participant")}
              disabled={isLoading}
              className="text-xs border-slate-700 hover:bg-navy-800"
            >
              Participant Demo
            </Button>
          </div>
        </div>

        {/* Regular Login Card */}
        <Card className="glass-panel p-6 border-slate-800">
          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@techfest.org"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold bg-white text-navy-950 hover:bg-slate-100 mt-2"
            >
              Continue to Dashboard
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
