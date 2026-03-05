import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is an llms.txt generator?",
    a: "An llms.txt generator automatically creates a configuration file that tells AI crawlers how to access and interpret your website content.",
  },
  {
    q: "Where should I upload the llms.txt file?",
    a: "Upload it to the root directory of your website (example.com/llms.txt).",
  },
  {
    q: "Why do websites need an llms.txt file?",
    a: "It helps AI systems identify your most important pages and improves visibility in AI-generated answers.",
  },
  {
    q: "Is this LLMs.txt generator free?",
    a: "Yes. The tool is completely free and requires no signup.",
  },
];

const FaqSection = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-3xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        LLMs.txt Generator FAQ
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
