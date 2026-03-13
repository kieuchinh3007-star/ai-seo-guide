import { Globe, Search, FileText, Upload } from "lucide-react";

const steps = [
  { icon: Globe, title: "Step 1", desc: "Enter your website URL in the input field." },
  { icon: Search, title: "Step 2", desc: "The tool automatically crawls your sitemap and discovers all pages." },
  { icon: FileText, title: "Step 3", desc: "An llms.txt file is generated with categorized page listings." },
  { icon: Upload, title: "Step 4", desc: "Download the file and upload it to your website root (domain.com/llms.txt)." },
];

const HowToUse = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        How to Use LLMs.txt Generator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="text-center space-y-3 p-6 rounded-xl bg-card border border-border shadow-saas">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-card-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowToUse;
