import { Bot, Lock, TrendingUp, Zap } from "lucide-react";

const cards = [
  { icon: Bot, title: "Optimize for AI Search", desc: "Help AI assistants understand and cite your website content." },
  { icon: Lock, title: "Control AI Crawling", desc: "Define how AI models access and use your data." },
  { icon: TrendingUp, title: "Boost AI Visibility", desc: "Increase your chances of appearing in AI-generated answers." },
  { icon: Zap, title: "Instant Generation", desc: "Just enter a URL — the tool crawls your sitemap and generates llms.txt in seconds." },
];

const WhyUse = () => (
  <section className="py-16 md:py-24 bg-card">
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Why Use LLMs.txt Generator?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-background shadow-saas space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUse;
