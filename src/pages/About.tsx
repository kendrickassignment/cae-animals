import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Linkedin,
  Github,
  ExternalLink,
  Upload,
  Brain,
  ScanSearch,
  FileCheck,
  Shield,
  VolumeX,
  Globe,
  Store,
  Clock,
  CalendarClock,
  EyeOff,
  Ghost,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import caeLogoTruth from "@/assets/cae-logo-truth.png";
import caeLogoDark from "@/assets/cae-logo-dark.png";
import Footer from "@/components/layout/Footer";

const evasionPatterns = [
  {
    icon: Shield,
    title: "Hedging Language",
    desc: "Vague words like 'aspire to', 'work towards' that avoid firm commitments.",
  },
  {
    icon: VolumeX,
    title: "Strategic Silence",
    desc: "Completely omitting specific countries or regions from reporting.",
  },
  {
    icon: Globe,
    title: "Geographic Tiering",
    desc: "Different standards for different regions — 'leading markets' vs everywhere else.",
  },
  { icon: Store, title: "Franchise Firewall", desc: "Excluding franchise operations from cage-free commitments." },
  {
    icon: Clock,
    title: "Availability Clause",
    desc: "'Subject to local availability' escape clauses with no measurable criteria.",
  },
  {
    icon: CalendarClock,
    title: "Timeline Deferral",
    desc: "Pushing deadlines indefinitely into the future without interim milestones.",
  },
  {
    icon: EyeOff,
    title: "Silent Delisting",
    desc: "Quietly removing previous commitments from updated reports without disclosure.",
  },
  {
    icon: Ghost,
    title: "Corporate Ghosting",
    desc: "Ignoring follow-up inquiries about commitments, hoping no one notices.",
  },
  {
    icon: TrendingDown,
    title: "Commitment Downgrade",
    desc: "Weakening language from previous reports to reduce accountability.",
  },
];

