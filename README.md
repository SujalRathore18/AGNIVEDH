# AGNIVEDH

**Explainable AI for Latent Defect Detection in Component Burn-In**  
*Probe Deep. Detect Early. Ensure Reliability.*  

> **Context:** ISRO | Smart India Hackathon 2026 | PS 26170 | Team GSR NEXUS

---

## 🛰️ Overview

**AGNIVEDH** is an explainable AI system engineered for high-reliability aerospace electronic component burn-in qualification. Space-grade microchips undergo thermal soak (up to 168 hours at 125°C) to eliminate infant mortality. 

However, conventional quality assurance faces a critical blind spot: **a component can pass the manufacturer's absolute datasheet limit while being an anomalous statistical outlier within its own manufacturing wafer batch.**

AGNIVEDH addresses this through a multi-layer physics and statistical reasoning engine:
1. **Layer 1 (Static Check):** Enforces statutory datasheet thresholds (e.g. 50 µA max leakage).
2. **Layer 2 (Module A - Robust Batch Outlier):** Employs natural log transforms and Median Absolute Deviation (MAD) with a 4.5× threshold to catch components like a 45 µA part in a 10 µA batch ($Score \approx 8.4$). Pools references dynamically when batch sample size $n < 30$.
3. **Layer 3 (Module B - Trajectory Drift Forecaster):** Predicts 168h end-of-test leakage from early 0–24h burn-in telemetry with conformal prediction intervals and a 96h trajectory consistency guard.
4. **Human-in-the-Loop Consensus:** Quarantines ambiguous cases into an explicit **Review** lane, generating structured, plain-English **Reason Cards** and requiring mandatory justification notes on inspector overrides.

---

## 🐸 Meet Vedh: The Space Frog AI Inspector

The mascot is **Vedh**, an astronaut frog rendered in pure inline SVG. Vedh's helmet visor and indicators dynamically react to application state:
- **Idle:** Calm green visor glow with microchip in hand.
- **Thinking:** Visor HUD displays scanning telemetry while probing query intents.
- **Alert:** Flashing amber/red hazard visor glow and thermal probe on flagged components.
- **Happy:** Celebratory neon green visor and thumbs-up on qualified, accepted components.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18.x or 20+ (tested with Node v22)
- npm 9+ or pnpm / yarn

### Installation & Local Run

```bash
# 1. Clone repository and navigate to workspace
git clone <repo-url>
cd AGNIVEDH

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application runs **100% offline** out of the box using the built-in deterministic physics simulation engine.

---

## 🔧 Environment Configuration

AGNIVEDH uses a single environment variable flag to switch seamlessly between the deterministic offline TypeScript mock engine and an external FastAPI backend.

Create a `.env.local` file (already preconfigured in this prototype):

```bash
# Toggle between local mock engine and FastAPI backend
NEXT_PUBLIC_USE_MOCK=true

# FastAPI Backend Base URL (active when NEXT_PUBLIC_USE_MOCK=false)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Optional API Key for authenticated endpoints
NEXT_PUBLIC_API_KEY=
```

### Switching to Real Backend
Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local` and ensure your FastAPI backend conforms to the contract in `lib/api.ts`. Both mock and real implementations reside behind the typed `AgnivedhApiClient` interface without changing any UI component code.

---

## 🧪 Automated Unit Tests (Vitest)

Unit tests verify the statistical math for Module A:
- A batch with median 10.0 µA, log-spread 0.18, and threshold 4.5 yields an effective limit of **22.5 µA**.
- A **45.0 µA** component produces an outlier score of **8.4** ($4.5 \times$ batch median) and is **FLAGGED** even though $45 < 50$ µA datasheet limit.
- Batches with $n < 30$ trigger **low confidence** pooling.

Run the test suite:
```bash
npm run test
```

---

## 🌌 Core Features & Routes

### 1. Mission Landing (`/`)
- Full-screen space scene with animated stars, drifting asteroids, comet streaks, UFO, and floating Vedh.
- **Ask AGNIVEDH Panel:** Natural language querying over the loaded telemetry lot (intent-matched offline rule engine; no external LLM calls).
- **The Problem:** Interactive number-line widget illustrating the 45 µA latent defect paradox.
- **Three Layers:** Detailed breakdown of physical bounds, cohort statistics, and predictive aging.
- **Workflow Pipeline:** 5-stage interactive animated qualification flow.
- **Honest Limits:** Explicit banner stating synthetic data boundaries and ISRO calibration requirements.

### 2. Inspector Console (`/dashboard`)
- **Dataset Bar:** Instant demo reset, synthetic generator modal (custom seed, batches, datasheet limit), CSV upload with dropped-row validation report, and analysis progress simulation.
- **Overview:** Stat tiles (Accept, Review, Reject, Early Fail), multi-layer catch bar chart, decision donut, and batch decision grid.
- **Batches (`/dashboard/batches` & `/dashboard/batches/[id]`):** Median µA, learned vs datasheet limits, effective limit, log-axis distribution histogram with flagged parts marked.
- **Parts Table (`/dashboard/parts`):** Paginated, sortable table with multi-layer filtering (Static, Module A, Module B) and search.
- **Part Detail (`/dashboard/parts/[id]`):**
  - Reactive Vedh mascot expression.
  - Plain-English Reason Card.
  - 168h trajectory chart with shaded prediction range and limit reference lines.
  - Inspector action modal requiring a mandatory justification note for overrides.
  - Collapsible model attribution panel.
- **Evaluation (`/dashboard/evaluation`):** Dynamic precision, recall, F1, and conformal coverage metrics computed live from the engine.
- **Models (`/dashboard/models`):** L2 Ridge vs LightGBM architecture comparison with batch-grouped cross-validation metrics and Retrain simulation.
- **Export:** Instant download of lot decisions as CSV or JSON.

---

## 🚀 Deploying to Vercel

AGNIVEDH is optimized for zero-config Vercel deployment:

1. Push your repository to GitHub / GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under Environment Variables, set:
   ```
   NEXT_PUBLIC_USE_MOCK=true
   ```
4. Deploy! Next.js will build the static and SSR bundles with zero external dependencies.

---

## 🛡️ Accessibility & Design Standards

- **Contrast:** WCAG AA compliant on all text and visual indicators.
- **Redundant Encoding:** Status states never use color alone; always paired with icons and uppercase text badges (`ACCEPT`, `REVIEW`, `REJECT`).
- **Motion:** Full support for `prefers-reduced-motion` (disables space debris, comet animations, canvas twinkling speed, and smooth scroll).
- **Keyboard Navigation:** Focus rings (`*:focus-visible`), skip link, and Esc dismissal on all modals.

---

## 📜 Credits & License

- **Organization:** Indian Space Research Organisation (ISRO)
- **Initiative:** Smart India Hackathon 2026
- **Problem Statement:** PS 26170
- **Team:** GSR NEXUS
