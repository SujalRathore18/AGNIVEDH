# AGNIVEDH 🔭

### Explainable AI for Latent Defect Detection in Component Burn-In

**Probe Deep. Detect Early. Ensure Reliability.**

AGNIVEDH is an **explainable AI-powered burn-in analytics platform** designed for high-reliability electronic component screening under **ISRO Smart India Hackathon 2026 — PS 26170**.

It addresses a critical limitation of conventional pass/fail screening: a component can remain **within its absolute datasheet limit while behaving as a statistical outlier within its manufacturing batch**, potentially indicating a latent defect.

AGNIVEDH combines **robust statistics, trajectory forecasting, uncertainty estimation, and human-in-the-loop inspection** to identify these hidden anomalies before they become reliability risks.

---

## 🚀 What AGNIVEDH Does

AGNIVEDH analyzes burn-in telemetry through a **three-layer detection architecture**:

### 1. Static Datasheet Check

Validates component measurements against absolute engineering limits.

**Example:**
A leakage current of **45 µA** passes a **50 µA datasheet limit**.

### 2. Robust Batch Outlier Detection

Analyzes the component relative to its own manufacturing batch using:

* Log-space transformation
* Median-based statistics
* Median Absolute Deviation (MAD)
* Robust anomaly scoring
* Dynamic batch baselines
* Low-confidence handling for small batches

This allows AGNIVEDH to identify statistically abnormal components that conventional absolute limits may miss.

### 3. Trajectory Drift Forecasting

Uses early burn-in telemetry to estimate future component behavior.

**Early readings → 168h forecast → Prediction interval → Trajectory consistency check**

The system evaluates:

* Expected 168h value
* Predicted drift
* Prediction uncertainty
* 96h trajectory consistency
* Datasheet safety boundaries

---

## 🧠 Human-in-the-Loop AI

AGNIVEDH does not blindly automate safety-critical decisions.

Every component is classified into:

**ACCEPT → REVIEW → REJECT**

Ambiguous cases enter a dedicated **Review** lane.

Each flagged component receives an explainable **Reason Card** containing:

* Detected anomaly layer
* Observed value
* Batch baseline
* Relevant threshold
* Predicted trajectory
* Confidence / uncertainty
* Recommended action

Inspector overrides require a **mandatory justification note**, creating an auditable decision trail.

---

## 🧪 Built-In Simulation & Testing

AGNIVEDH includes a deterministic offline simulation engine for development and demonstration.

It supports:

* Synthetic burn-in lot generation
* Configurable batch sizes
* Datasheet limits
* Controlled anomaly injection
* Multiple burn-in readpoints
* CSV upload and validation
* Automated statistical evaluation
* Batch-grouped model validation

The project also includes **Vitest unit tests** covering the core statistical calculations and small-batch confidence logic.

> **Important:** Synthetic simulation results are intended for development and demonstration. Real-world production performance and thresholds require calibration and validation against actual ISRO/organiser data.

---

## 📊 Inspector Dashboard

The `/dashboard` console provides a complete burn-in analysis workflow.

### Overview

* Accept / Review / Reject statistics
* Early-failure tracking
* Layer-wise anomaly detection
* Batch-level decisions
* Decision distribution

### Batch Intelligence

* Batch median
* Learned statistical limits
* Datasheet limits
* Effective limits
* Distribution analysis
* Flagged-component visualization

### Component Inspector

* Component telemetry
* 168h trajectory
* Prediction interval
* Limit references
* Reason Card
* Model attribution
* Inspector override workflow

### Evaluation

* Precision
* Recall
* F1
* Prediction coverage
* Layer-wise detection performance

### Model Comparison

* Ridge Regression
* LightGBM challenger
* Batch-grouped validation
* Model comparison
* Retraining simulation

### Export

Analysis results can be exported as:

* CSV
* JSON

---

## 💻 Technology Stack

**Frontend**

* Next.js
* React
* TypeScript
* Recharts
* Responsive dashboard UI

**AI / Statistical Engine**

* Robust statistics
* MAD-based anomaly detection
* Log-space analysis
* Ridge Regression
* LightGBM
* Prediction intervals
* Batch-grouped validation

**Backend Integration**

* FastAPI-compatible API architecture
* Typed `AgnivedhApiClient`
* Offline deterministic mock engine

**Testing**

* Vitest

**Deployment**

* Vercel
* Docker / on-premise compatible architecture

---

## 🔌 Offline-First Architecture

AGNIVEDH can run completely offline using its deterministic local simulation engine.