const techStack = [
  { name: "React + TypeScript", desc: "Modern, responsive web interface" },
  { name: "FastAPI (Python)", desc: "High-performance API backend" },
  { name: "Google Gemini AI", desc: "Adversarial language model for detecting evasion patterns" },
  { name: "PyMuPDF", desc: "PDF text extraction preserving page structure" },
  { name: "Supabase", desc: "Secure database and authentication" },
  { name: "Tailwind CSS", desc: "Clean, accessible UI design" },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "UPLOAD",
    desc: "Users upload corporate sustainability report PDFs for analysis.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI ANALYSIS",
    desc: "Adversarial AI powered by Google Gemini scans every page, footnote, and appendix.",
  },
  {
    icon: ScanSearch,
    step: "03",
    title: "PATTERN DETECTION",
    desc: "The engine detects 9 distinct evasion patterns used to obscure regional exclusions.",
  },
  {
    icon: FileCheck,
    step: "04",
    title: "EVIDENCE REPORT",
    desc: "Citation-backed scorecard with exact page numbers, generated in 3–5 minutes at $0.15 per report.",
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About CAE — Mission, Methodology & Team | Cage-Free Egg Accountability</title>
        <meta
          name="description"
          content="Learn how CAE uses adversarial AI to detect 9 evasion patterns in corporate sustainability reports. Built by Kendrick Filbert at Act For Farmed Animals."
        />
        <meta property="og:title" content="About CAE — Mission, Methodology & Team | Cage-Free Egg Accountability" />
        <meta
          property="og:description"
          content="Learn how CAE uses adversarial AI to detect 9 evasion patterns in corporate sustainability reports. Built by Kendrick Filbert at Act For Farmed Animals."
        />
        <link rel="canonical" href="https://cae-animals.com/about" />
        <meta property="og:url" content="https://cae-animals.com/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="About CAE — Mission, Methodology & Team | Cage-Free Egg Accountability" />
        <meta
          name="twitter:description"
          content="Learn how CAE uses adversarial AI to detect 9 evasion patterns in corporate sustainability reports. Built by Kendrick Filbert at Act For Farmed Animals."
        />
      </Helmet>

      {user ? (
        <div className="sticky top-0 z-50 bg-background border-b border-border px-4 sm:px-6 py-3 flex items-center">
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2 font-body font-bold text-xs sm:text-sm">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <nav className="bg-primary h-16 flex items-center px-4 sm:px-6 sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3">
            <img src={caeLogoDark} alt="CAE Logo" className="h-10 mix-blend-multiply cursor-pointer" />
            <span className="font-nav text-[10px] text-primary-foreground/70 tracking-wider hidden sm:block">
              Corporate Accountability Engine
            </span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all hidden sm:block"
            >
              HOME
            </Link>
            <a
              href="/#contact"
              className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all hidden sm:block"
            >
              CONTACT
            </a>
            <Link
              to="/auth"
              className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all"
            >
              SIGN IN
            </Link>
            <Link to="/auth">
              <Button
                variant="outline"
                className="bg-sidebar text-sidebar-foreground border-none font-body font-bold text-xs sm:text-sm px-3 sm:px-5 hover:bg-sidebar/90"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      )}

      <div className="max-w-4xl mx-auto space-y-10 py-10 sm:py-16 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <img src={caeLogoTruth} alt="CAE Logo" className="w-[180px] mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2">ABOUT CAE</h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider">Truth. Extracted.</p>
        </div>

        {/* Section 1 — Our Mission */}
        <section className="bg-card rounded-lg border-l-4 border-primary p-8">
          <h2 className="font-display text-2xl mb-4">OUR MISSION</h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            The Corporate Accountability Engine exists to close the accountability gap in corporate cage-free egg
            commitments. Multinational corporations publish sustainability reports filled with global pledges — but
            hidden in footnotes and legal clauses are exclusions that exempt entire regions like Indonesia. CAE was
            built to make these exclusions impossible to hide.
          </p>
        </section>

        {/* Section 2 — How CAE Works */}
        <section className="bg-card rounded-lg border-l-4 border-secondary p-8">
          <h2 className="font-display text-2xl mb-6">HOW CAE WORKS</h2>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-muted rounded-lg p-5 flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <span className="font-display text-2xl text-primary">{s.step}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-display text-base">{s.title}</h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Evasion Patterns */}
          <h3 className="font-display text-xl mb-4">9 EVASION PATTERNS DETECTED</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evasionPatterns.map((p) => (
              <div key={p.title} className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <p.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-display text-sm">{p.title}</span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Built By */}
        <section className="bg-card rounded-lg border-l-4 border-destructive p-8">
          <h2 className="font-display text-2xl mb-4">BUILT BY</h2>
          <h3 className="font-display text-2xl mb-1">Kendrick Filbert</h3>
          <p className="font-body text-muted-foreground mb-4">Act For Farmed Animals</p>
          <p className="font-body text-muted-foreground leading-relaxed mb-6">
            As a researcher at Act For Farmed Animals, I spent weeks manually auditing corporate sustainability reports
            — cross-referencing footnotes, appendices, and legal clauses across hundreds of pages. The Corporate
            Accountability Engine was born from that frustration. What took 2 weeks now takes 3–5 minutes. Our goal:
            give every animal welfare advocate access to instant, evidence-backed corporate intelligence.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="https://www.linkedin.com/in/kendrick-filbert/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </Button>
            </a>
            <a href="https://github.com/kendrickassignment" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <Github className="h-4 w-4" /> GitHub
              </Button>
            </a>
            <a href="https://huggingface.co/kendrickfff" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <ExternalLink className="h-4 w-4" /> Hugging Face
              </Button>
            </a>
          </div>
        </section>

        {/* Section 4 — Tech Stack */}
        <section className="bg-card rounded-lg border-l-4 border-risk-low p-8">
          <h2 className="font-display text-2xl mb-4">TECH STACK</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {techStack.map((t) => (
              <div key={t.name} className="bg-muted rounded-lg p-4">
                <Badge variant="secondary" className="font-nav text-[11px] tracking-wider mb-2">
                  {t.name}
                </Badge>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-6">
          <Link to="/auth">
            <Button className="font-body font-bold text-base px-10 py-6 rounded-lg">START ANALYZING</Button>
          </Link>
        </div>

        <p className="text-center font-body text-xs text-muted-foreground">
          Corporate Accountability Engine v1.0 — Truth. Extracted.
        </p>
      </div>

      <Footer />
    </div>
  );
}
