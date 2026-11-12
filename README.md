<div align="center">

<img src="public/logo.png" width="96" height="96" alt="GatherBuy AI" />

<h1>GatherBuy AI</h1>

<h3>Group purchasing, intelligently managed.</h3>

<p>One autonomous AI agent to organize your group purchases, compare supplier quotations,<br/>calculate fair individual contributions, and simplify PayPal payments.</p>

<br/>

<a href="https://gatherbuy-ai.vercel.app"><img src="https://img.shields.io/badge/🌐  Live App-gatherbuy--ai.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App"/></a>&nbsp;
<a href="#-demo-video"><img src="https://img.shields.io/badge/🎬  Demo Video-Watch Now-ef4444?style=for-the-badge&logo=youtube&logoColor=white" alt="Demo Video"/></a>&nbsp;
<a href="https://github.com/Shreyanshjain3725/gatherbuy-ai"><img src="https://img.shields.io/badge/⭐  GitHub-Shreyanshjain3725-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

<br/><br/>

<img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind CSS-3-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Gemini AI-1.5 Flash-4285F4?style=flat-square&logo=google" alt="Gemini"/>
<img src="https://img.shields.io/badge/PayPal-Orders API v2-003087?style=flat-square&logo=paypal" alt="PayPal"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" alt="Vercel"/>
<img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License"/>

<br/><br/>

> *Buy together. Save together. Pay fairly.*

</div>

---

## 🎬 Demo Video

<div align="center">

