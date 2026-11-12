"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Layers,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StructuredCampaignOutput } from "@/lib/ai/gemini";
import { formatCurrency } from "@/lib/utils";

export default function NewCampaignPage() {
  const router = useRouter();
  const [prompt, setPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form state (populated either by AI or manual input)
  const [campaignTitle, setCampaignTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Merchandise & Apparel");
  const [targetBudget, setTargetBudget] = React.useState<number>(800);
  const [deadline, setDeadline] = React.useState("2026-11-25");
  const [organizerName, setOrganizerName] = React.useState("Alex Rivera");
  const [organizerEmail, setOrganizerEmail] = React.useState("alex.rivera@techfest.org");

  const [products, setProducts] = React.useState<
    Array<{
      name: string;
      quantity: number;
      estimated_unit_cost: number;
      options?: Array<{ name: string; values: string[] }>;
    }>
  >([
    {
      name: "Hoodie",
      quantity: 25,
      estimated_unit_cost: 22.0,
      options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    },
    {
      name: "T-shirt",
      quantity: 30,
      estimated_unit_cost: 11.0,
      options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    },
    {
      name: "Badge",
      quantity: 50,
      estimated_unit_cost: 3.5,
      options: [{ name: "Finish", values: ["Matte Black", "Silver"] }],
    },
  ]);

  const [clarifyingQuestions, setClarifyingQuestions] = React.useState<string[]>([]);
  const [isAiParsed, setIsAiParsed] = React.useState(false);
  const [aiNotice, setAiNotice] = React.useState<string | null>(null);

  const samplePrompts = [
    "We are organizing a college tech fest. We need 25 hoodies, 30 T-shirts and 50 badges. Our budget is $800. All products should arrive by November 25.",
    "Startup buying 10 ergonomic chairs, 5 standing desks, and 12 dual-monitor arms with a $3,500 budget for our new co-working hub.",
    "Friends trip to Yosemite: need 4 camping tents, 6 sleeping bags, and 2 portable cooking stoves. Target budget $600 by July 15.",
  ];

  const handleGenerateWithAI = async (selectedPrompt?: string) => {
    const textToRun = selectedPrompt || prompt;
    if (!textToRun.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setAiNotice(null);

    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToRun }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate campaign");
      }

      const parsed: StructuredCampaignOutput = data.data;
      setCampaignTitle(parsed.campaign_name);
      setDescription(parsed.description);
      setCategory(parsed.category || "Merchandise & Apparel");
      setTargetBudget(parsed.budget);
      setDeadline(parsed.deadline);
      setProducts(parsed.products);
      setClarifyingQuestions(parsed.clarifying_questions || []);
      setIsAiParsed(true);
      setAiNotice(data.message);
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setErrorMessage(err.message || "Failed to parse requirements");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: "New Product Item",
        quantity: 10,
        estimated_unit_cost: 15.0,
        options: [{ name: "Size", values: ["S", "M", "L"] }],
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || products.length === 0) {
      setErrorMessage("Please specify campaign title and at least one product.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle,
          description,
          category,
          target_budget: targetBudget,
          deadline,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          currency: "USD",
          items: products.map((p) => ({
            name: p.name,
            target_quantity: p.quantity,
            unit_cost_estimate: p.estimated_unit_cost,
            options: p.options || [],
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push(`/campaign/${data.data.id}`);
    } catch (err: any) {
      console.error("Submit campaign error:", err);
      setErrorMessage(err.message || "Could not launch campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          <span>Create Purchasing Campaign with AI</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Describe what your group needs in plain English. GatherBuy AI parses products, target quantities, budget, and deadlines into an organized campaign.
        </p>
      </div>

      {/* AI Prompt Input Box */}
      <Card className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Describe Your Group Purchase</span>
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. We are organizing a college tech fest. We need 25 hoodies, 30 T-shirts and 50 badges. Our budget is $800. All products should arrive by November 25."
            className="w-full p-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Sample Prompt Chips */}
        <div className="space-y-2">
          <span className="text-[11px] text-slate-400">Or try a sample prompt:</span>
          <div className="flex flex-col sm:flex-row gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sp);
                  handleGenerateWithAI(sp);
                }}
                className="text-left text-[11px] p-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-colors line-clamp-1"
              >
                "{sp.slice(0, 55)}..."
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="emerald"
            size="md"
            onClick={() => handleGenerateWithAI()}
            isLoading={isGenerating}
            disabled={!prompt.trim() || isGenerating}
            className="font-bold text-xs gap-1.5 shadow-glow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Parse & Structure with AI</span>
          </Button>
        </div>

        {aiNotice && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{aiNotice}</span>
          </div>
        )}
      </Card>

      {/* Clarifying Questions Detected by AI */}
      {clarifyingQuestions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            <span>Clarifying Questions Identified by AI:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            {clarifyingQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Review & Launch Campaign Form */}
      <form onSubmit={handleLaunchCampaign} className="space-y-6">
        <Card className="glass-panel p-6 border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Review Structured Campaign Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-medium text-slate-300">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-medium text-slate-300">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Target Budget ($ USD)</label>
              <input
                type="number"
                step="10"
                value={targetBudget}
                onChange={(e) => setTargetBudget(parseFloat(e.target.value) || 0)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Delivery Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Organizer Name</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Organizer Email</label>
              <input
                type="email"
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Products in Group Order ({products.length})
              </label>
              <button
                type="button"
                onClick={handleAddProduct}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {products.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-navy-850/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProducts((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, name: val } : p))
                        );
                      }}
                      placeholder="Product name"
                      className="h-8 px-2.5 rounded-lg bg-navy-800 border border-slate-700 text-white"
                    />

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setProducts((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, quantity: val } : p))
                          );
                        }}
                        className="h-8 w-20 px-2 rounded-lg bg-navy-800 border border-slate-700 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Est. Cost:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.estimated_unit_cost}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setProducts((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, estimated_unit_cost: val } : p
                            )
                          );
                        }}
                        className="h-8 w-24 px-2 rounded-lg bg-navy-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-navy-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Generates a unique shareable invite link for your group members.
            </span>
            <Button
              type="submit"
              variant="emerald"
              size="lg"
              isLoading={isSubmitting}
              className="font-bold gap-2 text-xs shadow-glow"
            >
              <span>Launch Campaign</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
