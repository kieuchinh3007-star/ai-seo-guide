import { Bot, Lock, TrendingUp, Zap } from "lucide-react";

const cards = [
  { icon: Bot, title: "Tối ưu cho AI Search", desc: "Giúp các AI assistant hiểu và trích dẫn nội dung website của bạn." },
  { icon: Lock, title: "Kiểm soát AI Crawling", desc: "Xác định cách các mô hình AI truy cập và sử dụng dữ liệu của bạn." },
  { icon: TrendingUp, title: "Tăng khả năng hiển thị", desc: "Tăng cơ hội xuất hiện trong câu trả lời của AI search engines." },
  { icon: Zap, title: "Tạo file tự động", desc: "Chỉ cần nhập URL, tool quét sitemap và tạo file llms.txt trong vài giây." },
];

const WhyUse = () => (
  <section className="py-16 md:py-24 bg-card">
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Tại sao cần file LLMs.txt?
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
