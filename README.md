# GatherBuy AI
### An Intelligent Agent for Collaborative Purchasing and Payments

> **Tagline:** *Buy together. Save together. Pay fairly.*  
> **Platform:** Enterprise AI Procurement & Collaborative Payments.

---

## 🚀 Overview

Organizing purchases among multiple people is notoriously painful. Group organizers face endless manual friction:
- Collecting disparate item picks, sizing, and quantity preferences.
- Contacting suppliers, deciphering minimum order quantities (MOQs), shipping freight, and sales tax quotes.
- Splitting shared costs (like shipping and tax) fairly without arbitrary rounding discrepancies.
- Manually following up with participants to collect individual payments.

**GatherBuy AI** automates this entire lifecycle with an end-to-end intelligent agent workflow:

```
USER REQUIREMENTS (Natural Language)
        ↓
AI PROCUREMENT AGENT (Google Gemini SDK)
        ↓
STRUCTURED PURCHASE CAMPAIGN
        ↓
SUPPLIER QUOTATION COMPARISON & LANDED COST INTELLIGENCE
        ↓
AI RECOMMENDATION & RISK AUDITING
        ↓
FAIRSHARE DETERMINISTIC ENGINE (Hare-Niemeyer Algorithm)
        ↓
MEMBER INVITATIONS & INTERACTIVE SELECTIONS
        ↓
PAYPAL CHECKOUT (PayPal Orders API v2)
        ↓
SERVER-SIDE PAYMENT VERIFICATION & IDEMPOTENCY
        ↓
LIVE PURCHASE PROGRESS & AUDIT TRAIL
```

---

## 🌟 Key Features

### 1. 🤖 Conversational AI Procurement Agent
- **Natural Language Understanding:** Converts unstructured prompts (e.g., *"We need 25 hoodies, 30 tees, and 50 badges by Nov 25 with an $800 budget."*) into validated, structured JSON campaigns using Zod.
- **Clarification:** Asks useful clarifying questions rather than hallucinating missing data.
- **Interactive Advisor:** Organizers can ask questions in real time:
  - *"Can we reduce the total budget by 15%?"*
  - *"Which supplier is the best option?"*
  - *"How much will each person need to contribute?"*
  - *"Can you identify problems in the current campaign?"*
- **Strict Separation of Concerns:** AI models interpret, explain, and recommend, but **never calculate authoritative monetary sums**. All currency allocations are computed deterministically on the backend.
- **Zero-Downtime Deterministic Fallback:** Automatically operates cleanly even if a Gemini API key is not configured.

### 2. 📊 Supplier Management & Smart Comparison
- **True Landed Cost:** Computes `Item Subtotal + Shipping Freight + Sales Tax - Volume Discounts`.
- **Intelligent Tradeoff Analysis:** Compares suppliers side-by-side (e.g., a $15 unit price with $50 shipping and 10-day lead time vs a $16 unit price with $10 shipping and 4-day delivery).
- **Ranking Engine:** Tags quotes with **Recommended**, **Lowest Cost**, and **Fastest Turnaround** badges.
- **MOQ & Deadline Risk Detection:** Warns organizers when aggregate demand fails to meet supplier MOQ minimums.

### 3. ⚖️ FairShare Contribution Engine
- **Deterministic Largest-Remainder Method:** Implements the mathematically verified Hare-Niemeyer algorithm using integer minor currency units (cents).
- **Zero-Loss Guarantee:** $\sum \text{Member Contributions} \equiv \text{Total Landed Campaign Order}$ without a single cent of rounding drift.
- **Proportional Fee Allocation:** Divides shared shipping and taxes proportionally based on individual pick value.
- **Interactive What-If Simulator:** Real-time sliders allow organizers to preview:
  - Adding extra item quantities.
  - Switching suppliers.
  - Simulating members dropping out.
  - Applying extra negotiated volume discounts.

### 4. 💳 PayPal Sandbox Integration (Critical Requirement)
- **Official PayPal Orders API v2:** Implements genuine server-side order creation and capture endpoints:
  - `POST /api/paypal/create-order`
  - `POST /api/paypal/capture-order`
