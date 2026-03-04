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
    desc: "Using weak words like 'hope to' or 'strive towards' instead of firm promises.",
  },
  {
    icon: VolumeX,
    title: "Strategic Silence",
    desc: "Completely ignoring specific countries or regions in their progress reports.",
  },
  {
    icon: Globe,
    title: "Geographic Tiering",
    desc: "Treating regions differently—keeping promises in the West but ignoring Indonesia.",
  },
  {
    icon: Store,
    title: "Franchise Firewall",
    desc: "Claiming the rules don't apply to stores run by local partners or franchises.",
  },
  {
    icon: Clock,
    title: "Availability Clause",
    desc: "Making excuses like 'we will do it when local supply is ready' with no deadline.",
  },
  {
    icon: CalendarClock,
    title: "Timeline Deferral",
    desc: "Quietly pushing deadlines further and further into the future.",
  },
  {
    icon: EyeOff,
    title: "Silent Delisting",
    desc: "Secretly removing countries from their promise list without telling anyone.",
  },
  {
    icon: Ghost,
    title: "Corporate Ghosting",
    desc: "Ignoring messages from advocates and hoping the problem just goes away.",
  },
  {
    icon: TrendingDown,
    title: "Commitment Downgrade",
    desc: "Making their promises weaker than what they told the public last year.",
  },
];

const techStack = [
  { name: "React + TypeScript", desc: "The website interface you are looking at" },
  { name: "FastAPI (Python)", desc: "The high-performance engine running behind the scenes" },
  { name: "Google Gemini AI", desc: "The smart brain trained to detect hidden corporate tricks" },
  { name: "PyMuPDF", desc: "The tool that carefully extracts text from PDF files" },
  { name: "Supabase", desc: "Keeps our data and analysis secure" },
  { name: "Tailwind CSS", desc: "Provides a clean and easy-to-use design" },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "UPLOAD",
    desc: "Just upload a corporate sustainability report (PDF) into the system.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI SCAN",
    desc: "Our AI quickly reads through every tiny footnote and appendix so you don't have to.",
  },
  {
    icon: ScanSearch,
    step: "03",
    title: "SPOT TRICKS",
    desc: "The system acts like a digital detective, looking for 9 common corporate excuses.",
  },
  {
    icon: FileCheck,
    step: "04",
    title: "GET PROOF",
    desc: "In just 3–5 minutes, you get a clear report with exact page numbers and quotes.",
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About CAE — Finding the Truth in Corporate Reports</title>
        <meta
          name="description"
          content="Learn how CAE uses smart AI to find hidden excuses in corporate reports. Built to help animal advocates hold big companies accountable."
        />
        <meta property="og:title" content="About CAE — Finding the Truth in Corporate Reports" />
        <meta
          property="og:description"
          content="Learn how CAE uses smart AI to find hidden excuses in corporate reports. Built to help animal advocates hold big companies accountable."
        />
        <link rel="canonical" href="https://cae-animals.com/about" />
        <meta property="og:url" content="https://cae-animals.com/about" />
        <meta property="og:type" content="website" />
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
            <span className="font-nav font-bold text-sm text-primary-foreground tracking-wider hidden sm:block">
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
          <img src={caeLogoTruth} alt="CAE Logo" className="w-[240px] sm:w-[300px] mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2">ABOUT CAE</h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider">Finding the truth, made easy.</p>
        </div>

        {/* Section 1 — Our Mission */}
        <section className="bg-card rounded-lg border-l-4 border-primary p-8">
          <h2 className="font-display text-2xl mb-4">OUR MISSION</h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Big food companies often promise to go "cage-free" globally to look good. But if you read the fine print,
            they frequently leave out countries like Indonesia. We built the Corporate Accountability Engine (CAE) to
            catch these hidden tricks automatically. Our mission is to make it easy for any volunteer or advocate to
            hold big corporations accountable.
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
          <h3 className="font-display text-xl mb-4">9 COMMON TRICKS WE DETECT</h3>
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
            As a key player at Act For Farmed Animals, I spent weeks manually reading corporate reports—hunting through
            hundreds of pages of fine print just to find out if a company is keeping its cage-free promise. The
            Corporate Accountability Engine was born from that frustration. What used to take two weeks now takes just
            3–5 minutes. My goal is to give every animal advocate an easy way to find the proof they need to protect
            animals.
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
          <h2 className="font-display text-2xl mb-4">THE TECH BEHIND CAE</h2>
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
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button className="font-body font-bold text-base px-10 py-6 rounded-lg">START ANALYZING</Button>
          </Link>
        </div>

        <p className="text-center font-body text-xs text-muted-foreground">
          Corporate Accountability Engine v2.0 — Truth. Extracted.
        </p>
      </div>

      <Footer />
    </div>
  );
}
