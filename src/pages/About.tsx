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
  Info,
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
    desc: "Completely ignoring specific countries like Indonesia in global reports.",
  },
  {
    icon: Globe,
    title: "Geographic Tiering",
    desc: "Treating regions differently—ignoring Indonesia while keeping promises in the West.",
  },
  {
    icon: Store,
    title: "Franchise Firewall",
    desc: "Claiming rules don't apply to stores run by local partners or franchises.",
  },
  {
    icon: Clock,
    title: "Availability Clause",
    desc: "Excuses like 'we'll do it when local supply is ready' without any deadline.",
  },
  {
    icon: CalendarClock,
    title: "Timeline Deferral",
    desc: "Quietly pushing deadlines further into the future to avoid action now.",
  },
  {
    icon: EyeOff,
    title: "Silent Delisting",
    desc: "Secretly removing countries from their promise list without disclosure.",
  },
  {
    icon: Ghost,
    title: "Corporate Ghosting",
    desc: "Completely ceasing to report on previously made promises, hoping no one notices the silence.",
  },
  {
    icon: TrendingDown,
    title: "Commitment Downgrade",
    desc: "Making their promises weaker than what they committed to last year.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "UPLOAD",
    desc: "Simply drop a company's sustainability report (PDF) into the engine.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI AUDIT",
    desc: "Our AI scans hundreds of pages, checking every tiny footnote so you don't have to.",
  },
  {
    icon: ScanSearch,
    step: "03",
    title: "SPOT TRICKS",
    desc: "The system identifies the 'tricks' companies use to avoid their responsibilities.",
  },
  {
    icon: FileCheck,
    step: "04",
    title: "GET PROOF",
    desc: "In minutes, you get a clear report with page numbers to use in your campaigns.",
  },
  {
    icon: Shield,
    step: "05",
    title: "OPTIONAL: CUSTOM AI ENGINE",
    desc: "For Power Users & NGOs — Have dozens of ESG reports to audit? Bypass public server limits and queues by using your organization's own Google Gemini API Key (recommended for very large documents). Your privacy is guaranteed: API keys are used statelessly per-request and are NEVER stored in our database. Configure this in the Settings menu.",
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About CAE — Truth. Extracted.</title>
        <meta
          name="description"
          content="CAE uses AI to find hidden excuses in corporate reports, helping animal advocates in Indonesia hold big companies accountable."
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
            <span className="font-nav font-bold text-sm text-primary-foreground tracking-wider hidden sm:block">
              Corporate Accountability Engine
            </span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all"
            >
              HOME
            </Link>
            <Link
              to="/auth"
              className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all"
            >
              SIGN IN
            </Link>
            <Link to="/auth">
              <Button
                variant="outline"
                className="bg-sidebar text-sidebar-foreground border-none font-body font-bold text-xs sm:text-sm px-3 sm:px-5"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      )}

      <div className="max-w-4xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <img src={caeLogoTruth} alt="CAE Logo" className="w-[240px] sm:w-[300px] mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2">ABOUT CAE</h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider uppercase">Truth. Extracted.</p>
        </div>

        {/* OUR MISSION */}
        <section className="bg-card rounded-xl border-l-4 border-primary p-8 shadow-sm">
          <h2 className="font-display text-2xl mb-4 flex items-center gap-2">OUR MISSION</h2>
          <p className="font-body text-muted-foreground leading-relaxed text-lg">
            Multinational food companies, hotels, and retailers often promise to go "cage-free" globally to look
            good in the public eye. But when you read their reports (ESG, Sustainability, Annual Reports, etc.),
            they frequently leave out countries like Indonesia. We built the{" "}
            <strong className="text-foreground font-bold">Corporate Accountability Engine (CAE)</strong> to catch
            these hidden tricks automatically — so any volunteer, advocate, or organization can hold big
            corporations accountable without spending weeks reading fine print.
          </p>
        </section>

        {/* INDONESIA CONTEXT (Additional Section for UX) */}
        <section className="bg-muted rounded-xl p-8 border border-border">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-display text-xl mb-3 uppercase">Why Indonesia?</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Many companies claim they can't go cage-free in Indonesia because of "lack of regulation."{" "}
                <strong className="text-foreground font-bold">This is no longer true.</strong> Since 2025, Indonesia has
                recognized cage-free systems (Permentan No. 32). CAE is specifically programmed to flag when companies
                use outdated legal excuses to avoid protecting animals in our region.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl text-center">HOW IT WORKS</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="bg-card border border-border rounded-xl p-6 transition-all hover:shadow-md">
                <div className="flex gap-4 items-start">
                  <span className="font-display text-3xl text-primary/20 leading-none">{s.step}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg">{s.title}</h3>
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9 TRICKS */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl text-center uppercase">9 Tricks We Detect</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evasionPatterns.map((p) => (
              <div
                key={p.title}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                  <span className="font-display text-sm">{p.title}</span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SCORING METHODOLOGY */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl text-center uppercase">Scoring Methodology Details</h2>
          <p className="font-body text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            The AI Risk Score is calculated by summing penalty and reward points based on the following factors detected in each report.
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-sidebar text-sidebar-foreground">
                    <th className="font-nav text-[11px] tracking-wider text-left p-3">FACTOR</th>
                    <th className="font-nav text-[11px] tracking-wider text-left p-3">POINTS</th>
                    <th className="font-nav text-[11px] tracking-wider text-left p-3">CONDITION</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { factor: "Strategic Silence", points: "+35", condition: "Indonesia not mentioned in cage-free context", penalty: true },
                    { factor: "Geographic Exclusion", points: "+30", condition: "Indonesia explicitly excluded", penalty: true },
                    { factor: "Franchise Firewall", points: "+15", condition: "Commitments limited to company-owned", penalty: true },
                    { factor: "Corporate Ghosting", points: "+15", condition: "No external accountability mechanism", penalty: true },
                    { factor: "Commitment Downgrade", points: "+15", condition: "Weakened language from previous years", penalty: true },
                    { factor: "Timeline Deferral", points: "+10", condition: "Indonesia deadlines pushed beyond 2030", penalty: true },
                    { factor: "Hedging Language", points: "+2 each", condition: "Non-binding phrases (max +10)", penalty: true },
                    { factor: "Availability Clause", points: "+5 each", condition: "Escape conditions (max +10)", penalty: true },
                    { factor: "Binding Language", points: "−3 each", condition: "Strong commitments (max −15)", penalty: false },
                    { factor: "Third-Party Audit", points: "−5", condition: "Independent verification exists", penalty: false },
                    { factor: "Indonesia Data", points: "−10", condition: "Indonesia-specific progress reported", penalty: false },
                  ].map((row, i) => (
                    <tr key={row.factor} className={`border-t border-border ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                      <td className="p-3 font-body text-sm font-bold">{row.factor}</td>
                      <td className={`p-3 font-display text-sm font-bold ${row.penalty ? "text-destructive" : "text-risk-low"}`}>{row.points}</td>
                      <td className="p-3 font-body text-xs text-muted-foreground">{row.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BUILT BY */}
        <section className="bg-sidebar text-sidebar-foreground rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-3xl mb-6">BUILT BY</h2>
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-display text-2xl">Kendrick Filbert</h3>
              <p className="font-body text-sidebar-foreground/80 leading-relaxed italic">
                "As a key players at Act For Farmed Animals, I and my teams spent weeks manually reading corporate
                reports—hunting through hundreds of pages just to see if a company was keeping its promise. I built CAE
                so what used to take me two weeks now takes you average 3-5 minutes. My goal: give every advocate the
                proof they need to win for animals."
              </p>
              <div className="flex gap-4 pt-4">
                <a href="https://www.linkedin.com/in/kendrick-filbert/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5 hover:text-primary transition-colors" />
                </a>
                <a href="https://github.com/kendrickassignment" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5 hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="text-center space-y-4">
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button className="font-display text-lg px-12 py-8 rounded-full shadow-lg hover:scale-105 transition-transform">
              START YOUR FIRST AUDIT
            </Button>
          </Link>
          <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
            Corporate Accountability Engine v2.2.0 — Truth. Extracted.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
