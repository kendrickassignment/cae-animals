# 🌍 Corporate Accountability Engine (CAE)
## Product Requirements Document (PRD)

**Organization:** Act For Farmed Animals (AFFA) / Sinergia Animal International  
**Owner:** Kendrick   
**Status:** 🟢 In Production (Backend) | 🟡 Frontend in Development  

---

## 📑 Table of Contents
1. [Product Mission & Vision](#1-product-mission--vision)
2. [Product Strategy](#2-product-strategy)
3. [Problem Statement & Target Users](#3-problem-statement--target-users)
4. [System Architecture](#4-system-architecture)
5. [Core Features & Requirements](#5-core-features--requirements)
6. [AI Analysis & Evasion Patterns](#6-ai-analysis--evasion-patterns)
7. [API & Data Model](#7-api--data-model)
8. [Non-Functional Requirements & Security](#8-non-functional-requirements--security)
9. [Success Metrics & Roadmap](#9-success-metrics--roadmap)

---

## 1. Product Mission & Vision

### 🎯 Mission
> **Empower animal welfare advocates with AI-powered tools that expose corporate greenwashing in sustainability reports — making it impossible for companies to hide behind vague language while farmed animals in Southeast Asia pay the price.**

CAE exists because corporations routinely publish sustainability reports that *appear* to commit to cage-free egg sourcing globally, while strategically excluding markets like Indonesia through deliberate ambiguity, geographic silence, and hedging language. The mission is not just detection — it is **accountability**. Every finding is evidence-grade: page-referenced, quote-backed, and severity-scored.

### 🔭 Vision
**By 2028, CAE becomes the standard accountability tool used by animal welfare organizations across Southeast Asia to audit corporate sustainability commitments — transforming a process that takes weeks of manual review into minutes of automated, evidence-backed analysis.**

**Design Principles:**
1. **Adversarial by Default:** Assume guilt and require proof of innocence. Companies should not benefit from ambiguity.
2. **Evidence Over Opinions:** Every finding must cite exact quotes and page numbers.
3. **Free-First Architecture:** Built on free-tier LLM APIs so nonprofits with zero budget can run it.
4. **AI Cannot Override Python:** Scoring rules and validation logic are enforced deterministically by Python code.

---

## 2. Product Strategy

CAE occupies a unique niche: **adversarial AI auditing for corporate sustainability claims**, specifically targeting the gap between global commitments and regional implementation in Southeast Asia. Unlike generic ESG platforms, CAE audits and holds specific commitments accountable by analyzing the actual language companies use.

### Competitive Moat
* **Domain-Specific AI Prompting:** 9 evasion patterns trained through adversarial prompt engineering.
* **Hybrid Routing Intelligence:** Cost-optimized: Flash for screening, Pro only when risk is detected.
* **Hard Validation Layer:** AI output cannot manipulate scores — Python enforces the law.
* **Stateless BYOK (Bring Your Own Key):** Enterprise-grade security for bulk processing without storing user credentials.

---

## 3. Problem Statement & Target Users

Global food corporations publish annual reports claiming "100% cage-free by 2025". However, they hide evasion tactics in 300-page PDFs:
* **Geographic exclusion** (excluding SEA).
* **Hedging language** ("where commercially viable").
* **Strategic silence** (Indonesia never mentioned).
* **Franchise firewalls** (excluding franchisees).

**Target Users:**
* **Primary:** Campaign Managers & Research Analysts (Sinergia Animal / AFFA) who need to quickly identify evading companies with evidence for negotiations.
* **Secondary:** Partner Org Analysts (OWA), Journalists, and Policy Advocates.

---

## 4. System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                      WEB FRONTEND                            │
│              (Lovable / React — cae-animals.com)             │
└──────────────────────────────┬───────────────────────────────┘
                           │ HTTPS (CORS-enabled)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (CAE)                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Upload   │  │ Analyze  │  │ Reports  │  │ Providers│      │
│  │ Endpoint │  │ Endpoint │  │ Endpoint │  │ Endpoint │      │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘      │
│       │             │                                        │
│       ▼             ▼                                        │
│  ┌──────────┐  ┌─────────────────────────────────────────┐   │
│  │ PDF      │  │ HYBRID ROUTING ENGINE                   │   │
│  │ Parser   │  │  Stage 1: Flash Scan (gemini-2.0-flash) │   │
│  │          │  │     ↓ Score ≥ 56 OR Indo silent?        │   │
│  │(pdfplumber│ │  Stage 2: Pro Deep (gemini-2.5-pro)     │   │
│  │ /PyPDF2) │  │     ↓ Pro fails?                        │   │
│  └──────────┘  │  Fallback: Keep Flash result            │   │
│                └─────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ HARD VALIDATION LAYER (Python-enforced)               │   │
│  │ • Score clamping (0-100) & Level mapping              │   │
│  │ • Deduplication, finding type, severity validation    │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

```

---

## 5. Core Features & Requirements

### F1: PDF Upload & Parsing

Accept sustainability PDFs up to 50MB. Extracts text with page markers for accurate citation.

### F2: Hybrid Gemini Routing

Intelligent two-stage analysis:

* **Stage 1 (Flash Scan):** `gemini-3.0-flash` for initial scoring.
* **Stage 2 (Pro Deep):** Escalates to `gemini-3.1-pro` ONLY IF risk score ≥ 56 or Indonesia is silent. Fallbacks gracefully to Flash if Pro times out.

### F3: Multi-File Merge Analysis

Merge up to 10 PDFs (e.g., Annual Report + ESG Addendum) into a single analysis context with continuous page numbering and document source attribution. Includes **Partial Failure Handling**: if 1 of 5 files fails to process, the system merges the successful 4 and flags the failure to the user.

### F4: Hard Validation Layer

Deterministic Python code that AI cannot override. Clamps scores (0-100), enforces Risk Level (Low/Medium/High/Critical), and deduplicates findings.

### F5: Bring Your Own Key (BYOK)

Allows NGOs to input their own Gemini/Groq API keys for bulk processing, bypassing public server limits. Built with **Stateless Security**: keys are used per-request and NEVER stored in the database.

---

## 6. AI Analysis & Evasion Patterns

CAE detects **9 evasion patterns** plus **1 positive pattern**:

| Pattern | Description | Impact |
| --- | --- | --- |
| **Strategic Silence** | Indonesia/SEA simply never mentioned (plausible deniability) | +35 (Critical) |
| **Geographic Exclusion** | Commitments explicitly limited to certain regions | +30 (Critical) |
| **Corporate Ghosting** | Company unresponsive to previous accountability tracks | +15 (High) |
| **Commitment Downgrade** | Language weakened from previous year ("will" → "aims to") | +15 (High) |
| **Franchise Firewall** | Commitment limited to "company-owned operations" | +15 (High) |
| **Timeline Deferral** | Deadlines pushed beyond reasonable limits (e.g., 2035) | +10 (Medium) |
| **Availability Clause** | Escape hatch: "subject to supplier availability" | +5 each |
| **Hedging Language** | Vague qualifiers: "aspire to," "where feasible" | +2 each |
| **Silent Delisting** | Previously committed products quietly removed | Critical |
| ✅ **Binding Commitment** | Clear dates, markets, and accountability (Positive) | -3 each |
| ✅ **Indonesia Data** | Specific reporting on Indonesia progress (Positive) | -10 |

**Score-to-Level Mapping:**
🟢 **Low:** 0–30 | 🟡 **Medium:** 31–55 | 🟠 **High:** 56–79 | 🔴 **Critical:** 80–100

---

## 7. API & Data Model

* **`POST /upload`**: Upload PDF, returns `report_id`.
* **`POST /analyze`**: Trigger analysis pipeline.
* **`POST /analyze-multi`**: Trigger multi-file merge.
* **`GET /analysis/{id}`**: Fetch detailed JSON report including scoring breakdown, verbatim quotes, and confidence levels.
* **`GET /analysis/{id}/export`**: Download findings as CSV.

---

## 8. Non-Functional Requirements & Security

### Security & Privacy

* **Stateless BYOK:** User-provided API keys are encrypted in transit via HTTPS, used entirely in RAM, and immediately discarded. No credentials are saved in the database.
* **Data Retention Policy:** Uploaded PDFs are automatically deleted from the server immediately after text extraction. Analysis JSON results are purged from the system after 30 days to prevent storage bloat.

### Resilience

* **Retry with Exponential Backoff:** Automatic retries (15s → 30s → 60s) for 429 (Rate Limit) and 50x server errors.
* **Provider Diversity:** Fallback to Groq or Mistral if Google Gemini experiences regional downtime.

---

## 9. Success Metrics & Roadmap

### KPIs

1. **Time-to-Value (TTV):** Average time from a campaigner uploading a PDF to exporting a CSV is ≤ 5 minutes.
2. **Analysis Completion Rate:** >95% success rate (including graceful fallbacks).
3. **Finding Accuracy:** >85% findings confirmed by human expert review without false positives on geographic exclusion.

### Roadmap (Next 12 Months)

* **Q2 2026:** Batch analysis queue & Supabase integration for persistent (opt-in) user accounts.
* **Q3 2026:** Multi-language parsing (Bahasa Indonesia) & OCR for scanned PDFs.
* **Q4 2026:** Public Accountability Dashboard & Open API for allied organizations.
