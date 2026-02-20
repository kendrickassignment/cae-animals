export interface SeedCompany {
  id: string;
  name: string;
  industry: string;
  headquarters_country: string;
  latest_risk_level: string;
  latest_risk_score: number;
  total_reports_analyzed: number;
  last_audited_at: string;
}

export interface SeedAnalysis {
  id: string;
  report_id: string;
  company_name: string;
  report_year: number;
  overall_risk_level: string;
  overall_risk_score: number;
  global_claim: string;
  indonesia_mentioned: boolean;
  indonesia_status: string;
  sea_countries_mentioned: string[];
  sea_countries_excluded: string[];
  binding_language_count: number;
  hedging_language_count: number;
  summary: string;
  status: string;
  created_at: string;
  findings: SeedFinding[];
}

export interface SeedFinding {
  id: string;
  finding_type: string;
  severity: string;
  title: string;
  description: string;
  exact_quote: string;
  page_number: number;
  section: string | null;
  paragraph: string | null;
  country_affected: string | null;
}

export const seedCompanies: SeedCompany[] = [
  { id: "c1", name: "Yum! Brands", industry: "food_service", headquarters_country: "United States", latest_risk_level: "critical", latest_risk_score: 92, total_reports_analyzed: 3, last_audited_at: "2026-02-15T10:00:00Z" },
  { id: "c2", name: "Hilton Hotels", industry: "hospitality", headquarters_country: "United States", latest_risk_level: "high", latest_risk_score: 78, total_reports_analyzed: 2, last_audited_at: "2026-02-10T14:30:00Z" },
  { id: "c3", name: "Starbucks", industry: "food_service", headquarters_country: "United States", latest_risk_level: "high", latest_risk_score: 81, total_reports_analyzed: 2, last_audited_at: "2026-02-12T09:15:00Z" },
  { id: "c4", name: "Accor Hotels", industry: "hospitality", headquarters_country: "France", latest_risk_level: "medium", latest_risk_score: 45, total_reports_analyzed: 1, last_audited_at: "2026-01-28T16:00:00Z" },
  { id: "c5", name: "IKEA", industry: "retail", headquarters_country: "Sweden", latest_risk_level: "high", latest_risk_score: 85, total_reports_analyzed: 1, last_audited_at: "2026-02-05T11:45:00Z" },
];

