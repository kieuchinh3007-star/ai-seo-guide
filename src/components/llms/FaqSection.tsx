import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is an llms.txt generator?",
    a: "An llms.txt generator automatically creates a configuration file by crawling your website's sitemap, helping AI crawlers better understand and cite your content.",
  },
  {
    q: "Where should I upload the llms.txt file?",
    a: "Upload it to the root directory of your website (e.g., example.com/llms.txt).",
  },
  {
    q: "Why do websites need an llms.txt file?",
    a: "It helps AI search engines like ChatGPT, Perplexity, and Claude identify your most important pages, increasing your visibility in AI-generated answers.",
  },
  {
    q: "Is this LLMs.txt generator free?",
    a: "Yes. The tool is completely free and requires no signup.",
  },
  {
    q: "How does the tool crawl my website?",
    a: "The tool automatically finds and parses your website's sitemap.xml, collects all URLs, and categorizes them into Docs and Optional sections based on URL structure.",
  },
];

const FaqSection = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-3xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 bg-card shadow-saas">
            <AccordionTrigger className="text-left font-medium text-card-foreground hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
