import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is CAE?",
    a: "CAE (Corporate Accountability Engine) helps animal advocates across Asia review multinational companies' cage-free egg promises. It analyzes ESG, sustainability, and annual reports for hidden exclusions, weak commitments, and broken promises. CAE began with an Indonesia focus; Indonesia remains part of its wider Asian mission.",
  },
  {
    q: "How does CAE work?",
    a: "Upload a company's ESG, sustainability, annual report, or related disclosure in PDF format. CAE reviews the documents in approximately 3–5 minutes and highlights findings with quotes and page references for you to check before using them in your advocacy.",
  },
  {
    q: "What does CAE detect?",
    a: "CAE identifies nine key patterns: Hedging Language (non-binding phrases like 'we aim to'), Strategic Silence (countries simply not mentioned), Geographic Tiering ('leading markets' get real commitments while others get vague deadlines), Franchise Firewall (excluding franchises and licensees), Availability Clause (subjective deferrals like 'where supply is available'), Timeline Deferral (pushing deadlines with no interim milestones), Silent Delisting (quietly removing commitments from reports), Corporate Ghosting (ceasing to report on promises entirely), and Commitment Downgrade (weakening language in newer reports).",
  },
  {
    q: "Who is CAE for?",
    a: "CAE is built for anyone who cares about animals — whether you're an NGO researcher, a volunteer, an advocacy organization, or simply someone who wants to know if companies are keeping their cage-free promises.",
  },
  {
    q: "How long does an analysis take?",
    a: "It depends on the number of pages and content. A full analysis of a hundred-page report takes approximately 5 minutes, compared to the 2 weeks typically required for manual report review.",
  },
  {
    q: "Is CAE free to use?",
    a: "Yes! CAE is currently free during our pilot phase. Just sign up and start analyzing reports — no credit card needed.",
  },
  {
    q: "What types of reports can CAE analyze?",
    a: "CAE analyzes sustainability and CSR reports, ESG disclosures, annual reports, and related public releases containing animal welfare or cage-free egg commitments. Upload up to 3 PDF files per analysis, with a maximum of 25 MB per file.",
  },
  {
    q: "Does CAE focus on all of Asia?",
    a: "CAE's mission now covers Asia, including Indonesia, rather than Indonesia alone. You can review reports from multinational companies operating across the region. Current results still include an Indonesia-specific status and any Southeast Asian country information returned by the analysis. These are not an assessment of every Asian country, and CAE does not yet provide verified local regulatory checks for every market. Always review the country-specific evidence before drawing conclusions.",
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FAQSection() {
  return (
    <section className="py-20 px-6 bg-sidebar">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-4xl text-center text-sidebar-foreground mb-12">FREQUENTLY ASKED QUESTIONS</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-sidebar-border rounded-lg bg-sidebar-accent px-6 data-[state=open]:border-sidebar-primary/50"
            >
              <AccordionTrigger className="font-body font-bold text-sidebar-foreground text-left text-base hover:no-underline hover:text-sidebar-primary py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="font-body text-sidebar-foreground/70 leading-relaxed text-sm pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
