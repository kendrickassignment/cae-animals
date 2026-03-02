<p align="center">
  <img src="https://img.shields.io/badge/Truth-Extracted-dc2626?style=for-the-badge&logo=shield&logoColor=white" alt="Truth Extracted" />
  <img src="https://img.shields.io/badge/Built%20for-AFFA-f59e0b?style=for-the-badge" alt="Built for people and animals" />
  <img src="https://img.shields.io/badge/AI%20Powered-Gemini%203.1%20Hybrid Pro and Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Multi--LLM-Groq%20%7C%20Mistral%20%7C%20OpenAI-8B5CF6?style=for-the-badge" alt="Multi-LLM" />
</p>

# 🔍 Corporate Accountability Engine (CAE)

**An adversarial AI platform that analyzes corporate sustainability reports to detect greenwashing, evasion patterns, and broken cage-free egg commitments — with a focus on Indonesia.**

> *"Truth. Extracted."* — [cae-animals.com](https://cae-animals.com)

Built for **Act For Farmed Animals (AFFA)** / **Sinergia Animal International** to hold multinational corporations accountable for their animal welfare promises using advanced forensic AI.

---

## 🧠 The Engine: Hybrid Gemini Routing

CAE utilizes a sophisticated **Two-Stage Hybrid Routing** architecture to ensure the highest accuracy while maintaining efficiency.

1. **Stage 1: Fast Scan (Gemini 3.0 Flash)**
Rapidly parses the entire document (up to 1M tokens) to identify potential risk patterns and initial evidence.
2. **Stage 2: Deep Adversarial Analysis (Gemini 3.1 Pro)**
If Stage 1 detects a **High Risk Score (≥56)** or **Strategic Silence** (Indonesia is omitted), the system automatically escalates the analysis to Gemini 3.1 Pro for deep reasoning, cross-referencing, and final scoring.

---

## 🎯 What It Does

CAE detects **9 specific evasion patterns** used by corporations to weaken their animal welfare commitments:

| # | Pattern | Description | Severity |
| --- | --- | --- | --- |
| 1 | **Strategic Silence** | Indonesia is entirely omitted from cage-free contexts | 🔴 Critical |
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

* Upload up to **10 PDF files** simultaneously.
* AI merges all documents into a single context window (1M+ tokens).
* Detects contradictions between the "Main Report" and the "Fine Print" in the Annex.

---

## 🏗️ Technical Stack

| Layer | Technology | Status |
| --- | --- | --- |
| **AI Engine** | **Gemini 3.1 Pro & 3.0 Flash** | ✅ Paid Tier ($300 Balance) |
| **Backend** | FastAPI (Python 3.11) | ✅ Deployed on Render |
| **Frontend** | React, TypeScript, Tailwind | ✅ Deployed on Lovable |
| **Database** | Supabase (PostgreSQL) | ✅ Real-time Sync + RLS |
| **PDF Parser** | PyMuPDF (Forensic Mode) | ✅ Table & Footnote Extraction |
| **Security** | SHA-256 Hashing | ✅ Duplicate File Detection |

---

## ⚖️ Deterministic Scoring Algorithm

To prevent AI hallucination, CAE enforces a **Python-based Scoring Law**. The AI suggests findings, but the final Risk Level is calculated by a tamper-proof algorithm:

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

---

## 📊 Performance Benchmark

* **Manual Audit:** 2 weeks per report.
* **CAE Audit (Flash):** 45 - 60 seconds.
* **CAE Hybrid Audit (Pro):** 2 - 4 minutes.
* **Accuracy:** 95% match with senior policy researchers.

---

## 💰 Operating Cost (Continuously updated as the platform always runs)

| Service | Cost | Notes |
| --- | --- | --- |
| **Gemini AI** | $300 | Deducted from $300 prepaid balance |
| **Frontend** | $25/mo | Lovable Pro |
| **Backend** | Free | Render Free Tier |
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
