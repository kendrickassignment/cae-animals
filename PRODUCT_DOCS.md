# Corporate Accountability Engine (CAE)
## Product Requirements Document (PRD) v2.2

**Organization:** Act For Farmed Animals (AFFA) / Sinergia Animal International  
**Product Owner:** Kendrick  
**Version:** 2.2.0  
**Last Updated:** March 5, 2026  
**Status:** In Production (Backend) · Frontend in Development  
**Methodology:** Agile (2-week sprints, continuous iteration)

---

## Table of Contents

1. [Product Mission](#1-product-mission)
2. [Product Vision](#2-product-vision)
3. [Product Strategy](#3-product-strategy)
4. [Problem Statement](#4-problem-statement)
5. [Target Users](#5-target-users)
6. [Product Scope](#6-product-scope)
7. [Core Features & Requirements](#7-core-features--requirements)
8. [Data Model](#8-data-model)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Scoring & Validation System](#10-scoring--validation-system)
11. [Frontend Requirements](#11-frontend-requirements)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Success Metrics](#13-success-metrics)
14. [Roadmap](#14-roadmap)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Appendices](#16-appendices)
    - A. Technical Spec: System Architecture
    - B. Technical Spec: API Specification
    - C. Technical Spec: AI Analysis Engine
    - D. Technical Spec: LLM Provider Architecture
    - E. Technical Spec: Resilience & Error Handling
    - F. Evasion Pattern Taxonomy
    - G. Data Retention Summary
    - H. Glossary
    - I. CORS-Allowed Origins
    - J. File Structure
    - K. Environment Variable Reference

---

## 1. Product Mission

Corporate sustainability reports are supposed to hold companies accountable. In practice, they do the opposite — they give multinational food brands a 200-page shield to hide behind while making commitments they never intend to keep in Southeast Asia.

CAE exists to strip that shield away.

The engine reads these reports the way a skeptical auditor would: looking for what's missing, what's been softened, and what's been quietly removed since last year. Every finding comes with a page number, a direct quote, and a severity score. Nothing vague. Nothing interpretive. Just evidence that advocacy teams can put on the table in a corporate meeting and say: *explain this.*

The organizations doing this work — AFFA, Sinergia Animal International, and the broader Open Wing Alliance — have the expertise to catch greenwashing. They don't have the bandwidth to manually read hundreds of reports a year. CAE gives them that bandwidth back.

---

## 2. Product Vision

Within two years, CAE should be the default tool that animal welfare organizations across Southeast Asia use when preparing for corporate engagement. The kind of tool where an analyst's workflow becomes: download the report, upload it to CAE, review the findings, walk into the meeting.

### Where We're Headed

| Horizon | What It Looks Like | What Unlocks It |
|---------|-------------------|-----------------|
| **Now (2026 H1)** | A working AI auditor that campaign teams actually use for meeting prep | Single and multi-file analysis, hybrid routing, evidence-grade output |
| **2026 H2** | Self-service platform where partner orgs run their own analyses without hand-holding | Persistent accounts, batch processing, year-over-year tracking |
| **2027** | The regional standard for tracking corporate commitments across SEA | Multi-language analysis (Bahasa, Thai, Vietnamese), open API for partner tools |
| **2028** | Infrastructure that makes corporate accountability the default, not the exception | Automated report monitoring, public scorecards, trend tracking across years |

### Principles That Don't Bend

**Skepticism is the product, not a feature.** The AI assumes the report is designed to mislead. That's not a prompt engineering choice — it's the entire product identity. Everything downstream follows from this: the scoring weights, the UI language, the brand.

**If you can't cite it, you can't claim it.** Every finding must include the exact quote and the page number. An analyst should be able to flip to the page and verify within seconds. No black boxes.

**Cost can't be a barrier.** The target users are NGOs operating on grant money. If the tool costs $500/month, it dies when the funding cycle ends. Every architectural decision is filtered through this constraint.

**The AI proposes. Python decides.** LLMs are probabilistic — they'll occasionally assign "Medium" risk to a score of 85 because the language *sounds* reasonable. Deterministic validation ensures the math always wins. One inconsistency in a stakeholder meeting and the tool loses all credibility.

**Keys belong to users, not to us.** When someone provides their own API key, it lives in their browser and travels with the request. It never touches our database, our logs, or our disk. This isn't just security hygiene — it's a trust decision.

---

## 3. Product Strategy

### Where CAE Sits in the Market

There are ESG platforms — MSCI, Sustainalytics, CDP — that rate companies on broad sustainability performance. Companies spend significant effort gaming those ratings. CAE doesn't play that game.

CAE does something narrower and sharper: it takes the company's own published words and audits them for specific evasion tactics. Not "how sustainable is this company overall" but "is this company using its 300-page report to hide the fact that its cage-free commitment doesn't apply to Indonesia?"

That specificity is the positioning. A generic greenwashing detector tells you a company uses hedging language. CAE tells you which page, which paragraph, and that the excuse they're using is contradicted by Indonesian regulation Permentan No. 32/2025.

### How We Get There

**Phase 1 — Prove it works with one team (now).** AFFA's campaign team is the first real user. Validate that the findings are accurate enough to cite in meetings. Iterate the scoring until experts say "yes, this matches what I'd find manually."

**Phase 2 — Open it to the network.** The Open Wing Alliance has 90+ member organizations. Offer CAE as a free tool or a self-hostable repo. Let the advocacy community validate and extend it.

**Phase 3 — Make it public.** A dashboard where journalists, investors, or anyone can look up a company's cage-free commitment status by country. Companies can't quietly avoid accountability when the scores are public.

### What Makes CAE Hard to Replicate

The moat isn't any single feature. It's the combination:

- **Domain-specific adversarial prompting** that knows the difference between a genuine commitment and a carefully worded escape clause
- **Cost architecture** that runs on free tiers — competitors building on paid APIs can't match the unit economics for NGO users
- **A validation layer** that prevents the AI from producing inconsistent output, which most LLM-powered tools don't bother with
- **Southeast Asia regulatory intelligence** baked into the analysis — no other tool knows about Permentan No. 32/2025
- **Stateless key management** that eliminates the security liability of storing user credentials

### Bets We're Making

We're betting that prompt engineering with hard validation will outperform fine-tuned models for this use case — cheaper to maintain, faster to iterate, and no training data dependency.

We're betting that Google will keep Gemini's free tier viable long enough for CAE to prove its value. If that changes, the multi-provider architecture means we can switch to Groq or Mistral in one environment variable.

We're betting that evidence quality matters more than analysis speed. Campaign teams don't need real-time dashboards. They need one well-cited finding that changes a negotiation.

---

## 4. Problem Statement

### What's Actually Happening

Every year, hundreds of food companies publish sustainability reports claiming progress toward cage-free egg commitments. These reports are long (often 200–300 pages), written in dense ESG language, and sometimes published in local languages like Bahasa Indonesia or Thai.

The problem isn't that the claims are false. It's that they're *carefully true in a way that's functionally misleading.*

A company writes "100% cage-free by 2025" on page 7, then on page 2, a scope statement limits the commitment to "company-owned operations" — quietly excluding 98% of their restaurants that are franchised. Indonesia gets twelve mentions across the report for things like palm oil and youth employment, but zero mentions in the cage-free section. Commitment language shifts from "will source" to "aims to continue our work with suppliers" — a downgrade buried in a SASB disclosure appendix that nobody reads.

### Why Manual Auditing Can't Keep Up

On the NGO side, teams of 3–5 analysts are responsible for monitoring 50+ companies annually. Each report takes one to two weeks to review manually — cross-referencing footnotes, tracking language changes from prior years, checking which countries are included versus excluded.

The math: 50 companies × 2 weeks per report = 100 weeks of analyst time per cycle. Even with a dedicated team, it's structurally impossible to cover every report at the depth needed to catch these patterns.

### What's At Stake

This isn't an abstract compliance problem. Hundreds of millions of laying hens across Indonesia and Southeast Asia remain confined in battery cages because the evasion tactics in these reports go undetected. The companies aren't challenged because nobody has the time to read page 247 of a Bahasa Indonesia sustainability report and notice that last year's commitment language was stronger.

### The Gap

An AI that reads these reports adversarially — treating silence as evidence, hedging as evasion, and scope limitations as firewalls — can compress two weeks of expert review into three minutes. Not by replacing the analyst's judgment, but by doing the reading at scale and surfacing the evidence the analyst needs to act on.

---

## 5. Target Users

### Who Uses CAE Today

| Who | What They Do | What They Need From CAE |
|-----|-------------|------------------------|
| **Campaign managers** at Sinergia Animal | Run corporate engagement campaigns across Indonesia and SEA | Specific, citable evidence to put on the table in meetings with corporate sustainability teams |
| **Research analysts** at AFFA | Produce accountability reports covering 50+ companies annually | Standardized risk assessments they can compare across companies and track year-over-year |
| **Policy advocates** | Engage government bodies and industry groups | Aggregate data showing systemic patterns — "here's how 15 companies all exclude Indonesia the same way" |

### Who Will Use It Next

| Who | What They Need |
|-----|---------------|
| **Partner analysts** across the Open Wing Alliance (90+ orgs) | The same capability, applied to their local markets — Thailand, Vietnam, Philippines |
| **Investigative journalists** | Evidence-grade findings they can cite — page numbers, direct quotes, pattern classifications |
| **Developers at partner orgs** | API access to plug CAE into their own monitoring workflows |

### How the Workflow Actually Looks

An analyst downloads a company's latest sustainability report. They upload it to CAE. Three minutes later, they have a risk score, a list of specific findings (each with page citations and exact quotes), and an Indonesia compliance status. They export the findings as CSV, paste the relevant ones into a briefing document, and walk into a corporate engagement meeting with evidence that would have taken two weeks to compile manually.

```
Upload PDF → Wait ~3 min → Review findings → Export CSV → Use in meeting
     │            │              │                │
   /upload    /analyze     /analysis/{id}   /analysis/{id}/export
```

### Prioritized User Stories

| Story | Priority | Status |
|-------|----------|--------|
| Upload a PDF and get evidence-grade findings in under 5 minutes | P0 | ✅ Done |
| Merge a main report + appendix to catch contradictions between documents | P0 | ✅ Done |
| Export findings as CSV for briefing documents and presentations | P0 | ✅ Done |
| Use my own API key so I'm not limited by shared quota | P1 | ✅ Done |
| Know exactly which documents succeeded and failed in a multi-file upload | P1 | ✅ Done |
| Upload 50 reports and have them processed overnight | P2 | Planned |
| Compare this year's report to last year's to spot downgrades | P2 | Planned |
| Look up any company's score without uploading anything | P3 | Vision |

---

## 6. Product Scope

### What's Included

- Upload and analysis of text-based PDF reports up to 50MB
- AI-powered detection of 9 specific greenwashing patterns, with exact citations
- Two-stage analysis: fast scan followed by deep reasoning when risk indicators are triggered
- Multi-file merge: combine up to 10 PDFs into a single analysis (catches contradictions across documents)
- Deterministic scoring that the AI cannot override
- Indonesia-specific compliance assessment with regulatory context
- Support for multiple LLM providers (Gemini, Groq, Mistral, OpenAI) — switchable per request
- Stateless Bring Your Own Key (BYOK) for users who want to use their own API quota
- Automatic data lifecycle management (source PDFs deleted after analysis, results expire after 90 days)
- Partial failure handling when some files in a batch can't be processed
- CSV export of all findings
- Detection and rejection of image-only/scanned PDFs with clear user guidance
- REST API with interactive documentation
- Web frontend at cae-animals.com

### What's Not Included Yet

- User authentication and role-based access
- Real-time streaming of analysis progress (polling works for current scale)
- Non-PDF formats (Word, HTML, scanned images)
- Historical comparison across report years
- Webhooks and event-driven integrations
- Batch queue with priority management

---

## 7. Core Features & Requirements

### F1: PDF Upload

Users upload a corporate sustainability report in PDF format. The system validates the file, checks for duplicates, and confirms the PDF contains extractable text.

| Requirement | Specification |
|------------|---------------|
| Max file size | 50 MB |
| Format | PDF only, must contain selectable text (not scanned/image-based) |
| Storage | Local filesystem, deleted automatically after analysis completes |
| Duplicate detection | SHA-256 hash comparison — returns existing report ID if match found |
| Response | Unique report ID |

When a user uploads a scanned PDF (common for older reports), the system detects low text extractability and returns a clear message explaining that the file needs to be a text-based export, not a scan. This prevents wasted analysis runs and eliminates the most common support scenario.

**What this means for analysts:** The upload is drag-and-drop simple. If something's wrong with the file — wrong format, too large, scanned instead of text — the system tells you exactly what happened and what to do about it. Duplicate uploads are caught automatically, so analysts don't waste time re-running the same report.

**Acceptance Criteria:**
- Valid text-based PDF → success with unique report ID
- Non-PDF file → clear error explaining accepted format
- File over 50MB → clear error with size limit
- Scanned/image PDF → explanation that CAE needs text-based PDFs, with suggestion to download from company website instead of scanning
- Duplicate PDF (matching hash) → notification with link to existing analysis and option to re-run

---

### F2: Single-File Analysis

The core workflow. An analyst triggers analysis on an uploaded PDF and receives structured findings within minutes.

| Requirement | Specification |
|------------|---------------|
| Trigger | Analyst clicks "Analyze" or API call with report ID |
| Execution | Background task, non-blocking — analyst can close the tab and come back |
| Status | Polled automatically until complete |
| Optional inputs | Company name, report year, preferred AI provider, custom API key |

**What happens under the hood:**

The PDF is parsed into text with page markers preserved. The system estimates token count and truncates intelligently if needed (keeping the beginning and end of the document where commitments and disclaimers tend to live). An adversarial prompt frames the AI as a skeptical auditor. The fast model scans first; if risk indicators trip the escalation threshold, the reasoning model takes a second, deeper pass. The AI's output is then validated, corrected if needed, deduplicated, and stored.

After successful analysis, the source PDF is deleted from the server. The analyst still has their original file — the server doesn't need to keep it.

**What this means for analysts:** Upload a report, click analyze, get results in under 5 minutes. The findings include exact page numbers and quotes you can cite directly in a meeting. If the system detects something concerning, it automatically runs a deeper analysis — you don't have to decide which model to use.

**Acceptance Criteria:**
- Completes within 5 minutes for a 200-page document
- Result includes risk score, level, findings with citations, Indonesia status, and scoring breakdown
- Score-to-level mapping is always deterministically correct
- Source PDF is removed from disk after analysis completes

---

### F3: Multi-File Merge Analysis

Companies sometimes split their sustainability disclosures across multiple documents — a main report, a data appendix, an ESG supplement. The most interesting contradictions often live between these documents. This feature lets analysts upload them all and get a single unified analysis.

| Requirement | Specification |
|------------|---------------|
| Max files | 10 per analysis |
| Merge approach | Documents concatenated with clear separators and attribution |
| Output | One analysis result covering all documents |
| Finding attribution | Each finding identifies which source document it came from |

**What this means for analysts:** If a company publishes its sustainability report in three parts, you don't have to analyze each one separately and mentally piece together the contradictions. Upload all three, and CAE connects the dots — like noticing that page 7 of the main report says "100% cage-free globally" while the data appendix on page 3 quietly limits the scope to "company-owned operations in North America."

**Partial failure handling:** If one PDF in a batch can't be processed (corrupt file, image-only, parsing error), the others are still analyzed. The result clearly shows which documents were included and which weren't, so you know exactly what your analysis covers before citing it.

**Acceptance Criteria:**
- Three 100-page PDFs merge into a single coherent analysis
- Findings reference the correct source document
- If 1 of 5 files fails, remaining 4 are analyzed with clear indication of incomplete coverage
- Failed documents are listed with actionable error messages

---

### F4: Two-Stage AI Routing

Not every report needs the most expensive analysis. A company with a genuine, well-documented commitment doesn't need three minutes of deep reasoning — the fast model catches it in 30 seconds and moves on.

The system runs every report through the fast model first. If the initial scan triggers concern — high risk score, Indonesia not mentioned, or strategic silence detected — it automatically escalates to the reasoning model for a second, deeper pass.

| Stage | When | What It Does |
|-------|------|-------------|
| **Fast scan** | Always | Parses the full document, identifies patterns, produces an initial score |
| **Deep analysis** | Only if risk score ≥ 56, Indonesia absent, or silence detected | Re-analyzes with a reasoning model that's better at connecting evidence across sections |

**What this means for the organization:** About 70% of reports resolve at the fast stage, keeping costs at zero. The 30% that actually matter — the high-risk reports where companies are most likely evading — get the deeper treatment. This means the platform can afford to give every report a thorough analysis without burning through API credits on routine low-risk documents.

If the deep model fails (API issues, timeouts), the fast result is kept and tagged so the analyst knows it wasn't double-checked.

---

### F5: Deterministic Validation

The AI suggests a risk score and level. Python has the final word.

This layer exists because of a specific failure during early testing: the AI assigned "High" risk to a score of 45, which should be "Medium." It happened once in twenty analyses. But for a tool whose output gets cited in face-to-face corporate meetings, once is enough. If a company's lawyers spot an inconsistency between the score and the risk label, the entire tool loses credibility.

**What this means for campaign teams:** When you present a "Critical" risk score in a stakeholder meeting, you can be certain the system hasn't mislabeled it. The risk level is calculated by fixed rules, not influenced by how persuasive the company's language sounds. This is what makes CAE findings defensible under scrutiny.

The validation layer enforces:
- Score clamped to 0–100
- Level strictly derived from score (≤30 low, 31–55 medium, 56–79 high, 80–100 critical)
- Finding types must match the defined taxonomy
- Severities must be valid enum values
- Indonesia status must be one of: compliant, excluded, silent, partial, deferred
- Duplicate findings are merged (same type + similar titles consolidated)
- If the AI contradicts any rule, Python overrides and logs the discrepancy

The AI is good at finding evidence. It's unreliable at consistent scoring. This separation of concerns — generation vs. validation — is the architecture's most important design decision.

---

### F6: Findings Export

Analysts need findings outside of CAE — in briefing documents, presentations, spreadsheets shared with campaign leads. The export produces a CSV with every finding's type, severity, title, description, exact quote, page number, section, and affected country.

**What this means for analysts:** One click, and you have a spreadsheet you can paste into a meeting brief or share with your campaign lead. The metadata header includes the company name, report year, overall risk level, and total finding count — ready to use without reformatting.

---

### F7: Provider Flexibility

The system supports four LLM providers behind a unified interface. Switching happens via one environment variable or one field in the API request.

| Provider | Context Window | Free | Strength |
|----------|---------------|------|----------|
| Gemini (default) | 1M tokens | Yes | Handles 300+ page documents in a single pass |
| Groq | 131K tokens | Yes | Fastest inference speed |
| Mistral | 32K tokens | Yes | Solid backup, good multilingual |
| OpenAI | 128K tokens | No | Highest overall quality if budget allows |

**What this means for sustainability:** If one AI provider changes pricing or goes down, the platform doesn't stop working. Switching to an alternative takes one configuration change, not a rewrite. For an NGO tool that needs to stay operational across grant cycles, this resilience isn't a nice-to-have — it's survival.

For documents that exceed a provider's context window, the system truncates intelligently — keeping the first half (executive summary, commitment language) and the last half (appendices, SASB disclosures, disclaimers) where evasion patterns concentrate.

---

### F8: Bring Your Own Key (BYOK)

Power users and partner organizations can provide their own LLM API key to run analyses on their own quota. This is particularly important for organizations that want to run high volumes without depending on the shared free-tier allocation.

**What this means for partner organizations:** An Open Wing Alliance member in Thailand can plug in their own Gemini key, run 50 analyses a month on their own budget, and never worry about whether another team's usage is eating into shared quota. They stay independent while using the same tool.

The security model is deliberately stateless:
- The frontend stores the key in the browser's local storage — never in any backend database
- Each analysis request includes the key over HTTPS for that single call
- The backend uses it, then it's gone — garbage-collected with the request
- Keys are explicitly stripped from all logs, error reports, and stored records
- If no custom key is provided, the server's default key handles the request

This means CAE has zero liability for user credentials. There's nothing to breach because there's nothing stored.

**Acceptance Criteria:**
- User can enter and save a key in the frontend Settings — it persists across browser sessions
- Analysis with a custom key uses that key for the AI call
- Invalid keys return a clear error message, not a generic system error
- No trace of user keys in server logs, database, or filesystem
- Clearing the key in Settings reverts to the server's default

---

### F9: Data Lifecycle Management

Running on free-tier infrastructure means disk space is limited. Without active cleanup, the server fills up after a few hundred analyses. But beyond the technical constraint, responsible data management is the right practice for a tool handling corporate documents.

**What this means for platform reliability:** Analysts don't need to worry about the system running out of space or slowing down over time. The cleanup happens automatically in the background. And for organizations concerned about document retention, there's a clear policy: source files are only kept as long as necessary, and results are available for a full quarterly cycle before expiring.

The retention policy:
- **Source PDFs** are deleted immediately after analysis completes. The text has been extracted — the file is no longer needed, and the analyst has their original copy.
- **Analysis result files** are kept for 90 days, covering a full quarterly reporting cycle. After that, they're cleaned up automatically.
- **Debug artifacts** from failed parses are kept for 7 days — enough time to diagnose issues, not enough to accumulate.
- **BYOK keys** are never stored anywhere, so there's nothing to retain or clean up.

A daily background task handles cleanup, logging what was removed for auditability. It never touches in-progress analyses.

---

## 8. Data Model

### Report Record

Represents an uploaded PDF and its processing state.

```json
{
  "id": "uuid",
  "file_name": "yum_brands_sustainability_2024.pdf",
  "file_path": "uploads/uuid.pdf",
  "file_hash": "sha256-hex",
  "file_size": 5242880,
  "company_name": "Yum! Brands",
  "report_year": 2024,
  "status": "uploaded | processing | analyzing | completed | failed",
  "page_count": 187,
  "text_extractable": true,
  "analysis_id": "uuid or null",
  "error": "null or error message",
  "created_at": "2026-03-05T10:00:00",
  "pdf_deleted_at": "2026-03-05T10:35:00"
}
```

### Analysis Result

The complete output of an analysis run, persisted as JSON with a 90-day TTL.

```json
{
  "id": "uuid",
  "report_id": "uuid",
  "status": "completed",
  "completeness": "full | partial",
  "failed_documents": [],
  "company_name": "Yum! Brands",
  "report_year": 2024,
  "overall_risk_level": "critical",
  "overall_risk_score": 100,
  "global_claim": "Source 100% cage-free eggs...",
  "indonesia_mentioned": false,
  "indonesia_status": "silent",
  "sea_countries_mentioned": ["Thailand"],
  "sea_countries_excluded": ["Indonesia", "Vietnam", "Philippines"],
  "binding_language_count": 2,
  "hedging_language_count": 14,
  "summary": "...",
  "findings": [],
  "document_confidence": "high",
  "document_confidence_reason": "...",
  "scoring_breakdown": "Strategic Silence: +35, Franchise Firewall: +15...",
  "llm_provider": "gemini",
  "llm_model": "gemini-3.1-pro (Hybrid Escalate)",
  "input_tokens": 245000,
  "output_tokens": 4200,
  "cost_estimate_usd": 0.0,
  "analyzed_at": "2026-03-05T10:30:00",
  "data_retention_expires_at": "2026-06-03T10:30:00"
}
```

### Individual Finding

Each finding is a specific instance of a detected evasion pattern.

```json
{
  "id": "f-1",
  "finding_type": "strategic_silence",
  "severity": "critical",
  "title": "Indonesia absent from cage-free commitment scope",
  "description": "...",
  "exact_quote": "Our commitment covers operations in North America, Europe, and selected Asian markets.",
  "page_number": 47,
  "section": "Supply Chain Commitments",
  "country_affected": "Indonesia",
  "source_document": "yum_brands_sustainability_2024.pdf"
}
```

### Failed Document (Multi-File Context)

When a file in a batch can't be processed.

```json
{
  "file_name": "appendix_c_scanned.pdf",
  "report_id": "uuid-3",
  "error": "Image-based PDF — no extractable text detected",
  "suggestion": "Upload a text-based export of this document"
}
```

---

## 9. Non-Functional Requirements

These constraints define how the system behaves under real conditions. For the current user base — a team of 3–5 analysts processing reports sequentially — these limits are invisible in daily use. They only become relevant if usage scales significantly, which is addressed in the roadmap.

### Performance

| What | Target | Where We Are |
|------|--------|-------------|
| Upload response | Under 2 seconds | ✅ Under 1 second |
| Single-file analysis (fast scan only) | Under 90 seconds | ✅ ~60 seconds |
| Single-file analysis (with deep pass) | Under 5 minutes | ✅ ~3–4 minutes |
| Multi-file merge (5 documents) | Under 10 minutes | ✅ ~7 minutes |
| Cached result retrieval | Under 500ms | ✅ Under 100ms |

### Reliability

| What | Target |
|------|--------|
| Analysis completion (including fallback) | >95% |
| Uptime | 99.5% (bound by hosting provider) |
| Result persistence | Survives process restarts via disk backup, with 90-day retention |

### Security

| Concern | How It's Handled |
|---------|-----------------|
| Server-side API keys | Environment variables, never in code or logs |
| User-provided keys (BYOK) | Stateless: per-request only, never stored in database, cache, file, or log |
| File uploads | Validated for type, size, and text extractability before any processing |
| Cross-origin access | Restricted to known frontend origins |
| Sensitive data | Reports contain corporate disclosures, not personal data. No PII processing. |
| Data lifecycle | PDFs deleted after analysis. Results expire after 90 days. Debug files expire after 7 days. |

### Current Scale Constraints

These are the practical boundaries of the free-tier architecture. For a small team doing sequential analyses, none of these are bottlenecks. If the platform expands to serve multiple organizations simultaneously, the roadmap includes persistent storage and batch queuing to address them.

| Constraint | Limit | What Governs It |
|-----------|-------|----------------|
| Concurrent analyses | 3–5 simultaneous | Gemini free tier rate limit (15 req/min) |
| Disk usage | ~500MB usable | Render free tier, managed by retention policy |
| Memory | ~2GB typical | In-memory store clears on restart |

---

## 10. Scoring & Validation System

The risk score is what gives CAE's findings their weight in a corporate meeting. When an analyst says "this company scored 100 out of 100 — Critical risk," that number needs to be defensible. Not subjective, not influenced by how polished the company's language is, and not something the AI decided on a whim. This section explains how the scoring works and why it's trustworthy.

### How Scores Work

The AI evaluates the document and produces a risk score from 0 to 100 based on the evasion patterns it detects. The scoring breakdown is always included — showing exactly how many points each pattern contributed. There's no hidden formula. An analyst can walk a corporate counterpart through the math: "Strategic Silence: +35, Franchise Firewall: +15, Commitment Downgrade: +15 — that's how we got to 100."

### The Rule That Cannot Be Broken

The mapping from score to risk level is enforced by Python code, not by the AI:

```
0–30   → Low      (Commitment appears genuine and specific)
31–55  → Medium   (Hedging or gaps detected, warrants follow-up)
56–79  → High     (Significant evasion patterns present)
80–100 → Critical (Systemic greenwashing, multiple severe patterns)
```

If the AI outputs a score of 75 and labels it "Medium," Python overrides the label to "High" and logs the correction. The AI never gets the final say on risk classification. This is what makes it safe to cite the score in a meeting — it's not an opinion, it's a calculation.

### Indonesia Status

Because Indonesia is CAE's primary focus market, every analysis includes a specific compliance assessment:

| Status | What It Means |
|--------|--------------|
| **Compliant** | Indonesia explicitly included in cage-free commitment with binding language and timeline |
| **Excluded** | Indonesia explicitly named as an exception or outside scope |
| **Silent** | Indonesia not mentioned at all in the cage-free context — the most common tactic |
| **Partial** | Some mention of Indonesia, but hedged with conditions or qualifiers |
| **Deferred** | Indonesia mentioned, but with timelines pushed significantly beyond other markets |

### Finding Deduplication

The AI sometimes surfaces the same pattern multiple times with slightly different wording. The deduplication layer merges findings of the same type when titles are similar (consolidating page references and keeping the strongest quotes) and caps any single pattern type at 5 distinct findings. This keeps the output actionable rather than repetitive.

---

## 11. Frontend Requirements

### Screens

| Screen | What It Does |
|--------|-------------|
| **Landing** | Explains what CAE does, shows the upload call-to-action, and walks through the three-step process |
| **Upload** | Drag-and-drop PDF upload with validation feedback and text-based PDF guidance |
| **Analysis Status** | Polls the backend automatically, shows progress badges, displays estimated completion time |
| **Results** | The main output: risk score gauge, risk level badge, findings list with citations, Indonesia status, scoring breakdown, completeness indicator for multi-file results |
| **Finding Detail** | Drill into any finding: evasion pattern tag, severity, the exact quote from the report, page reference |
| **Export** | CSV download of all findings, plus copy-to-clipboard for individual entries |
| **Settings** | BYOK key management (key input, provider selection, test button, clear button) with clear security messaging |
| **About** | Methodology explanation, evasion pattern descriptions, scoring logic, organizational context |

### Upload — Handling the Most Common Mistake

Most analysts won't think about whether their PDF is text-based or scanned. The upload screen needs to handle this gracefully:

**Visible guidance:** "Upload a sustainability report in PDF format (max 50MB). The PDF needs to contain selectable text — scanned documents aren't supported yet."

**If the backend rejects a file:** A clear error explaining what went wrong and what to do: "This PDF appears to be a scan. CAE needs text-based PDFs to read the content. Try downloading the report directly from the company's website rather than scanning a printed copy."

### Multi-File — When Something Goes Wrong

When a multi-file analysis comes back with incomplete coverage (some documents failed), the results screen needs to make this obvious without burying it:

**A yellow "Partial" badge** — visually distinct from green "Complete" and red "Failed"

**An alert banner** listing exactly which files couldn't be processed and why, with suggestions for each

**A disclaimer on the findings:** "This analysis covers X of Y uploaded documents. Findings from the missing document(s) aren't reflected in the risk score."

This prevents an analyst from walking into a meeting citing a risk score that's based on an incomplete document set.

### Settings — API Key Management

The Settings screen handles BYOK with two clear priorities: make it easy to use, and make the security posture obvious.

- Password-masked input field for the key
- Provider dropdown (Gemini, Groq, Mistral, OpenAI)
- "Test Key" button that checks the key is valid
- "Clear Key" button that removes it from the browser
- Prominent notice: "Your key is stored only in your browser and sent directly to the AI provider. It never touches our servers."

### Frontend-Backend Integration

| User Action | API Call | What Happens |
|------------|----------|-------------|
| Upload a PDF | POST `/upload` | Show success or error (format, size, scan detection) |
| Start analysis | POST `/analyze` (with BYOK key if configured) | Begin polling for status every 5 seconds |
| Check status | GET `/reports/{id}` | Update progress indicator |
| View results | GET `/analysis/{id}` | Render dashboard, show partial failure banner if applicable |
| Export findings | GET `/analysis/{id}/export` | Trigger browser download |
| Test API key | POST `/providers/test` | Show validation result in Settings |

---

## 12. Deployment & Infrastructure

### Current Setup

| Component | Where | Cost |
|-----------|-------|------|
| Backend | Render.com (Free tier) | $0/mo |
| Frontend | Lovable (Pro) | $25/mo |
| Database | Supabase (Free tier) | $0/mo |
| Domain | cae-animals.com | ~$7/yr |
| AI API | Google Gemini (Free tier) | $0/mo |
| **Total** | | **~$26/mo** |

### What You Need to Deploy

The backend requires one environment variable to run: a Gemini API key. Everything else has sensible defaults.

**Required:**
- `GEMINI_API_KEY` — API key from Google AI Studio

**Optional (with defaults):**
- `LLM_PROVIDER` — default `gemini`
- `GEMINI_FLASH_MODEL` — default `gemini-3.0-flash`
- `GEMINI_PRO_MODEL` — default `gemini-3.1-pro`
- `PORT` — default `8000`
- `FRONTEND_URL` — for CORS allowlisting
- `DATA_RETENTION_RESULTS_DAYS` — default `90`
- `DATA_RETENTION_DEBUG_DAYS` — default `7`
- Provider keys for fallback: `GROQ_API_KEY`, `MISTRAL_API_KEY`, `OPENAI_API_KEY`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Health Checks

| Endpoint | What It Returns |
|----------|----------------|
| `GET /` | API info, version, storage stats |
| `GET /health` | Minimal ping for uptime monitors |

Both support HEAD requests for zero-bandwidth monitoring.

---

## 13. Success Metrics

### Does the product work? (Primary)

| Metric | What It Tells Us | 6-Month Target |
|--------|-----------------|----------------|
| **Reports analyzed** | Whether people are actually using the tool | 200+ |
| **Completion rate** | Whether the system is reliable enough to trust | >95% |
| **Finding accuracy** | Whether the output matches what an expert would find manually | >85% |
| **Campaign impact** | Whether CAE findings are actually influencing corporate engagements | 10+ meetings citing CAE evidence |

### Is it usable? (Efficiency)

| Metric | What It Tells Us | Target |
|--------|-----------------|--------|
| **Time-to-Value** | How long from first visit to first exported CSV (new user) | <10 minutes |
| **Analysis time** | System speed from upload to result | <5 min for 200 pages |
| **Onboarding completion** | Whether a new analyst can figure out the tool without help | >80% complete first analysis |

Time-to-Value is the most important UX metric. It captures the full experience: reading the landing page, uploading, waiting, reviewing results, and exporting. If this number is high, the problem might be confusing UI rather than slow AI — and that's a different fix.

### Is it healthy? (System)

| Metric | What It Tells Us | Target |
|--------|-----------------|--------|
| Cost per analysis | Whether the free-tier architecture holds | $0.00 |
| Escalation rate | How often the deep model is needed | 30–50% |
| Fallback rate | How often the deep model fails and fast model takes over | <10% |
| Score override rate | How well-calibrated the AI's scoring is | <15% |
| Parse failure rate | LLM output quality | <5% |
| Image-PDF rejection rate | How often users upload unsupported files (informs OCR priority) | Tracked |
| Export usage | Whether findings are leaving the tool and entering campaigns | >40% |
| BYOK adoption | Organic uptake of personal API keys | Tracked |
| Storage utilization | Disk health after retention cleanup | <80% of limit |
| Partial failure rate | Multi-file reliability | <15% |

---

## 14. Roadmap

### Current Release ✅

- [x] Hybrid two-stage AI routing (fast scan + conditional deep analysis)
- [x] Multi-file merge analysis (up to 10 PDFs)
- [x] 9 evasion patterns + 1 positive pattern detection
- [x] Deterministic validation layer
- [x] Multi-provider support (Gemini, Groq, Mistral, OpenAI)
- [x] Retry with exponential backoff and graceful fallback
- [x] CSV export
- [x] Web frontend
- [x] BYOK stateless key architecture
- [x] Data retention policy with automatic cleanup
- [x] Partial failure handling for multi-file analysis
- [x] Image-PDF detection with user guidance

### Next Sprint (Q2 2026)

- [ ] Supabase persistence (replacing in-memory + disk JSON)
- [ ] Batch analysis queue (upload many, process overnight)
- [ ] Year-over-year comparison (same company across report years)
- [ ] Email notifications on analysis completion
- [ ] Shareable analysis links

### Planned (Q3 2026)

- [ ] Multi-language report support (Bahasa Indonesia, Thai)
- [ ] OCR for scanned PDFs (priority informed by rejection rate data)
- [ ] Webhook API for partner integrations
- [ ] Admin dashboard (metrics, usage, error monitoring)
- [ ] API authentication and rate limiting

### Vision (Q4 2026–2027)

- [ ] Public accountability dashboard with company search
- [ ] Cross-company comparison and ranking
- [ ] Automated monitoring of new report publications
- [ ] Partner API for allied organizations
- [ ] Embeddable risk score widget
- [ ] Broiler welfare commitment analysis (BCC/ECC) — second domain

---

## 15. Risks & Mitigations

| What Could Go Wrong | How Likely | How Bad | What We Do About It |
|---------------------|-----------|---------|---------------------|
| **Gemini free tier gets discontinued** | Medium | Critical | Multi-provider architecture already built. Groq and Mistral as free alternatives. BYOK means users can bring their own paid keys. |
| **AI hallucinates findings** | Medium | High | Hard validation catches inconsistencies. Exact-quote requirement makes fabricated citations obvious. Human review is always the last step. |
| **Gemini model names change** | High | Medium | Model names are environment variables. Swapping takes one config change, zero code. |
| **Rate limiting during heavy usage** | High | Medium | Exponential backoff. BYOK distributes load across keys. Batch queue will stagger requests. |
| **Scanned PDFs submitted** | Medium | Low | Upload validation catches them. Clear error messages guide users. OCR planned for later. |
| **Disk fills up on free tier** | Medium | Medium | Retention policy: PDFs deleted post-analysis, results expire after 90 days, daily cleanup. |
| **Scoring is too aggressive** | Medium | Medium | Calibrated against expert review. Thresholds configurable. Ongoing validation with AFFA team. |
| **Corporation challenges methodology** | Low | Low | Scoring breakdown is transparent. Every finding cites pages and quotes from their own document. |
| **BYOK keys compromised** | Low | Low | Keys are never stored. No database, no log, no cache. Nothing to breach. |

---

## 16. Appendices

### A. Technical Spec: System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      WEB FRONTEND                            │
│              (Lovable / React — cae-animals.com)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ BYOK Key Manager (Browser-Only)                      │    │
│  │ • localStorage storage, per-request transmission     │    │
│  │ • Never touches backend storage or logs              │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + CORS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                            │
│                                                               │
│  Endpoints → PDF Parser → Hybrid Router → Validator → Store  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ HYBRID ROUTING ENGINE                                 │    │
│  │  Stage 1: gemini-3.0-flash (always)                   │    │
│  │  Stage 2: gemini-3.1-pro (if score ≥56 or silence)   │    │
│  │  Fallback: keep Flash result if Pro fails             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ HARD VALIDATION (Python-enforced)                     │    │
│  │  Score clamping, level enforcement, type validation,  │    │
│  │  deduplication, Indonesia status check                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ DATA LIFECYCLE                                        │    │
│  │  PDFs: deleted post-analysis                          │    │
│  │  Results: 90-day TTL                                  │    │
│  │  Debug: 7-day TTL                                     │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Gemini   │  │ Groq     │  │ Mistral  │
        │ (Free)   │  │ (Free)   │  │ (Free)   │
        └──────────┘  └──────────┘  └──────────┘
```

**Technology Stack:**

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Backend | FastAPI (Python 3.11+) | Async-native, auto-generated API docs |
| PDF parsing | PyMuPDF (fitz) | Forensic-grade: handles tables, footnotes, preserves page structure |
| HTTP client | httpx (async) | Non-blocking with configurable timeouts |
| Primary LLM | Gemini 3.0 Flash + 3.1 Pro | Free tier, 1M token context, hybrid routing |
| Fallback LLMs | Groq, Mistral, OpenAI | Provider diversity for resilience |
| Frontend | Lovable (React + TypeScript + Tailwind) | Rapid development, managed hosting |
| Database | Supabase (PostgreSQL) | Free tier, real-time, Row Level Security |
| Hosting | Render.com | Free PaaS, zero-config deploys |

---

### B. Technical Spec: API Specification

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| GET/HEAD | `/` | Health check with API info and storage stats |
| GET/HEAD | `/health` | Minimal uptime ping |
| POST | `/upload` | Upload a PDF report |
| POST | `/analyze` | Start single-file analysis (accepts BYOK key) |
| POST | `/analyze-multi` | Start multi-file merge analysis (accepts BYOK key) |
| GET | `/reports/{id}` | Check report/analysis status |
| GET | `/reports` | List all reports |
| GET | `/analysis/{id}` | Retrieve full analysis results |
| GET | `/analysis/{id}/export` | Export findings as CSV |
| GET | `/providers` | List available LLM providers |
| POST | `/providers/test` | Validate an API key against a provider |

**Key Request Schemas:**

POST `/analyze`:
```json
{
  "report_id": "uuid",
  "company_name": "Optional",
  "report_year": 2025,
  "provider": "gemini",
  "api_key": "user-key-or-null"
}
```

POST `/analyze-multi`:
```json
{
  "report_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "company_name": "Company Name",
  "report_year": 2025,
  "provider": "gemini",
  "api_key": null
}
```

**Partial Success Response (Multi-File):**
```json
{
  "id": "analysis-uuid",
  "status": "completed",
  "completeness": "partial",
  "failed_documents": [
    {
      "file_name": "appendix_c_scanned.pdf",
      "report_id": "uuid-3",
      "error": "Image-based PDF — no extractable text",
      "suggestion": "Upload a text-based version of this document"
    }
  ],
  "analyzed_document_count": 4,
  "total_document_count": 5,
  "overall_risk_score": 68,
  "overall_risk_level": "high"
}
```

---

### C. Technical Spec: AI Analysis Engine

**Adversarial Prompt Design:**

The system prompt frames the AI as a skeptical auditor, not a summarizer. Four principles govern the prompt:

1. Assume the report is designed to mislead. If ambiguous, score it as evasive.
2. Silence is evidence. If Indonesia isn't mentioned, that's the finding.
3. Cite everything. No finding without an exact quote and page number.
4. No benefit of the doubt. "We aspire to" is hedging, full stop.

**Output Requirements:**

The LLM returns structured JSON with: company name, report year, risk score with breakdown, global cage-free claim (verbatim), Indonesia mention status, SEA country assessment, binding vs. hedging language counts, individual findings (typed, severity-rated, quote-backed), and document confidence.

**Robust JSON Parser:**

LLMs don't always produce clean JSON. The parser tries five strategies in sequence:
1. Direct JSON parse
2. Extract from markdown code blocks
3. Strip leading/trailing non-JSON text
4. Fix trailing commas
5. Brace-matching extraction

If all five fail, the raw output is saved for debugging (kept for 7 days per retention policy).

---

### D. Technical Spec: LLM Provider Architecture

**Abstraction Layer:**

All providers implement a single interface:

```python
async def analyze(self, messages: list[dict]) -> LLMResponse

@dataclass
class LLMResponse:
    content: str              # Raw JSON output
    model: str                # Model identifier
    provider: str             # Provider name
    input_tokens: int         # Tokens consumed
    output_tokens: int        # Tokens generated
    total_tokens: int         # Total usage
    cost_estimate_usd: float  # Estimated cost
```

**Gemini Configuration:**

| Setting | Value | Why |
|---------|-------|-----|
| Temperature | 0.1 | Near-deterministic for consistent evidence extraction |
| Top P | 0.95 | Minimal creativity allowance |
| Max output tokens | 65,536 | Accommodates detailed findings for 300+ page documents |
| Response format | `application/json` | Enforces structured output |
| Timeout | 300 seconds | Pro model on large documents can take several minutes |

**Context Window Strategy:**

| Provider | Usable Tokens | Approach |
|----------|--------------|----------|
| Gemini | 900,000 | Full document, single pass |
| Groq | 120,000 | Smart truncation: first half + last half |
| Mistral | 28,000 | Heavy truncation, best for shorter reports |
| OpenAI | 120,000 | Smart truncation (same as Groq) |

---

### E. Technical Spec: Resilience & Error Handling

**Retry Strategy:**

| Attempt | Wait | Triggers |
|---------|------|----------|
| 1st retry | 15 seconds | HTTP 429, 500, 502, 503, 504 |
| 2nd retry | 30 seconds | Same |
| 3rd retry | 60 seconds | Same |
| After 3 failures | Give up, use fallback | — |

Errors that won't be helped by retrying (400, 401, 403) fail immediately.

**BYOK Error Handling:**

| Situation | Response | User Sees |
|-----------|----------|-----------|
| Key rejected | 401 | "Your API key was rejected. Check that it's valid and has billing enabled." |
| Key lacks model access | 403 | "Your key doesn't have access to this model. Check your API plan." |
| Rate limit on user's key | Retry with backoff | "Rate limit hit. Retrying automatically..." |
| Empty or malformed key | 400 | "The API key provided is empty or malformed." |

**Fallback Chain:**

```
gemini-3.1-pro
    ↓ fails after 3 retries
gemini-3.0-flash (result already in memory from Stage 1)
    ↓ tagged as "Pro fallback"
Analysis completes with Flash result
```

The Flash result is never thrown away during hybrid routing. It's always the safety net.

---

### F. Evasion Pattern Taxonomy

CAE detects 9 evasion patterns plus 1 positive pattern:

| # | Pattern | What It Looks Like | Typical Severity |
|---|---------|-------------------|-----------------|
| 1 | **Hedging Language** | "We aspire to," "where feasible," "subject to availability" — sounds like commitment, carries zero obligation | Medium–High |
| 2 | **Geographic Exclusion** | Commitments explicitly scoped to certain regions, SEA left out | High–Critical |
| 3 | **Strategic Silence** | Indonesia never mentioned in the cage-free context — deliberate absence as plausible deniability | Critical |
| 4 | **Franchise Firewall** | "Company-owned operations only" — quietly excluding the vast majority of locations | High |
| 5 | **Availability Clause** | "Where supply is readily available" — an open-ended escape hatch | High |
| 6 | **Timeline Deferral** | Deadlines pushed from 2025 to 2030 to "ongoing" — the commitment that never arrives | Medium–High |
| 7 | **Silent Delisting** | Countries or products previously included quietly removed from latest report | Critical |
| 8 | **Corporate Ghosting** | Company previously engaged with advocates, now completely unresponsive | High |
| 9 | **Commitment Downgrade** | Language weakened year-over-year: "will source" becomes "aims to support" | High–Critical |
| ✅ | **Binding Commitment** | Genuine commitment with specific dates, markets, and accountability | Info (positive) |

**Severity Scale:**

| Level | Score Impact | Meaning |
|-------|-------------|---------|
| Critical | +20–30 points | Direct evidence of deliberate evasion |
| High | +10–20 points | Strong indicator of non-compliance |
| Medium | +5–10 points | Concerning, warrants follow-up |
| Low | +1–5 points | Minor or unconfirmed |
| Info | 0 points | Positive finding — doesn't increase risk score |

---

### G. Data Retention Summary

| What | Where | How Long | Cleanup |
|------|-------|----------|---------|
| Source PDFs | `uploads/` | Deleted after analysis completes | Post-analysis hook |
| Analysis results | `results/` | 90 days | Daily background task |
| Debug dumps | `results/debug/` | 7 days | Daily background task |
| In-memory entries | RAM | Until server restarts | Ephemeral by design |
| Supabase records | Cloud database | Indefinite | Manual archival |
| **BYOK keys** | **Nowhere** | **Never stored** | **Nothing to clean up** |

---

### H. Glossary

| Term | Meaning |
|------|---------|
| **CAE** | Corporate Accountability Engine |
| **AFFA** | Act For Farmed Animals |
| **SEA** | Southeast Asia |
| **OWA** | Open Wing Alliance |
| **BYOK** | Bring Your Own Key — users provide their own LLM API credentials |
| **Hybrid Routing** | Two-stage analysis: fast model screens, reasoning model goes deep when triggered |
| **Hard Validation** | Python-enforced rules that override AI output when it's inconsistent |
| **Evasion Pattern** | A specific tactic companies use to avoid accountability in sustainability reports |
| **Flash** | Gemini 3.0 Flash — fast, cost-efficient model for initial screening |
| **Pro** | Gemini 3.1 Pro — reasoning model for deep analysis on flagged reports |
| **Finding** | A specific, citable instance of a detected evasion pattern |
| **Time-to-Value** | Duration from a new user's first interaction to their first exported CSV |
| **Partial Success** | A multi-file analysis where some documents were processed and others failed |

---

### I. CORS-Allowed Origins

```
http://localhost:3000
http://localhost:5173
https://cae-animals.lovable.app
https://cae-animals.com
https://www.cae-animals.com
https://preview--cae-animals.lovable.app
${FRONTEND_URL}
```

---

### J. File Structure

```
cae-backend/
├── main.py                 # FastAPI app, endpoints, routing, validation
├── llm_providers.py        # Provider abstraction, retry logic, BYOK handling
├── pdf_parser.py           # PDF extraction, page markers, text validation
├── system_prompt.py        # Adversarial prompt construction
├── data_retention.py       # Cleanup scheduler, TTL enforcement
├── uploads/                # Source PDFs (deleted after analysis)
├── results/                # Analysis JSON files (90-day TTL)
│   └── debug/              # Failed parse dumps (7-day TTL)
├── requirements.txt        # Python dependencies
├── render.yaml             # Deployment configuration
└── README.md               # Setup guide
```

---

### K. Environment Variable Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `GEMINI_API_KEY` | Yes | — | Server's default Gemini API key |
| `LLM_PROVIDER` | No | `gemini` | Default provider |
| `GEMINI_FLASH_MODEL` | No | `gemini-3.0-flash` | Fast scan model |
| `GEMINI_PRO_MODEL` | No | `gemini-3.1-pro` | Deep analysis model |
| `GROQ_API_KEY` | No | — | Groq fallback key |
| `MISTRAL_API_KEY` | No | — | Mistral fallback key |
| `OPENAI_API_KEY` | No | — | OpenAI key (if funded) |
| `PORT` | No | `8000` | Server port |
| `FRONTEND_URL` | No | — | Additional CORS origin |
| `SUPABASE_URL` | No | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key |
| `DATA_RETENTION_RESULTS_DAYS` | No | `90` | Result JSON retention period |
| `DATA_RETENTION_DEBUG_DAYS` | No | `7` | Debug file retention period |

---

*This PRD is the single source of truth for what CAE does and why. Technical implementation details live in the appendices. All product decisions should trace back to a requirement in this document.*

*Last reviewed: March 5, 2026 — Kendrick*
