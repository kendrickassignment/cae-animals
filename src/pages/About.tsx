import { Shield, VolumeX, Globe, Store, Clock, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import caeLogo from "@/assets/cae-logo.png";

const evasionPatterns = [
  "Hedging Language",
  "Strategic Silence",
  "Geographic Tiering",
  "Franchise Firewall",
  "Availability Clause",
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
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="bg-card rounded-lg border-t-4 border-primary p-8 text-center">
        <img src={caeLogo} alt="CAE Logo" className="w-[200px] mx-auto mb-4" />
        <h2 className="font-display text-3xl mb-2">TRUTH. EXTRACTED.</h2>
        <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An adversarial AI engine that audits corporate sustainability reports to detect greenwashing in cage-free egg commitments across Southeast Asia.
        </p>
      </div>

      {/* The Problem */}
      <div className="bg-card rounded-lg border-l-4 border-destructive p-8">
        <h3 className="font-display text-2xl mb-4">THE PROBLEM</h3>
        <p className="font-body text-muted-foreground leading-relaxed">
          Multinational food corporations publish 200-page sustainability reports claiming global cage-free commitments. Hidden in footnotes, appendices, and legal clauses are exclusions that exempt entire regions like Indonesia and Southeast Asia. Manual auditing takes 2 weeks per company. The volume makes real-time accountability impossible. Corporations enjoy positive PR while continuing battery-cage operations without scrutiny.
        </p>
      </div>

      {/* The Solution */}
      <div className="bg-card rounded-lg border-l-4 border-risk-low p-8">
        <h3 className="font-display text-2xl mb-4">THE SOLUTION</h3>
        <p className="font-body text-muted-foreground leading-relaxed mb-6">
          CAE uses adversarial AI to ingest corporate PDFs, detect deceptive hedging language, expose geographical exclusions, and surface citation-backed evidence with exact page numbers — in under 60 seconds. Cost per report: $0.15.
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
          <p className="font-body text-muted-foreground mb-4">Technical PM / Microsoft MVP</p>
          <p className="font-body text-muted-foreground leading-relaxed mb-6">
            Building AI-powered tools for animal welfare accountability. The Corporate Accountability Engine was developed to give advocacy researchers instant, evidence-backed intelligence against corporate greenwashing — turning a 2-week audit into a 60-second operation.
          </p>
          <div className="flex gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2">
                <Github className="h-4 w-4" />
                GitHub
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
            <div
              key={tech}
              className="bg-muted rounded-full px-4 py-2 text-center font-body text-sm text-foreground"
            >
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
  );
}
