import { Globe, Search, FileText, Upload } from "lucide-react";

const steps = [
  { icon: Globe, title: "Bước 1", desc: "Nhập URL website của bạn vào ô input." },
  { icon: Search, title: "Bước 2", desc: "Tool tự động quét sitemap và thu thập toàn bộ URL trên website." },
  { icon: FileText, title: "Bước 3", desc: "File llms.txt được tạo tự động với danh sách trang đã phân loại." },
  { icon: Upload, title: "Bước 4", desc: "Tải file và upload lên thư mục gốc website (domain.com/llms.txt)." },
];

const HowToUse = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Cách sử dụng LLMs.txt Generator
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