export const seedAnalyses: SeedAnalysis[] = [
  {
    id: "a1", report_id: "r1", company_name: "Yum! Brands", report_year: 2024,
    overall_risk_level: "critical", overall_risk_score: 92,
    global_claim: "94% cage-free egg sourcing globally",
    indonesia_mentioned: true, indonesia_status: "deferred",
    sea_countries_mentioned: ["Thailand", "Malaysia"], sea_countries_excluded: ["Indonesia", "Vietnam", "Philippines"],
    binding_language_count: 2, hedging_language_count: 8,
    summary: "Yum! Brands reports 94% cage-free compliance but this figure only counts 'U.S., Western Europe and other leading markets.' Indonesia and most of Southeast Asia are classified as 'Elsewhere' with a vague 2030 deadline. The report uses extensive hedging language and geographic tiering to create the appearance of progress while deferring action in key markets.",
    status: "completed", created_at: "2026-02-15T10:30:00Z",
    findings: [
      { id: "f1", finding_type: "geographic_exclusion", severity: "critical", title: "Geographic Tiering — Indonesia Classified as 'Elsewhere'", description: "The company's 94% figure only counts operations in leading markets. Indonesia is grouped under 'Elsewhere globally' with a distant 2030 target, effectively excluding it from current commitments.", exact_quote: "Our 94% cage-free figure reflects operations in the U.S., Western Europe and other leading markets. Elsewhere globally, we aim to achieve similar standards by 2030.", page_number: 0, section: "ESG Report — Animal Welfare Section", paragraph: "Regional Progress", country_affected: "Indonesia" },
      { id: "f2", finding_type: "hedging_language", severity: "high", title: "Non-Binding 'Aim To' Language", description: "The word 'aim' is legally non-binding and creates no enforceable commitment for Southeast Asian markets.", exact_quote: "we aim to achieve similar standards by 2030", page_number: 0, section: "ESG Report — Animal Welfare Section", paragraph: null, country_affected: null },
      { id: "f3", finding_type: "timeline_deferral", severity: "high", title: "2030 Deadline for Non-Leading Markets", description: "A 2030 deadline for 'elsewhere' markets represents a 5+ year deferral with no interim milestones or accountability mechanisms.", exact_quote: "Elsewhere globally, we aim to achieve similar standards by 2030.", page_number: 0, section: "ESG Report — Animal Welfare Section", paragraph: null, country_affected: "Indonesia" },
    ],
  },
  {
    id: "a2", report_id: "r2", company_name: "Hilton Hotels", report_year: 2024,
    overall_risk_level: "high", overall_risk_score: 78,
    global_claim: "100% cage-free eggs globally",
    indonesia_mentioned: true, indonesia_status: "deferred",
    sea_countries_mentioned: ["Indonesia"], sea_countries_excluded: ["Vietnam", "Philippines", "Myanmar"],
    binding_language_count: 3, hedging_language_count: 5,
    summary: "Hilton's 'global' cage-free commitment contains a critical footnote: 'Where supply is readily available.' This subjective availability clause gives indefinite deferral power to any market where sourcing is inconvenient, with no defined metrics for what constitutes 'readily available.'",
    status: "completed", created_at: "2026-02-10T15:00:00Z",
    findings: [
      { id: "f4", finding_type: "availability_clause", severity: "critical", title: "Availability Clause — Indefinite Subjective Deferral", description: "The footnote 'Where supply is readily available' effectively nullifies the global commitment for markets like Indonesia where cage-free supply chains are still developing.", exact_quote: "Our commitment applies globally where cage-free supply is readily available*", page_number: 3, section: "Responsible Sourcing Goals 2024", paragraph: "Footnote ii", country_affected: "Indonesia" },
      { id: "f5", finding_type: "hedging_language", severity: "medium", title: "Aspirational 'Commitment' Without Metrics", description: "No defined metrics for measuring progress in Southeast Asian markets.", exact_quote: "We remain committed to our cage-free journey across all regions.", page_number: 3, section: "Responsible Sourcing Goals 2024", paragraph: null, country_affected: null },
    ],
  },
  {
    id: "a3", report_id: "r3", company_name: "Starbucks", report_year: 2024,
    overall_risk_level: "high", overall_risk_score: 81,
    global_claim: "Cage-free eggs in company-operated stores",
    indonesia_mentioned: false, indonesia_status: "excluded",
    sea_countries_mentioned: [], sea_countries_excluded: ["Indonesia"],
    binding_language_count: 4, hedging_language_count: 6,
    summary: "Starbucks limits its cage-free commitment to 'company-operated stores globally.' However, Indonesia operations are run through licensee PT Sari Coffee Indonesia, creating a franchise firewall that conveniently excludes the country from reporting obligations. Indonesia is not mentioned anywhere in the animal welfare section.",
    status: "completed", created_at: "2026-02-12T09:45:00Z",
    findings: [
      { id: "f6", finding_type: "franchise_firewall", severity: "critical", title: "Franchise Firewall — Licensee Exclusion", description: "The commitment only covers 'company-operated stores.' Indonesia is run by licensee PT Sari Coffee Indonesia, creating a structural exclusion from the commitment.", exact_quote: "This commitment applies to company-operated stores globally.", page_number: 44, section: "Global Environmental & Social Impact Report 2022", paragraph: null, country_affected: "Indonesia" },
      { id: "f7", finding_type: "strategic_silence", severity: "high", title: "Indonesia Absent from Animal Welfare Section", description: "Despite operating in Indonesia through a licensee, the country is not mentioned in the animal welfare or cage-free progress sections of the report.", exact_quote: "", page_number: 0, section: "Animal Welfare Section", paragraph: null, country_affected: "Indonesia" },
    ],
  },
  {
    id: "a4", report_id: "r4", company_name: "Accor Hotels", report_year: 2024,
    overall_risk_level: "medium", overall_risk_score: 45,
    global_claim: "Cage-free transition in all markets",
    indonesia_mentioned: true, indonesia_status: "partial",
    sea_countries_mentioned: ["Indonesia", "Thailand", "Vietnam"], sea_countries_excluded: [],
    binding_language_count: 6, hedging_language_count: 3,
    summary: "Accor is the most transparent company analyzed. They report 64% cage-free compliance in Indonesia with a clear 2027 target. While not yet complete, they provide country-level data and interim milestones — a significant improvement over competitors.",
    status: "completed", created_at: "2026-01-28T16:30:00Z",
    findings: [
      { id: "f8", finding_type: "binding_commitment", severity: "low", title: "Specific Country-Level Target with Timeline", description: "Accor provides actual compliance data for Indonesia (64%) and a specific deadline (2027), making this a more credible commitment.", exact_quote: "In Indonesia, 64% of our egg supply is now cage-free, with a target to reach 100% by 2027.", page_number: 1, section: "Accor Eggs from Cage-Free Hens Data", paragraph: null, country_affected: "Indonesia" },
    ],
  },
  {
    id: "a5", report_id: "r5", company_name: "IKEA", report_year: 2024,
    overall_risk_level: "high", overall_risk_score: 85,
    global_claim: "Global commitment to cage-free eggs",
    indonesia_mentioned: false, indonesia_status: "silent",
    sea_countries_mentioned: [], sea_countries_excluded: ["Indonesia"],
    binding_language_count: 3, hedging_language_count: 4,
    summary: "IKEA's sustainability report contains zero mentions of Indonesia in its Regional Progress section, which covers 28 countries. This 'strategic silence' is itself a red flag — the company makes a 'Global' commitment but simply does not report on one of Southeast Asia's largest markets. (Note: IKEA is used as a hypothetical example to demonstrate the Strategic Silence detection pattern.)",
    status: "completed", created_at: "2026-02-05T12:00:00Z",
    findings: [
      { id: "f9", finding_type: "strategic_silence", severity: "critical", title: "Complete Strategic Silence on Indonesia", description: "Indonesia does not appear anywhere in the report despite IKEA's 'Global' cage-free commitment. The Regional Progress section covers 28 countries but excludes Indonesia entirely. (Hypothetical example for demo purposes.)", exact_quote: "", page_number: 0, section: "Regional Progress", paragraph: null, country_affected: "Indonesia" },
      { id: "f10", finding_type: "hedging_language", severity: "medium", title: "Vague 'Working Towards' Language", description: "Multiple instances of non-binding language when describing progress in 'emerging markets.'", exact_quote: "We are working towards ensuring all our food operations source cage-free eggs where operationally feasible.", page_number: 52, section: "Animal Welfare", paragraph: null, country_affected: null },
    ],
  },
];

