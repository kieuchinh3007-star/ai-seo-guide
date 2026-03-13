import { FileCheck, Bot, Search, Map, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  { icon: FileCheck, name: "LLMs.txt Validator", desc: "Kiểm tra file llms.txt có đúng chuẩn không." },
  { icon: Bot, name: "Robots.txt Validator", desc: "Kiểm tra file robots.txt đã cấu hình đúng chưa." },
  { icon: Search, name: "AI Crawler Checker", desc: "Xem AI bot nào có thể truy cập website của bạn." },
  { icon: Map, name: "Sitemap Validator", desc: "Kiểm tra cấu trúc XML sitemap." },
  { icon: Tag, name: "Meta Tag Analyzer", desc: "Phân tích meta tags để tối ưu SEO." },
];

const MoreTools = () => (
  <section className="py-16 md:py-24 bg-card">
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Các công cụ AI SEO khác
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((t, i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-background shadow-saas space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
            <Button variant="outline" size="sm">Dùng thử</Button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MoreTools;
