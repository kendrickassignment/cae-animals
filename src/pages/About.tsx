import { Link } from "react-router-dom";
import { Linkedin, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import caeLogoTruth from "@/assets/cae-logo-truth.png";
import caeLogoDark from "@/assets/cae-logo-dark.png";
import Footer from "@/components/layout/Footer";

const evasionPatterns = [
  "Hedging Language",
  "Strategic Silence",
  "Geographic Tiering",
  "Franchise Firewall",
  "Availability Clause",
  "Timeline Deferral",
  "Silent Delisting",
  "Corporate Ghosting",
  "Commitment Downgrade",
];

const techStack = [
  "React + TypeScript",
  "FastAPI (Python)",
  "Google Gemini AI",
  "PyMuPDF",
  "Supabase",
  "Tailwind CSS",
  "Render.com",
  "Lovable",
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        /* Logged-in: simple back button, no navbar */
        <div className="sticky top-0 z-50 bg-background border-b border-border px-4 sm:px-6 py-3 flex items-center">
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2 font-body font-bold text-xs sm:text-sm">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        /* Public: full navbar */
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

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-8 sm:py-12 px-4 sm:px-6">
        {/* Hero */}
        <div className="bg-card rounded-lg border-t-4 border-primary p-8 text-center">
          <img src={caeLogoTruth} alt="CAE Logo" className="w-[200px] mx-auto mb-4" />
          <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An adversarial AI engine that audits corporate sustainability reports to detect greenwashing in cage-free
            egg commitments across Indonesia.
          </p>
        </div>

        {/* The Problem */}
        <div className="bg-card rounded-lg border-l-4 border-destructive p-8">
          <h3 className="font-display text-2xl mb-4">THE PROBLEM</h3>
          <p className="font-body text-muted-foreground leading-relaxed">
            Multinational food corporations publish hundreds page sustainability reports claiming global cage-free
            commitments. Hidden in footnotes, appendices, and legal clauses are exclusions that exempt entire regions
            like Indonesia and Southeast Asia. Manual auditing takes 2 weeks per company. The volume makes real-time
            accountability impossible. Corporations enjoy positive PR while continuing battery-cage operations without
            scrutiny.
          </p>
        </div>

        {/* The Solution */}
        <div className="bg-card rounded-lg border-l-4 border-risk-low p-8">
          <h3 className="font-display text-2xl mb-4">THE SOLUTION</h3>
          <p className="font-body text-muted-foreground leading-relaxed mb-6">
            CAE uses adversarial AI to ingest corporate PDFs, detect deceptive hedging language, expose geographical
            exclusions, and surface citation-backed evidence with exact page numbers — in between 3-5 minutes. Cost per
            report: $0.15. The result is an instant, audit-ready scorecard for campaigners.
          </p>
          <div className="flex flex-wrap gap-2">
            {evasionPatterns.map((pattern) => (
              <Badge key={pattern} variant="secondary" className="font-nav text-[11px] tracking-wider">
                {pattern}
              </Badge>
            ))}
          </div>
        </div>

        {/* Built By */}
        <div className="bg-card rounded-lg border-l-4 border-primary p-8">
          <h3 className="font-display text-2xl mb-4">BUILT BY</h3>
          <div>
            <h4 className="font-display text-2xl mb-1">Kendrick Filbert</h4>
            <p className="font-body text-muted-foreground mb-4">Act For Farmed Animals</p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Building AI-powered tools for animal welfare accountability. The Corporate Accountability Engine was
              developed to give advocacy researchers instant, evidence-backed intelligence against corporate
              greenwashing — turning a 2-week audit into a 3-5 minutes operation.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="https://www.linkedin.com/in/kendrick-filbert/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </a>
              <a href="https://github.com/kendrickassignment" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
              <a href="https://huggingface.co/kendrickfff" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Hugging Face
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-card rounded-lg border-l-4 border-secondary p-8">
          <h3 className="font-display text-2xl mb-4">TECH STACK</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {techStack.map((tech) => (
              <div key={tech} className="bg-muted rounded-full px-4 py-2 text-center font-body text-sm text-foreground">
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-body text-xs text-muted-foreground pt-4">
          Corporate Accountability Engine v1.0 — Truth. Extracted.
        </p>
      </div>

      <Footer />
    </div>
  );
}