export function getRiskColor(level: string): string {
  switch (level) {
    case "critical": return "text-risk-critical";
    case "high": return "text-risk-high";
    case "medium": return "text-risk-medium";
    case "low": return "text-risk-low";
    default: return "text-risk-none";
  }
}

export function getRiskBgColor(level: string): string {
  switch (level) {
    case "critical": return "bg-risk-critical-bg text-risk-critical";
    case "high": return "bg-risk-high-bg text-risk-high";
    case "medium": return "bg-risk-medium-bg text-risk-medium";
    case "low": return "bg-risk-low-bg text-risk-low";
    default: return "bg-risk-none-bg text-risk-none";
  }
}

export function getIndonesiaStatusLabel(status: string): string {
  switch (status) {
    case "compliant": return "COMPLIANT";
    case "excluded": return "EXCLUDED";
    case "silent": return "NO DATA — SILENT";
    case "partial": return "PARTIAL";
    case "deferred": return "DEFERRED";
    default: return status.toUpperCase();
  }
}

export function getIndonesiaStatusColor(status: string): string {
  switch (status) {
    case "compliant": return "bg-risk-low-bg text-risk-low";
    case "excluded": return "bg-risk-critical-bg text-risk-critical";
    case "silent": return "bg-risk-none-bg text-risk-none";
    case "partial": return "bg-risk-medium-bg text-risk-medium";
    case "deferred": return "bg-risk-high-bg text-risk-high";
    default: return "bg-muted text-muted-foreground";
  }
}

export function getFindingTypeLabel(type: string): string {
  switch (type) {
    case "hedging_language": return "Hedging Language";
    case "geographic_exclusion": return "Geographic Exclusion";
    case "strategic_silence": return "Strategic Silence";
    case "franchise_firewall": return "Franchise Firewall";
    case "availability_clause": return "Availability Clause";
    case "timeline_deferral": return "Timeline Deferral";
    case "binding_commitment": return "Binding Commitment";
    default: return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
}
