<p align="center">
  <img src="https://img.shields.io/badge/Truth-Extracted-dc2626?style=for-the-badge&logo=shield&logoColor=white" alt="Truth Extracted" />
  <img src="https://img.shields.io/badge/Built%20for-AFFA-f59e0b?style=for-the-badge" alt="Built for people and animals" />
  <img src="https://img.shields.io/badge/AI%20Powered-Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Multi--LLM-Groq%20%7C%20Mistral%20%7C%20OpenAI-8B5CF6?style=for-the-badge" alt="Multi-LLM" />
</p>

# 🔍 Corporate Accountability Engine (CAE)

**An adversarial AI platform that analyzes corporate sustainability reports to detect greenwashing, evasion patterns, and broken cage-free egg commitments — with a focus on Southeast Asia.**

> *"Truth. Extracted."* — [truthextracted.com](https://truthextracted.com)

Built for [Act For Farmed Animals (AFFA)](https://www.actforfarmedanimals.org/) / [Sinergia Animal International](https://www.sinergiaanimal.org/) to hold multinational corporations accountable for their animal welfare promises.

---

## 🎯 What It Does

CAE uploads corporate sustainability PDFs, parses them, and uses adversarial AI analysis to detect **9 evasion patterns**:

| # | Pattern | Description | Severity |
|---|---------|-------------|----------|
| 1 | **Strategic Silence** | Company avoids mentioning cage-free eggs entirely — the absence IS the evidence | 🔴 Critical |
| 2 | **Hedging Language** | "We aspire to..." / "We aim to..." — soft language that avoids binding commitments | 🟡 Medium |
| 3 | **Geographic Exclusion** | Global commitments that quietly exclude Southeast Asian markets | 🔴 Critical |
| 4 | **Franchise Firewall** | Parent company deflects responsibility to franchisees | 🟠 High |
| 5 | **Timeline Deferral** | Pushing deadlines indefinitely ("by 2030... by 2035... by 2040...") | 🟠 High |
| 6 | **Availability Clause** | "Subject to local supply availability" — built-in escape hatches | 🟡 Medium |
| 7 | **Silent Delisting** | Quietly removing previously included countries from cage-free programs | 🔴 Critical |
| 8 | **Corporate Ghosting** | No response to inquiries, no progress updates, no accountability mechanisms | 🟠 High |
| 9 | **Commitment Downgrade** | Weakening language from previous years — absolute → relative, specific → vague | 🟠 High |

### Real Examples

#### IKEA FY24 Sustainability Report — Score: 98/100 🔴 CRITICAL

- **Complete Strategic Silence** on Indonesia in 200+ pages — never mentioned in cage-free context
- **Franchise Firewall** — commitments limited to company-owned stores
- **Commitment Downgrade** — circularity goals downgraded from fixed endpoints to vague "transitions"
- **Corporate Ghosting** — no third-party verification for the "100% cage-free" claim
- Processing time: ~3 minutes

#### Unilever Indonesia FY24 (Bahasa Indonesia) — Score: 45/100 🟠 HIGH

- **Strategic Silence** — complete omission of cage-free egg commitment
- **8 Hedging findings** — "kami yakin" (we believe), "menuju" (towards), "berupaya" (work to)
- **Exact page citations** — p.3, p.9, p.46, p.47, p.48, p.158
- 🇮🇩 **Indonesia Status: NO DATA — SILENT** — despite global parent committing to 100% cage-free

---

## 🏗️ Architecture

```text
┌─────────────────┐     ┌────────────────────┐     ┌────────────────┐
│   Frontend      │     │   Backend API      │     │   AI Engine    │
│   (Lovable)     │────▶│   (Render)         │────▶│   Gemini 2.5   │
│   React + TS    │     │   FastAPI + Python  │     │   Flash (1M    │
│   Tailwind CSS  │     │   PDF Parser       │     │   tokens)      │
└────────┬────────┘     └────────┬───────────┘     └────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌────────────────────┐     ┌────────────────┐
│   Database      │     │   Edge Functions   │     │   Email        │
│   (Supabase)    │     │   (Supabase)       │     │   (Resend)     │
│   PostgreSQL    │     │   Notifications    │     │   Flag/Verify  │
│   Auth + RLS    │     │   Flag/Unflag      │     │   Alerts       │
│   Storage       │     │   Analysis Alerts  │     │                │
│   Realtime      │     │                    │     │                │
└─────────────────┘     └────────────────────┘     └────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, shadcn/ui | Dashboard, analysis display, company tracking |
| **Backend** | Python, FastAPI, PyPDF2/pdfplumber | PDF upload, parsing, AI orchestration, finding deduplication |
| **AI Engine** | Google Gemini 2.5 Flash (default) | Adversarial analysis with 1M token context window |
| **AI Alternatives** | Groq (Llama 3.3 70B), Mistral (Small), OpenAI (GPT-4o) | Configurable per-analysis or globally |
| **Database** | Supabase (PostgreSQL) | Permanent storage, auth, Row Level Security, Realtime |
| **Storage** | Supabase Storage | PDF file storage with ownership policies |
| **Edge Functions** | Supabase Edge Functions (Deno) | Notification delivery, flag/unflag alerts |
| **Email** | Resend API | Flag notifications, analysis completion alerts |
| **Hosting** | Lovable (frontend), Render (backend) | Free tier deployment |
| **Domain** | truthextracted.com (IONOS) | Custom domain |

### AI Providers

| Provider | Model | Context Window | Cost | Best For |
|---|---|---|---|---|
| **Google Gemini** | `gemini-2.5-flash` | 1M tokens | Free | Large documents (200+ pages) — **Recommended** |
| **Groq** | `llama-3.3-70b-versatile` | 131K tokens | Free | Fast inference, medium documents |
| **Mistral** | `mistral-small-latest` | 32K tokens | Free | Backup, multilingual analysis |
| **OpenAI** | `gpt-4o` | 128K tokens | Paid | Highest quality analysis |

---

## 📊 Features

### 🏠 Dashboard

- **Real-time statistics** — Total Reports, Companies Tracked, High Risk Findings, Avg Risk Score (real analyses only, excludes demo data)
- **Risk distribution chart** — Visual breakdown of critical/high/medium/low (real analyses only)
- **Recent analyses table** — Paginated (10 per page) with Previous/Next navigation
- **Status badges** — Verified ✅, Unverified ⏳, Demo 🎮
- **Source indicators** — ⚡ Live vs ✓ Demo
- **PDF upload** — Drag & drop, supports up to 50MB, 10 files at once
- **Real-time progress** — Uploading → Parsing → Analyzing → Complete
- **Search** — Fuzzy search across company names, report years, and risk levels

### 📄 Analysis Detail

- **Executive Summary** — AI-generated adversarial analysis
- **Indonesia Status** — 🇮🇩 Compliant / Partial / No Data — Silent indicator
- **Global claim extraction** — Exact quote of the company's cage-free commitment
- **Risk score (0-100)** with color-coded severity badge
- **9 Evasion pattern detection** with specific counts per pattern
- **Binding vs. hedging language ratio** with counts
- **Individual findings** — Severity badges, exact quotes, page numbers, affected countries
- **Previous Analyses** — Historical comparison for the same company (real-to-real only, demo data excluded)
- **Score trend indicators** — Shows +/- score change between real analyses
- **CSV export** of all findings
- **Download original PDF**

### 🛡️ Admin Features

- **Mark as Verified** — Admin approves analysis for team-wide visibility
- **Flag as Suspicious** — Flag with a required reason; shows warning banner on the analysis
- **Unflag** — Remove flag with notification to the uploader
- **Edit Metadata** — Change company name or report year post-analysis
- **Delete Analysis** — Permanently remove an analysis with confirmation
- **View all analyses** — Admin sees all (including unverified), team members see only own + verified + seed

### 🔔 Notification System

- **In-app notifications** (bell icon) — Realtime via Supabase Realtime subscriptions
- **Email notifications** — Via Resend API through Supabase Edge Functions
- **Admin receives:**
  - New analysis completed alerts (with company, year, risk level, uploader name)
- **Users receive:**
  - Flag/unflag notifications from admin (with reason)
- **Session notifications** — Toast messages for own actions (upload complete, flag, etc.)
- **Deduplication** — Server-side guard prevents duplicate notifications per analysis

### 🔍 Duplicate Detection

- **File hash check (SHA-256)** — Same PDF detected before processing starts, regardless of metadata
- **Company + Year check** — Same company and year combination detected
- **Seed data excluded** — Demo/seed analyses never trigger duplicate warnings
- **User choice** — View existing analysis or proceed with new upload

### 🧹 Finding Deduplication

Two-layer system to prevent noisy/duplicate findings:

1. **AI Prompt Layer** — System prompt instructs Gemini to group related findings (max 3-5 per pattern type, target 7-15 total)
2. **Python Safety Net** — `deduplicate_findings()` function merges identical findings server-side, collecting all page references into one grouped finding

### 🏢 Companies

- **Company cards** with risk levels and report years
- **Dynamic addition** from real analyses
- **Historical tracking** across multiple reports

### ⚙️ Settings

- Configure AI provider (Gemini, OpenAI, Groq, Mistral)
- Backend URL configuration
- API key management (stored client-side only)

---

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with granular policies:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `analysis_results` | Own + Verified + Seed (`user_id IS NULL`) + Admin sees all | Authenticated | Owner only | Owner only |
| `admin_notifications` | Own notifications (`admin_user_id = auth.uid()`) | Blocked client-side (`WITH CHECK (false)`); edge functions use service role | Recipient only | Recipient only |
| `companies` | All authenticated | Authenticated | Owner only | Owner only |
| `findings` | All authenticated | Report owner (via subquery) | Report owner | Report owner |
| `reports` | All authenticated | Authenticated | Owner only | Owner only |
| `profiles` | Own profile only | Own profile only | Own profile only | — |
| `user_roles` | Own roles only | Service role only | — | — |
| `contact_rate_limits` | Service role only | Service role only | — | — |

### Role-Based Access

| Feature | Team Member | Admin |
|---|---|---|
| Upload & analyze PDFs | ✅ | ✅ |
| View own analyses (verified & unverified) | ✅ | ✅ |
| View others' **verified** analyses | ✅ | ✅ |
| View others' **unverified** analyses | ❌ | ✅ |
| View seed/demo data | ✅ | ✅ |
| Mark as Verified | ❌ | ✅ |
| Flag/Unflag analyses | ✅ (flag only) | ✅ |
| Edit metadata | ❌ | ✅ |
| Delete any analysis | ❌ | ✅ |
| Receive flag notifications | ✅ (own analyses) | ✅ |
| Receive new analysis alerts | ❌ | ✅ |

### Additional Security Measures

- ✅ All RLS policies use `(select auth.uid())` for query performance optimization
- ✅ Edge function notifications use service role key (bypass RLS for cross-user inserts)
- ✅ Client-side inserts to `admin_notifications` blocked (`WITH CHECK (false)`)
- ✅ Contact form input sanitization (HTML entity escaping)
- ✅ Contact form rate limiting (3 requests/IP/hour)
- ✅ CORS restricted to specific frontend origins
- ✅ localStorage cleared on sign-out
- ✅ Leaked password protection enabled
- ✅ Storage DELETE policy with ownership verification
- ✅ Edge function CORS restricted (no wildcard)
- ✅ Content security headers (X-Content-Type-Options: nosniff)
- ✅ Tamper-proof scoring — Python enforces score-to-level mapping; AI cannot override
- ✅ AI-generated fields protected — no manual editing of scores/findings
- ✅ SHA-256 file hashing for duplicate detection
- ✅ Audit trail — upload timestamps, flag history, verification status tracked

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account
- Google AI Studio API key (Gemini)

### Frontend Setup

```bash
git clone https://github.com/kendrickassignment/cae-animals.git
cd cae-animals
npm install
npm run dev
```

### Backend Setup

The backend API is deployed separately on Render:

```bash
# Clone the backend repository
git clone https://github.com/kendrickassignment/cae-backend.git
cd cae-backend
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --port 8000
```

Or configure via the Settings page in the app:

1. Navigate to **Settings**
2. Set **Backend URL** (your Render deployment)
3. Set **AI Provider** (Gemini recommended)
4. Set **API Key** (your Google AI Studio key)

### Environment Variables

**Frontend** (via Lovable):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Backend** (via Render):

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | Default LLM provider (default: `gemini`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `FRONTEND_URL` | Frontend URL for CORS |
| `PORT` | Server port (default: `8000`) |

**Edge Functions** (via Supabase):

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for email notifications |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for cross-user operations |

---

## 📁 Database Schema

### `analysis_results`

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users
report_id               text
company_name            text
report_year             integer
overall_risk_level      text           -- 'low', 'medium', 'high', 'critical'
overall_risk_score      integer        -- 0-100
global_claim            text
indonesia_mentioned     boolean
indonesia_status        text           -- 'compliant', 'partial', 'excluded', 'silent', 'deferred'
sea_countries_mentioned jsonb
sea_countries_excluded  jsonb
binding_language_count  integer
hedging_language_count  integer
summary                 text
findings                jsonb
scoring_breakdown       text
document_confidence     text           -- 'high', 'medium', 'low'
document_confidence_reason text
llm_provider            text
llm_model               text
input_tokens            integer
output_tokens           integer
cost_estimate_usd       numeric
file_hash               text           -- SHA-256 hash for duplicate detection
verified                boolean DEFAULT false
analyzed_at             timestamptz
created_at              timestamptz DEFAULT now()
```

### `reports`

```sql
id                        uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                   uuid REFERENCES auth.users
file_name                 text
file_path                 text
status                    text           -- 'uploaded', 'parsing', 'analyzing', 'completed', 'failed'
page_count                integer
analysis_id               uuid REFERENCES analysis_results
processing_completed_at   timestamptz
created_at                timestamptz DEFAULT now()
```

### `admin_notifications`

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
admin_user_id     uuid REFERENCES auth.users    -- recipient user ID (admin or regular user)
type              text                           -- 'new_analysis', 'flag', 'unflag'
title             text
message           text
analysis_id       uuid REFERENCES analysis_results
is_read           boolean DEFAULT false
created_at        timestamptz DEFAULT now()
```

### `user_roles`

```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id    uuid REFERENCES auth.users
role       text           -- 'admin', 'team_member'
created_at timestamptz DEFAULT now()
```

### `companies`

```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id    uuid REFERENCES auth.users
name       text
created_at timestamptz DEFAULT now()
```

### `findings`

```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
report_id        uuid REFERENCES reports
finding_type     text           -- 'strategic_silence', 'hedging_language', etc.
severity         text           -- 'critical', 'high', 'medium', 'low', 'info'
title            text
description      text
exact_quote      text
page_number      integer
section          text
country_affected text
```

### `profiles`

```sql
id         uuid PRIMARY KEY REFERENCES auth.users
full_name  text
avatar_url text
updated_at timestamptz
```

### `contact_rate_limits`

```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
ip_address text
created_at timestamptz DEFAULT now()
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API info and status |
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload a PDF (max 50MB) |
| `POST` | `/analyze` | Trigger AI analysis on uploaded report |
| `GET` | `/reports/{id}` | Get report status |
| `GET` | `/reports` | List all reports |
| `GET` | `/analysis/{id}` | Get full analysis results |
| `GET` | `/analysis/{id}/export` | Export findings as CSV |
| `GET` | `/providers` | List available AI providers |
| `POST` | `/providers/test` | Test API key validity |

### Edge Functions

| Function | Trigger | Description |
|---|---|---|
| `notify-analysis-complete` | Analysis saved | Sends in-app + email notification to all admins |
| `notify-flag-status` | Flag/unflag action | Sends in-app + email notification to analysis uploader |

---

## 📈 Analysis Output Example

```json
{
  "company_name": "IKEA",
  "report_year": 2024,
  "overall_risk_score": 98,
  "overall_risk_level": "critical",
  "document_confidence": "high",
  "indonesia_mentioned": true,
  "indonesia_status": "silent",
  "global_claim": "In FY24, we reached our goal of sourcing 100% of eggs from either cage-free or free-range chickens, one year ahead of the FY25 goal.",
  "binding_language_count": 14,
  "hedging_language_count": 26,
  "scoring_breakdown": "Strategic Silence +35, Corporate Ghosting +15, Commitment Downgrade +15, Hedging Language +8, ...",
  "findings": [
    {
      "finding_type": "strategic_silence",
      "severity": "critical",
      "title": "Indonesia's Cage-Free Egg Status Unreported Despite 'Global' Claim",
      "description": "Indonesia is mentioned multiple times in other contexts (rattan, palm oil) but never in cage-free egg context...",
      "exact_quote": "N/A — Evidence is omission of data",
      "page_number": 0,
      "country_affected": "Indonesia"
    },
    {
      "finding_type": "commitment_downgrade",
      "severity": "high",
      "title": "Circularity and Material Goals Downgraded from Fixed Endpoints",
      "description": "Report reveals weakening of previously firm commitments...",
      "exact_quote": "We are transitioning towards circular and climate positive...",
      "page_number": 6,
      "country_affected": null
    }
  ]
}
```

---

## ⚖️ Scoring Algorithm

CAE uses a **deterministic, tamper-proof scoring system**. The AI suggests — Python decides.

```python
def score_to_level(score: int) -> str:
    """Deterministic risk mapping — bypasses AI hallucination"""
    if score >= 80: return "critical"
    if score >= 56: return "high"
    if score >= 31: return "medium"
    return "low"
```

### Score Components

| Factor | Points | Condition |
|---|---|---|
| **Strategic Silence** | +35 | Indonesia not mentioned in cage-free context |
| **Geographic Exclusion** | +30 | Indonesia explicitly excluded |
| **Franchise Firewall** | +15 | Commitments limited to company-owned |
| **Corporate Ghosting** | +15 | No external accountability mechanism |
| **Commitment Downgrade** | +15 | Weakened language from previous years |
| **Timeline Deferral** | +10 | SEA deadlines pushed beyond 2030 |
| **Hedging Language** | +2 each | Non-binding phrases (max +10) |
| **Availability Clause** | +5 each | Escape conditions (max +10) |
| **Binding Language** | -3 each | Strong commitments (max -15) |
| **Third-Party Audit** | -5 | Independent verification exists |
| **Indonesia Data** | -10 | Indonesia-specific progress reported |

---

## 🧪 Demo vs. Real Data

CAE maintains strict separation between demo/seed data and real analyses:

| Feature | Demo Data | Real Data |
|---|---|---|
| Dashboard stats | ❌ Excluded | ✅ Counted |
| Duplicate detection | ❌ Never triggers | ✅ Triggers warning |
| Previous Analyses | Only shown with other demos | Only shown with other real |
| Score trend (+/-) | Shows "—" | Shows actual diff |
| Visibility | All users | Owner + verified + admin |

Demo data is identified by `user_id IS NULL`.

---

## 💰 Operating Cost

| Service | Cost | Notes |
|---|---|---|
| Domain (IONOS) | $1/year | truthextracted.com |
| Frontend (Lovable) | $25/month | React hosting + deployment |
| Backend (Render) | Free | Free tier |
| AI Engine (Gemini) | Free | Free tier (1M token context) |
| Database (Supabase) | Free | PostgreSQL + Auth + Storage + Realtime |
| Edge Functions (Supabase) | Free | Notification delivery |
| Email (Resend) | Free | 100 emails/day free tier |
| **Total** | **~$26/month** | |

---

## 🗺️ Roadmap

- [x] Core platform — upload, analyze, dashboard, notifications
- [x] Admin system — verify, flag, edit, delete
- [x] Realtime updates — Supabase Realtime subscriptions
- [x] Duplicate detection — SHA-256 file hash + company/year check
- [x] Finding deduplication — AI prompt grouping + Python safety net
- [x] Demo/real data separation
- [ ] Custom domain email (alerts@truthextracted.com)
- [ ] Bulk upload & batch analysis
- [ ] API access for programmatic analysis
- [ ] Multi-language support (Bahasa Indonesia, Thai, Vietnamese)
- [ ] Automated periodic re-analysis
- [ ] Public accountability dashboard
- [ ] Company response portal

---

## 🤝 Built For

**[Act For Farmed Animals (AFFA)](https://www.actforfarmedanimals.org/) / [Sinergia Animal International](https://www.sinergiaanimal.org/)**

CAE supports AFFA's mission by providing:

- **Evidence-based accountability** — exact quotes, page numbers, pattern detection
- **Southeast Asia focus** — specifically tracks Indonesia, Thailand, Philippines, Vietnam, Malaysia
- **Multilingual analysis** — reads reports in Bahasa Indonesia, Thai, and other local languages
- **Permanent record** — all analyses stored in Supabase, persisting until account deletion
- **Team collaboration** — multi-user dashboard with admin verification workflow

---

## 📄 License

This project is built for nonprofit animal welfare research. For licensing inquiries, contact the repository owner.

---

## 🙏 Acknowledgments

- **AFFA / Sinergia Animal International** — For the mission and domain expertise
- **Open Wing Alliance** — For cage-free commitment tracking data
- **Google Gemini** — For powering the adversarial AI analysis (1M token context)
- **Groq, Mistral, OpenAI** — For alternative AI provider support
- **Supabase** — For database, auth, storage, realtime, and edge functions
- **Lovable** — For the frontend development platform
- **Resend** — For email notification infrastructure
- **Render** — For backend hosting

---

<p align="center">
<strong>Truth. Extracted.</strong>
<br>
<em>Because corporate promises should be verifiable.</em>
<br><br>
<a href="https://truthextracted.com">truthextracted.com</a>
</p>
