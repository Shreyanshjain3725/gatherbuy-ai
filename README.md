<div align="center">

<img src="https://gatherbuy-ai.vercel.app/icon.svg" width="72" height="72" alt="GatherBuy AI Logo" />

# GatherBuy AI

### Group purchasing, intelligently managed.

**One autonomous AI agent to organize your group purchases, compare supplier quotations, calculate fair individual contributions, and simplify PayPal payments.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-gatherbuy--ai.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://gatherbuy-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Shreyanshjain3725%2Fgatherbuy--ai-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shreyanshjain3725/gatherbuy-ai)
[![Deploy Status](https://img.shields.io/badge/Deploy-Passing-10b981?style=for-the-badge&logo=vercel)](https://vercel.com/shreyanshjain3725/gatherbuy-ai)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)

<br/>

> **Buy together. Save together. Pay fairly.**

</div>

---

## 🌐 Live Application

| | Link |
|---|---|
| 🚀 **Live App** | **[gatherbuy-ai.vercel.app](https://gatherbuy-ai.vercel.app)** |
| 🎮 **Demo Campaign** | [gatherbuy-ai.vercel.app/join/TECH26](https://gatherbuy-ai.vercel.app/join/TECH26) |
| 📊 **Dashboard** | [gatherbuy-ai.vercel.app/dashboard](https://gatherbuy-ai.vercel.app/dashboard) |
| ✨ **New Campaign** | [gatherbuy-ai.vercel.app/campaign/new](https://gatherbuy-ai.vercel.app/campaign/new) |

---

## 📸 Screenshots

### Landing Page
![GatherBuy AI Landing Page](public/screenshots/hero.jpg)

### Procurement Dashboard
![GatherBuy AI Dashboard](public/screenshots/dashboard.jpg)

---

## 🎬 Demo Video

> 📽️ **[Watch the full product walkthrough →](#)** *(Coming soon — record your demo and paste the link here)*
>
> Or explore the **live demo** instantly at [gatherbuy-ai.vercel.app](https://gatherbuy-ai.vercel.app) — no signup needed. Click **"Explore Live Demo"** on the landing page.

---

## 🧭 Product Walkthrough

The complete GatherBuy AI workflow:

```
USER REQUIREMENTS  (Natural Language)
        ↓
AI PROCUREMENT AGENT  (Google Gemini)
        ↓
STRUCTURED PURCHASE CAMPAIGN
        ↓
SUPPLIER QUOTATION COMPARISON & LANDED COST ANALYSIS
        ↓
AI RECOMMENDATION & RISK AUDITING
        ↓
FAIRSHARE ENGINE  (Hare-Niemeyer Largest-Remainder Algorithm)
        ↓
MEMBER INVITATIONS & ITEM SELECTIONS
        ↓
PAYPAL CHECKOUT  (Orders API v2 — Sandbox)
        ↓
SERVER-SIDE PAYMENT VERIFICATION & IDEMPOTENCY
        ↓
LIVE PURCHASE PROGRESS & AUDIT TRAIL
```

---

## ✨ Key Features

### 🤖 Conversational AI Procurement Agent
- Converts plain English into structured, validated JSON campaigns using Google Gemini + Zod
- Asks useful clarifying questions rather than hallucinating missing data
- Real-time AI advisor — ask anything about your campaign:
  - *"Can we reduce the total budget by 15%?"*
  - *"Which supplier is the best option?"*
  - *"How much will each person contribute?"*
- **AI never controls payment amounts** — all monetary math is deterministic server-side
- Graceful fallback mode when no Gemini API key is configured

### 📊 Smart Supplier Comparison
- Computes true **landed cost** = `Item Subtotal + Shipping + Tax - Discounts`
- Side-by-side multi-supplier comparison with **Recommended**, **Lowest Cost**, and **Fastest** badges
- MOQ & deadline risk detection — warns before you commit
- Explains tradeoffs: a \$15 unit price + \$50 shipping vs \$16 unit + \$10 shipping

### ⚖️ FairShare Contribution Engine
- **Hare-Niemeyer Largest-Remainder Algorithm** in integer cents — zero rounding drift
- Mathematically guaranteed: $\sum \text{Member Shares} = \text{Total Order Value}$
- Proportional freight & tax allocation per member
- Interactive what-if simulator (switch supplier, change quantity, member drops out)

### 💳 PayPal Sandbox Integration
- Full **PayPal Orders API v2** — server-side order creation + capture
- Client secret never exposed to the browser
- Capture verification — only marks paid after Sandbox confirmation
- Idempotent transaction handling — no duplicate captures
- Demo simulation mode when credentials are absent (clearly labelled)

### 👥 Participant Invitations & Checkout
- Unique shareable invite link + code (e.g. `TECH26`)
- Interactive item picker — sizes, colors, quantities
- Live FairShare preview before payment
- Confetti celebration on successful PayPal Sandbox checkout

### 📄 Export & Audit Trail
- Download procurement reports as **CSV** and **PDF**
- Real-time transaction ledger at `/transactions`

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router, Server API Routes, TypeScript) |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Glassmorphism, Custom Dark Theme |
| **Animation** | Framer Motion, Canvas Confetti |
| **Validation** | Zod |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **Payments** | PayPal Orders API v2, PayPal Sandbox JS SDK |
| **Database** | Supabase PostgreSQL + In-Memory Demo Store |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Testing** | Node.js built-in Test Runner |

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Shreyanshjain3725/gatherbuy-ai.git
cd gatherbuy-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file:
```bash
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key        # https://aistudio.google.com
GEMINI_MODEL=gemini-1.5-flash

# PayPal Sandbox  — https://developer.paypal.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CURRENCY=USD

# Supabase (optional — in-memory demo store is active by default)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
DEMO_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **No API keys? No problem.** The app runs fully in Demo Mode with realistic sample data and simulated PayPal payments right out of the box.

### 4. Run tests
```bash
node --test test/business-logic.test.mjs
```

### 5. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 6. Build for production
```bash
npm run build && npm start
```

---

## 🎮 Demo Experience

The app ships with a pre-seeded flagship campaign:

### **"TechFest 2026 — Merchandise Procurement"** · Invite Code: `TECH26`

| Detail | Value |
|---|---|
| Products | Heavyweight Hoodies, Poly-Cotton T-shirts, Laser-Etched Enamel Badges |
| Participants | 5 members (Alex Rivera, Samantha Chen, Marcus Vance, Priya Patel, Liam O'Connor) |
| Suppliers | 3 competing quotes (Apex Merch Co., PrintCraft Direct, Velocity Express) |
| Status | \$119.41 collected / \$850.00 total — 2 paid, 3 pending |
| Join Link | [gatherbuy-ai.vercel.app/join/TECH26](https://gatherbuy-ai.vercel.app/join/TECH26) |

Hit **Reset Demo** in the navbar anytime to restore fresh seed data.

---

## 🔒 Security & Fintech Standards

1. **Deterministic monetary math** — AI never outputs binding amounts; all payment calculations happen server-side in integer cents
2. **Credential isolation** — PayPal Client Secret and Supabase Service Role key are strictly server-side
3. **Capture verification** — payments only confirmed after PayPal Sandbox capture response
4. **Idempotency** — duplicate capture requests are safely detected and rejected
5. **No escrow** — GatherBuy AI facilitates direct payments, never acts as an escrow intermediary

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Auth & demo entry
│   ├── dashboard/                # Main dashboard
│   ├── campaign/[id]/            # Campaign detail + AI advisor
│   ├── campaign/[id]/suppliers/  # Supplier comparison
│   ├── campaign/new/             # AI campaign creator
│   ├── join/[code]/              # Member invite & checkout
│   ├── transactions/             # Payment audit ledger
│   ├── settings/                 # App settings
│   └── api/                      # Backend API routes
│       ├── ai/                   # Gemini AI endpoints
│       ├── campaigns/            # Campaign CRUD
│       ├── paypal/               # PayPal Orders API v2
│       ├── fairshare/            # Contribution calculator
│       └── demo/                 # Demo reset
├── components/                   # Reusable UI components
└── lib/
    ├── ai/                       # Gemini integration
    ├── db/                       # In-memory store + seed data
    ├── paypal/                   # PayPal SDK wrapper
    └── utils/                    # Business logic (deterministic)
```

---

## 🚀 Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

```bash
# Deploy manually
npx vercel --prod
```

**Vercel Environment Variables** (set in dashboard or via CLI):
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_BASE_URL`
- `PAYPAL_CURRENCY`
- `DEMO_MODE`

---

<div align="center">

**GatherBuy AI** — Intelligent Agent for Group Commerce

[gatherbuy-ai.vercel.app](https://gatherbuy-ai.vercel.app) · [GitHub](https://github.com/Shreyanshjain3725/gatherbuy-ai)

*Buy together. Save together. Pay fairly.*

© 2026 GatherBuy AI Technologies Inc.

</div>