```text
Burn-In CSV / Test Data
        ↓
Data Validation
        ↓
Static Datasheet Check
        ↓
Robust Batch Outlier Detection
        ↓
168h Drift Forecast
        ↓
96h Consistency Guard
        ↓
Decision Fusion
        ↓
┌─────────┬────────┬────────┐
│ ACCEPT  │ REVIEW │ REJECT │
└─────────┴────────┴────────┘
        ↓
Reason Card + QA Report
```

The frontend communicates through a typed API abstraction, allowing the deterministic mock engine to be replaced with a **FastAPI backend without changing the UI layer**.

---

## 📁 Key Routes

| Route                   | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `/`                     | Mission overview and AGNIVEDH introduction |
| `/dashboard`            | Burn-in inspection console                 |
| `/dashboard/batches`    | Batch-level analytics                      |
| `/dashboard/parts`      | Component-level inspection                 |
| `/dashboard/evaluation` | Model evaluation                           |
| `/dashboard/models`     | Model comparison and retraining            |
| `/dashboard/parts/[id]` | Detailed component investigation           |

---

## 🔧 Environment Configuration

AGNIVEDH uses environment variables to switch between the deterministic offline TypeScript mock engine and an external FastAPI backend.

```env
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=
```

### Offline Mode

```env
NEXT_PUBLIC_USE_MOCK=true
```

Runs entirely using the built-in deterministic simulation engine.

### FastAPI Mode

```env
NEXT_PUBLIC_USE_MOCK=false
```

Connects the frontend to the configured FastAPI backend through the `AgnivedhApiClient` interface.

---

## 🧪 Automated Unit Tests

Unit tests verify the statistical calculations for Module A and small-batch handling.

Key test cases include:

* Batch median and log-spread calculations
* Robust anomaly scoring
* Datasheet-limit comparison
* Low-confidence pooling for batches with `n < 30`

Run the test suite with:

```bash
npm run test
```

---

## 🚀 Deploying to Vercel

AGNIVEDH is optimized for zero-config Vercel deployment.

1. Push the repository to GitHub / GitLab.
2. Import the project into the Vercel Dashboard.
3. Configure:

```env
NEXT_PUBLIC_USE_MOCK=true
```

4. Deploy.

---

## 🛡️ Accessibility & Design Standards

* **Contrast:** WCAG AA-oriented contrast on text and visual indicators.
* **Redundant Encoding:** Status states never use color alone; always paired with icons and uppercase text badges (`ACCEPT`, `REVIEW`, `REJECT`).
* **Motion:** Support for `prefers-reduced-motion`.
* **Keyboard Navigation:** Focus rings, skip link, and Esc dismissal on modals.

---

## 🛡️ Safety & Reliability Philosophy

AGNIVEDH follows a **safety-first, recall-oriented approach** rather than treating anomaly detection as a simple classification problem.

Key principles:

* **False negatives are treated as critical.**
* Multiple detection layers provide independent anomaly signals.
* Uncertain cases go to **Review**, not forced acceptance.
* Small batches receive explicit confidence handling.
* Measurement conditions are considered during analysis.
* Every automated decision should remain interpretable to a QA inspector.
* Production thresholds must be calibrated using real component data.

---

## 🌌 Meet Vedh

**Vedh** is AGNIVEDH's astronaut-frog AI inspector.

Vedh's interface state reflects the inspection workflow:

* 🟢 **Idle** — ready for analysis
* 🔵 **Thinking** — processing telemetry
* 🔴 **Alert** — anomaly detected
* 🟢 **Happy** — component qualified

The mascot provides an intuitive visual layer over an otherwise complex statistical inspection system.

---

## 🎯 Problem Statement

**ISRO SIH 2026 — PS 26170**

> AI-Driven Anomaly Detection in Component Burn-In & Screening

AGNIVEDH focuses on detecting **latent component behavior that conventional absolute pass/fail limits may not capture**, while maintaining explainability and human oversight.

---

## ⚠️ Project Boundary

AGNIVEDH is a **prototype/research implementation for SIH 2026**.

The current system demonstrates the complete analysis workflow using deterministic/synthetic data.

Before production deployment:

1. Calibrate thresholds using real ISRO data.
2. Validate against historical labelled failures.
3. Test on unseen production lots.
4. Establish acceptable recall/review thresholds with domain experts.
5. Validate any proposed burn-in optimization through a controlled pilot.

**AGNIVEDH does not claim production-level defect detection accuracy or guaranteed burn-in reduction without real-world validation.**

---

## 👥 Team

**GSR NEXUS**

Built for:

**Smart India Hackathon 2026 · ISRO · PS 26170**

---

### License

Add the project's actual license here once finalized.
