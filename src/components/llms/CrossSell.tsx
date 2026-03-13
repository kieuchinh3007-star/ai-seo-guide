import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const CrossSell = () => (
  <section className="py-16 md:py-24 bg-card">
    <div className="container max-w-5xl">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Đo lường traffic từ AI Search Engines
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sau khi tối ưu website cho AI crawlers, hãy theo dõi lượng traffic đến từ các nền tảng AI search.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Letsmetrix giúp bạn đo lường traffic từ ChatGPT, Perplexity và các nguồn AI khác.
          </p>
          <Button size="lg" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Dùng thử Letsmetrix
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-saas-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">AI Search Traffic</span>
              <span className="text-xs text-muted-foreground">30 ngày gần nhất</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "ChatGPT", value: 42, color: "bg-primary" },
                { name: "Perplexity", value: 28, color: "bg-accent" },
                { name: "Claude", value: 18, color: "bg-info" },
                { name: "Gemini", value: 12, color: "bg-success" },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-card-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CrossSell;
