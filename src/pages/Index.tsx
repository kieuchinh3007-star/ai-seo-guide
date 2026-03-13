import { useState, useRef } from "react";
import { ChevronRight } from "lucide-react";
import GeneratorTool, { type CrawlResult } from "@/components/llms/GeneratorTool";
import ResultSection from "@/components/llms/ResultSection";
import HowToUse from "@/components/llms/HowToUse";
import WhyUse from "@/components/llms/WhyUse";
import ExampleFile from "@/components/llms/ExampleFile";
import CrossSell from "@/components/llms/CrossSell";
import FaqSection from "@/components/llms/FaqSection";
import MoreTools from "@/components/llms/MoreTools";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const [result, setResult] = useState<CrawlResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (data: CrawlResult) => {
    setResult(data);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleRegenerate = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative w-full h-48 md:h-72 lg:h-80 overflow-hidden">
        <img
          src={heroBanner}
          alt="LLMs.txt Generator - AI SEO Tool"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Hero Content */}
      <section className="pt-8 md:pt-12 pb-12 md:pb-20 -mt-16 md:-mt-24 relative z-10">
        <div className="container max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
            <a href="#" className="hover:text-foreground transition-colors">Home</a>
            <ChevronRight className="h-3 w-3" />
            <a href="#" className="hover:text-foreground transition-colors">Free Tools</a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">LLMs.txt Generator</span>
          </nav>

          <div className="text-center mb-10 space-y-4">
            <h1 className="text-3xl md:text-[44px] md:leading-tight font-extrabold text-foreground">
              LLMs.txt Generator – Free Online Tool
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter your website URL — we'll automatically crawl your sitemap and generate a ready-to-use llms.txt file in seconds.
            </p>
            <p className="text-sm text-muted-foreground">
              An llms.txt file helps AI models like ChatGPT, Perplexity, and Claude better understand and cite your website content.
            </p>
          </div>

          <GeneratorTool onGenerate={handleGenerate} />
        </div>
      </section>

      {/* Result */}
      {result && (
        <section ref={resultRef} className="py-12 bg-card">
          <div className="container max-w-4xl">
            <ResultSection data={result} onRegenerate={handleRegenerate} />
          </div>
        </section>
      )}

      <HowToUse />
      <WhyUse />
      <ExampleFile />
      <CrossSell />
      <FaqSection />
      <MoreTools />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Letsmetrix. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
};

export default Index;
