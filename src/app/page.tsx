import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  TrendingDown,
  Layers,
  ShoppingBag,
  CreditCard,
  Percent,
  Sliders,
  DollarSign,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/campaign/progress-bar";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-navy-950">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial-gradient pointer-events-none" />
      <div className="absolute top-48 right-0 w-[600px] h-[600px] bg-radial-blue pointer-events-none opacity-40" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-glow">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Collaborative Purchasing Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
            Group purchasing, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 bg-clip-text text-transparent">
              intelligently managed.
            </span>
          </h1>

          {/* Tagline & Supporting Text */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            One autonomous agent to organize your group purchases, compare supplier quotations, calculate fair individual contributions, and simplify PayPal payments.
          </p>

          <div className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <span>Buy together.</span>
            <span>•</span>
            <span>Save together.</span>
            <span>•</span>
            <span>Pay fairly.</span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link href="/campaign/new" className="w-full sm:w-auto">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto gap-2 font-bold px-8 shadow-glow">
                Start a Campaign
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/campaign/camp-techfest-2026" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-slate-700 bg-navy-900/60 hover:bg-navy-800">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Explore Live Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Realistic Interactive Product Dashboard Preview */}
        <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-lime-500/20 blur-xl opacity-70" />
          <div className="relative rounded-2xl border border-slate-800 bg-navy-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-navy-950/80">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-400 ml-2 font-mono">
                  gatherbuy.ai/campaign/camp-techfest-2026
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm">
                  Active Sandbox
                </Badge>
              </div>
            </div>

            {/* Dashboard Content Mock */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
                    <span>TechFest 2026 Engineering Committee</span>
                    <span>•</span>
                    <span>Code: TECH26</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Official Bulk Merchandise Procurement
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Landed Budget</div>
                    <div className="text-xl font-extrabold text-white">$748.25</div>
                  </div>
                  <Link href="/campaign/camp-techfest-2026">
                    <Button variant="emerald" size="sm" className="font-semibold text-xs">
                      View Cockpit
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Live Metric Progress */}
              <div className="p-4 rounded-xl bg-navy-850/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Collected: <strong className="text-emerald-400">$119.41</strong> / $748.25
                  </span>
                  <span className="text-slate-400">
                    2 of 5 members paid • 3 awaiting PayPal Sandbox capture
                  </span>
                </div>
                <ProgressBar value={119.41} max={748.25} />
              </div>

              {/* 3 Interactive Highlight Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Column 1: AI Advisor */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Cpu className="h-4 w-4" />
                    <span>AI Procurement Reasoner</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "Apex Merch delivers landed cost of $748.25 in 6 days. Compared to PrintCraft, saves 8 transit days with lower freight fees."
                  </p>
                </div>

                {/* Column 2: FairShare */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-lime-400">
                    <Percent className="h-4 w-4" />
                    <span>Hare-Niemeyer FairShare</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Integer cents allocation. Proportional shipping ($35.00) divided strictly by individual pick volume. Zero rounding drift.
                  </p>
                </div>

                {/* Column 3: PayPal Sandbox */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-400">
                    <CreditCard className="h-4 w-4" />
                    <span>PayPal Orders API v2</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Server-side order generation and verified capture. Idempotent transaction ledger with instant activity stream.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Complete Journey (How It Works) */}
      <section className="py-20 border-t border-slate-800/80 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              The Autonomous Workflow
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              From natural language to verified group checkout in minutes.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                1
              </span>
              <h4 className="text-base font-bold text-white">Describe in Plain English</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your requirements naturally: "We need 25 hoodies, 30 tees, and 50 badges by Nov 25 with an $800 budget."
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                2
              </span>
              <h4 className="text-base font-bold text-white">Compare Landed Quotes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log multiple supplier quotes. AI analyzes unit pricing, shipping, tax rates, and delivery speed to recommend the best option.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                3
              </span>
              <h4 className="text-base font-bold text-white">FairShare Allocation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Members select their custom quantities and sizes. Our engine computes their exact proportional share of shipping and discounts down to the cent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                4
              </span>
              <h4 className="text-base font-bold text-white">PayPal Sandbox Checkout</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each member completes their individual payment with PayPal Sandbox. Backend captures and verifies transaction authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real PayPal Developer Platform Integration Highlight */}
      <section className="py-20 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>PayPal Developer Platform Integration</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Enterprise-grade payments via PayPal Sandbox APIs.
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                GatherBuy AI implements genuine server-side PayPal order creation and capture using the official PayPal Orders API v2.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Authoritative Server-Side Calculation:</strong> Payable amounts are calculated exclusively on the server — never trusted from client input.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Strict Amount & Currency Verification:</strong> Orders are verified against captured amount and currency before updating campaign progress.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Idempotency & Fraud Protection:</strong> Duplicate captures and replay attacks are safely rejected.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Full Demo Simulation Mode:</strong> Seamless evaluation experience with mock sandbox captures when credentials are not configured.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/transactions">
                  <Button variant="secondary" size="md" className="gap-2 text-xs">
                    View Real-Time Transaction Audit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code / Visual Box */}
            <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">POST /api/paypal/create-order</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">200 OK</span>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-navy-950 border border-slate-800/80">
{`{
  "orderId": "PAYPAL-ORD-882194",
  "intent": "CAPTURE",
  "purchase_units": [{
    "amount": {
      "currency_code": "USD",
      "value": "51.96",
      "breakdown": {
        "item_total": { "value": "47.00" },
        "shipping": { "value": "5.45" },
        "tax_total": { "value": "3.38" },
        "discount": { "value": "3.87" }
      }
    }
  }],
  "status": "CREATED"
}`}
              </pre>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Verification: Server-Side Validated</span>
                <span className="text-emerald-400 font-semibold">Ready for Capture</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-navy-900/60 to-navy-950 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to experience collaborative purchasing?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Test the complete journey: create a campaign with Gemini AI, compare landed supplier costs, simulate scenarios with FairShare, and checkout with PayPal Sandbox.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/campaign/camp-techfest-2026">
              <Button variant="emerald" size="lg" className="gap-2 font-bold px-8 shadow-glow">
                Explore Demo Campaign
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="border-slate-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
