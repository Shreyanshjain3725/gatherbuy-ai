"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  Layers,
  History,
  Settings as SettingsIcon,
  PlusCircle,
  RotateCcw,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 2500);
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to reset demo:", err);
    } finally {
      setResetting(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Layers },
    { name: "New Campaign", href: "/campaign/new", icon: PlusCircle },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-navy-950 font-bold shadow-glow group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                GatherBuy <span className="text-emerald-400 font-semibold">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 pl-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-navy-800 text-emerald-400"
                      : "text-slate-300 hover:text-white hover:bg-navy-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            title="Reset demo data to initial TechFest 2026 state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-navy-800 rounded-lg border border-slate-800 transition-colors"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetSuccess ? "Reset Complete!" : "Reset Demo"}
          </button>

          <Link href="/campaign/camp-techfest-2026">
            <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5" />
              Explore Demo Campaign
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="default" size="sm" className="bg-white text-navy-950 font-semibold hover:bg-slate-100">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-navy-900/95 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-navy-800 text-emerald-400" : "text-slate-300 hover:bg-navy-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/campaign/camp-techfest-2026"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="emerald" size="sm" className="w-full">
                Explore Demo Campaign
              </Button>
            </Link>
            <button
              onClick={handleResetDemo}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-slate-400 hover:bg-navy-800 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Dataset
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
