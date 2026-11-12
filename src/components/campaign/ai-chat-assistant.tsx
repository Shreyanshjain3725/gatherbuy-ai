"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";
import { Campaign } from "@/lib/db/schema";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  risks?: Array<{
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
    mitigation: string;
  }>;
  tips?: string[];
  isFallback?: boolean;
}

export function AIChatAssistant({ campaign }: { campaign: Campaign }) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your AI Procurement Advisor for "${campaign.title}". I monitor supplier landed costs, delivery risks, and fair member allocations. How can I optimize your campaign today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Which supplier is the best option?",
    "Can we reduce the total budget by 15%?",
    "How much will each person need to contribute?",
    "Can you identify problems in the current campaign?",
  ];

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, campaignId: campaign.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get advice");
      }

      const advisorData = data.data;
      const assistantMsg: Message = {
        role: "assistant",
        content: advisorData.direct_answer_to_user || advisorData.analysis,
        risks: advisorData.risks_detected,
        tips: advisorData.budget_optimization_tips,
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Apologies, I encountered an issue analyzing the campaign: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-slate-800 bg-navy-900/80 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-navy-950/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-navy-950 font-bold shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Autonomous Procurement Advisor
            </h4>
            <p className="text-[11px] text-slate-400">
              Powered by Google Gemini • Grounded in Deterministic Server Calculations
            </p>
          </div>
        </div>

        <Badge variant="emerald" size="sm" className="hidden sm:inline-flex">
          Online
        </Badge>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-navy-850/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          Quick queries:
        </span>
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendQuery(sq)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-emerald-500 text-navy-950 font-medium rounded-tr-none shadow-glow"
                    : "bg-navy-800/90 text-slate-200 border border-slate-700/70 rounded-tl-none shadow-md"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Detected Risks Box */}
                {!isUser && msg.risks && msg.risks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span>Audited Risk Detection:</span>
                    </div>
                    {msg.risks.map((risk, ri) => (
                      <div
                        key={ri}
                        className={`p-2 rounded-lg border text-[11px] ${
                          risk.severity === "high"
                            ? "bg-red-500/10 border-red-500/30 text-red-300"
                            : risk.severity === "medium"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{risk.title}</span>
                          <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
                            {risk.severity}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-300">{risk.description}</p>
                        <div className="mt-1 text-[10px] text-emerald-400">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optimization Tips Box */}
                {!isUser && msg.tips && msg.tips.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Lightbulb className="h-3.5 w-3.5 text-lime-400" />
                      <span>Cost Reduction Recommendations:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
                      {msg.tips.map((tip, ti) => (
                        <li key={ti}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fallback mode indicator tag */}
                {!isUser && msg.isFallback && (
                  <div className="mt-2 text-[10px] text-slate-400 italic">
                    ℹ️ Analyzed via built-in deterministic rules (GEMINI_API_KEY optional)
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-slate-300 border border-slate-700">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <span>GatherBuy AI is analyzing supplier quotes and campaign totals...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-navy-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask questions about suppliers, budget cuts, risks, or participant shares..."
            disabled={loading}
            className="flex-1 h-10 px-4 rounded-xl bg-navy-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
          </input>
          <Button
            type="submit"
            variant="emerald"
            size="sm"
            disabled={!inputQuery.trim() || loading}
            className="h-10 px-4 gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
