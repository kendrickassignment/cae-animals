<p align="center">
  <img src="https://img.shields.io/badge/Truth-Extracted-dc2626?style=for-the-badge&logo=shield&logoColor=white" alt="Truth Extracted" />
  <img src="https://img.shields.io/badge/Built%20for-AFFA-f59e0b?style=for-the-badge" alt="Built for people and animals" />
  <img src="https://img.shields.io/badge/AI%20Powered-Gemini%203.1%20Hybrid Pro and Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Multi--LLM-Groq%20%7C%20Mistral%20%7C%20OpenAI-8B5CF6?style=for-the-badge" alt="Multi-LLM" />
</p>

# 🔍 Corporate Accountability Engine (CAE)

**An AI-assisted report-review platform for cage-free egg accountability across Asia, including Indonesia. CAE helps animal advocates review multinational companies’ ESG, sustainability, annual reports, and related disclosures for hidden exclusions and broken promises.**

> *"Truth. Extracted."* — [cae-animals.com](https://cae-animals.com)

Built for **Act For Farmed Animals (AFFA)** / **Sinergia Animal International**, with a wider mission for volunteers, researchers, enthusiasts, and NGOs working for animals across Asia.

## From Indonesia to Asia: Before and Now

**Before:** CAE began with an Indonesia-focused question: do multinational companies’ global cage-free promises actually include Indonesia? The original analysis used an Indonesia status, country-specific omission and exclusion factors, and Indonesian context.

**Now:** CAE’s mission and frontend positioning extend across Asia. Indonesia remains included, not replaced. The broader question is whether companies’ promises reach the Asian countries and operations where they do business—not just the markets highlighted in a global progress headline.

| Area | Before | Now |
|------|--------|-----|
| Focus | Indonesia-centered accountability | Asia-wide advocacy mission, including Indonesia |
| Audience | Indonesia-focused campaign teams | Volunteers, researchers, animal welfare enthusiasts, and NGOs across Asia |
| Reports | Often described as sustainability reports | ESG, sustainability, annual reports, CSR disclosures, and related PDF appendices |
| Evidence | Quotes, page references, and country findings | Same evidence-first review; retain each finding’s actual affected country |
| Country assessment | Indonesia-specific status and scoring factors | Preserved and labeled country-specific, not relabeled as an Asia score |

### What the expansion delivers—and what it does not

This release updates frontend wording, search/social descriptions, generated report context, and CAE documentation. It does **not** change backend prompts, routing, scoring weights, database fields, or email logic.

Current results still use `indonesia_mentioned`, `indonesia_status`, and the existing `sea_countries_mentioned` / `sea_countries_excluded` fields when returned. Southeast Asia is part of Asia, not the whole region. Those fields do not establish complete Asian country coverage, verified local legal compliance, or multilingual accuracy. Never turn an Indonesia finding into a conclusion about all Asian markets.

CAE reduces the reading burden; it does not replace your judgment. Review the source quotes, page references, report scope, and local context before using findings externally. A risk score helps prioritize questions, not certify a company or prove a legal violation.

For a detailed explanation of the origins, wider mission, unchanged analysis contract, responsible workflow, and remaining regional validation work, see [Before and Now in the product documentation](PRODUCT_DOCS.md#0-before-and-now-from-indonesia-to-asia).

---

## 🧠 The Engine: Hybrid Gemini Routing

CAE utilizes a sophisticated **Two-Stage Hybrid Routing** architecture to ensure the highest accuracy while maintaining efficiency.

1. **Stage 1: Fast Scan (Gemini 3.0 Flash)**
Rapidly parses the entire document (up to 1M tokens) to identify potential risk patterns and initial evidence.
2. **Stage 2: Deep Adversarial Analysis (Gemini 3.1 Pro)**
The original documented routing escalates a **High Risk Score (≥56)** or **Strategic Silence** (Indonesia omitted) to Gemini 3.1 Pro. That Indonesia-specific trigger is unchanged by the Asia positioning update; it is not a new Asia-wide trigger. Model configuration and behavior were not re-audited in this release.

---

## 🎯 What It Does

CAE detects **9 specific evasion patterns** used by corporations to weaken their animal welfare commitments:

| # | Pattern | Description | Severity |
| --- | --- | --- | --- |
| 1 | **Strategic Silence** | Relevant countries are absent from cage-free reporting; current Indonesia-specific scoring remains unchanged | 🔴 Critical |
| 2 | **Franchise Firewall** | Parent company excludes 90%+ of locations (franchisees) from scope | 🔴 Critical |
| 3 | **Geographic Tiering** | Prioritizing Western markets (2026) while deferring Asia (2030+) | 🔴 Critical |
| 4 | **Commitment Downgrade** | Shifting from firm "Will source" to "Aims to support" | 🟠 High |
| 5 | **Timeline Deferral** | Pushing deadlines indefinitely into the future | 🟠 High |
| 6 | **Corporate Ghosting** | No third-party audits or external accountability mechanisms | 🟠 High |
| 7 | **Availability Clause** | Using "supply availability" as an indefinite escape hatch | 🟡 Medium |
| 8 | **Hedging Language** | Pervasive use of non-binding, aspirational verbs | 🟡 Medium |
| 9 | **Silent Delisting** | Removing specific countries from previous global progress reports | 🔴 Critical |

---

## 🚀 New Feature: Multi-File Merge Analysis

Corporations often hide commitments in separate Appendices or ESG Data Books. CAE now supports **Multi-File Analysis**:

* Upload up to **3 PDF files** simultaneously, each file max 25 MB.
* AI merges all documents into a single context window (1M+ tokens).
* Detects contradictions between the "Main Report" and the "Fine Print" in the Annex.

---

## 🏗️ Technical Stack

| Layer | Technology | Status |
| --- | --- | --- |
| **AI Engine** | **Gemini 3.1 Pro & 3.0 Flash** | ✅ Paid Tier ($300 Balance) |
| **Backend** | FastAPI (Python 3.11) | Google Cloud Run is the current default frontend API connection |
| **Frontend** | React, TypeScript, Tailwind | ✅ Deployed on Lovable |
| **Database** | Supabase (PostgreSQL) | ✅ Real-time Sync + RLS |
| **PDF Parser** | PyMuPDF (Forensic Mode) | ✅ Table & Footnote Extraction |
| **Security** | SHA-256 Hashing | ✅ Duplicate File Detection |

---

## ⚖️ Deterministic Scoring Algorithm

CAE’s documented **Python-based validation** maps a score to a consistent risk level. This does not make AI findings or the score hallucination-proof. The existing Indonesia-related factors below remain unchanged; they are not uniformly validated regional scoring rules:

```python
def score_to_level(score: int) -> str:
    if score >= 80: return "critical" # 🔴
    if score >= 56: return "high"     # 🟠
    if score >= 31: return "medium"   # 🟡
    return "low"                      # 🟢

```

| Factor | Points |
| --- | --- |
| **Strategic Silence (Indonesia)** | +35 |
| **Franchise Firewall** | +15 |
| **Geographic Tiering** | +12 |
| **Third-Party Audit (Verified)** | -10 |

These are historical example factors, not a complete scoring specification. The current About-page guide lists third-party audit as −5; review each returned scoring breakdown rather than treating this older example as authoritative. Asia expansion does not reconcile or recalibrate backend weights.

---

## 📊 Performance Benchmark

Historical figures below were not re-benchmarked for Asian markets in this release; no benchmark protocol is included here. Do not treat them as guarantees of speed or regional accuracy.

* **Manual Audit:** 2 weeks per report.
* **CAE Audit (Flash):** 45 - 60 seconds.
* **CAE Hybrid Audit (Pro):** 2 - 4 minutes.
* **Accuracy:** 95% match with senior policy researchers.

---

## 💰 Operating Cost (Continuously updated as the platform always runs)

Historical budget reference only. The backend has since moved to Google Cloud Run; its current cost and capacity were not audited in this positioning update. The prepaid AI amount is not a verified monthly charge.

| Service | Cost | Notes |
| --- | --- | --- |
| **Gemini AI** | $300 | Deducted from $300 prepaid balance |
| **Frontend** | $25/mo | Lovable Pro |
| **Backend** | Not reverified | Google Cloud Run, usage-based |
| **Database** | Free | Supabase Free Tier |
| **Domain** | $7/yr | cae-animals.com |
| **Total** | **~$332** | for animals |

---

## 🤝 Built By

**Kendrick Filbert**
at **Act For Farmed Animals (AFFA)**.

> *"2 weeks of manual auditing reduced to 3-5 minutes. That's the power of adversarial AI for animal welfare."*

---

<p align="center">
<strong>Truth. Extracted.</strong>





<a href="[https://cae-animals.com](https://cae-animals.com)">cae-animals.com</a>
</p>