- **Server-Side Security:**
  - PayPal client secrets are never exposed to the frontend.
  - Client-provided payment amounts are never trusted; backend calculates the authoritative member share.
  - Strict verification of capture status (`COMPLETED`), amount, and currency.
  - Idempotent transaction handling to prevent duplicate capture attempts.
  - Direct non-escrow settlement to the merchant account.
- **Built-in Demo Simulation Mode:** When PayPal credentials are not present, GatherBuy AI switches to an explicit Demo Simulator mode with sample verified captures and realistic test modals.

### 5. 👥 Participant Invitation & Checkout
- **Unique Shareable Link & Invite Code** (e.g. `TECH26`).
- **Interactive Item Picker:** Participants select sizes, colors, and quantities.
- **Live FairShare Preview:** Computes and displays their exact share before payment.
- **PayPal Sandbox Checkout:** One-click checkout with instant capture verification and celebratory confetti.

### 6. 📄 Export & Audit Trail
- Download comprehensive procurement reports in **CSV** and **PDF** formats.
- Real-time transaction audit ledger at `/transactions`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server API Routes, TypeScript) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Lucide Icons, Glassmorphism, Custom Theme |
| **Animation & Charts** | [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Validation** | [Zod](https://zod.dev/) |
| **Payments** | [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/), PayPal Sandbox SDK |
| **AI Model** | [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`) |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) (Schema, RLS policies) + Standalone In-Memory Demo Store |
| **PDF Generation** | [jsPDF](https://www.npmjs.com/package/jspdf), [jspdf-autotable](https://www.npmjs.com/package/jspdf-autotable) |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert/strict`) |

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root (see `.env.example`):

```bash
# ====================================================================
# GatherBuy AI - Environment Configuration
# ====================================================================

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# PayPal Developer Platform (Sandbox)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CURRENCY=USD

# Supabase PostgreSQL (Optional - In-Memory Demo Store active by default)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Demo Mode Flag
DEMO_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note for Judges:** You can run and evaluate the complete application immediately with zero configuration! GatherBuy AI includes full-fidelity deterministic fallbacks and sample datasets. To test live PayPal Sandbox checkout, add your Sandbox Client ID and Secret to `.env.local`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Business Logic Tests
```bash
node --test test/business-logic.test.mjs
```
*Verifies Hare-Niemeyer largest-remainder allocation, proportional freight distribution, landed cost computation, budget thresholds, and payment lifecycle state transitions.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Demonstration Experience

GatherBuy AI comes pre-seeded with the flagship showcase campaign:

### **"TechFest 2026 — Merchandise Procurement"** (Invite Code: `TECH26`)
- **Products:** Heavyweight Hoodies, Poly-Cotton T-shirts, Laser-Etched Enamel Badges.
- **Participants:** 5 members (Alex Rivera, Samantha Chen, Marcus Vance, Priya Patel, Liam O'Connor).
- **Quotations:** 3 competing suppliers (Apex Merch Co., PrintCraft Direct, Velocity Express).
- **Live Status:** $119.41 collected via PayPal Sandbox captures (Alex & Samantha paid); 3 members pending checkout.
- **Participant Test View:** Navigate to `/join/TECH26` to pick items and trigger PayPal Sandbox checkout.
- **Reset Button:** Hit **Reset Demo** in the navigation bar anytime to restore the seed dataset to its pristine state.

---

## 🔒 Security & Fintech Standards

1. **Deterministic Monetary Authoritativeness:** AI models are never entrusted with executing or outputting binding transaction amounts. All payment amounts, taxes, and shipping allocations are calculated server-side in integer cents.
2. **Credential Isolation:** PayPal Client Secret and Supabase Service Role keys remain strictly server-side and are never sent to the browser.
3. **Capture Verification:** Transactions are only flagged as completed after verified confirmation from PayPal Sandbox Order Capture endpoints.
4. **Idempotency Protection:** Replay attacks and duplicate capture requests are identified and handled safely.
5. **No Escrow Misrepresentation:** GatherBuy AI acts as a collaborative ordering agent facilitating direct recipient payments, not an escrow intermediary.

---

## 🏢 GatherBuy AI Technologies

*Engineered with precision for modern group commerce.*  
**GatherBuy AI: Buy together. Save together. Pay fairly.**
