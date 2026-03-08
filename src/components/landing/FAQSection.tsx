import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is CAE?",
    a: "CAE (Corporate Accountability Engine) is an AI-powered tool that analyzes corporate sustainability reports to detect hidden exclusions, hedging language, and broken promises in cage-free egg commitments.",
  },
  {
    q: "How does CAE work?",
    a: "Upload a company's sustainability report PDF and CAE's AI engine analyzes the entire document in approximately 3-5 minutes — extracting findings with direct quotes, scoring accountability, and providing actionable recommendations.",
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
    a: "CAE analyzes corporate sustainability reports, CSR reports, ESG disclosures, public releases and annual reports in PDF format that contain animal welfare or cage-free egg commitments. (Max 10 reports per analysis)",
  },
  {
    q: "Is it available to Southeast Asia?",
    a: "Currently, CAE focuses on Indonesia as its primary market, where cage-free egg adoption is still in its early stages. However, the analysis engine works with any sustainability report in English, so it can be used for companies operating globally. Regional expansion across Southeast Asia is planned as we grow.",
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