> 📽️ **[▶ Watch the full product walkthrough](#)** — *(Record your demo and drop the YouTube / Loom link here)*

No video yet? Explore the **live app** directly — no signup required.<br/>
Hit **"Explore Live Demo"** on the landing page for an instant guided walkthrough.

</div>

---

## 🌐 Live Application

<div align="center">

| | |
|:---:|:---:|
| **[🚀 Open Live App](https://gatherbuy-ai.vercel.app)** | **[🎮 Try Demo Campaign](https://gatherbuy-ai.vercel.app/join/TECH26)** |
| [📊 Dashboard](https://gatherbuy-ai.vercel.app/dashboard) | [✨ Create New Campaign](https://gatherbuy-ai.vercel.app/campaign/new) |

</div>

---

## 📸 Screenshots

### Landing Page
![GatherBuy AI — Landing Page](public/screenshots/hero.jpg)

### Procurement Dashboard
![GatherBuy AI — Dashboard](public/screenshots/dashboard.jpg)

---

## 🧭 How It Works

```
 Natural Language Input
        ↓
 AI Procurement Agent  (Google Gemini)
        ↓
 Structured Purchase Campaign
        ↓
 Supplier Quotation Comparison & Landed Cost Analysis
        ↓
 AI Recommendation & Risk Auditing
        ↓
 FairShare Engine  (Hare-Niemeyer Largest-Remainder)
        ↓
 Member Invitations & Item Selections
        ↓
 PayPal Checkout  (Orders API v2 — Sandbox)
        ↓
 Server-Side Payment Verification & Idempotency
        ↓
 Live Purchase Progress & Audit Trail
```

---

## ✨ Key Features

### 🤖 Conversational AI Procurement Agent
- Converts plain English into structured, Zod-validated JSON campaigns via Google Gemini
- Asks smart clarifying questions — never hallucinates missing data
- Real-time AI advisor you can query anytime:
  - *"Can we cut the budget by 15%?"*
  - *"Which supplier is best?"*
  - *"How much does each person owe?"*
- **AI never controls payment amounts** — all monetary math is deterministic server-side
- Graceful fallback mode when no Gemini API key is configured

### 📊 Smart Supplier Comparison
- Computes true **landed cost**: `Subtotal + Shipping + Tax − Discounts`
- Side-by-side comparison with **Recommended**, **Lowest Cost**, and **Fastest** badges
- MOQ & deadline risk detection — warns before you commit
- Explains tradeoffs in plain language using real computed values

### ⚖️ FairShare Contribution Engine
- **Hare-Niemeyer Largest-Remainder Algorithm** in integer cents — zero rounding drift
- Mathematically guaranteed: every member's share sums exactly to the total
- Proportional freight & tax allocation per member
- Interactive what-if simulator — switch supplier, change quantity, member drops out

### 💳 PayPal Sandbox Integration
- Full **PayPal Orders API v2** — server-side order creation + capture
- Client secret never exposed to the browser
- Payments only confirmed after Sandbox capture verification
- Idempotent transaction handling — no duplicate charges
- Clearly-labelled Demo simulation mode when credentials are absent

### 👥 Participant Invitations & Checkout
- Unique shareable invite link + code (e.g. `TECH26`)
- Interactive item picker with sizes, colors, and quantities
- Live FairShare preview before payment
- Confetti celebration on successful PayPal Sandbox checkout 🎉

### 📄 Export & Audit Trail
- Download procurement reports as **CSV** and **PDF**
- Real-time transaction ledger at `/transactions`

---

## 💳 How We Use PayPal

GatherBuy AI integrates the **PayPal Developer Platform** through the **PayPal Orders API v2** to handle real collaborative payments in a group purchasing workflow. Here's exactly how PayPal is used at every stage:

### Order Creation (`POST /api/paypal/create-order`)
When a group member clicks "Pay My Share," the backend calculates their exact contribution using the deterministic FairShare engine (never a client-provided amount) and calls the PayPal Orders API to create a new order:

```
POST https://api-m.sandbox.paypal.com/v2/checkout/orders
{
  "intent": "CAPTURE",
  "purchase_units": [{
    "amount": { "currency_code": "USD", "value": "<member_share>" },
    "description": "GatherBuy AI — <campaign_name> — <member_name>"
  }]
}
```

- The **PayPal Client Secret** is used server-side to obtain an OAuth Bearer token — it is never exposed to the frontend.
- The order amount is computed on the server from the campaign's landed cost and the member's proportional allocation — the client cannot manipulate the payment amount.

### Client-Side Approval (PayPal JavaScript SDK)
The frontend loads the **PayPal JavaScript SDK** (`@paypal/paypal-js`) using the **Sandbox Client ID** (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`). The PayPal buttons are rendered on the join/checkout page. When the member approves the payment in the PayPal popup, the SDK returns the `orderID`.

### Order Capture (`POST /api/paypal/capture-order`)
After approval, the backend calls PayPal to capture the funds:

```
POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture
```

- The backend verifies the capture response: `status === "COMPLETED"`, correct `amount`, and correct `currency_code`.
- Only after this server-side verification is the member's payment recorded in the application database.
- **Idempotency** is enforced — if a capture is attempted twice for the same member/campaign, the duplicate is safely rejected.

### Transaction Audit Trail
Every successful PayPal capture is logged with the PayPal Order ID, member name, amount, timestamp, and campaign reference. These are displayed in the `/transactions` audit ledger and can be exported as CSV/PDF.

### Demo Mode
When PayPal Sandbox credentials are not configured, the app enters a clearly-labelled **Demo Simulation Mode** that generates realistic-looking sample transactions. These are explicitly marked as simulated and never claim to be real PayPal transactions.

**Files:** [`src/lib/paypal/`](src/lib/paypal/) · [`src/app/api/paypal/create-order/`](src/app/api/paypal/create-order/) · [`src/app/api/paypal/capture-order/`](src/app/api/paypal/capture-order/)

---

## 🤖 How We Use AI (Google Gemini)

GatherBuy AI integrates the **Google Gemini API** (`gemini-1.5-flash` model via the `@google/generative-ai` SDK) as an intelligent procurement agent that assists users throughout the group purchasing lifecycle. AI is used meaningfully — not as a gimmick — to solve real problems.

### 1. Natural Language → Structured Campaign (`POST /api/ai/campaign`)

Users describe their purchase in plain English:

> *"We need 25 hoodies, 30 T-shirts, and 50 badges for our college tech fest. Budget is $800. Everything should arrive by November 25."*

The Gemini model parses this into a **structured JSON campaign** validated with Zod:

```json
{
  "campaign_name": "Tech Fest Merchandise",
  "description": "Bulk merchandise procurement for college tech fest",
  "budget": 800,
  "deadline": "2026-11-25",
  "products": [
    { "name": "Hoodie", "quantity": 25 },
    { "name": "T-shirt", "quantity": 30 },
    { "name": "Badge", "quantity": 50 }
  ],
  "clarifying_questions": []
}
```

When information is missing or ambiguous, the AI asks **clarifying questions** instead of guessing.

### 2. Real-Time AI Advisor (`POST /api/ai/advisor`)

Once a campaign is active, the AI advisor answers questions using **actual campaign data** — supplier quotes, member contributions, budget figures — injected into the prompt context:

- *"Which supplier gives us the best deal and why?"* → AI compares real landed costs
- *"Can we cut the budget by 15%?"* → AI analyzes feasibility against current quotes
- *"What risks do you see in this campaign?"* → AI flags MOQ conflicts, tight deadlines, suspiciously low quotes
- *"How much will each person contribute?"* → AI explains the FairShare allocation

### 3. Procurement Analysis & Recommendations

The AI performs multi-dimensional supplier analysis:
- Evaluates tradeoffs (lower unit price with higher shipping vs. higher unit price with free shipping)
- Detects risks: quotes exceeding budget, delivery dates after deadline, MOQ minimums not met
- Suggests budget optimization strategies

### Critical Design Principle: AI ≠ Calculator

> **All monetary calculations are deterministic and server-side.** The AI model interprets, explains, and recommends — but it never computes authoritative payment amounts. Prices, totals, fees, allocations, and PayPal order amounts are calculated using the FairShare engine (Hare-Niemeyer algorithm) in integer cents.

### Fallback Mode

When the `GEMINI_API_KEY` environment variable is not configured, the app switches to a **deterministic fallback mode** that returns pre-structured responses. This is clearly indicated in the UI so users know AI is not active.

**Files:** [`src/lib/ai/`](src/lib/ai/) · [`src/app/api/ai/campaign/`](src/app/api/ai/campaign/) · [`src/app/api/ai/advisor/`](src/app/api/ai/advisor/)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 — App Router, Server API Routes, TypeScript |
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

### 1. Clone
```bash
git clone https://github.com/Shreyanshjain3725/gatherbuy-ai.git
cd gatherbuy-ai
```

### 2. Install
```bash
npm install
```

### 3. Configure `.env.local`
```bash
# Google Gemini AI — https://aistudio.google.com
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# PayPal Sandbox — https://developer.paypal.com
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

> **No API keys?** The app runs fully in Demo Mode with realistic sample data and simulated PayPal payments — zero configuration needed.

### 4. Run tests
```bash
node --test test/business-logic.test.mjs
```

### 5. Dev server
```bash
npm run dev
# → http://localhost:3000
```

### 6. Production build
```bash
npm run build && npm start
```

---

## 🎮 Pre-loaded Demo Campaign

**"TechFest 2026 — Merchandise Procurement"** · Invite Code: `TECH26`

| | |
|---|---|
| **Products** | Heavyweight Hoodies, Poly-Cotton T-shirts, Laser-Etched Badges |
| **Members** | 5 participants (Alex, Samantha, Marcus, Priya, Liam) |
| **Suppliers** | 3 competing quotes (Apex Merch, PrintCraft, Velocity Express) |
| **Status** | \$119.41 collected / \$850.00 total |
| **Join** | [gatherbuy-ai.vercel.app/join/TECH26](https://gatherbuy-ai.vercel.app/join/TECH26) |

> Hit **Reset Demo** in the navbar to restore pristine seed data at any time.

---

## 🔒 Security & Fintech Standards

1. **Deterministic monetary math** — AI never outputs binding amounts; all payment calculations are server-side in integer cents
2. **Credential isolation** — PayPal Client Secret and Supabase Service Role key are strictly server-side
3. **Capture verification** — payments only confirmed after PayPal Sandbox capture response
4. **Idempotency** — duplicate capture requests are safely detected and rejected
5. **No escrow** — GatherBuy AI facilitates direct payments, never acts as an intermediary

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

Deployed on **Vercel** — every push to `main` triggers an automatic production deployment.

```bash
npx vercel --prod   # manual deploy
```

**Required environment variables in Vercel:**
`GEMINI_API_KEY` · `NEXT_PUBLIC_PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_BASE_URL` · `PAYPAL_CURRENCY` · `DEMO_MODE`

---

## 📄 License

This project is licensed under the **MIT License** — an [OSI-approved](https://opensource.org/licenses/MIT) open source license.

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

<img src="public/logo.png" width="48" height="48" alt="GatherBuy AI" />

**GatherBuy AI** — Intelligent Agent for Group Commerce

<a href="https://gatherbuy-ai.vercel.app">gatherbuy-ai.vercel.app</a> · <a href="https://github.com/Shreyanshjain3725/gatherbuy-ai">GitHub</a>

*Buy together. Save together. Pay fairly.*

© 2026 GatherBuy AI Technologies Inc.

</div>
